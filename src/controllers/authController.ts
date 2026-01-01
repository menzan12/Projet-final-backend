import { Request, Response } from "express";
import User from "../models/User.model";
import { SendEmail } from "./sendEmail"; 
import bcrypt from "bcrypt";
import { appendFile } from "fs";


/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role, adminSecret } = req.body;

        // 1. Validation de base
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Veuillez remplir tous les champs." });
        }

        // 2. Vérification existence
        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: "Cet utilisateur existe déjà." });
        }

        // 3. Sécurisation du rôle
        let finalRole = role || "client";
        if (finalRole === "admin") {
            if (adminSecret !== process.env.ADMIN_REGISTRATION_SECRET) {
                return res.status(403).json({ 
                    message: "Code secret invalide. Inscription admin refusée." 
                });
            }
        }

        // 4. Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);

        // 5. Création de l'utilisateur
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: finalRole 
        });

        const savedUser = await newUser.save();

        // 6. Logique d'email
        const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/api/auth/verify-email/${savedUser._id}`;
        
        try {
            await SendEmail("Validation du compte", "Bienvenue ! Validez votre email.", savedUser.email, verifyUrl);
        } catch (emailError) {
            console.error("Erreur envoi email:", emailError);
        }

        return res.status(201).json({
            message: "Utilisateur créé avec succès.",
            user: { 
                id: savedUser._id, 
                name: savedUser.name, 
                email: savedUser.email,
                role: savedUser.role 
            }
        });

    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email déjà utilisé." });
        }
        console.error("Erreur Register:", error);
        res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
    }
};

/* Récupérer les informations de l'utilisateur connecté
 */
export const getMe = async (req: Request, res: Response) => {
    try {
        const authUser = (req as any).user;
        if (!authUser) return res.status(401).json({ message: "Non autorisé" });

        const user = await User.findById(authUser.id || authUser.uid).select("-password");
        if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

        res.json({
            id: user._id,
            name: user.name,
            role: user.role,
            email: user.email,
        });
    } catch (error) {
        console.error("Erreur GetMe:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
//Déconnexion
export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({ message: "Déconnecté" });
};