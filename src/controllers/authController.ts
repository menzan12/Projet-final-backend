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
 * Etape 1: Complétion des infos de base
 */
export const completeVendorProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) return res.status(401).json({ message: "Non autorisé" });

    const { firstName, lastName, phone, bio, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: `${firstName} ${lastName}`,
        phone,
        bio,
        address,
        isProfileComplete: true,
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ message: "Utilisateur introuvable" });

    return res.json({ message: "Profil complété", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du profil" });
  }
};

/**
 * Etape 2: Mise à jour des compétences ET de l'image de service (ImageKit)
 */
export const updateVendorSkills = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) return res.status(401).json({ message: "Non autorisé" });

    // imageUrl provient du succès de IKUpload côté frontend
    const { category, experience, skills, imageUrl } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        vendorCategory: category,
        experienceYears: experience,
        skills: skills,
        serviceMainImage: imageUrl, // Sauvegarde de l'URL ImageKit
      },
      { new: true }
    ).select("-password");

    return res.json({
      message: "Compétences et image de service mises à jour",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour des compétences" });
  }
};

/**
 * Etape 3: Upload des documents officiels (URLs ImageKit)
 */
export const uploadVendorDocs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) return res.status(401).json({ message: "Non autorisé" });

    const { identityUrl, registrationUrl } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        documents: {
          identity: identityUrl,
          registration: registrationUrl
        }
      },
      { new: true }
    );

    return res.json({ message: "Documents enregistrés avec succès", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'upload des documents" });
  }
};

/**
 * Etape 4: Infos bancaires et soumission finale
 */
export const updateVendorBanking = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const { accountHolder, iban, bic } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        bankingInfo: { accountHolder, iban, bic },
        // On peut ajouter un flag pour dire que le dossier est prêt à être validé
        isWaitingApproval: true 
      },
      { new: true }
    );

    res.json({ message: "Informations bancaires enregistrées. Dossier en cours de revue.", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * Déconnexion
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