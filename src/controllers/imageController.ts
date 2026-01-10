import { Request, Response } from "express";
import imagekit from "../utils/imagekit";


export const getAuthParams = (req: Request, res: Response) => {
  try {
    const authParams = imagekit.getAuthenticationParameters();
    res.json(authParams);
  } catch (error) {
    res.status(500).json({ message: "Erreur authentification ImageKit" });
  }
};

// On crée une fonction vide pour éviter que TypeScript ne plante
export const getMyImages = async (req: Request, res: Response) => {
  res.json({ message: "Fonctionnalité bientôt disponible" });
};