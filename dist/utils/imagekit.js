"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const imagekit_1 = __importDefault(require("imagekit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Force le chargement du .env depuis la racine du projet
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../.env") });
// Debug pour voir si les clés sont bien lues (à retirer après)
console.log("IK Public Key check:", process.env.IMAGEKIT_PUBLIC_KEY ? "Présente" : "ABSENTE");
if (!process.env.IMAGEKIT_PUBLIC_KEY) {
    throw new Error("La variable IMAGEKIT_PUBLIC_KEY est manquante dans le .env backend");
}
const imagekit = new imagekit_1.default({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});
exports.default = imagekit;
