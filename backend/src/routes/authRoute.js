import express from "express";
import { login, getUser } from "../controllers/authController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Rutas públicas
// router.post("/register", register);
router.post("/login", login);

// Rutas protegidas
router.get("/getUser", authMiddleware, getUser);

export default router;
