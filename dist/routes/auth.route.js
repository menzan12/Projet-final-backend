"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Routes publiques
router.post("/register", authController_1.register);
router.post("/login", authController_1.login);
// Routes protégées
router.post("/logout", authMiddleware_1.protect, authController_1.logout);
router.get("/me", authMiddleware_1.protect, authController_1.getMe);
router.put("/complete-vendor-profile", authMiddleware_1.protect, authController_1.completeVendorProfile);
router.put("/update-vendor-skills", authMiddleware_1.protect, authController_1.updateVendorSkills);
router.post("/upload-vendor-docs", authMiddleware_1.protect, authController_1.uploadVendorDocs);
router.put("/update-vendor-banking", authMiddleware_1.protect, authController_1.updateVendorBanking);
exports.default = router;
