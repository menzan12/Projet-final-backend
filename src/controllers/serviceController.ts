import { Request, Response } from "express";
import { Types } from "mongoose";
import Service from "../models/Service.model";

export const createService = async (req: Request, res: Response) => {
  try {
    const userAuth = (req as any).user;
    const vendorId = userAuth.id || userAuth.uid || userAuth._id;

    const { title, description, price, category, city, images } = req.body;

    const service = await Service.create({
      title,
      description,
      price: Number(price),
      category,
      city,
      images, 
      vendor: new Types.ObjectId(vendorId),
      status: "approved"
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création." });
  }
};

export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find({ status: "approved" })
      .populate("vendor", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération." });
  }
};

export const getVendorServices = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const services = await Service.find({ vendor: user.id }).sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération dashboard." });
  }
};

export const getActiveCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Service.distinct("category", { status: "approved" });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Erreur catégories." });
  }
};

export const getServiceById = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id).populate("vendor", "name email");
    if (!service) return res.status(404).json({ message: "Service introuvable." });
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = await Service.findOneAndUpdate(
      { _id: id, vendor: (req as any).user.id },
      req.body,
      { new: true }
    );
    if (!service) return res.status(404).json({ message: "Service non trouvé ou non autorisé." });
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: "Erreur mise à jour." });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    await Service.deleteOne({ _id: req.params.id, vendor: (req as any).user.id });
    res.json({ message: "Service supprimé." });
  } catch (error) {
    res.status(500).json({ message: "Erreur suppression." });
  }
};