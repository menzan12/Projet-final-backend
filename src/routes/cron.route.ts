import { Router } from "express";
import IAConversationModel from "../models/IAConversation.model";

const router = Router();

router.get("/cleanup", async (req, res) => {
  // Sécurité : vérifier que la requête vient de Vercel
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const result = await IAConversationModel.deleteMany({ 
      createdAt: { $lt: oneMonthAgo } 
    });
    
    console.log("[Auto-Cleanup] Messages supprimés :", result.deletedCount);
    res.json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    console.error("[Auto-Cleanup] Erreur :", error);
    res.status(500).json({ error: "Cleanup failed" });
  }
});

export default router;