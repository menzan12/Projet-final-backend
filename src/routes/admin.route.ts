import express from "express";
import { protect, admin } from "../middlewares/authMiddleware";
import { 
  getPendingVendors, 
  approveVendor, 
  rejectVendor, 
  getAllUsers, 
  getFullUserProfile,
  updateVendorPlan,
  requestUpgrade // Ajoute cet import depuis ton contrôleur
} from "../controllers/adminController";

const router = express.Router();

/**
 * @section Business & Plans
 * Gestion des abonnements et quotas
 */

// ACCÈS VENDEUR : Envoyer une demande d'upgrade
// On utilise 'protect' mais PAS 'admin' car c'est le vendeur qui appelle cette route
router.post("/request-upgrade", protect, requestUpgrade);

// ACCÈS ADMIN : Modifier manuellement le plan d'un vendeur
router.patch("/update-vendor-plan", protect, admin, updateVendorPlan);


/**
 * @section Modération & Approbations
 */

// Récupérer les vendeurs en attente de validation
router.get("/pending-vendors", protect, admin, getPendingVendors);

// Approuver un vendeur
router.patch("/approve-vendor/:vendorId", protect, admin, approveVendor);

// Refuser un vendeur
router.patch("/reject-vendor/:vendorId", protect, admin, rejectVendor);


/**
 * @section Gestion des Utilisateurs
 */

// Récupérer tous les utilisateurs (avec filtres de recherche)
router.get("/users", protect, admin, getAllUsers);

// Détails complets d'un profil
router.get("/users/:id/full-profile", protect, admin, getFullUserProfile);

export default router;