// Installe d'abord : npm install cookie-parser
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; 
import dotenv from "dotenv";
import connectDB from "./db/connexion-db";
import authRoutes from "./routes/auth.route";

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true })); // Autorise les cookies
app.use(express.json());
app.use(cookieParser()); // Crucial pour lire les cookies du Login

app.use("/api/auth", authRoutes);

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur actif sur le port ${PORT}`));