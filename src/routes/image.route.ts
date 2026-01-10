import { Router } from "express";
import { protect } from "../middlewares/authMiddleware"; 
import { getAuthParams, getMyImages } from "../controllers/imageController";


const router = Router();

// Le frontend appelle cette route : /api/image/auth
router.get("/auth", protect, getAuthParams);

router.get("/my-images", protect, getMyImages);

export default router;