import jwt from "jsonwebtoken";
import config from "../config/env.js";
import User from "../models/User.js";

/**
 * Middleware de autenticación
 * Verifica que el usuario tenga un token válido y esté activo
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "No autenticado",
        message:
          "Token no proporcionado. Debes incluir 'Authorization: Bearer <token>' en el header",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verificar token JWT
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Sesión expirada",
          message:
            "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
        });
      }
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          error: "Token inválido",
          message: "El token proporcionado no es válido.",
        });
      }
      throw error;
    }

    // Obtener usuario completo
    const user = await User.findById(decoded.userId)
      .select("-password")
      .populate("tenantId", "name slug isActive")
      .lean();

    if (!user) {
      return res.status(401).json({
        error: "No autenticado",
        message: "Usuario no encontrado. El token puede ser inválido.",
      });
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      return res.status(403).json({
        error: "Cuenta inactiva",
        message: "Tu cuenta ha sido desactivada. Contacta al administrador.",
      });
    }

    // Verificar tenant activo (excepto superadmin)
    if (user.role !== "superadmin") {
      if (!user.tenantId) {
        return res.status(403).json({
          error: "Sin organización",
          message:
            "Tu usuario no está asociado a ninguna organización. Contacta al administrador.",
        });
      }

      // Verificar que el tenant esté activo
      if (!user.tenantId.isActive) {
        return res.status(403).json({
          error: "Organización inactiva",
          message:
            "Tu organización ha sido desactivada. Contacta al administrador.",
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
      tenant: user.tenantId, // Información completa
    };

    next();
  } catch (error) {
    res.status(500).json({
      error: "Error interno",
      message: "Error al procesar la autenticación. Intenta de nuevo.",
    });
  }
};

// /**
//  * Permite requests sin autenticación
//  * Útil para endpoints públicos
//  */
// export const optionalAuthenticate = async (req, res, next) => {
//   try {
//     const authHeader = req.header("Authorization");

//     // Si no hay header, continuar sin usuario
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       req.user = null;
//       return next();
//     }

//     // Si hay header, intentar autenticar
//     await authenticate(req, res, next);
//   } catch (error) {
//     req.user = null;
//     next();
//   }
// };

export default authenticate;
