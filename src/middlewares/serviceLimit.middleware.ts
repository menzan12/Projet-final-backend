import { Request, Response, NextFunction } from "express";
import Service from "../models/Service.model";
import User from "../models/User.model";

const limits: Record<string, number> = {
  free: 3,
  pro: 10,
  premium: 1000,
};

export const checkServiceLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userAuth = (req as any).user;
    
    // Si ce n'est pas un vendeur (ex: admin), on ne bloque pas
    if (userAuth.role !== "vendor") return next();

    // On récupère l'utilisateur frais depuis la DB pour avoir son plan à jour
    const user = await User.findById(userAuth._id || userAuth.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    // 1. Sécurité : Vérification de l'approbation administrative
    if (!user.isAdminApproved) {
      return res.status(403).json({ 
        message: "Votre profil doit être approuvé par l'administration avant de publier des services." 
      });
    }

    // 2. Calcul du quota
    const count = await Service.countDocuments({ vendor: user._id });
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
  } catch (error) {
    console.error("Erreur Middleware Quota:", error);
    res.status(500).json({ message: "Erreur lors de la vérification des quotas." });
  }
};