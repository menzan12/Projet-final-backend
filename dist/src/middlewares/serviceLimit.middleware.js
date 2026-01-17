"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkServiceLimit = void 0;
const Service_model_1 = __importDefault(require("../models/Service.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const limits = {
    free: 3,
    pro: 10,
    premium: 1000,
};
const checkServiceLimit = async (req, res, next) => {
    try {
        const userAuth = req.user;
        // Si ce n'est pas un vendeur (ex: admin), on ne bloque pas
        if (userAuth.role !== "vendor")
            return next();
        // On récupère l'utilisateur frais depuis la DB pour avoir son plan à jour
        const user = await User_model_1.default.findById(userAuth._id || userAuth.id);
        if (!user)
            return res.status(404).json({ message: "Utilisateur introuvable" });
        // 1. Sécurité : Vérification de l'approbation administrative
        if (!user.isAdminApproved) {
            return res.status(403).json({
                message: "Votre profil doit être approuvé par l'administration avant de publier des services."
            });
        }
        // 2. Calcul du quota
        const count = await Service_model_1.default.countDocuments({ vendor: user._id });
        const currentPlan = (user.vendorPlan || "free").toLowerCase();
        const limit = limits[currentPlan] || 3;
        if (count >= limit) {
            return res.status(403).json({
                message: `Limite de services atteinte pour le plan ${currentPlan.toUpperCase()} (${limit} max).`,
                currentCount: count,
                limit: limit,
                needsUpgrade: true // Flag utile pour le frontend
            });
        }
        next();
    }
    catch (error) {
        console.error("Erreur Middleware Quota:", error);
        res.status(500).json({ message: "Erreur lors de la vérification des quotas." });
    }
};
exports.checkServiceLimit = checkServiceLimit;
