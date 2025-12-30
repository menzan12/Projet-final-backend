"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.register = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const sendEmail_1 = require("./sendEmail");
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * Inscription d'un nouvel utilisateur
 */
const register = async (req, res) => {
    try {
        // 1. Extraction dynamique du rôle depuis le corps de la requête
        const { name, email, password, role } = req.body;
        // Validation des champs obligatoires
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Veuillez remplir tous les champs." });
        }
        // Vérification de l'existence de l'utilisateur
        const userExists = await User_model_1.default.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: "Cet utilisateur existe déjà." });
        }
        // Sécurité : Empêcher l'inscription directe en tant qu'admin via le client
        // Si quelqu'un tente de s'inscrire en tant qu'admin, on le force en "client"
        let finalRole = role || "client";
        if (finalRole === "admin") {
            finalRole = "client";
        }
        // Hachage du mot de passe
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        // 2. Création de l'utilisateur avec le rôle dynamique (client ou vendor)
        const newUser = new User_model_1.default({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: finalRole // Utilise la valeur nettoyée
        });
        const savedUser = await newUser.save();
        // Préparation de l'URL de vérification
        const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/api/auth/verify-email/${savedUser._id}`;
        // Envoi de l'email de bienvenue
        try {
            await (0, sendEmail_1.SendEmail)("Validation du compte", "Bienvenue ! Validez votre email.", savedUser.email, verifyUrl);
        }
        catch (emailError) {
            console.error("Erreur envoi email:", emailError);
            // On ne bloque pas la réponse si l'email échoue, l'utilisateur est quand même créé
        }
        // 3. Réponse avec le rôle inclus pour confirmation dans Postman
        return res.status(201).json({
            message: "Utilisateur créé avec succès. Email envoyé.",
            user: {
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                role: savedUser.role // Très important pour ton test
            }
        });
    }
    catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email déjà utilisé." });
        }
        console.error("Erreur Register:", error);
        res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
    }
};
exports.register = register;
/**
 * Récupérer les informations de l'utilisateur connecté
 */
const getMe = async (req, res) => {
    try {
        // On récupère l'utilisateur injecté par le middleware d'authentification
        const authUser = req.user;
        if (!authUser) {
            return res.status(401).json({ message: "Non autorisé" });
        }
        // On cherche les infos complètes en base
        const user = await User_model_1.default.findById(authUser.id || authUser.uid).select("-password");
        if (!user) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }
        res.json({
            id: user._id,
            name: user.name,
            role: user.role,
            email: user.email,
        });
    }
    catch (error) {
        console.error("Erreur GetMe:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.getMe = getMe;
