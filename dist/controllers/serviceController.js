"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceById = exports.getActiveCategories = exports.getAllServices = exports.deleteService = exports.updateService = exports.createService = void 0;
const mongoose_1 = require("mongoose");
const Service_model_1 = __importDefault(require("../models/Service.model"));
/**
 * CRÉER un service (Vendeur uniquement)
 */
const createService = async (req, res) => {
    try {
        const user = req.user;
        // 🔐 Restriction de rôle
        if (user.role !== "vendor" && user.role !== "admin") {
            return res.status(403).json({
                message: "Accès refusé. Seuls les vendeurs peuvent créer des services.",
            });
        }
        const { title, description, price, category } = req.body;
        const service = await Service_model_1.default.create({
            title,
            description,
            price: Number(price),
            category,
            vendor: new mongoose_1.Types.ObjectId(user.uid),
            status: "pending",
        });
        res.status(201).json(service);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur lors de la création." });
    }
};
exports.createService = createService;
/**
 * MODIFIER un service
 */
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const user = req.user;
        const service = await Service_model_1.default.findById(id);
        if (!service)
            return res.status(404).json({ message: "Service non trouvé" });
        // 🔐 Propriétaire ou Admin
        if (service.vendor.toString() !== user.uid && user.role !== "admin") {
            return res.status(403).json({ message: "Action non autorisée" });
        }
        const updatedService = await Service_model_1.default.findByIdAndUpdate(id, updates, {
            new: true,
        });
        res.status(200).json(updatedService);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }
};
exports.updateService = updateService;
/**
 * SUPPRIMER un service
 */
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const service = await Service_model_1.default.findById(id);
        if (!service)
            return res.status(404).json({ message: "Service non trouvé" });
        // 🔐 Propriétaire ou Admin
        if (service.vendor.toString() !== user.uid && user.role !== "admin") {
            return res.status(403).json({ message: "Action non autorisée" });
        }
        await service.deleteOne();
        res.json({ message: "Service supprimé avec succès" });
    }
    catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression" });
    }
};
exports.deleteService = deleteService;
/**
 * RÉCUPÉRER tous les services (Public)
 */
const getAllServices = async (req, res) => {
    try {
        const services = await Service_model_1.default.find({ status: "approved" })
            .populate("vendor", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json(services);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Erreur lors de la récupération des services" });
    }
};
exports.getAllServices = getAllServices;
/**
 * RÉCUPÉRER les catégories actives (Dynamique)
 */
const getActiveCategories = async (req, res) => {
    try {
        const categories = await Service_model_1.default.distinct("category", {
            status: "approved",
        });
        const categoryCounts = await Promise.all(categories.map(async (cat) => {
            const count = await Service_model_1.default.countDocuments({
                category: cat,
                status: "approved",
            });
            return { name: cat, count };
        }));
        res.status(200).json(categoryCounts);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Erreur lors de la récupération des catégories" });
    }
};
exports.getActiveCategories = getActiveCategories;
/**
 * RÉCUPÉRER un service par son ID (Public)
 */
const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        // On cherche le service et on remplit les infos du vendeur (nom, email, avatar si existant)
        const service = await Service_model_1.default.findById(id).populate("vendor", "name email");
        if (!service) {
            return res.status(404).json({ message: "Service non trouvé." });
        }
        res.status(200).json(service);
    }
    catch (error) {
        // Gestion d'erreur si l'ID n'est pas au format valide MongoDB
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Format d'identifiant invalide." });
        }
        res.status(500).json({ message: "Erreur lors de la récupération du service." });
    }
};
exports.getServiceById = getServiceById;
