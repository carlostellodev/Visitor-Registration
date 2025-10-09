import {
  hasPermission,
  isSuperAdmin,
  canAccessAllTenants,
} from "../config/permissions.js";

/**
 * Middleware principal de autorización
 * Verifica que el usuario tenga los permisos necesarios
 *
 * @param {string|string[]} requiredPermissions - Permiso(s) requerido(s)
 * @param {object} options - Opciones de configuración
 * @param {boolean} options.checkTenantOwnership - Verificar que el recurso pertenece al tenant del usuario
 * @param {boolean} options.requireAll - Requiere TODOS los permisos (default: false, requiere al menos uno)
 *
 */
export const authorize = (requiredPermissions, options = {}) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "No autenticado",
          message: "Debes iniciar sesión para acceder a este recurso",
        });
      }

      const { role, tenantId, _id: userId } = req.user;

      // SuperAdmin tiene acceso total a todo
      if (isSuperAdmin(role)) {
        return next();
      }

      // Normalizar permisos
      const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      // Verificar permisos
      const hasRequiredPermission = options.requireAll
        ? permissions.every((permission) => hasPermission(role, permission))
        : permissions.some((permission) => hasPermission(role, permission));

      if (!hasRequiredPermission) {
        return res.status(403).json({
          error: "Sin autorización",
          message: "No tienes permisos para realizar esta acción",
          requiredPermissions: permissions,
        });
      }

      // Verificar propiedad de tenant
      if (options.checkTenantOwnership && !canAccessAllTenants(role)) {
        const resourceTenantId =
          req.params.tenantId || req.body.tenantId || req.query.tenantId;

        if (resourceTenantId && resourceTenantId !== tenantId?.toString()) {
          return res.status(403).json({
            error: "Sin autorización",
            message: "No puedes acceder a recursos de otras organizaciones",
          });
        }
      }
      next();
    } catch (error) {
      res.status(500).json({
        error: "Error interno",
        message: "Error al verificar permisos",
      });
    }
  };
};

/**
 * Middleware que verifica si es SuperAdmin
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "No autenticado",
      message: "Debes iniciar sesión",
    });
  }

  if (!isSuperAdmin(req.user.role)) {
    return res.status(403).json({
      error: "Sin autorización",
      message: "Solo los superadministradores pueden acceder a este recurso",
    });
  }
  next();
};

/**
 * Middleware que verifica si es Admin o superior
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "No autenticado",
      message: "Debes iniciar sesión",
    });
  }

  const { role } = req.user;

  if (!isSuperAdmin(role) && role !== "admin") {
    return res.status(403).json({
      error: "Sin autorización",
      message: "Solo los administradores pueden acceder a este recurso",
    });
  }
  next();
};

/**
 * Middleware que filtra automáticamente por tenant
 * Para queries de base de datos
 */
export const filterByTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "No autenticado",
      message: "Debes iniciar sesión",
    });
  }

  // SuperAdmin puede ver todo
  if (isSuperAdmin(req.user.role)) {
    req.tenantFilter = {};
    return next();
  }

  // Para otros roles, filtrar por su tenant
  req.tenantFilter = { tenantId: req.user.tenantId };
  next();
};

/**
 * Middleware que verifica la propiedad de un recurso específico
 * Útil para operaciones UPDATE y DELETE
 *
 * @param {Model} Model - Modelo de Mongoose
 * @param {string} resourceIdParam - Nombre del parámetro en la URL (default: 'id')
 *
 */
export const checkResourceOwnership = (Model, resourceIdParam = "id") => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: "No autenticado",
          message: "Debes iniciar sesión",
        });
      }

      // SuperAdmin puede acceder a todo
      if (isSuperAdmin(req.user.role)) {
        return next();
      }

      const resourceId = req.params[resourceIdParam];

      if (!resourceId) {
        return res.status(400).json({
          error: "ID no proporcionado",
          message: `El parámetro '${resourceIdParam}' es requerido`,
        });
      }

      // Buscar recurso
      const resource = await Model.findById(resourceId).lean();

      if (!resource) {
        return res.status(404).json({
          error: "Recurso no encontrado",
          message: "El recurso solicitado no existe",
        });
      }

      // Verificar que el recurso pertenece al tenant del usuario
      if (resource.tenantId?.toString() !== req.user.tenantId?.toString()) {
        return res.status(403).json({
          error: "Sin autorización",
          message: "Este recurso no pertenece a tu organización",
        });
      }

      // Adjuntar recurso para uso posterior en el controlador
      req.resource = resource;
      next();
    } catch (error) {
      if (error.name === "CastError") {
        return res.status(400).json({
          error: "ID inválido",
          message: "El ID proporcionado no es válido",
        });
      }
      res.status(500).json({
        error: "Error interno",
        message: "Error al verificar permisos del recurso",
      });
    }
  };
};

/**
 * Middleware para validar que el body tenga el tenantId correcto
 * Para operaciones CREATE
 */
export const validateTenantInBody = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "No autenticado",
      message: "Debes iniciar sesión",
    });
  }

  // SuperAdmin puede especificar cualquier tenant
  if (isSuperAdmin(req.user.role)) {
    return next();
  }

  // Si el body incluye tenantId, debe coincidir con el del usuario
  if (
    req.body.tenantId &&
    req.body.tenantId !== req.user.tenantId?.toString()
  ) {
    return res.status(403).json({
      error: "Sin autorización",
      message: "No puedes crear recursos en otras organizaciones",
    });
  }

  // Forzar el tenantId del usuario en el body
  req.body.tenantId = req.user.tenantId;

  next();
};

/**
 * Helper para verificar múltiples condiciones de autorización
 */
export const authorizeAny = (...middlewares) => {
  return async (req, res, next) => {
    let lastError = null;

    for (const middleware of middlewares) {
      try {
        await new Promise((resolve, reject) => {
          middleware(req, res, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        return next();
      } catch (error) {
        lastError = error;
        continue;
      }
    }

    // Si ninguno pasó, devolver el último error
    res.status(403).json({
      error: "Sin autorización",
      message: "No cumples ninguno de los requisitos de autorización",
    });
  };
};

export default {
  authorize,
  requireSuperAdmin,
  requireAdmin,
  filterByTenant,
  checkResourceOwnership,
  validateTenantInBody,
  authorizeAny,
};
