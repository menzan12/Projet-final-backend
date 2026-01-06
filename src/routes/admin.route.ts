import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { approveVendor } from "../controllers/adminController";

const router = express.Router();

// Route pour approuver un vendeur
// Note : Tu devrais idéalement ajouter un middleware "isAdmin" ici plus tard
router.patch("/approve-vendor/:vendorId", protect, approveVendor);

export default router;