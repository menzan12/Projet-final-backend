import { Request, Response } from "express";
import { Types } from "mongoose";
import Service from "../models/Service.model";
import Booking from "../models/Booking.model";

/**
 * Récupère les statistiques détaillées pour le tableau de bord vendeur
 */
export const getVendorStats = async (req: Request, res: Response) => {
  try {
    const vendorId = (req as any).user._id;

    if (!vendorId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const now = new Date();

    // Définition des intervalles de temps (Mois en cours)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Définition des intervalles de temps (Mois précédent pour la croissance)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    /* =====================================================
       1️⃣ CA du mois courant (Somme des totalPrice)
    ===================================================== */
    const revenueResult = await Booking.aggregate([
      {
        $match: {
          vendor: new Types.ObjectId(vendorId),
          status: "completed",
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" }, 
        },
      },
    ]);

    const currentMonthRevenue = revenueResult[0]?.totalRevenue ?? 0;

    /* =====================================================
       2️⃣ CA du mois précédent (Pour calculer la croissance)
    ===================================================== */
    const lastMonthResult = await Booking.aggregate([
      {
        $match: {
          vendor: new Types.ObjectId(vendorId),
          status: "completed",
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    const lastMonthRevenue = lastMonthResult[0]?.totalRevenue ?? 0;

    /* =====================================================
       3️⃣ Services en attente d'approbation
    ===================================================== */
    const pendingServices = await Service.countDocuments({
      vendor: new Types.ObjectId(vendorId),
      status: "pending",
    });

    /* =====================================================
       4️⃣ Calcul de la croissance en %
    ===================================================== */
    let revenueGrowth = 0;
    if (lastMonthRevenue > 0) {
      revenueGrowth = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
      revenueGrowth = Math.round(revenueGrowth * 10) / 10; // Arrondi à 1 décimale
    } else if (currentMonthRevenue > 0) {
      revenueGrowth = 100; // 100% de croissance si premier CA
    }

    /* =====================================================
       5️⃣ Réservations totales (Toutes périodes)
    ===================================================== */
    const totalBookings = await Booking.countDocuments({
      vendor: new Types.ObjectId(vendorId)
    });

    return res.json({
      currentMonthRevenue,
      revenueGrowth,
      pendingServices,
      totalBookings
    });

  } catch (error: any) {
    console.error("❌ Stats error:", error.message);
    return res.status(500).json({ message: "Erreur lors du calcul des statistiques" });
  }
};