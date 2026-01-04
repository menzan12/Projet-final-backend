import { Router } from "express";
import { sendMessage, getMyMessages } from "../controllers/messageController";
import { protect } from "../middlewares/authMiddleware";
import Message from "../models/Message.model";
import { Types } from "mongoose";

const router = Router();

// POST /api/messages -> Envoyer un message
router.post("/", protect, sendMessage);

// GET /api/messages/my -> Historique global
router.get("/my", protect, getMyMessages);

// GET /api/messages/booking/:bookingId -> Messages d'une réservation spécifique
router.get("/booking/:bookingId", protect, async (req, res) => {
  const { bookingId } = req.params;
  const user = (req as any).user;

  try {
    if (!Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "ID de réservation invalide" });
    }

    // On récupère les messages liés à la réservation
    const messages = await Message.find({ booking: bookingId })
      .populate("sender", "_id name email") // On force l'ID et le Nom
      .populate("receiver", "_id name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err: any) {
    console.error("Erreur récupération messages:", err.message);
    res.status(500).json({ message: "Erreur serveur lors de la récupération" });
  }
});

export default router;