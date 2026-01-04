// src/controllers/authController.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import { JoseSecretkey } from "../utils/joseKey";
import User from "../models/User.model";

export const login = async (req: Request, res: Response) => {
  try {
    console.log("\n=== 🔐 LOGIN ===");
    const { email, password } = req.body;
    console.log("📧 Email:", email);

    // 1️⃣ Vérifier que l'utilisateur existe
    const user = await User.findOne({ email });

    if (!user) {
      console.log("❌ Utilisateur non trouvé");
      return res.status(401).json({
        message: "Email ou mot de passe incorrect",
      });
    }

    // 2️⃣ Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("❌ Mot de passe incorrect");
      return res.status(401).json({
        message: "Email ou mot de passe incorrect",
      });
    }

    console.log("✅ Utilisateur authentifié:", user.email);

    // 3️⃣ Créer le JWT avec jose (chiffré)
    const token = await new jose.EncryptJWT({
      id: user._id.toString(),
      role: user.role,
    })
      .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .encrypt(JoseSecretkey);

    console.log("✅ Token généré:", token.substring(0, 30) + "...");

    // 4️⃣ Définir le cookie HttpOnly
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      path: "/",
    };

    res.cookie("token", token, cookieOptions);

    console.log("🍪 Cookie défini avec options:", cookieOptions);
    console.log("✅ Connexion réussie pour:", user.email);

    // 5️⃣ Retourner UNIQUEMENT les infos utilisateur
    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "Connexion réussie",
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({
      message: "Erreur lors de la connexion",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  console.log("\n=== 👋 LOGOUT ===");
  
  // Supprimer le cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  console.log("✅ Cookie supprimé");

  return res.json({
    message: "Déconnexion réussie",
  });
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ GetMe error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "client",
    });

    const token = await new jose.EncryptJWT({
      id: user._id.toString(),
      role: user.role,
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

    return res.status(201).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "Inscription réussie",
    });
  } catch (error) {
    console.error("❌ Register error:", error);
    return res.status(500).json({
      message: "Erreur lors de l'inscription",
    });
  }
};