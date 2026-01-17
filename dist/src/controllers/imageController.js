"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyImages = exports.getAuthParams = void 0;
const imagekit_1 = __importDefault(require("../utils/imagekit"));
const getAuthParams = (req, res) => {
    try {
        console.log("🔐 Génération des tokens ImageKit...");
        const authParams = imagekit_1.default.getAuthenticationParameters();
        console.log("✅ Tokens générés:", {
            signature: authParams.signature ? '✓' : '✗',
            token: authParams.token ? '✓' : '✗',
            expire: authParams.expire ? '✓' : '✗'
        });
        res.json(authParams);
    }
    catch (error) {
        console.error("❌ Erreur authentification ImageKit:", error);
        res.status(500).json({
            message: "Erreur authentification ImageKit",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getAuthParams = getAuthParams;
// CORRECTION: Ajout du mot-clé export
const getMyImages = async (req, res) => {
    res.json({ message: "Fonctionnalité bientôt disponible" });
};
exports.getMyImages = getMyImages;
