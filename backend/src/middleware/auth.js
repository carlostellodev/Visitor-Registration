import jwt from "jsonwebtoken";
import config from "../config/env.js";
import User from "../models/user.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "No autenticado",
        message: "Token no proporcionado",
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await User.findById(decoded.userId)
      .select("-password")
      .populate("tenantId", "name slug isActive")
      .lean();

    if (!user) {
      return res.status(401).json({
        error: "No autenticado",
        message: "Usuario no encontrado",
      });
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      return res.status(403).json({
        error: "Cuenta inactiva",
        message: "Tu cuenta ha sido desactivada. Contacta al administrador.",
      });
    }

    // Verificar que el tenant esté activo (excepto superadmin)
    if (user.role !== "superadmin") {
      if (!user.tenantId) {
        return res.status(403).json({
          error: "Sin organización",
          message: "Tu usuario no está asociado a ninguna organización",
        });
      }

      if (!user.tenantId.isActive) {
        return res.status(403).json({
          error: "Organización inactiva",
          message: "Tu organización ha sido desactivada",
        });
      }
    }

    // Adjuntar información del usuario a la req
    req.user = {
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId?._id,
      tenant: user.tenantId,
    };

    next();
  } catch (error) {
    // Errores específicos de JWT
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Token inválido",
        message: "El token proporcionado no es válido",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Sesión expirada",
        message: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
      });
    }
    console.error("Error en autenticación:", error);
    res.status(500).json({
      error: "Error interno",
      message: "Error al verificar autenticación",
    });
  }
};

export default authMiddleware;
