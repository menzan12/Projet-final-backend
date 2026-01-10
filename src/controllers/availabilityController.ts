import { Request, Response } from "express";
import VendorAvailability from "../models/VendorAvailability.model";

export const createAvailability = async (req: Request, res: Response) => {
  try {
    const slot = await VendorAvailability.create({
      vendor: (req as any).user.id,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime
    });
    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: "Erreur création créneau" });
  }
};

export const getVendorAvailability = async (req: Request, res: Response) => {
  try {
    const slots = await VendorAvailability.find({
      vendor: req.params.vendorId,
      isBooked: false,
      date: { $gte: new Date() } 
    }).sort({ date: 1, startTime: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération créneaux" });
  }
};