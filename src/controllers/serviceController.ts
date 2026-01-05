import { Request, Response } from "express";
import { Types } from "mongoose";
import Service from "../models/Service.model";
import { CreateServiceRequestBody, UpdateServiceRequestBody } from "../types";

/**
 * RÉCUPÉRER les services du vendeur connecté
 */
export const getVendorServices = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    // Harmonisation de l'ID (tes logs montrent que c'est user.id)
    const vendorId = user.id || user.uid || user._id;

    if (!vendorId) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const services = await Service.find({ 
      vendor: new Types.ObjectId(vendorId) 
    }).sort({ createdAt: -1 });

    console.log(`DEBUG - Vendeur ${vendorId} : ${services.length} services trouvés.`);

    res.status(200).json(services);
  } catch (error) {
    console.error("ERREUR getVendorServices:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des services." });
  }
};

/**
 * CRÉER un service (Vendeur uniquement)
 */
export const createService = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (user.role !== "vendor" && user.role !== "admin") {
      return res.status(403).json({
        message: "Accès refusé. Seuls les vendeurs peuvent créer des services.",
      });
    }

    const { title, description, price, category, city, provider } =
      req.body as CreateServiceRequestBody;

    // Utilisation de l'ID correct provenant du token
    const vendorId = user.id || user.uid || user._id;

    const service = await Service.create({
      title,
      description,
      price: Number(price),
      category,
      city,
      provider,
      vendor: new Types.ObjectId(vendorId),
      status: "pending", // Reste en attente pour validation admin
    });

    res.status(201).json(service);
  } catch (error) {
    console.error("Erreur Backend Create:", error);
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
    const userId = user.id || user.uid || user._id;

    const service = await Service.findById(id);
    if (!service)
      return res.status(404).json({ message: "Service non trouvé" });

    // Vérification de propriété
    if (service.vendor.toString() !== userId && user.role !== "admin") {
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
    const userId = user.id || user.uid || user._id;

    const service = await Service.findById(id);
    if (!service)
      return res.status(404).json({ message: "Service non trouvé" });

    if (service.vendor.toString() !== userId && user.role !== "admin") {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    await service.deleteOne();
    res.json({ message: "Service supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

/**
 * RÉCUPÉRER tous les services (Public - Client)
 */
export const getAllServices = async (req: Request, res: Response) => {
  try {
    // On ne montre que les services approuvés aux clients
    const services = await Service.find({ status: "approved" })
      .populate("vendor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération services publics" });
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
    res.status(500).json({ message: "Erreur récupération catégories" });
  }
};

/**
 * RÉCUPÉRER un service par ID
 */
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id).populate("vendor", "name email");

    if (!service) {
      return res.status(404).json({ message: "Service non trouvé." });
    }

    res.status(200).json(service);
  } catch (error: any) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Format ID invalide." });
    }
    res.status(500).json({ message: "Erreur récupération service." });
  }
};