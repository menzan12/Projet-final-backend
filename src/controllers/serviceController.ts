import { Request, Response } from "express";
import { Types } from "mongoose";
import Service from "../models/Service.model";
import { CreateServiceRequestBody, UpdateServiceRequestBody } from "../types";

/**
 * CRÉER un service (Vendeur uniquement)
 */
export const createService = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    // 🔐 Restriction de rôle
    if (user.role !== "vendor" && user.role !== "admin") {
      return res.status(403).json({
        message: "Accès refusé. Seuls les vendeurs peuvent créer des services.",
      });
    }

    const { title, description, price, category } =
      req.body as CreateServiceRequestBody;

    const service = await Service.create({
      title,
      description,
      price: Number(price),
      category,
      vendor: new Types.ObjectId(user.uid),
      status: "pending",
    });

    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création." });
  }
};

/**
 * MODIFIER un service
 */
export const updateService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: UpdateServiceRequestBody = req.body;
    const user = (req as any).user;

    const service = await Service.findById(id);
    if (!service)
      return res.status(404).json({ message: "Service non trouvé" });

    // 🔐 Propriétaire ou Admin
    if (service.vendor.toString() !== user.uid && user.role !== "admin") {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    const updatedService = await Service.findByIdAndUpdate(id, updates, {
      new: true,
    });

    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

/**
 * SUPPRIMER un service
 */
export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const service = await Service.findById(id);
    if (!service)
      return res.status(404).json({ message: "Service non trouvé" });

    // 🔐 Propriétaire ou Admin
    if (service.vendor.toString() !== user.uid && user.role !== "admin") {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    await service.deleteOne();
    res.json({ message: "Service supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

/**
 * RÉCUPÉRER tous les services (Public)
 */
export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find({ status: "approved" })
      .populate("vendor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(services);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des services" });
  }
};

/**
 * RÉCUPÉRER les catégories actives (Dynamique)
 */
export const getActiveCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Service.distinct("category", {
      status: "approved",
    });

    const categoryCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Service.countDocuments({
          category: cat,
          status: "approved",
        });
        return { name: cat, count };
      })
    );

    res.status(200).json(categoryCounts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des catégories" });
  }
};

/**
 * RÉCUPÉRER un service par son ID (Public)
 */
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // On cherche le service et on remplit les infos du vendeur (nom, email, avatar si existant)
    const service = await Service.findById(id).populate("vendor", "name email");

    if (!service) {
      return res.status(404).json({ message: "Service non trouvé." });
    }

    res.status(200).json(service);
  } catch (error: any) {
    // Gestion d'erreur si l'ID n'est pas au format valide MongoDB
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Format d'identifiant invalide." });
    }
    res.status(500).json({ message: "Erreur lors de la récupération du service." });
  }
};