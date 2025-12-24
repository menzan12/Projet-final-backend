import { Request, Response, NextFunction } from "express";
import * as jose from "jose";
import { JoseSecretkey } from "../utils/joseKey"; // Chemin à adapter

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Token manquant" });

    // jose accepte directement le Buffer retourné par le hash sha256
    const { payload } = await jose.jwtDecrypt(token, JoseSecretkey);

    (req as any).user = {
      uid: String(payload.uid),
      role: payload.role,
      email: payload.email
    };

    next();
  } catch (error) {
    console.error("Erreur Auth Middleware:", error);
    return res.status(401).json({ message: "Session invalide" });
  }
};