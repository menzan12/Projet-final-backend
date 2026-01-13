"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestUpgrade = exports.updateVendorPlan = exports.rejectVendor = exports.approveVendor = exports.getPendingVendors = exports.getFullUserProfile = exports.getAllUsers = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const Booking_model_1 = __importDefault(require("../models/Booking.model"));
const Service_model_1 = __importDefault(require("../models/Service.model"));
// --- GESTION DES UTILISATEURS ---
/**
 * 1. Liste des utilisateurs avec RECHERCHE dynamique
 */
const getAllUsers = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ]
            };
        }
        const users = await User_model_1.default.find(query)
            .select("name email role createdAt city isAdminApproved vendorPlan upgradeRequested requestedPlan")
            .sort({ createdAt: -1 });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur récupération utilisateurs" });
    }
};
exports.getAllUsers = getAllUsers;
/**
 * 2. Profil complet (Détails au clic)
 */
const getFullUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User_model_1.default.findById(userId).select("-password").lean();
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        let services = [];
        if (user.role === "vendor") {
            services = await Service_model_1.default.find({ vendor: userId }).sort({ createdAt: -1 });
        }
        const query = user.role === "vendor" ? { vendor: userId } : { client: userId };
        const bookings = await Booking_model_1.default.find(query)
            .populate("service", "title")
            .sort({ createdAt: -1 })
            .limit(20);
        const formattedBookings = bookings.map(b => ({
            _id: b._id,
            serviceName: b.service?.title || "Service supprimé",
            date: b.bookingDate || b.date,
            totalPrice: b.totalPrice,
            status: b.status
        }));
        res.json({
            ...user,
            services,
            bookings: formattedBookings
        });
    }
    catch (error) {
        console.error("Erreur getFullUserProfile:", error);
        res.status(500).json({ message: "Erreur lors de la récupération du profil" });
    }
};
exports.getFullUserProfile = getFullUserProfile;
// --- GESTION DES VENDEURS (APPROBATIONS) ---
const getPendingVendors = async (req, res) => {
    try {
        const pending = await User_model_1.default.find({
            role: "vendor",
            isWaitingApproval: true,
            isAdminApproved: false
        }).select("name email vendorCategory address createdAt city documents");
        res.json(pending);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur récupération vendeurs" });
    }
};
exports.getPendingVendors = getPendingVendors;
const approveVendor = async (req, res) => {
    try {
        const updated = await User_model_1.default.findByIdAndUpdate(req.params.vendorId, {
            isAdminApproved: true,
            isWaitingApproval: false
        }, { new: true });
        if (!updated)
            return res.status(404).json({ message: "Vendeur non trouvé" });
        res.json({ message: "Vendeur approuvé avec succès" });
    }
    catch (error) {
        res.status(500).json({ message: "Erreur validation vendeur" });
    }
};
exports.approveVendor = approveVendor;
const rejectVendor = async (req, res) => {
    try {
        const updated = await User_model_1.default.findByIdAndUpdate(req.params.vendorId, {
            isAdminApproved: false,
            isWaitingApproval: false,
            isProfileComplete: false
        }, { new: true });
        if (!updated)
            return res.status(404).json({ message: "Vendeur non trouvé" });
        res.json({ message: "Vendeur refusé. Profil réinitialisé." });
    }
    catch (error) {
        res.status(500).json({ message: "Erreur lors du rejet" });
    }
};
exports.rejectVendor = rejectVendor;
// --- GESTION BUSINESS (UPGRADES) ---
/**
 * 6. Modifier le plan d'un vendeur (Action Admin)
 */
const updateVendorPlan = async (req, res) => {
    try {
        const { userId, newPlan } = req.body;
        // Validation des types de plans autorisés
        const validPlans = ["free", "pro", "premium"];
        if (!validPlans.includes(newPlan)) {
            return res.status(400).json({ message: "Type de plan invalide" });
        }
        const user = await User_model_1.default.findById(userId);
        if (!user || user.role !== "vendor") {
            return res.status(404).json({ message: "Vendeur non trouvé" });
        }
        user.vendorPlan = newPlan;
        // On réinitialise la demande d'upgrade une fois traitée
        user.upgradeRequested = false;
        await user.save();
        res.json({
            message: `Plan de ${user.name} mis à jour vers ${newPlan}`,
            vendorPlan: user.vendorPlan
        });
    }
    catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du plan" });
    }
};
exports.updateVendorPlan = updateVendorPlan;
/**
 * 7. Demander un upgrade (Action Vendeur)
 */
const requestUpgrade = async (req, res) => {
    try {
        // Utilisation de l'ID depuis le middleware protect
        const userId = req.user._id;
        const { requestedPlan } = req.body;
        if (!["pro", "premium"].includes(requestedPlan)) {
            return res.status(400).json({ message: "Plan demandé invalide" });
        }
        await User_model_1.default.findByIdAndUpdate(userId, {
            upgradeRequested: true,
            requestedPlan: requestedPlan
        });
        res.status(200).json({ message: "Votre demande d'upgrade a été envoyée à l'administrateur." });
    }
    catch (error) {
        console.error("Erreur requestUpgrade:", error);
        res.status(500).json({ message: "Erreur serveur lors de la demande d'upgrade" });
    }
};
exports.requestUpgrade = requestUpgrade;
