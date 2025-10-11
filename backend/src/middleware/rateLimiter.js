import User from "../models/user.js";
import config from "../config/env.js";

/**
 * Rate Limiter para login basado en intentos fallidos
 * Solo se activa en producción
 */
class LoginRateLimiter {
  // constructor() {
  //   // Configuración de rate limiting
  //   this.maxAttempts = 5; // Intentos máximos permitidos
  //   this.lockDuration = 1 * 60 * 1000; // 15 minutos en milisegundos
  //   this.resetTime = 60 * 60 * 1000; // 1 hora para resetear contador
  // }

  /**
   * Middleware para verificar si el usuario está bloqueado
   */
  checkRateLimit = async (req, res, next) => {
    // Solo activar en producción
    if (config.isDevelopment) {
      return next();
    }

    try {
      const { email } = req.body;

      if (!email) {
        return next();
      }

      const user = await User.findOne({ email }).select("+security");

      if (!user) {
        return next();
      }

      // Verificar si la cuenta está bloqueada
      if (user.security.lockUntil && user.security.lockUntil > new Date()) {
        const remainingTime = Math.ceil(
          (user.security.lockUntil - new Date()) / 1000 / 60
        );

        return res.status(429).json({
          message:
            "Cuenta temporalmente bloqueada por múltiples intentos fallidos",
          details: `Intente nuevamente en ${remainingTime} minutos`,
          lockedUntil: user.security.lockUntil,
        });
      }

      // Si el bloqueo expiró, resetear los intentos
      if (user.security.lockUntil && user.security.lockUntil <= new Date()) {
        user.security.loginAttempts = 0;
        user.security.lockUntil = null;
        await user.save();
      }

      req.rateLimitUser = user;
      next();
    } catch (error) {
      console.error("Error en rate limiter:", error);
      next();
    }
  };

  /**
   * Registrar intento fallido de login
   */
  async recordFailedAttempt(email) {
    if (config.isDevelopment) {
      return;
    }

    try {
      const user = await User.findOne({ email }).select(
        "+security.loginAttempts +security.lastFailedLogin +security.lockUntil"
      );

      if (!user) {
        return;
      }

      const now = new Date();

      // Si han pasado más de 1 hora desde el último intento, resetear contador
      if (
        user.security.lastFailedLogin &&
        now - user.security.lastFailedLogin > config.rateLimiter.resetTime
      ) {
        user.security.loginAttempts = 0;
      }

      // Incrementar intentos fallidos
      user.security.loginAttempts += 1;
      user.security.lastFailedLogin = now;

      // Si se alcanzó el máximo de intentos, bloquear cuenta
      if (user.security.loginAttempts >= config.rateLimiter.maxAttempts) {
        user.security.lockUntil = new Date(
          now.getTime() + config.rateLimiter.lockDuration
        );
        console.warn(
          `Usuario bloqueado por múltiples intentos fallidos: ${email}`
        );
      }

      await user.save();

      return {
        attempts: user.security.loginAttempts,
        isLocked: user.security.loginAttempts >= config.rateLimiter.maxAttempts,
        lockUntil: user.security.lockUntil,
      };
    } catch (error) {
      console.error("Error registrando intento fallido:", error);
    }
  }

  /**
   * Registrar login exitoso (resetea intentos)
   */
  async recordSuccessfulLogin(userId, ipAddress = null) {
    // Registrar tanto en desarrollo como producción
    try {
      const user = await User.findById(userId).select(
        "+security.loginAttempts +security.lastFailedLogin +security.lockUntil"
      );

      if (!user) {
        return;
      }

      user.security.loginAttempts = 0;
      user.security.lastFailedLogin = null;
      user.security.lockUntil = null;
      user.security.lastLogin = new Date();

      if (ipAddress) {
        user.security.lastLoginIp = ipAddress;
      }

      await user.save();
    } catch (error) {
      console.error("Error registrando login exitoso:", error);
    }
  }

  /**
   * Verificar estado actual de rate limiting para un email
   */
  async checkStatus(email) {
    try {
      const user = await User.findOne({ email }).select("+security");

      if (!user) {
        return null;
      }

      const isLocked =
        user.security.lockUntil && user.security.lockUntil > new Date();

      return {
        email: user.email,
        attempts: user.security.loginAttempts,
        isLocked,
        lockUntil: user.security.lockUntil,
        lastFailedLogin: user.security.lastFailedLogin,
      };
    } catch (error) {
      console.error("Error verificando estado:", error);
      return null;
    }
  }
}

export default new LoginRateLimiter();
