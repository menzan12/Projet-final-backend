import express from "express";
import { ChatBotAI } from "../controllers/iaController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/ask",  ChatBotAI);

export default router;
