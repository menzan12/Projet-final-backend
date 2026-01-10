import express from "express";
import { protect, admin } from "../middlewares/authMiddleware";
import { 
  getPendingVendors, 
  approveVendor, 
  rejectVendor, 
  getAllUsers, 
  getFullUserProfile,
  updateVendorPlan // Importé depuis ton contrôleur
} from "../controllers/adminController";

const router = express.Router();

/**
 * @section Modération & Approbations
 * Gère le flux d'entrée des nouveaux prestataires
 */

// Récupérer les vendeurs qui attendent d'être validés
router.get("/pending-vendors", protect, admin, getPendingVendors);

// Approuver un vendeur (isWaitingApproval: false, isAdminApproved: true)
router.patch("/approve-vendor/:vendorId", protect, admin, approveVendor);

// Refuser un vendeur (suppression des documents ou réinitialisation)
router.patch("/reject-vendor/:vendorId", protect, admin, rejectVendor);


/**
 * @section Gestion des Utilisateurs & Communauté
 * Consultation de la base de données globale
 */

// Récupérer tous les utilisateurs (avec filtres possibles : client/vendor)
router.get("/users", protect, admin, getAllUsers);

// Récupérer les détails profonds (Profil + Services + Bookings)
router.get("/users/:id/full-profile", protect, admin, getFullUserProfile);


/**
 * @section Business & Plans
 * Gestion commerciale des comptes prestataires
 */

// Modifier manuellement le plan (free, pro, premium) d'un vendeur
router.patch("/update-vendor-plan", protect, admin, updateVendorPlan);


export default router;