import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { vendorApproved } from "../middlewares/vendorApproved.middleware";
import {
  createAvailability,
  getVendorAvailability
} from "../controllers/availabilityController";

const router = express.Router();

/**
 * Vendeur : créer ses créneaux
 */
router.post(
  "/",
  protect,
  vendorApproved,
  createAvailability
);

/**
 * Client : voir les créneaux d’un vendeur
 */
router.get(
  "/vendor/:vendorId",
  getVendorAvailability
);

export default router;
