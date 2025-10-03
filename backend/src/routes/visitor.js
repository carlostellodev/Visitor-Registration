import express from "express";
import {
  createVisitor,
  getAllVisitors,
  getVisitorById,
  getVisitorsByTenant,
  deleteVisitor,
} from "../controllers/visitorController.js";
import authMiddleware from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.post("/", authMiddleware, upload.single("pdf"), createVisitor);
router.get("/", authMiddleware, getAllVisitors);
router.get("/tenant/:tenantId", authMiddleware, getVisitorsByTenant);
router.get("/:id", authMiddleware, getVisitorById);
router.delete("/:id", authMiddleware, deleteVisitor);

export default router;
