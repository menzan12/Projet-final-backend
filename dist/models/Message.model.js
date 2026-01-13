"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Définition du Schéma
const messageSchema = new mongoose_1.Schema({
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    booking: { type: mongoose_1.Schema.Types.ObjectId, ref: "Booking", required: true },
    content: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });
// Exportation du modèle
const Message = (0, mongoose_1.model)("Message", messageSchema);
exports.default = Message;
