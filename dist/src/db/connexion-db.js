"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI non défini dans .env");
        }
        await mongoose_1.default.connect(uri, {
            dbName: "projetFinal"
        });
        console.log("MongoDB connecté ");
    }
    catch (error) {
        console.error(" Erreur de connexion MongoDB :", error.message);
        process.exit(1);
    }
};
exports.default = connectDB;
