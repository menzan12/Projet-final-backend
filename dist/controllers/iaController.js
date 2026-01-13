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
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("Clé OpenAI manquante");
        }
        const openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: chatbotContext_1.ChatBotContext },
                { role: "user", content: prompt }
            ],
            max_tokens: 500,
        });
        const text = response.choices[0].message.content;
        return res.json({ text });
    }
    catch (error) {
        console.error("Erreur critique OpenAI:", error.message);
        return res.status(500).json({ message: "Désolé, nos services d'IA sont temporairement indisponibles." });
    }
}
// --- CHATBOT PRINCIPAL ---
const ChatBotAI = async (req, res) => {
    try {
        const { text } = req.body;
        const user = req.user;
        if (!text) {
            return res.status(400).json({ message: "Le texte est requis." });
        }
        // Diagnostic API Key
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY manquante, bascule immédiate sur OpenAI");
            return await fallBackOpenAI(text, res);
        }
        const ai = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
        // Construction du prompt avec contexte
        const prompt = `Tu es l'assistant de SkillMarket. Voici ton contexte: ${chatbotContext_1.ChatBotContext}\n\nUtilisateur: ${text}\nAssistant:`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let answer = response.text();
        // Nettoyage rapide (enlever les balises markdown si l'IA en met)
        answer = answer.replace(/```json|```/g, "").trim();
        // Sauvegarde asynchrone (ne bloque pas la réponse client)
        const userId = user.id || user._id || user.uid;
        if (userId) {
            IAConversation_model_1.default.create({
                user: new mongoose_1.Types.ObjectId(userId),
                question: text,
                answer: answer
            }).catch(e => console.error("Erreur save DB:", e.message));
        }
        return res.json({ text: answer });
    }
    catch (error) {
        console.error("Gemini Error:", error.message, "Passage à OpenAI...");
        // Tentative de secours avec OpenAI
        return await fallBackOpenAI(req.body.text, res);
    }
};
exports.ChatBotAI = ChatBotAI;
// --- NETTOYAGE DES CONVERSATIONS ---
const cleanupOldConversations = async (req, res) => {
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const result = await IAConversation_model_1.default.deleteMany({
            createdAt: { $lt: oneMonthAgo }
        });
        return res.status(200).json({
            success: true,
            message: `Nettoyage effectué : ${result.deletedCount} messages supprimés.`,
            thresholdDate: oneMonthAgo
        });
    }
    catch (error) {
        console.error("Erreur nettoyage:", error.message);
        return res.status(500).json({ success: false, message: "Erreur serveur lors du nettoyage." });
    }
};
exports.cleanupOldConversations = cleanupOldConversations;
