import { Request, Response } from "express";
import { Types } from "mongoose";
import Service from "../models/Service.model";
import { CreateServiceRequestBody, UpdateServiceRequestBody } from "../types";

/**
 * CRÉER un service (Vendeur uniquement)
 */
export const createService = async (req: Request, res: Response) => {
  try {
    const { title, description, price, category }: CreateServiceRequestBody = req.body;
    const user = (req as any).user;

    // Sécurité supplémentaire : On vérifie si l'ID est valide avant de l'utiliser
    if (!user.uid || user.uid === "[object Object]") {
        return res.status(401).json({ message: "Session invalide. Veuillez vous reconnecter." });
    }

    const serviceData = {
      title,
      description,
      price: Number(price),
      category,
      vendor: new Types.ObjectId(user.uid), // Ici, user.uid sera une string hexadécimale propre
      status: "pending"
    };

    const service = await Service.create(serviceData as any);
    res.status(201).json(service);

  } catch (error: any) {
    console.error("Erreur terminal :", error);
    res.status(500).json({ 
        message: "Erreur lors de la création du service",
        details: error.message 
    });
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
    if (!service) return res.status(404).json({ message: "Service non trouvé" });

    // Sécurité : Vérifier que c'est bien le propriétaire
    if (service.vendor.toString() !== user.uid && user.role !== "admin") {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    const updatedService = await Service.findByIdAndUpdate(id, updates, { new: true });
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
    if (!service) return res.status(404).json({ message: "Service non trouvé" });

    // Sécurité : Propriétaire ou Admin uniquement
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
    // On ne récupère que les services approuvés par l'admin pour le public
    const services = await Service.find({ status: "approved" })
      .populate("vendor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des services" });
  }
};