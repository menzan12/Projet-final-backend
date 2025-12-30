import { Request, Response } from "express";
import User from "../models/User.model";
import bcrypt from "bcrypt";
import * as jose from "jose";
import { JoseSecretkey } from "../utils/joseKey";

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Identifiants invalides." });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: "Identifiants invalides." });
        }

        if (!user.isEmailVerify) {
            return res.status(403).json({ message: "Veuillez vérifier votre email avant de vous connecter." });
        }

        // Création Token JWE (Chiffré) avec Jose
        const token = await new jose.EncryptJWT({ 
            uid: user._id.toString(), 
            role: user.role,
            email: user.email 
        })
            .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
            .setIssuedAt()
            .setExpirationTime("2h")
            .encrypt(JoseSecretkey);

        // Cookie HttpOnly pour la sécurité
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours en ms
        });

        return res.status(200).json({ message: "Connecté", role: user.role });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};

// Récupérer les infos de l'utilisateur connecté
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user; // Injecté par le middleware 'protect'
    
    if (!user) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    // On renvoie les infos de base (on ne renvoie JAMAIS le mot de passe)
    return res.status(200).json({
      id: user.uid,
      role: user.role,
      email: user.email,
      name: user.name // Assure-toi que ton middleware 'protect' extrait bien le nom si besoin
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};