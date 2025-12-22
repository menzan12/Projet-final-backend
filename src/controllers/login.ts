import { Request, Response } from "express";
import User from "../models/UserModel";
import bcrypt from "bcrypt";
import * as jose from "jose";
import { JoseSecretkey } from "./Josekey";

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
            uid: user._id, 
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
            maxAge: 2 * 60 * 60 * 1000 // 2 heures en ms
        });

        return res.status(200).json({ message: "Connecté", role: user.role });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};