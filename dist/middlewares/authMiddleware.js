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
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jose = __importStar(require("jose"));
const joseKey_1 = require("../utils/joseKey"); // Chemin à adapter
const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token)
            return res.status(401).json({ message: "Token manquant" });
        // jose accepte directement le Buffer retourné par le hash sha256
        const { payload } = await jose.jwtDecrypt(token, joseKey_1.JoseSecretkey);
        req.user = {
            uid: String(payload.uid),
            role: payload.role,
            email: payload.email
        };
        next();
    }
    catch (error) {
        console.error("Erreur Auth Middleware:", error);
        return res.status(401).json({ message: "Session invalide" });
    }
};
exports.protect = protect;
