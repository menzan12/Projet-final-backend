"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messageController_1 = require("../controllers/messageController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const Message_model_1 = __importDefault(require("../models/Message.model"));
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
// POST /api/messages -> Envoyer un message
router.post("/", authMiddleware_1.protect, messageController_1.sendMessage);
// GET /api/messages/my -> Historique global
router.get("/my", authMiddleware_1.protect, messageController_1.getMyMessages);
// GET /api/messages/booking/:bookingId -> Messages d'une réservation spécifique
router.get("/booking/:bookingId", authMiddleware_1.protect, async (req, res) => {
    const { bookingId } = req.params;
    const user = req.user;
    try {
        if (!mongoose_1.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: "ID de réservation invalide" });
        }
        // On récupère les messages liés à la réservation
        const messages = await Message_model_1.default.find({ booking: bookingId })
            .populate("sender", "_id name email") // On force l'ID et le Nom
            .populate("receiver", "_id name email")
            .sort({ createdAt: 1 });
        res.json(messages);
    }
    catch (err) {
        console.error("Erreur récupération messages:", err.message);
        res.status(500).json({ message: "Erreur serveur lors de la récupération" });
    }
});
exports.default = router;
