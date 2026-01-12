import { Request, Response } from "express";
import { Types } from "mongoose";
import Booking from "../models/Booking.model";
import Service from "../models/Service.model";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { serviceId, slot, notes } = req.body;
    const userId = (req as any).user._id;

    if (!slot || !slot.date || !slot.time) {
      return res.status(400).json({ message: "Le créneau est requis" });
    }

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: "Service introuvable" });

    // Construction de la date ISO (On dynamise l'année/mois si besoin)
    const bookingDate = new Date(`2026-10-${slot.date.padStart(2, '0')}T${slot.time}:00`); 

    const newBooking = await Booking.create({
      service: new Types.ObjectId(serviceId),
      client: new Types.ObjectId(userId),
      vendor: service.vendor,
      bookingDate: bookingDate,
      notes: notes || `Jour: ${slot.day}, Heure: ${slot.time}`,
      totalPrice: service.price,
      status: "pending"
    });

    res.status(201).json(newBooking);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur lors de la création de la réservation" });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const query = user.role === "vendor" 
      ? { vendor: user._id } 
      : { client: user._id };

    const bookings = await Booking.find(query)
      // Ajustement : on récupère 'name' au lieu de 'title' pour matcher ton UI
      .populate("service", "name price images") 
      // On récupère aussi l'avatar pour l'UI de messagerie
      .populate("client vendor", "name email avatar") 
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