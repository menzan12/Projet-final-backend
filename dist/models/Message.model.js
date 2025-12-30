"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });
// Indexation pour optimiser les recherches de conversations
messageSchema.index({ sender: 1, receiver: 1 });
exports.default = (0, mongoose_1.model)("Message", messageSchema);
