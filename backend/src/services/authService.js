import jwt from "jsonwebtoken";
import User from "../models/User.js";

class AuthService {
  // Generar JWT token
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  }

  // Registrar nuevo usuario
  async register({ name, email, password }) {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("El email ya está registrado");
    }

    // Crear nuevo usuario
    const user = new User({ name, email, password });
    await user.save();

    // Generar token
    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  }

  // Login de usuario
  async login({ email, password }) {
    // Buscar usuario
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error("Credenciales inválidas");
    }

    // Generar token
    const token = this.generateToken(user._id);

    return {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  }

  // Obtener usuario por ID
  async getUserById(userId) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    return user;
  }
}

export default new AuthService();
