import { Request, Response } from "express";
import Service from "../models/Service.model";
import { CreateServiceRequestBody, UpdateServiceRequestBody } from "../types";

export const createService = async (req: Request, res: Response) => {
  try {
    const { title, description, price, category }: CreateServiceRequestBody = req.body;
    const service = await Service.create({
      title, description, price, category,
      vendor: (req as any).user.uid 
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création" });
  }
};

export const updateService = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates: UpdateServiceRequestBody = req.body;
        const updatedService = await Service.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedService) return res.status(404).json({ message: "Service non trouvé" });
        res.status(200).json(updatedService);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service non trouvé" });

    const user = (req as any).user;
    if (service.vendor.toString() !== user.uid && user.role !== "admin") {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    await service.deleteOne();
    res.json({ message: "Service supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

// src/controllers/serviceController.ts

export const getAllServices = async (req: Request, res: Response) => {
  try {
    // On récupère les services et on "remplit" les infos du vendeur (name, email)
    const services = await Service.find({ status: "approved" }).populate("vendor", "name email");
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des services" });
  }
};