import express from "express";
import { 
  createService, updateService, deleteService, getAllServices, 
  getServiceById, getVendorServices, getActiveCategories 
} from "../controllers/serviceController";
import { protect } from "../middlewares/authMiddleware";
import { checkServiceLimit } from "../middlewares/serviceLimit.middleware";
import { requestUpgrade } from "../controllers/adminController";

const router = express.Router();

// --- ROUTES PUBLIQUES (Tout le monde) ---
router.get("/", getAllServices);
router.get("/categories", getActiveCategories);
router.get("/detail/:id", getServiceById);

// --- ROUTES PRIVÉES (Vendeurs connectés) ---
router.use(protect); // Middleware de protection pour toutes les routes ci-dessous

// Gestion du compte/quota
router.post('/request-upgrade', requestUpgrade);

// CRUD des services
router.get("/my-services", getVendorServices);
router.post("/", checkServiceLimit, createService); // Vérifie le quota avant création
router.put("/:id", updateService);
router.delete("/:id", deleteService);

export default router;