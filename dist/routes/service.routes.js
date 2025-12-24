"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const serviceController_1 = require("../controllers/serviceController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Public : Voir les services approuvés
router.get("/", serviceController_1.getAllServices);
// Protégé : Créer, Modifier, Supprimer (Nécessite d'être connecté)
router.post("/create", authMiddleware_1.protect, serviceController_1.createService);
router.put("/update/:id", authMiddleware_1.protect, serviceController_1.updateService);
router.delete("/delete/:id", authMiddleware_1.protect, serviceController_1.deleteService);
exports.default = router;
