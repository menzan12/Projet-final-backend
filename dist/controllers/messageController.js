"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyMessages = exports.sendMessage = void 0;
const mongoose_1 = require("mongoose"); // Import indispensable pour le typage
const Message_model_1 = __importDefault(require("../models/Message.model"));
/**
 * Envoyer un message
 */
const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const user = req.user;
        // 1. Validation de l'ID destinataire
        if (!mongoose_1.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "ID destinataire invalide." });
        }
        // 2. Préparation des données avec conversion en ObjectId
        const messageData = {
            sender: new mongoose_1.Types.ObjectId(user.uid),
            receiver: new mongoose_1.Types.ObjectId(receiverId),
            content
        };
        // 3. Utilisation de 'as any' pour éviter l'erreur de surcharge TS
        const message = await Message_model_1.default.create(messageData);
        res.status(201).json(message);
    }
    catch (error) {
        console.error("Erreur sendMessage:", error.message);
        res.status(500).json({ message: "Erreur lors de l'envoi du message." });
    }
};
exports.sendMessage = sendMessage;
/**
 * Voir mes messages (Historique complet)
 */
const getMyMessages = async (req, res) => {
    try {
        const user = req.user;
        // Conversion de l'UID en ObjectId pour la requête
        const userObjectId = new mongoose_1.Types.ObjectId(user.uid);
        const messages = await Message_model_1.default.find({
            $or: [
                { sender: userObjectId },
                { receiver: userObjectId }
            ]
        })
            .populate("sender", "name email")
            .populate("receiver", "name email")
            .sort({ createdAt: -1 });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur récupération messages." });
    }
};
exports.getMyMessages = getMyMessages;
