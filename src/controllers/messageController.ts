import { Request, Response } from "express";
import { Types } from "mongoose";
import Message from "../models/Message.model";

// S'assurer que le nom correspond exactement à l'import dans la route
export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { receiverId, content, booking } = req.body;
    const user = (req as any).user;

    if (!receiverId || !content || !booking) {
      res.status(400).json({ message: "Champs obligatoires manquants" });
      return;
    }

    const message = await Message.create({
      sender: new Types.ObjectId(user._id),
      receiver: new Types.ObjectId(receiverId),
      booking: new Types.ObjectId(booking),
      content,
    });

    const populated = await Message.findById(message._id).populate("sender", "name");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Vérifiez que le nom est bien getMyMessages
export const getMyMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const messages = await Message.find({
      $or: [
        { sender: new Types.ObjectId(user._id) },
        { receiver: new Types.ObjectId(user._id) },
      ],
    }).populate("sender receiver", "name");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Ajoutez cette fonction si vous l'utilisez pour le chat par booking
export const getMessagesByBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;
    const messages = await Message.find({ booking: new Types.ObjectId(bookingId) })
      .populate("sender receiver", "name")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Erreur" });
  }
};