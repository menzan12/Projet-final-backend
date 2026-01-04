// src/controllers/statsController.ts
import { Request, Response } from "express";
import { Types } from "mongoose";
import Service from "../models/Service.model";
import Booking from "../models/Booking.model";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

export const getVendorStats = async (req: AuthRequest, res: Response) => {
  try {
    const vendorId = req.user?.id;

    if (!vendorId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    /* ======================
       1️⃣ CA du mois courant
    ====================== */
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
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const currentMonthRevenue = revenueResult[0]?.totalRevenue ?? 0;

    /* ======================
       2️⃣ CA mois précédent
    ====================== */
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
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const lastMonthRevenue = lastMonthResult[0]?.totalRevenue ?? 0;

    /* ======================
       3️⃣ Services en attente
    ====================== */
    const pendingServices = await Service.countDocuments({
      vendor: new Types.ObjectId(vendorId),
      status: "pending",
    });

    /* ======================
       4️⃣ Croissance %
    ====================== */
    let revenueGrowth = 0;
    if (lastMonthRevenue > 0) {
      revenueGrowth =
        ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
      revenueGrowth = Math.round(revenueGrowth * 10) / 10;
    } else if (currentMonthRevenue > 0) {
      // Si pas de CA le mois dernier mais du CA ce mois = 100% de croissance
      revenueGrowth = 100;
    }

    return res.json({
      currentMonthRevenue,
      revenueGrowth,
      pendingServices,
    });
  } catch (error) {
    console.error("❌ Stats error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};