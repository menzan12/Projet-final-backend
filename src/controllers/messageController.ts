import { Request, Response } from "express";
import { Types } from "mongoose"; // Import indispensable pour le typage
import Message from "../models/Message.model";
import { CreateMessageRequestBody } from "../types";

/**
 * Envoyer un message
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { receiverId, content }: CreateMessageRequestBody = req.body;
    const user = (req as any).user;

    // 1. Validation de l'ID destinataire
    if (!Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "ID destinataire invalide." });
    }

    // 2. Préparation des données avec conversion en ObjectId
    const messageData = {
      sender: new Types.ObjectId(user.uid),
      receiver: new Types.ObjectId(receiverId),
      content
    };

    // 3. Utilisation de 'as any' pour éviter l'erreur de surcharge TS
    const message = await Message.create(messageData as any);

    res.status(201).json(message);
  } catch (error: any) {
    console.error("Erreur sendMessage:", error.message);
    res.status(500).json({ message: "Erreur lors de l'envoi du message." });
  }
};

/**
 * Voir mes messages (Historique complet)
 */
export const getMyMessages = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Conversion de l'UID en ObjectId pour la requête
    const userObjectId = new Types.ObjectId(user.uid);

    const messages = await Message.find({
      $or: [
        { sender: userObjectId }, 
        { receiver: userObjectId }
      ]
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur récupération messages." });
  }
};