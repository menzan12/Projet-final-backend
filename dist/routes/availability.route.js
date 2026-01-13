"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const vendorApproved_middleware_1 = require("../middlewares/vendorApproved.middleware");
const availabilityController_1 = require("../controllers/availabilityController");
const router = express_1.default.Router();
/**
 * Vendeur : créer ses créneaux
 */
router.post("/", authMiddleware_1.protect, vendorApproved_middleware_1.vendorApproved, availabilityController_1.createAvailability);
/**
 * Client : voir les créneaux d’un vendeur
 */
router.get("/vendor/:vendorId", availabilityController_1.getVendorAvailability);
exports.default = router;
