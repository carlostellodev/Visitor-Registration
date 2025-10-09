import express from "express";
import {
  createTenant,
  getAllTenants,
  getTenantById,
  getTenantBySlug,
  updateTenant,
  deactivateTenant,
  activateTenant,
  deleteTenant,
} from "../controllers/tenantController.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  authorize,
  requireSuperAdmin,
  checkResourceOwnership,
} from "../middleware/authorize.js";
import { PERMISSIONS } from "../config/permissions.js";
import Tenant from "../models/tenant.js";

const router = express.Router();

// ============================================
// Rutas públicas
// ============================================
/**
 * GET /api/tenants/slug/:slug
 * Obtener tenant por slug (para login)
 * Público - necesario para que el frontend sepa a qué tenant pertenece
 */
router.get("/slug/:slug", getTenantBySlug);

// ============================================
// Rutas protegidas
// ============================================
/**
 * POST /api/tenants
 * Crear nuevo tenant
 * Solo: SuperAdmin
 */
router.post("/", authenticate, requireSuperAdmin, createTenant);

/**
 * GET /api/tenants
 * Listar todos los tenants
 * SuperAdmin: Ve todos los tenants
 * Admin/User: Solo ve su propio tenant
 */
router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.TENANT_READ),
  getAllTenants
);

/**
 * GET /api/tenants/:id
 * Obtener tenant específico por ID
 * SuperAdmin: Cualquier tenant
 * Admin/User: Solo su propio tenant
 */
router.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.TENANT_READ, { checkTenantOwnership: true }),
  getTenantById
);

/**
 * PUT /api/tenants/:id
 * Actualizar tenant
 * SuperAdmin: Cualquier tenant
 * Admin: Solo su propio tenant
 */
router.put(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.TENANT_UPDATE),
  checkResourceOwnership(Tenant),
  updateTenant
);

/**
 * DELETE /api/tenants/:id
 * Desactivar tenant (soft delete)
 * Solo: SuperAdmin
 */
router.delete("/:id", authenticate, requireSuperAdmin, deactivateTenant);

/**
 * PATCH /api/tenants/:id/activate
 * Reactivar tenant desactivado
 * Solo: SuperAdmin
 */
router.patch("/:id/activate", authenticate, requireSuperAdmin, activateTenant);

/**
 * DELETE /api/tenants/:id/permanent
 * Eliminar tenant permanentemente (hard delete)
 * Solo: SuperAdmin
 */
router.delete("/:id/permanent", authenticate, requireSuperAdmin, deleteTenant);

export default router;
