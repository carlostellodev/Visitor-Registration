import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Tenant from "../models/tenant.js";
import config from "../config/env.js";
import rateLimiter from "../middleware/rateLimiter.js";

class AuthService {
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
    const userForAuth = await User.findOne({ email });

    if (!userForAuth) {
      // Registrar intento fallido (usuario no existe)
      await rateLimiter.recordFailedAttempt(email);
      throw new Error("Credenciales inválidas");
    }

    // Verificar contraseña
    const isPasswordValid = await userForAuth.comparePassword(password);
    if (!isPasswordValid) {
      // Registrar intento fallido (contraseña incorrecta)
      await rateLimiter.recordFailedAttempt(email);
      throw new Error("Credenciales inválidas");
    }

    if (!userForAuth.isActive) {
      throw new Error("Usuario inactivo");
    }

     const user = await User.findById(userForAuth._id)
       .populate("tenantId")
       .lean();

    // Verificar que el tenant esté activo
    if (!user.tenantId || !user.tenantId.isActive) {
      throw new Error("Tenant inactivo");
    }

    // Login exitoso
    await rateLimiter.recordSuccessfulLogin(user._id, ipAddress);

    // Generar token
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
