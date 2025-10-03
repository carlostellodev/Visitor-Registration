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
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, createDocument);
router.get("/", authMiddleware, getAllDocuments);
router.get("/tenant/:tenantId", authMiddleware, getDocumentsByTenant);
router.get("/:id", authMiddleware, getDocumentById);
router.put("/:id", authMiddleware, updateDocument);
router.delete("/:id", authMiddleware, deleteDocument);
router.delete("/:id/permanent", authMiddleware, permanentDeleteDocument);

export default router;
