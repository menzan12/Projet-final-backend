import { Router } from "express";
import { protect as authMiddleware } from "../middlewares/authMiddleware";
import { getVendorStats } from "../controllers/statsController";

const router = Router();

router.get("/vendor", authMiddleware, getVendorStats);

export default router;
