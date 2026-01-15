"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const IAConversation_model_1 = __importDefault(require("../models/IAConversation.model"));
const router = (0, express_1.Router)();
router.get("/cleanup", async (req, res) => {
    // Sécurité : vérifier que la requête vient de Vercel
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const result = await IAConversation_model_1.default.deleteMany({
            createdAt: { $lt: oneMonthAgo }
        });
        console.log("[Auto-Cleanup] Messages supprimés :", result.deletedCount);
        res.json({ success: true, deleted: result.deletedCount });
    }
    catch (error) {
        console.error("[Auto-Cleanup] Erreur :", error);
        res.status(500).json({ error: "Cleanup failed" });
    }
});
exports.default = router;
