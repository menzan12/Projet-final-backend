"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllServices = exports.deleteService = exports.updateService = exports.createService = void 0;
const mongoose_1 = require("mongoose");
const Service_model_1 = __importDefault(require("../models/Service.model"));
/**
 * CRÉER un service (Vendeur uniquement)
 */
const createService = async (req, res) => {
    try {
        const { title, description, price, category } = req.body;
        const user = req.user;
        // Sécurité supplémentaire : On vérifie si l'ID est valide avant de l'utiliser
        if (!user.uid || user.uid === "[object Object]") {
            return res.status(401).json({ message: "Session invalide. Veuillez vous reconnecter." });
        }
        const serviceData = {
            title,
            description,
            price: Number(price),
            category,
            vendor: new mongoose_1.Types.ObjectId(user.uid), // Ici, user.uid sera une string hexadécimale propre
            status: "pending"
        };
        const service = await Service_model_1.default.create(serviceData);
        res.status(201).json(service);
    }
    catch (error) {
        console.error("Erreur terminal :", error);
        res.status(500).json({
            message: "Erreur lors de la création du service",
            details: error.message
        });
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
        // Sécurité : Vérifier que c'est bien le propriétaire
        if (service.vendor.toString() !== user.uid && user.role !== "admin") {
            return res.status(403).json({ message: "Action non autorisée" });
        }
        const updatedService = await Service_model_1.default.findByIdAndUpdate(id, updates, { new: true });
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
        // Sécurité : Propriétaire ou Admin uniquement
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
        // On ne récupère que les services approuvés par l'admin pour le public
        const services = await Service_model_1.default.find({ status: "approved" })
            .populate("vendor", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json(services);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des services" });
    }
};
exports.getAllServices = getAllServices;
