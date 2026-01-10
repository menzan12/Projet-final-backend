import { Request, Response, NextFunction } from "express";
import User from "../models/User.model";

export const vendorApproved = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userAuth = (req as any).user;
    // Correction : payload._id (comme défini dans ton login)
    const user = await User.findById(userAuth._id); 

    console.log(`[MIDDLEWARE] Vérification approbation pour: ${user?.email}`);

    if (!user || user.role !== "vendor") {
      return res.status(403).json({ message: "Accès réservé aux vendeurs" });
    }

    if (!user.isProfileComplete) {
      console.warn(`[MIDDLEWARE] Bloqué: Profil non complété pour ${user.email}`);
      return res.status(403).json({ message: "Veuillez d'abord compléter votre profil" });
    }

    if (!user.isAdminApproved) {
      console.warn(`[MIDDLEWARE] Bloqué: En attente de validation admin pour ${user.email}`);
      return res.status(403).json({ message: "Profil non validé par l'administrateur" });
    }

    console.log("[MIDDLEWARE] Accès autorisé");
    next();
  } catch (error) {
    console.error("[MIDDLEWARE] Erreur:", error);
    res.status(500).json({ message: "Erreur middleware validation" });
  }
};