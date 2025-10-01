import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";

class AuthService {
  // Generar JWT token
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  }

  // Registrar nuevo usuario
  async register({ name, email, password, tenantId }) {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("El email ya está registrado");
    }

    // Verificar que el tenant existe y está activo
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      throw new Error("Tenant no encontrado");
    }
    if (!tenant.isActive) {
      throw new Error("El tenant no está activo");
    }

    // Crear nuevo usuario
    const user = new User({ name, email, password, tenantId });
    await user.save();

    // Generar token
    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      },
    };
  }

  // Login de usuario
  async login({ email, password }) {
    // Buscar usuario y popular tenant
    const user = await User.findOne({ email }).populate(
      "tenantId",
      "name slug theme isActive"
    );

    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("Credenciales inválidas");
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      throw new Error("Usuario inactivo");
    }

    // Verificar que el tenant esté activo
    if (!user.tenantId || !user.tenantId.isActive) {
      throw new Error("Tenant inactivo");
    }

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
          id: user.tenantId._id,
          name: user.tenantId.name,
          slug: user.tenantId.slug,
          theme: user.tenantId.theme,
        },
      },
    };
  }

  // Obtener usuario por ID
  async getUserById(userId) {
    const user = await User.findById(userId)
      .select("-password")
      .populate("tenantId", "name slug theme isActive");

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
        id: user.tenantId._id,
        name: user.tenantId.name,
        slug: user.tenantId.slug,
        theme: user.tenantId.theme,
        isActive: user.tenantId.isActive,
      },
      createdAt: user.createdAt,
    };
  }
}

export default new AuthService();
