import express from "express";
import { protect } from "../middlewares/authMiddleware";
import { getImageKitAuth } from "../controllers/imageController";

const router = express.Router();

router.get("/auth", protect, getImageKitAuth);

export default router;
