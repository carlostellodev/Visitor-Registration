import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Tenant from "../models/tenant.js";
import config from "../config/env.js";

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
  // async login({ email, password }) {
  //   const userForAuth = await User.findOne({ email });

  //   if (!userForAuth) {
  //     throw new Error("Credenciales inválidas");
  //   }

  //   // Verificar contraseña
  //   const isPasswordValid = await userForAuth.comparePassword(password);
  //   if (!isPasswordValid) {
  //     throw new Error("Credenciales inválidas");
  //   }

  //   // Verificar que el usuario esté activo
  //   if (!userForAuth.isActive) {
  //     throw new Error("Usuario inactivo");
  //   }

  //   const user = await User.findById(userForAuth._id)
  //     .populate("tenantId")
  //     .lean();

  //   // Verificar que el tenant esté activo
  //   if (!user.tenantId || !user.isActive) {
  //     throw new Error("Tenant inactivo");
  //   }

  //   // Generar token
  //   const token = this.generateToken(user._id);

  //   return {
  //     token,
  //     user: {
  //       _id: user._id,
  //       name: user.name,
  //       email: user.email,
  //       role: user.role,
  //       tenant: {
  //         _id: user.tenantId._id,
  //         name: user.tenantId.name,
  //         email: user.tenantId.email,
  //         phone: user.tenantId.phone,
  //         address: user.tenantId.address,
  //         slug: user.tenantId.slug,
  //         theme: user.tenantId.theme,
  //         config: user.tenantId.config,
  //       },
  //     },
  //   };
  // }

  async login({ email, password, ipAddress, userAgent }) {
    try {
      const sanitizedEmail = email.trim().toLowerCase();

      const user = await User.findOne({ email: sanitizedEmail })
        .select("+password +security")
        .populate("tenantId");

      const dummyHash = "$2b$10$dummyhashtopreventtimingattack1234567890";
      const passwordToCompare = user ? user.password : dummyHash;
      const isPasswordValid = await bcrypt.compare(password, passwordToCompare);

      if (!user || !isPasswordValid) {
        if (user) {
          await this.registerFailedLogin(user._id);
        }
        throw new Error("Email o contraseña incorrectos");
      }

      if (user.security?.lockUntil && user.security.lockUntil > Date.now()) {
        const minutesLeft = Math.ceil(
          (user.security.lockUntil - Date.now()) / 1000 / 60
        );
        throw new Error(
          `Cuenta bloqueada. Intenta de nuevo en ${minutesLeft} minutos`
        );
      }

      const loginAttempts = user.security?.loginAttempts || 0;
      if (loginAttempts >= 5) {
        const lockTime = 15 * 60 * 1000;
        const lastFailedLogin = user.security?.lastFailedLogin?.getTime() || 0;
        const timeSinceLastAttempt = Date.now() - lastFailedLogin;

        if (timeSinceLastAttempt < lockTime) {
          const minutesLeft = Math.ceil(
            (lockTime - timeSinceLastAttempt) / 1000 / 60
          );
          throw new Error(
            `Demasiados intentos fallidos. Intenta de nuevo en ${minutesLeft} minutos`
          );
        } else {
          await User.findByIdAndUpdate(user._id, {
            "security.loginAttempts": 0,
            "security.lastFailedLogin": null,
            "security.lockUntil": null,
          });
        }
      }

      if (!user.isActive) {
        throw new Error("Cuenta inactiva. Contacta al administrador");
      }

      if (!user.tenantId || !user.tenantId.isActive) {
        throw new Error("Organización inactiva. Contacta al administrador");
      }

      await User.findByIdAndUpdate(user._id, {
        "security.loginAttempts": 0,
        "security.lastFailedLogin": null,
        "security.lockUntil": null,
        "security.lastLogin": new Date(),
        "security.lastLoginIp": ipAddress,
      });

      const token = this.generateToken(user._id, {
        role: user.role,
        tenantId: user.tenantId._id,
      });

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
    } catch (error) {
      throw error;
    }
  }

  async registerFailedLogin(userId) {
    try {
      const user = await User.findById(userId).select("+security");
      if (!user) return;

      const newAttempts = (user.security?.loginAttempts || 0) + 1;
      const updateData = {
        "security.loginAttempts": newAttempts,
        "security.lastFailedLogin": new Date(),
      };

      if (newAttempts >= 5) {
        updateData["security.lockUntil"] = new Date(
          Date.now() + 15 * 60 * 1000
        );
      }

      await User.findByIdAndUpdate(userId, updateData);
    } catch (error) {
      console.error("Error registrando intento fallido:", error);
    }
  }

  generateToken(userId, additionalPayload = {}) {
    return jwt.sign(
      {
        userId,
        ...additionalPayload,
        iat: Math.floor(Date.now() / 1000),
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
      }
    );
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
