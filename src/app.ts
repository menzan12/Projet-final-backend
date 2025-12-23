import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; 
import dotenv from "dotenv";
import connectDB from "./db/connexion-db";
import authRoutes from "./routes/auth.route";
import serviceRoutes from "./routes/service.routes"; 

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur actif sur le port ${PORT}`));