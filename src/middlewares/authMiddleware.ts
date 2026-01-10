import { Request, Response, NextFunction } from "express";
import * as jose from "jose";
import { JoseSecretkey } from "../utils/joseKey";

// Middleware pour vérifier la session
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Session expirée" });

  try {
    const { payload } = await jose.jwtDecrypt(token, JoseSecretkey);
    
    (req as any).user = {
      _id: payload._id,
      role: payload.role // C'est ici qu'on récupère le rôle
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Jeton invalide" });
  }
};

// AJOUT : Middleware pour vérifier les droits Admin
export const admin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  // On vérifie si req.user existe et si son rôle est admin
  if (user && user.role === "admin") {
    next();
  } else {
    res.status(403).json({ 
      message: "Accès refusé : vous n'avez pas les droits administrateur" 
    });
  }
};