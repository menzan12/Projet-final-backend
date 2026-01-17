"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.updateVendorBanking = exports.uploadVendorDocs = exports.updateVendorSkills = exports.completeVendorProfile = exports.getMe = exports.register = exports.login = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jose = __importStar(require("jose"));
const joseKey_1 = require("../utils/joseKey");
/**
 * Connexion de l'utilisateur
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_model_1.default.findOne({ email: email.toLowerCase() });
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return res.status(401).json({ message: "Identifiants incorrects" });
        }
        const token = await new jose.EncryptJWT({
            _id: user._id.toString(),
            role: user.role
        })
            .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .encrypt(joseKey_1.JoseSecretkey);
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
    }
    catch (error) {
        res.status(500).json({ message: "Erreur lors de la connexion" });
    }
};
exports.login = login;
/**
 * Inscription d'un nouvel utilisateur
 */
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const userExists = await User_model_1.default.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: "Cet utilisateur existe déjà." });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const newUser = await User_model_1.default.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || "client"
        });
        return res.status(201).json({
            message: "Utilisateur créé avec succès",
            _id: newUser._id
        });
    }
    catch (error) {
        res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
};
exports.register = register;
/**
 * Récupérer l'utilisateur actuel (Me)
 */
const getMe = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId)
            return res.status(401).json({ message: "Non autorisé" });
        const user = await User_model_1.default.findById(userId).select("-password");
        if (!user)
            return res.status(404).json({ message: "Utilisateur introuvable" });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.getMe = getMe;
/**
 * Etape 1: Complétion des infos de base
 */
const completeVendorProfile = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId)
            return res.status(401).json({ message: "Non autorisé" });
        const { firstName, lastName, phone, bio, address } = req.body;
        const updatedUser = await User_model_1.default.findByIdAndUpdate(userId, {
            name: `${firstName} ${lastName}`,
            phone,
            bio,
            address,
            isProfileComplete: true,
        }, { new: true }).select("-password");
        if (!updatedUser)
            return res.status(404).json({ message: "Utilisateur introuvable" });
        return res.json({ message: "Profil complété", user: updatedUser });
    }
    catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du profil" });
    }
};
exports.completeVendorProfile = completeVendorProfile;
/**
 * Etape 2: Mise à jour des compétences ET de l'image de service (ImageKit)
 */
const updateVendorSkills = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId)
            return res.status(401).json({ message: "Non autorisé" });
        // imageUrl provient du succès de IKUpload côté frontend
        const { category, experience, skills, imageUrl } = req.body;
        const updatedUser = await User_model_1.default.findByIdAndUpdate(userId, {
            vendorCategory: category,
            experienceYears: experience,
            skills: skills,
            serviceMainImage: imageUrl, // Sauvegarde de l'URL ImageKit
        }, { new: true }).select("-password");
        return res.json({
            message: "Compétences et image de service mises à jour",
            user: updatedUser
        });
    }
    catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour des compétences" });
    }
};
exports.updateVendorSkills = updateVendorSkills;
/**
 * Etape 3: Upload des documents officiels (URLs ImageKit)
 */
const uploadVendorDocs = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId)
            return res.status(401).json({ message: "Non autorisé" });
        const { identityUrl, registrationUrl } = req.body;
        const updatedUser = await User_model_1.default.findByIdAndUpdate(userId, {
            documents: {
                identity: identityUrl,
                registration: registrationUrl
            }
        }, { new: true });
        return res.json({ message: "Documents enregistrés avec succès", user: updatedUser });
    }
    catch (error) {
        res.status(500).json({ message: "Erreur lors de l'upload des documents" });
    }
};
exports.uploadVendorDocs = uploadVendorDocs;
/**
 * Etape 4: Infos bancaires et soumission finale
 */
const updateVendorBanking = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { accountHolder, iban, bic } = req.body;
        const updatedUser = await User_model_1.default.findByIdAndUpdate(userId, {
            bankingInfo: { accountHolder, iban, bic },
            // On peut ajouter un flag pour dire que le dossier est prêt à être validé
            isWaitingApproval: true
        }, { new: true });
        res.json({ message: "Informations bancaires enregistrées. Dossier en cours de revue.", user: updatedUser });
    }
    catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.updateVendorBanking = updateVendorBanking;
/**
 * Déconnexion
 */
const logout = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
    });
    return res.status(200).json({ message: "Déconnexion réussie" });
};
exports.logout = logout;
