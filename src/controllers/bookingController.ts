import { Request, Response, RequestHandler } from "express";
import { Types } from "mongoose";
import Booking from "../models/Booking.model";
import Service from "../models/Service.model";

/**
 * @desc    Créer une nouvelle réservation
 * @route   POST /api/bookings
 */
export const createBooking: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { serviceId, bookingDate, notes } = req.body;
    const user = (req as any).user;

    // Utilisation de _id
    const userId = user._id || user.id;

    if (!serviceId || !Types.ObjectId.isValid(serviceId)) {
      res.status(400).json({ message: "ID du service invalide." });
      return;
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      res.status(404).json({ message: "Service introuvable." });
      return;
    }

    const newBooking = new Booking({
      service: new Types.ObjectId(serviceId),
      client: new Types.ObjectId(userId), // Utilisation de _id
      vendor: new Types.ObjectId(service.vendor as any),
      bookingDate: new Date(bookingDate),
      totalPrice: service.price,
      notes: notes || "",
      status: "pending"
    });

    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (error: any) {
    console.error("Erreur createBooking:", error.message);
    res.status(500).json({ message: "Erreur lors de la réservation." });
  }
};

/**
 * @desc    Récupérer les réservations de l'utilisateur (Client ou Vendeur)
 * @route   GET /api/bookings/my
 */
export const getMyBookings: RequestHandler = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // On récupère l'ID MongoDB correct
    const userId = user._id || user.id;

    if (!userId) {
      console.error("DEBUG: Aucun ID trouvé dans le token");
      res.status(401).json({ message: "Utilisateur non identifié" });
      return;
    }

    const userObjectId = new Types.ObjectId(userId);

    // Filtrage par rôle
    const query = user.role === "vendor" 
      ? { vendor: userObjectId } 
      : { client: userObjectId };

    const bookings = await Booking.find(query)
      .populate("service", "title price images") 
      .populate("client", "name email")
      .populate("vendor", "name email")
      .sort({ createdAt: -1 });

    console.log(`[Back] ${bookings.length} réservations trouvées pour : ${userId}`);
    res.status(200).json(bookings);
  } catch (error: any) {
    console.error("Erreur getMyBookings:", error.message);
    res.status(500).json({ message: "Erreur récupération réservations." });
  }
};

/**
 * @desc    Annuler une réservation
 * @route   PATCH /api/bookings/cancel/:id
 */
export const cancelBooking: RequestHandler = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userId = user._id || user.id;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404).json({ message: "Réservation non trouvée." });
      return;
    }

    if (booking.client.toString() !== userId.toString()) {
      res.status(403).json({ message: "Action non autorisée." });
      return;
    }

    booking.status = "cancelled";
    await booking.save();
    res.json({ message: "Réservation annulée." });
  } catch (error: any) {
    res.status(500).json({ message: "Erreur lors de l'annulation." });
  }
};

/**
 * @desc    Mettre à jour le statut (Vendeur uniquement)
 * @route   PATCH /api/bookings/status/:id
 */
export const updateBookingStatus: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const user = (req as any).user;
    const userId = user._id || user.id;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: "Réservation non trouvée." });
      return;
    }

    if (booking.vendor.toString() !== userId.toString()) {
      res.status(403).json({ message: "Interdit." });
      return;
    }

    booking.status = status;
    await booking.save();
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: "Erreur mise à jour." });
  }
};