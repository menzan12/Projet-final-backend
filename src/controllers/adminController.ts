import { Request, Response } from "express";
import User from "../models/User.model";
import Booking from "../models/Booking.model";
import Service from "../models/Service.model";

// --- GESTION DES UTILISATEURS ---

/**
 * 1. Liste des utilisateurs avec RECHERCHE dynamique
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      };
    }

    const users = await User.find(query)
      .select("name email role createdAt city isAdminApproved vendorPlan") // Ajout de vendorPlan ici pour la liste
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération utilisateurs" });
  }
};

/**
 * 2. Profil complet (Détails au clic)
 */
export const getFullUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    // .lean() permet d'avoir un objet JS simple, plus rapide
    const user = await User.findById(userId).select("-password").lean();
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    let services: any[] = []; 
    
    if (user.role === "vendor") {
      services = await Service.find({ vendor: userId }).sort({ createdAt: -1 });
    }

    // On cherche les bookings soit où l'user est client, soit où il est vendeur
    const query = user.role === "vendor" ? { vendor: userId } : { client: userId };
    
    const bookings = await Booking.find(query)
      .populate("service", "title") 
      .sort({ createdAt: -1 })
      .limit(20);

    const formattedBookings = bookings.map(b => ({
      _id: b._id,
      serviceName: (b.service as any)?.title || "Service supprimé",
      date: (b as any).bookingDate || (b as any).date, // Sécurité sur le nom du champ date
      totalPrice: b.totalPrice,
      status: b.status
    }));

    res.json({
      ...user,
      services,
      bookings: formattedBookings
    });
  } catch (error) {
    console.error("Erreur getFullUserProfile:", error);
    res.status(500).json({ message: "Erreur lors de la récupération du profil" });
  }
};

// --- GESTION DES VENDEURS (APPROBATIONS) ---

/**
 * 3. Liste des vendeurs en attente de validation
 */
export const getPendingVendors = async (req: Request, res: Response) => {
  try {
    const pending = await User.find({
      role: "vendor",
      isWaitingApproval: true,
      isAdminApproved: false
    }).select("name email vendorCategory address createdAt city documents");
    
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: "Erreur récupération vendeurs" });
  }
};

/**
 * 4. Approuver un vendeur
 */
export const approveVendor = async (req: Request, res: Response) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.vendorId, { 
      isAdminApproved: true,
      isWaitingApproval: false 
    }, { new: true });

    if (!updated) return res.status(404).json({ message: "Vendeur non trouvé" });
    
    res.json({ message: "Vendeur approuvé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur validation vendeur" });
  }
};

/**
 * 5. Refuser un vendeur (réinitialise son état pour qu'il puisse corriger)
 */
export const rejectVendor = async (req: Request, res: Response) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.vendorId, { 
      isAdminApproved: false,
      isWaitingApproval: false,
      isProfileComplete: false 
    }, { new: true });

    if (!updated) return res.status(404).json({ message: "Vendeur non trouvé" });

    res.json({ message: "Vendeur refusé. Le profil a été réinitialisé pour correction." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du rejet du vendeur" });
  }
};

// --- GESTION BUSINESS ---

/**
 * 6. Modifier le plan d'un vendeur
 */
export const updateVendorPlan = async (req: Request, res: Response) => {
  try {
    const { userId, newPlan } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (user.role !== "vendor") {
      return res.status(400).json({ message: "Seuls les vendeurs possèdent un plan" });
    }

    // Mise à jour du champ vendorPlan défini dans ton modèle
    user.vendorPlan = newPlan;
    await user.save();

    res.json({
      message: `Plan de ${user.name} mis à jour : ${newPlan}`,
      vendorPlan: user.vendorPlan
    });
  } catch (error) {
    console.error("Erreur updateVendorPlan:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du plan" });
  }
};