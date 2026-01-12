import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { ChatBotContext } from "../contexteAi/chatbotContext";
import IAConversation from "../models/IAConversation.model";
import { Types } from "mongoose";

// --- FONCTION DE FALLBACK OPENAI ---
async function fallBackOpenAI(prompt: string, res: Response) {
  try {
    if (!process.env.OPENAI_API_KEY) {
       throw new Error("Clé OpenAI manquante");
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ChatBotContext },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
    });

    const text = response.choices[0].message.content;
    return res.json({ text });
  } catch (error: any) {
    console.error("Erreur critique OpenAI:", error.message);
    return res.status(500).json({ message: "Désolé, nos services d'IA sont temporairement indisponibles." });
  }
}

// --- CHATBOT PRINCIPAL ---
export const ChatBotAI = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const user = (req as any).user;

    if (!text) {
      return res.status(400).json({ message: "Le texte est requis." });
    }

    // Diagnostic API Key
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY manquante, bascule immédiate sur OpenAI");
      return await fallBackOpenAI(text, res);
    }

    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construction du prompt avec contexte
    const prompt = `Tu es l'assistant de SkillMarket. Voici ton contexte: ${ChatBotContext}\n\nUtilisateur: ${text}\nAssistant:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let answer = response.text();

    // Nettoyage rapide (enlever les balises markdown si l'IA en met)
    answer = answer.replace(/```json|```/g, "").trim();

    // Sauvegarde asynchrone (ne bloque pas la réponse client)
    const userId = user.id || user._id || user.uid;
    if (userId) {
      IAConversation.create({
        user: new Types.ObjectId(userId),
        question: text,
        answer: answer
      }).catch(e => console.error("Erreur save DB:", e.message));
    }

    return res.json({ text: answer });

  } catch (error: any) {
    console.error("Gemini Error:", error.message, "Passage à OpenAI...");
    // Tentative de secours avec OpenAI
    return await fallBackOpenAI(req.body.text, res);
  }
};

// --- NETTOYAGE DES CONVERSATIONS ---
export const cleanupOldConversations = async (req: Request, res: Response) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const result = await IAConversation.deleteMany({
      createdAt: { $lt: oneMonthAgo }
    });

    return res.status(200).json({
      success: true,
      message: `Nettoyage effectué : ${result.deletedCount} messages supprimés.`,
      thresholdDate: oneMonthAgo
    });
  } catch (error: any) {
    console.error("Erreur nettoyage:", error.message);
    return res.status(500).json({ success: false, message: "Erreur serveur lors du nettoyage." });
  }
};