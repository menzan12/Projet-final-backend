import express from "express";
import { 
  createService, updateService, deleteService, getAllServices, 
  getServiceById, getVendorServices, getActiveCategories 
} from "../controllers/serviceController";
import { protect } from "../middlewares/authMiddleware";
import { checkServiceLimit } from "../middlewares/serviceLimit.middleware";

const router = express.Router();

router.get("/", getAllServices);
router.get("/categories", getActiveCategories);
router.get("/detail/:id", getServiceById);

router.get("/my-services", protect, getVendorServices);
router.post("/", protect, checkServiceLimit, createService);
router.put("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);

export default router;