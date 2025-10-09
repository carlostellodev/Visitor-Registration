import express from "express";
import {
  createWorker,
  getAllWorkers,
  getWorkerById,
  getWorkersByTenant,
  updateWorker,
  deactivateWorker,
  activateWorker,
  deleteWorker,
} from "../controllers/workerController.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  authorize,
  requireAdmin,
  filterByTenant,
  checkResourceOwnership,
} from "../middleware/authorize.js";
import { PERMISSIONS } from "../config/permissions.js";
import Worker from "../models/worker.js";

const router = express.Router();

// ============================================
// Rutas protegidas
// ============================================

/**
 * POST /api/workers
 * Crear worker
 * Admin: Puede crear en su tenant
 * SuperAdmin: Puede crear en cualquier tenant
 */
router.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.WORKER_CREATE),
  createWorker
);

/**
 * GET /api/workers
 * Listar todos los workers
 * SuperAdmin: Ve todos los workers de todos los tenants
 * Admin/User: Solo ve workers de su tenant
 */
router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.WORKER_READ),
  filterByTenant,
  getAllWorkers
);

/**
 * GET /api/workers/tenant/:tenantId
 * Obtener workers de un tenant específico
 * SuperAdmin: Cualquier tenant
 * Admin/User: Solo su tenant
 */
router.get(
  "/tenant/:tenantId",
  authenticate,
  authorize(PERMISSIONS.WORKER_READ, { checkTenantOwnership: true }),
  getWorkersByTenant
);

/**
 * GET /api/workers/:id
 * Obtener worker por ID
 * SuperAdmin: Cualquier worker
 * Admin/User: Solo workers de su tenant
 */
router.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.WORKER_READ),
  checkResourceOwnership(Worker),
  getWorkerById
);

/**
 * PUT /api/workers/:id
 * Actualizar worker
 * SuperAdmin: Cualquier worker
 * Admin: Solo workers de su tenant
 */
router.put(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.WORKER_UPDATE),
  checkResourceOwnership(Worker),
  updateWorker
);

/**
 * DELETE /api/workers/:id
 * Desactivar worker (soft delete)
 * SuperAdmin: Cualquier worker
 * Admin: Solo workers de su tenant
 */
router.delete(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.WORKER_DELETE),
  checkResourceOwnership(Worker),
  deactivateWorker
);

/**
 * PATCH /api/workers/:id/activate
 * Reactivar worker
 * Admin o superior
 */
router.patch(
  "/:id/activate",
  authenticate,
  requireAdmin,
  checkResourceOwnership(Worker),
  activateWorker
);

/**
 * DELETE /api/workers/:id/permanent
 * Eliminar worker permanentemente
 * Admin o superior
 */
router.delete(
  "/:id/permanent",
  authenticate,
  requireAdmin,
  checkResourceOwnership(Worker),
  deleteWorker
);

export default router;
