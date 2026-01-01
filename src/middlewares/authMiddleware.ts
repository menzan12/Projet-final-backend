import { Request, Response, NextFunction } from "express";
import * as jose from "jose";
import { JoseSecretkey } from "../utils/joseKey"; // Chemin à adapter

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token; // ou via headers

  if (!token) return res.status(401).json({ message: "Non connecté" });

  try {
    const { payload } = await jose.jwtDecrypt(token, JoseSecretkey);
    (req as any).user = payload;
    next();
  } catch (error: any) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      return res.status(401).json({ message: "Session expirée, veuillez vous reconnecter" });
    }
    return res.status(401).json({ message: "Jeton invalide" });
  }
};


