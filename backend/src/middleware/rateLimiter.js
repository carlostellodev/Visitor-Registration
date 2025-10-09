import rateLimit from "express-rate-limit";
import config from "../config/env.js";

/**
 * Rate limiter para login
 * Previene ataques de fuerza bruta
 */
export const loginLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutos
  max: config.rateLimit.max, // 5 intentos en producción, 100 en desarrollo
  message: {
    error: "Demasiados intentos",
    message:
      "Has excedido el límite de intentos de inicio de sesión. Por favor, intenta de nuevo en 15 minutos.",
    retryAfter: `${Math.ceil(config.rateLimit.windowMs / 1000 / 60)} minutos`,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Demasiados intentos",
      message:
        "Has excedido el límite de intentos de inicio de sesión. Por favor, intenta de nuevo más tarde.",
      retryAfter: `${Math.ceil(config.rateLimit.windowMs / 1000 / 60)} minutos`,
    });
  },
  //   skip: (req) => {
  //     return false;        //Para banear IPs
  //   },
});

/**
 * Rate limiter más estricto para intentos fallidos consecutivos
 */
export const strictLoginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: {
    error: "Cuenta bloqueada temporalmente",
    message:
      "Tu cuenta ha sido bloqueada temporalmente debido a múltiples intentos fallidos.",
  },
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = req.body.email || "unknown";
    return `${email}-${req.ip}`;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: "Cuenta bloqueada",
      message:
        "Tu cuenta ha sido bloqueada temporalmente. Por favor, contacta al administrador o espera 1 hora.",
    });
  },
});

/**
 * Rate limiter general para API
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Demasiadas peticiones",
    message:
      "Has excedido el límite de peticiones. Por favor, intenta de nuevo más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === "/health";
  },
});

export default {
  loginLimiter,
  strictLoginLimiter,
  apiLimiter,
};
