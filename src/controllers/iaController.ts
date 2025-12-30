import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { ChatBotContext } from "../contexteAi/chatbotContext";
import IAConversation from "../models/IAConversation.model";
import { Types } from "mongoose";

// --- FONCTION DE FALLBACK OPENAI ---
async function fallBackOpenAI(prompt: string, res: Response) {
  try {
    // Initialisation LOCALE pour garantir la lecture de la clé
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, 
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ChatBotContext },
        { role: "user", content: prompt }
      ],
    });

    return res.json({ text: response.choices[0].message.content });
  } catch (error: any) {
    console.error("Erreur critique OpenAI:", error.message);
    return res.status(500).json({ message: "IA indisponible (OpenAI Error)." });
  }
}

// --- CHATBOT PRINCIPAL ---
export const ChatBotAI = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const user = (req as any).user;

    // Diagnostic rapide dans la console
    if (!process.env.GEMINI_API_KEY) console.warn("Attention: GEMINI_API_KEY manquante");

    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(`Contexte: ${ChatBotContext}\nQuestion: ${text}`);
    const answer = result.response.text();

    // Sauvegarde
    IAConversation.create({
      user: new Types.ObjectId(user.uid),
      question: text,
      answer: answer
    }).catch(e => console.error("Erreur save DB:", e.message));

    return res.json({ text: answer });

  } catch (error: any) {
    console.error("Gemini a échoué, passage à OpenAI...");
    await fallBackOpenAI(req.body.text, res);
  }
};


//suppression des message coté ai
export const cleanupOldConversations = async (req: Request, res: Response) => {
  try {
    // 1. Calculer la date d'il y a un mois
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // 2. Supprimer les documents dont la date 'createdAt' est plus petite (inférieure) à un mois
    const result = await IAConversation.deleteMany({
      createdAt: { $lt: oneMonthAgo }
    });

    return res.status(200).json({
      success: true,
      message: "Nettoyage réussi",
      deletedCount: result.deletedCount,
      thresholdDate: oneMonthAgo
    });
  } catch (error: any) {
    console.error("Erreur lors du nettoyage des conversations:", error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du nettoyage de la base de données."
    });
  }
};