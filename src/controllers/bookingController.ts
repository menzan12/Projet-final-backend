import { Request, Response } from "express";
import { Types } from "mongoose";
import Booking from "../models/Booking.model";
import Service from "../models/Service.model";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { serviceId, bookingDate, notes } = req.body;
    const userId = (req as any).user._id;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service introuvable" });

    const newBooking = await Booking.create({
      service: new Types.ObjectId(serviceId),
      client: new Types.ObjectId(userId),
      vendor: service.vendor,
      bookingDate: new Date(bookingDate),
      totalPrice: service.price,
      notes: notes || "",
      status: "pending"
    });

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la réservation" });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const query = user.role === "vendor" ? { vendor: new Types.ObjectId(user._id) } : { client: new Types.ObjectId(user._id) };

    const bookings = await Booking.find(query)
      .populate("service", "title price images")
      .populate("client vendor", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération réservations" });
  }
};

// AJOUT DE LA FONCTION MANQUANTE : cancelBooking
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Réservation non trouvée" });

    // Seul le client peut annuler sa propre réservation
    if (booking.client.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    booking.status = "cancelled";
    await booking.save();
    res.json({ message: "Réservation annulée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'annulation" });
  }
};

// AJOUT DE LA FONCTION MANQUANTE : updateBookingStatus
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const userId = (req as any).user._id;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Réservation non trouvée" });

    // Seul le vendeur peut modifier le statut (confirmer/terminer)
    if (booking.vendor.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Interdit : Vous n'êtes pas le vendeur de ce service" });
    }

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Erreur mise à jour statut" });
  }
};