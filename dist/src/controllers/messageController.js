"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesByBooking = exports.getMyMessages = exports.sendMessage = void 0;
const mongoose_1 = require("mongoose");
const Message_model_1 = __importDefault(require("../models/Message.model"));
// S'assurer que le nom correspond exactement à l'import dans la route
const sendMessage = async (req, res) => {
    try {
        const { receiverId, content, booking } = req.body;
        const user = req.user;
        if (!receiverId || !content || !booking) {
            res.status(400).json({ message: "Champs obligatoires manquants" });
            return;
        }
        const message = await Message_model_1.default.create({
            sender: new mongoose_1.Types.ObjectId(user._id),
            receiver: new mongoose_1.Types.ObjectId(receiverId),
            booking: new mongoose_1.Types.ObjectId(booking),
            content,
        });
        const populated = await Message_model_1.default.findById(message._id).populate("sender", "name");
        res.status(201).json(populated);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.sendMessage = sendMessage;
// Vérifiez que le nom est bien getMyMessages
const getMyMessages = async (req, res) => {
    try {
        const user = req.user;
        const messages = await Message_model_1.default.find({
            $or: [
                { sender: new mongoose_1.Types.ObjectId(user._id) },
                { receiver: new mongoose_1.Types.ObjectId(user._id) },
            ],
        }).populate("sender receiver", "name");
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.getMyMessages = getMyMessages;
// Ajoutez cette fonction si vous l'utilisez pour le chat par booking
const getMessagesByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const messages = await Message_model_1.default.find({ booking: new mongoose_1.Types.ObjectId(bookingId) })
            .populate("sender receiver", "name")
            .sort({ createdAt: 1 });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur" });
    }
};
exports.getMessagesByBooking = getMessagesByBooking;
