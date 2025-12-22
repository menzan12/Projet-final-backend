import { Request, Response } from "express";
import User from "../models/UserModel";
import { SendEmail } from "./SendEmail"; // Assure-toi du bon chemin
import { IUser } from "../types";
import bcrypt from "bcrypt";

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Veuillez remplir tous les champs." });
        }

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: "Cet utilisateur existe déjà." });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "client"
        });

        const savedUser = await newUser.save();

        // Envoi Email
        const verifyUrl = `http://localhost:5000/api/auth/verify-email/${savedUser._id}`;
        await SendEmail("Validation du compte", "Bienvenue ! Validez votre email.", savedUser.email, verifyUrl);

        return res.status(201).json({
            message: "Utilisateur créé avec succès. Email envoyé.",
            user: { id: savedUser._id, name: savedUser.name, email: savedUser.email }
        });

    } catch (error: any) {
        // Gestion propre de l'erreur MongoDB 11000 (Doublons)
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email ou téléphone déjà utilisé." });
        }
        console.error("Erreur Register:", error);
        return res.status(500).json({ message: "Erreur serveur." });
    }
};