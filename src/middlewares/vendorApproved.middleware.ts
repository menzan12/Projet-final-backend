import { Request, Response, NextFunction } from "express";
import User from "../models/User.model";

export const vendorApproved = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userAuth = (req as any).user;
    const user = await User.findById(userAuth.id);

    if (!user || user.role !== "vendor") {
      return res.status(403).json({ message: "Accès réservé aux vendeurs" });
    }

    if (!user.isAdminApproved) {
      return res.status(403).json({ message: "Profil non validé par l'administrateur" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Erreur middleware validation" });
  }
};