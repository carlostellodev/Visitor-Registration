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
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Ruta pública
router.get("/slug/:slug", getTenantBySlug);

// Rutas protegidas
router.post("/", authMiddleware, createTenant);
router.get("/", authMiddleware, getAllTenants);
router.get("/:id", authMiddleware, getTenantById);
router.put("/:id", authMiddleware, updateTenant);
router.delete("/:id", authMiddleware, deactivateTenant);
router.patch("/:id/activate", authMiddleware, activateTenant);
router.delete("/:id/permanent", authMiddleware, deleteTenant);

export default router;
