import express from "express";
import {
  createVisitor,
  getAllVisitors,
  getVisitorById,
  getVisitorsByTenant,
  getVisitorsByTenantAndDate,
  deleteVisitor,
} from "../controllers/visitorController.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  authorize,
  filterByTenant,
  checkResourceOwnership,
} from "../middleware/authorize.js";
import { PERMISSIONS } from "../config/permissions.js";
import { upload } from "../middleware/upload.js";
import Visitor from "../models/visitor.js";

const router = express.Router();

// ============================================
// Rutas protegidas
// ============================================

/**
 * POST /api/visitors
 * Crear visitante (registrar visita)
 * Todos los usuarios autenticados pueden crear visitantes
 */
router.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.VISITOR_CREATE),
  upload.single("pdf"),
  createVisitor
);

/**
 * GET /api/visitors
 * Listar todos los visitantes
 * SuperAdmin: Ve todos los visitantes de todos los tenants
 * Admin: Solo ve visitantes de su tenant
 * User: Solo ve visitantes de su tenant
 */
router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.VISITOR_READ),
  filterByTenant,
  getAllVisitors
);

/**
 * GET /api/visitors/tenant/:tenantId/date/:date
 * Obtener visitantes de un tenant en una fecha específica
 * SuperAdmin: Cualquier tenant
 * Admin: Solo su tenant
 * Esta ruta debe ir ANTES de /tenant/:tenantId para evitar conflictos
 */
router.get(
  "/tenant/:tenantId/date/:date",
  authenticate,
  authorize(PERMISSIONS.VISITOR_READ, { checkTenantOwnership: true }),
  getVisitorsByTenantAndDate
);

/**
 * GET /api/visitors/tenant/:tenantId
 * Obtener visitantes de un tenant específico
 * SuperAdmin: Cualquier tenant
 * Admin: Solo su tenant
 */
router.get(
  "/tenant/:tenantId",
  authenticate,
  authorize(PERMISSIONS.VISITOR_READ, { checkTenantOwnership: true }),
  getVisitorsByTenant
);

/**
 * GET /api/visitors/:id
 * Obtener visitante por ID
 * SuperAdmin: Cualquier visitante
 * Admin: Solo visitantes de su tenant
 */
router.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.VISITOR_READ),
  checkResourceOwnership(Visitor),
  getVisitorById
);

/**
 * DELETE /api/visitors/:id
 * Eliminar visitante
 * SuperAdmin: Cualquier visitante
 * Admin: Solo visitantes de su tenant
 */
router.delete(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.VISITOR_DELETE),
  checkResourceOwnership(Visitor),
  deleteVisitor
);

export default router;
