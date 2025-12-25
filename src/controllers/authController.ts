import { Request, Response } from "express";
import User from "../models/User.model";
import { SendEmail } from "./sendEmail"; 
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

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "client"
        });

        const savedUser = await newUser.save();
        const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/api/auth/verify-email/${savedUser._id}`;
        
        await SendEmail("Validation du compte", "Bienvenue ! Validez votre email.", savedUser.email, verifyUrl);

        return res.status(201).json({
            message: "Utilisateur créé avec succès. Email envoyé.",
            user: { id: savedUser._id, name: savedUser.name, email: savedUser.email }
        });
    } catch (error: any) {
        if (error.code === 11000) return res.status(400).json({ message: "Email déjà utilisé." });
        res.status(500).json({ message: "Erreur serveur." });
    }
};