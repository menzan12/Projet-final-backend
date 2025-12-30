import express from "express";
import { 
    createService, 
    updateService, 
    deleteService, 
    getAllServices, 
    getActiveCategories,
    getServiceById
} from "../controllers/serviceController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// Public : Voir les services approuvés
router.get("/", getAllServices);
router.get("/categories", getActiveCategories)
router.get("/:id", getServiceById);

// Protégé : Créer, Modifier, Supprimer (Nécessite d'être connecté)
router.post("/create", protect, createService);
router.put("/update/:id", protect, updateService);
router.delete("/delete/:id", protect, deleteService);

export default router;