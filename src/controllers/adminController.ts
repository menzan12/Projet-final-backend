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
      .select("name email role createdAt city isAdminApproved vendorPlan upgradeRequested requestedPlan") 
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
    const user = await User.findById(userId).select("-password").lean();
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    let services: any[] = []; 
    if (user.role === "vendor") {
      services = await Service.find({ vendor: userId }).sort({ createdAt: -1 });
    }

    const query = user.role === "vendor" ? { vendor: userId } : { client: userId };
    const bookings = await Booking.find(query)
      .populate("service", "title") 
      .sort({ createdAt: -1 })
      .limit(20);

    const formattedBookings = bookings.map(b => ({
      _id: b._id,
      serviceName: (b.service as any)?.title || "Service supprimé",
      date: (b as any).bookingDate || (b as any).date,
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

export const rejectVendor = async (req: Request, res: Response) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.vendorId, { 
      isAdminApproved: false,
      isWaitingApproval: false,
      isProfileComplete: false 
    }, { new: true });
    if (!updated) return res.status(404).json({ message: "Vendeur non trouvé" });
    res.json({ message: "Vendeur refusé. Profil réinitialisé." });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du rejet" });
  }
};

// --- GESTION BUSINESS (UPGRADES) ---

/**
 * 6. Modifier le plan d'un vendeur (Action Admin)
 */
export const updateVendorPlan = async (req: Request, res: Response) => {
  try {
    const { userId, newPlan } = req.body;

    // Validation des types de plans autorisés
    const validPlans = ["free", "pro", "premium"];
    if (!validPlans.includes(newPlan)) {
      return res.status(400).json({ message: "Type de plan invalide" });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== "vendor") {
      return res.status(404).json({ message: "Vendeur non trouvé" });
    }

    user.vendorPlan = newPlan;
    // On réinitialise la demande d'upgrade une fois traitée
    user.upgradeRequested = false; 
    await user.save();

    res.json({
      message: `Plan de ${user.name} mis à jour vers ${newPlan}`,
      vendorPlan: user.vendorPlan
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du plan" });
  }
};

/**
 * 7. Demander un upgrade (Action Vendeur)
 */
export const requestUpgrade = async (req: Request, res: Response) => {
  try {
    // Utilisation de l'ID depuis le middleware protect
    const userId = (req as any).user._id; 
    const { requestedPlan } = req.body;

    if (!["pro", "premium"].includes(requestedPlan)) {
      return res.status(400).json({ message: "Plan demandé invalide" });
    }

    await User.findByIdAndUpdate(userId, { 
      upgradeRequested: true,
      requestedPlan: requestedPlan 
    });

    res.status(200).json({ message: "Votre demande d'upgrade a été envoyée à l'administrateur." });
  } catch (error) {
    console.error("Erreur requestUpgrade:", error);
    res.status(500).json({ message: "Erreur serveur lors de la demande d'upgrade" });
  }
};