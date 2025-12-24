import { Request, Response } from "express";
import { Types } from "mongoose";
import Booking from "../models/Booking.model";
import Service from "../models/Service.model";
import { CreateBookingRequestBody } from "../types";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { serviceId, bookingDate, notes }: CreateBookingRequestBody = req.body;
    const user = (req as any).user;

    // 1. VÉRIFICATION IMMÉDIATE DU FORMAT DE L'ID
    // On le fait AVANT de chercher en base de données
    if (!serviceId || !Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({ 
        message: "L'ID du service envoyé n'est pas valide." 
      });
    }

    // 2. RECHERCHE DU SERVICE
    const service = await Service.findById(serviceId);
    
    // Note : On vérifie si le service existe ET s'il est approuvé
    if (!service) {
      return res.status(404).json({ message: "Service introuvable." });
    }

    if (service.status !== "approved") {
      return res.status(400).json({ message: "Ce service n'est pas encore disponible à la réservation." });
    }

    // 3. PRÉPARATION DES DONNÉES
    const newBookingData = {
      service: new Types.ObjectId(serviceId),
      client: new Types.ObjectId(user.uid),
      vendor: new Types.ObjectId(service.vendor as any),
      bookingDate: new Date(bookingDate),
      totalPrice: service.price,
      notes: notes || "",
      status: "pending"
    };

    // 4. CRÉATION DANS LA BASE
    const booking = await Booking.create(newBookingData as any);

    res.status(201).json(booking);
  } catch (error: any) {
    console.error("Erreur exécution booking:", error.message);
    res.status(500).json({ 
      message: "Erreur lors de la réservation.",
      details: error.message 
    });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const query = user.role === "vendor" 
      ? { vendor: new Types.ObjectId(user.uid) } 
      : { client: new Types.ObjectId(user.uid) };

    const bookings = await Booking.find(query)
      .populate("service", "title price")
      .populate("client", "name email")
      .populate("vendor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération réservations." });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: "Réservation non trouvée." });

    if (booking.client.toString() !== user.uid) {
      return res.status(403).json({ message: "Action non autorisée." });
    }

    booking.status = "cancelled";
    await booking.save();
    res.json({ message: "Réservation annulée." });
  } catch (error) {
    res.status(500).json({ message: "Erreur annulation." });
  }
};

export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = (req as any).user;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Réservation non trouvée." });

    if (booking.vendor.toString() !== user.uid) {
      return res.status(403).json({ message: "Interdit." });
    }

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Erreur mise à jour." });
  }
};