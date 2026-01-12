import { Request, Response } from "express";
import imagekit from "../utils/imagekit";

export const getAuthParams = (req: Request, res: Response) => {
  try {
    console.log("🔐 Génération des tokens ImageKit...");
    
    const authParams = imagekit.getAuthenticationParameters();
    
    console.log("✅ Tokens générés:", {
      signature: authParams.signature ? '✓' : '✗',
      token: authParams.token ? '✓' : '✗',
      expire: authParams.expire ? '✓' : '✗'
    });
    
    res.json(authParams);
  } catch (error) {
    console.error("❌ Erreur authentification ImageKit:", error);
    res.status(500).json({ 
      message: "Erreur authentification ImageKit",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// CORRECTION: Ajout du mot-clé export
export const getMyImages = async (req: Request, res: Response) => {
  res.json({ message: "Fonctionnalité bientôt disponible" });
};