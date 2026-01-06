import { Request, Response, NextFunction } from "express";
import * as jose from "jose";
import { JoseSecretkey } from "../utils/joseKey";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Session expirée" });

  try {
    const { payload } = await jose.jwtDecrypt(token, JoseSecretkey);
    
    (req as any).user = {
      _id: payload._id,
      role: payload.role
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Jeton invalide" });
  }
};