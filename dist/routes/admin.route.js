"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const adminController_1 = require("../controllers/adminController");
const router = express_1.default.Router();
/**
 * @section Business & Plans
 * Gestion des abonnements et quotas
 */
// ACCÈS VENDEUR : Envoyer une demande d'upgrade
// On utilise 'protect' mais PAS 'admin' car c'est le vendeur qui appelle cette route
router.post("/request-upgrade", authMiddleware_1.protect, adminController_1.requestUpgrade);
// ACCÈS ADMIN : Modifier manuellement le plan d'un vendeur
router.patch("/update-vendor-plan", authMiddleware_1.protect, authMiddleware_1.admin, adminController_1.updateVendorPlan);
/**
 * @section Modération & Approbations
 */
// Récupérer les vendeurs en attente de validation
router.get("/pending-vendors", authMiddleware_1.protect, authMiddleware_1.admin, adminController_1.getPendingVendors);
// Approuver un vendeur
router.patch("/approve-vendor/:vendorId", authMiddleware_1.protect, authMiddleware_1.admin, adminController_1.approveVendor);
// Refuser un vendeur
router.patch("/reject-vendor/:vendorId", authMiddleware_1.protect, authMiddleware_1.admin, adminController_1.rejectVendor);
/**
 * @section Gestion des Utilisateurs
 */
// Récupérer tous les utilisateurs (avec filtres de recherche)
router.get("/users", authMiddleware_1.protect, authMiddleware_1.admin, adminController_1.getAllUsers);
// Détails complets d'un profil
router.get("/users/:id/full-profile", authMiddleware_1.protect, authMiddleware_1.admin, adminController_1.getFullUserProfile);
exports.default = router;
