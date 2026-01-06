import { Request, Response } from "express";
import User from "../models/User.model";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import { JoseSecretkey } from "../utils/joseKey";

/**
 * Connexion de l'utilisateur
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Identifiants incorrects" });
    }

    // On stocke ._id dans le payload du token
    const token = await new jose.EncryptJWT({ 
      _id: user._id.toString(), 
      role: user.role 
    })
      .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .encrypt(JoseSecretkey);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
        isAdminApproved: user.isAdminApproved,
        vendorPlan: user.vendorPlan
      },
      message: "Connexion réussie"
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "client"
    });

    return res.status(201).json({ 
      message: "Utilisateur créé avec succès", 
      _id: newUser._id 
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
};

/**
 * Récupérer l'utilisateur actuel (Me)
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) return res.status(401).json({ message: "Non autorisé" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Déconnexion (Suppression du cookie)
 */
export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({ message: "Déconnexion réussie" });
};