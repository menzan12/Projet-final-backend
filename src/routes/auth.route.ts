import express from "express";
import { login, register, logout, getMe } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// Routes publiques
router.post("/register", register);
router.post("/login", login);

// Routes protégées
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

export default router;