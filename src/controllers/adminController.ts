import { Request, Response } from "express";
import User from "../models/User.model";

export const approveVendor = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.params.vendorId, { isAdminApproved: true });
    res.json({ message: "Vendeur approuvé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur validation vendeur" });
  }
};