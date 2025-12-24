"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const UserModel_1 = __importDefault(require("../models/UserModel"));
const sendEmail_1 = require("./sendEmail");
const bcrypt_1 = __importDefault(require("bcrypt"));
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Veuillez remplir tous les champs." });
        }
        const userExists = await UserModel_1.default.findOne({ email: email.toLowerCase() });
        if (userExists) {
            return res.status(400).json({ message: "Cet utilisateur existe déjà." });
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        const newUser = new UserModel_1.default({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "client"
        });
        const savedUser = await newUser.save();
        const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/api/auth/verify-email/${savedUser._id}`;
        await (0, sendEmail_1.SendEmail)("Validation du compte", "Bienvenue ! Validez votre email.", savedUser.email, verifyUrl);
        return res.status(201).json({
            message: "Utilisateur créé avec succès. Email envoyé.",
            user: { id: savedUser._id, name: savedUser.name, email: savedUser.email }
        });
    }
    catch (error) {
        if (error.code === 11000)
            return res.status(400).json({ message: "Email déjà utilisé." });
        res.status(500).json({ message: "Erreur serveur." });
    }
};
exports.register = register;
