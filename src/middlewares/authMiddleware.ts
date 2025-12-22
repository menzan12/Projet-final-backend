import { Request, Response, NextFunction } from "express";
import * as jose from "jose";
import { JoseSecretkey } from "../controllers/Josekey";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Récupération du token depuis les cookies (nécessite cookie-parser)
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Accès refusé, token manquant." });
        }

        // Déchiffrement du token JWE
        const { payload } = await jose.jwtDecrypt(token, JoseSecretkey);

        // Ajout des infos de l'utilisateur à l'objet Request pour les routes suivantes
        (req as any).user = payload;

        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide ou expiré." });
    }
};