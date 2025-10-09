import express from "express";
import {
  createDocument,
  getAllDocuments,
  getDocumentById,
  getDocumentsByTenant,
  updateDocument,
  deleteDocument,
  permanentDeleteDocument,
} from "../controllers/documentController.js";
import { authenticate } from "../middleware/authenticate.js";
import {
  authorize,
  requireAdmin,
  filterByTenant,
  checkResourceOwnership,
} from "../middleware/authorize.js";
import { PERMISSIONS } from "../config/permissions.js";
import Document from "../models/document.js";

const router = express.Router();

// ============================================
// Rutas protegidas
// ============================================

/**
 * POST /api/documents
 * Crear documento
 * Admin: Puede crear en su tenant
 * SuperAdmin: Puede crear en cualquier tenant
 */
router.post(
  "/",
  authenticate,
  authorize(PERMISSIONS.DOCUMENT_CREATE),
  createDocument
);

/**
 * GET /api/documents
 * Listar todos los documentos
 * SuperAdmin: Ve todos los documentos de todos los tenants
 * Admin/User: Solo ve documentos de su tenant
 */
router.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.DOCUMENT_READ),
  filterByTenant,
  getAllDocuments
);

/**
 * GET /api/documents/tenant/:tenantId
 * Obtener documentos de un tenant específico
 * SuperAdmin: Cualquier tenant
 * Admin/User: Solo su tenant
 */
router.get(
  "/tenant/:tenantId",
  authenticate,
  authorize(PERMISSIONS.DOCUMENT_READ, { checkTenantOwnership: true }),
  getDocumentsByTenant
);

/**
 * GET /api/documents/:id
 * Obtener documento por ID
 * SuperAdmin: Cualquier documento
 * Admin/User: Solo documentos de su tenant
 */
router.get(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.DOCUMENT_READ),
  checkResourceOwnership(Document),
  getDocumentById
);

/**
 * PUT /api/documents/:id
 * Actualizar documento
 * SuperAdmin: Cualquier documento
 * Admin: Solo documentos de su tenant
 */
router.put(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.DOCUMENT_UPDATE),
  checkResourceOwnership(Document),
  updateDocument
);

/**
 * DELETE /api/documents/:id
 * Desactivar documento (soft delete)
 * SuperAdmin: Cualquier documento
 * Admin: Solo documentos de su tenant
 */
router.delete(
  "/:id",
  authenticate,
  authorize(PERMISSIONS.DOCUMENT_DELETE),
  checkResourceOwnership(Document),
  deleteDocument
);

/**
 * DELETE /api/documents/:id/permanent
 * Eliminar documento permanentemente
 * Admin o superior
 */
router.delete(
  "/:id/permanent",
  authenticate,
  requireAdmin,
  checkResourceOwnership(Document),
  permanentDeleteDocument
);

export default router;
