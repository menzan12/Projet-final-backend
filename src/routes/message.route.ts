import { Router } from "express";
import { sendMessage, getMyMessages } from "../controllers/messageController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

// POST /api/messages -> Pour envoyer (Fonctionne)
router.post("/", protect, sendMessage);

// GET /api/messages/my -> Pour lire tes messages (C'est celle-ci qu'il faut tester)
router.get("/my", protect, getMyMessages);

export default router;