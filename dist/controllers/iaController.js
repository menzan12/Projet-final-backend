"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupOldConversations = exports.ChatBotAI = void 0;
const generative_ai_1 = require("@google/generative-ai");
const openai_1 = __importDefault(require("openai"));
const chatbotContext_1 = require("../contexteAi/chatbotContext");
const IAConversation_model_1 = __importDefault(require("../models/IAConversation.model"));
const mongoose_1 = require("mongoose");
// --- FONCTION DE FALLBACK OPENAI ---
async function fallBackOpenAI(prompt, res) {
    try {
        // Initialisation LOCALE pour garantir la lecture de la clé
        const openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: chatbotContext_1.ChatBotContext },
                { role: "user", content: prompt }
            ],
        });
        return res.json({ text: response.choices[0].message.content });
    }
    catch (error) {
        console.error("Erreur critique OpenAI:", error.message);
        return res.status(500).json({ message: "IA indisponible (OpenAI Error)." });
    }
}
// --- CHATBOT PRINCIPAL ---
const ChatBotAI = async (req, res) => {
    try {
        const { text } = req.body;
        const user = req.user;
        // Diagnostic rapide dans la console
        if (!process.env.GEMINI_API_KEY)
            console.warn("Attention: GEMINI_API_KEY manquante");
        const ai = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(`Contexte: ${chatbotContext_1.ChatBotContext}\nQuestion: ${text}`);
        const answer = result.response.text();
        // Sauvegarde
        IAConversation_model_1.default.create({
            user: new mongoose_1.Types.ObjectId(user.uid),
            question: text,
            answer: answer
        }).catch(e => console.error("Erreur save DB:", e.message));
        return res.json({ text: answer });
    }
    catch (error) {
        console.error("Gemini a échoué, passage à OpenAI...");
        await fallBackOpenAI(req.body.text, res);
    }
};
exports.ChatBotAI = ChatBotAI;
//suppression des message coté ai
const cleanupOldConversations = async (req, res) => {
    try {
        // 1. Calculer la date d'il y a un mois
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        // 2. Supprimer les documents dont la date 'createdAt' est plus petite (inférieure) à un mois
        const result = await IAConversation_model_1.default.deleteMany({
            createdAt: { $lt: oneMonthAgo }
        });
        return res.status(200).json({
            success: true,
            message: "Nettoyage réussi",
            deletedCount: result.deletedCount,
            thresholdDate: oneMonthAgo
        });
    }
    catch (error) {
        console.error("Erreur lors du nettoyage des conversations:", error.message);
        return res.status(500).json({
            success: false,
            message: "Erreur lors du nettoyage de la base de données."
        });
    }
};
exports.cleanupOldConversations = cleanupOldConversations;
