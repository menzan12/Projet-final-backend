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
exports.login = void 0;
const UserModel_1 = __importDefault(require("../models/UserModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jose = __importStar(require("jose"));
const joseKey_1 = require("../utils/joseKey");
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Identifiants invalides." });
        }
        const isValid = await bcrypt_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: "Identifiants invalides." });
        }
        if (!user.isEmailVerify) {
            return res.status(403).json({ message: "Veuillez vérifier votre email avant de vous connecter." });
        }
        // Création Token JWE (Chiffré) avec Jose
        const token = await new jose.EncryptJWT({
            uid: user._id.toString(),
            role: user.role,
            email: user.email
        })
            .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
            .setIssuedAt()
            .setExpirationTime("2h")
            .encrypt(joseKey_1.JoseSecretkey);
        // Cookie HttpOnly pour la sécurité
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 2 * 60 * 60 * 1000 // 2 heures en ms
        });
        return res.status(200).json({ message: "Connecté", role: user.role });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};
exports.login = login;
