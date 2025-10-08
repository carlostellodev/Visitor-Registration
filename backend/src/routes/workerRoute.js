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
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Rutas protegidas
router.post("/", authMiddleware, createWorker);
router.get("/", authMiddleware, getAllWorkers);
router.get("/:id", authMiddleware, getWorkerById);

router.get("/tenant/:tenantId", authMiddleware, getWorkersByTenant);

router.put("/:id", authMiddleware, updateWorker);
router.delete("/:id", authMiddleware, deactivateWorker);
router.patch("/:id/activate", authMiddleware, activateWorker);
router.delete("/:id/permanent", authMiddleware, deleteWorker);

export default router;
