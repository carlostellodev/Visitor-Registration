import express from "express";
import { register, login, getUser } from "../controllers/authController.js";
import authenticate from "../middleware/authenticate.js";
import config from "../config/env.js";

const blockIfDisabled = (req, res, next) => {
  if (config.auth.allow_register !== "true") {
    return res.status(403).json({ message: "Registro deshabilitado" });
  }
  next();
};

const router = express.Router();

// Rutas públicas
router.post("/register", blockIfDisabled, register);
router.post("/login", login);

// Rutas protegidas
router.get("/getUser", authenticate, getUser);

export default router;
