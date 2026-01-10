import express from "express";
import { login, register, logout, getMe, completeVendorProfile, updateVendorSkills, uploadVendorDocs, updateVendorBanking } from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// Routes publiques
router.post("/register", register);
router.post("/login", login);

// Routes protégées
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

router.put("/complete-vendor-profile", protect, completeVendorProfile);
router.put("/update-vendor-skills", protect, updateVendorSkills);
router.post("/upload-vendor-docs", protect, uploadVendorDocs);
router.put("/update-vendor-banking", protect, updateVendorBanking)

export default router;