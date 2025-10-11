import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Tenant from "../models/tenant.js";
import config from "../config/env.js";
import rateLimiter from "../middleware/rateLimiter.js";

class AuthService {
  // Generar JWT token
  generateToken(userId) {
    return jwt.sign({ userId }, config.jwt.secret, { expiresIn: "7d" });
  }

  // Registrar nuevo usuario
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("El email ya está registrado");
    }

    // Verificar que el tenant existe y está activo
    const tenant = await Tenant.findById(userData.tenantId);
    if (!tenant) {
      throw new Error("Tenant no encontrado");
    }
    if (!tenant.isActive) {
      throw new Error("El tenant no está activo");
    }

    // Crear nuevo usuario
    const user = new User(userData);
    await user.save();

    // Generar token
    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      },
    };
  }

  // Login de usuario
  async login({ email, password, ipAddress = null }) {
    const userForAuth = await User.findOne({ email }).select(
      "+security.loginAttempts +security.lastFailedLogin +security.lockUntil"
    );

    if (!userForAuth) {
      await rateLimiter.recordFailedAttempt(email);
      throw new Error("Credenciales inválidas");
    }

    if (
      userForAuth.security.lockUntil &&
      userForAuth.security.lockUntil > new Date()
    ) {
      const remainingTime = Math.ceil(
        (userForAuth.security.lockUntil - new Date()) / 1000 / 60
      );

      // Código 429
      const error = new Error("Cuenta temporalmente bloqueada");
      error.statusCode = 429;
      error.details = `Intenta nuevamente en ${remainingTime} minutos`;
      error.lockedUntil = userForAuth.security.lockUntil;
      throw error;
    }

    const isPasswordValid = await userForAuth.comparePassword(password);
    if (!isPasswordValid) {
      // Contraseña incorrecta
      const lockInfo = await rateLimiter.recordFailedAttempt(email);

      if (lockInfo && lockInfo.isLocked) {
        const remainingTime = Math.ceil(
          (lockInfo.lockUntil - new Date()) / 1000 / 60
        );
        const error = new Error("Cuenta temporalmente bloqueada");
        error.statusCode = 429;
        error.details = `Demasiados intentos fallidos. Intenta nuevamente en ${remainingTime} minutos`;
        error.lockedUntil = lockInfo.lockUntil;
        throw error;
      }

      throw new Error("Credenciales inválidas");
    }

    if (!userForAuth.isActive) {
      throw new Error("Usuario inactivo");
    }

    const user = await User.findById(userForAuth._id)
      .populate("tenantId")
      .lean();

    if (!user.tenantId || !user.tenantId.isActive) {
      throw new Error("Tenant inactivo");
    }

    // Login exitoso
    await rateLimiter.recordSuccessfulLogin(user._id, ipAddress);

    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenant: {
          _id: user.tenantId._id,
          name: user.tenantId.name,
          email: user.tenantId.email,
          phone: user.tenantId.phone,
          address: user.tenantId.address,
          slug: user.tenantId.slug,
          theme: user.tenantId.theme,
          config: user.tenantId.config,
        },
      },
    };
  }

  // Obtener usuario por ID
  async getUserById(userId) {
    const user = await User.findById(userId)
      .select("-password")
      .populate("tenantId")
      .lean();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      tenant: {
        _id: user.tenantId._id,
        name: user.tenantId.name,
        email: user.tenantId.email,
        phone: user.tenantId.phone,
        address: user.tenantId.address,
        slug: user.tenantId.slug,
        theme: user.tenantId.theme,
        isActive: user.tenantId.isActive,
        config: user.tenantId.config,
      },
      createdAt: user.createdAt,
    };
  }
}

export default new AuthService();
