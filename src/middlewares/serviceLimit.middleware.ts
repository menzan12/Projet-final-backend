import { Request, Response, NextFunction } from "express";
import Service from "../models/Service.model";
import User from "../models/User.model";

const limits: Record<string, number> = {
  free: 1,
  pro: 3,
  premium: 1000,
};

export const checkServiceLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userAuth = (req as any).user;
    if (userAuth.role !== "vendor") return next();

    const user = await User.findById(userAuth.id || userAuth.uid);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    // Vérification de la validation administrative
    if (!user.isAdminApproved) {
      return res.status(403).json({ message: "Profil en attente de validation admin." });
    }

    const count = await Service.countDocuments({ vendor: user._id });
    const currentPlan = (user as any).vendorPlan || "free";
    const limit = limits[currentPlan as keyof typeof limits];

    if (count >= limit) {
      return res.status(403).json({ message: `Limite atteinte (${limit} services max).` });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Erreur vérification quotas." });
  }
};