"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatus = exports.cancelBooking = exports.getMyBookings = exports.createBooking = void 0;
const mongoose_1 = require("mongoose");
const Booking_model_1 = __importDefault(require("../models/Booking.model"));
const Service_model_1 = __importDefault(require("../models/Service.model"));
const createBooking = async (req, res) => {
    try {
        const { serviceId, bookingDate, notes } = req.body;
        const user = req.user;
        // 1. VÉRIFICATION IMMÉDIATE DU FORMAT DE L'ID
        // On le fait AVANT de chercher en base de données
        if (!serviceId || !mongoose_1.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({
                message: "L'ID du service envoyé n'est pas valide."
            });
        }
        // 2. RECHERCHE DU SERVICE
        const service = await Service_model_1.default.findById(serviceId);
        // Note : On vérifie si le service existe ET s'il est approuvé
        if (!service) {
            return res.status(404).json({ message: "Service introuvable." });
        }
        if (service.status !== "approved") {
            return res.status(400).json({ message: "Ce service n'est pas encore disponible à la réservation." });
        }
        // 3. PRÉPARATION DES DONNÉES
        const newBookingData = {
            service: new mongoose_1.Types.ObjectId(serviceId),
            client: new mongoose_1.Types.ObjectId(user.uid),
            vendor: new mongoose_1.Types.ObjectId(service.vendor),
            bookingDate: new Date(bookingDate),
            totalPrice: service.price,
            notes: notes || "",
            status: "pending"
        };
        // 4. CRÉATION DANS LA BASE
        const booking = await Booking_model_1.default.create(newBookingData);
        res.status(201).json(booking);
    }
    catch (error) {
        console.error("Erreur exécution booking:", error.message);
        res.status(500).json({
            message: "Erreur lors de la réservation.",
            details: error.message
        });
    }
};
exports.createBooking = createBooking;
const getMyBookings = async (req, res) => {
    try {
        const user = req.user;
        const query = user.role === "vendor"
            ? { vendor: new mongoose_1.Types.ObjectId(user.uid) }
            : { client: new mongoose_1.Types.ObjectId(user.uid) };
        const bookings = await Booking_model_1.default.find(query)
            .populate("service", "title price")
            .populate("client", "name email")
            .populate("vendor", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur récupération réservations." });
    }
};
exports.getMyBookings = getMyBookings;
const cancelBooking = async (req, res) => {
    try {
        const user = req.user;
        const booking = await Booking_model_1.default.findById(req.params.id);
        if (!booking)
            return res.status(404).json({ message: "Réservation non trouvée." });
        if (booking.client.toString() !== user.uid) {
            return res.status(403).json({ message: "Action non autorisée." });
        }
        booking.status = "cancelled";
        await booking.save();
        res.json({ message: "Réservation annulée." });
    }
    catch (error) {
        res.status(500).json({ message: "Erreur annulation." });
    }
};
exports.cancelBooking = cancelBooking;
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = req.user;
        const booking = await Booking_model_1.default.findById(id);
        if (!booking)
            return res.status(404).json({ message: "Réservation non trouvée." });
        if (booking.vendor.toString() !== user.uid) {
            return res.status(403).json({ message: "Interdit." });
        }
        booking.status = status;
        await booking.save();
        res.json(booking);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur mise à jour." });
    }
};
exports.updateBookingStatus = updateBookingStatus;
