import { Request, Response, NextFunction } from "express";
import * as jose from "jose";
import { JoseSecretkey } from "../controllers/Josekey";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Accès refusé, token manquant." });
        }

        const { payload } = await jose.jwtDecrypt(token, JoseSecretkey);
        (req as any).user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide ou expiré." });
    }
};