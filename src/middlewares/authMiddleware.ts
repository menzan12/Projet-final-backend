import { Request, Response, NextFunction } from "express";
import * as jose from "jose";
import { JoseSecretkey } from "../utils/joseKey";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Session expirée" });

  try {
    const { payload } = await jose.jwtDecrypt(token, JoseSecretkey);
    
    // Sécurité : On récupère l'ID peu importe s'il s'appelle id ou _id dans le token
    const userId = payload._id || payload.id;

    if (!userId) {
      return res.status(401).json({ message: "Token invalide : ID manquant" });
    }

    (req as any).user = {
      _id: userId.toString(), // On force _id ici
      role: payload.role
    };

    console.log(`[AUTH] Utilisateur : ${userId}`);
    next();
  } catch (error) {
    res.status(401).json({ message: "Jeton invalide" });
  }
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (user && user.role === "admin") {
    next();
  } else {
    res.status(403).json({ 
      message: "Accès refusé : droits administrateur requis" 
    });
  }
};