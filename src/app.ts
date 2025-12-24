import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; 
import dotenv from "dotenv";
import connectDB from "./db/connexion-db";
import authRoutes from "./routes/auth.route";
import serviceRoutes from "./routes/service.routes";
import bookingRoutes from "./routes/booking.routes";

dotenv.config();
connectDB();

const app = express();

// Middlewares obligatoires
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true })); 
app.use(express.json());
app.use(cookieParser()); // Indispensable pour lire le token dans les cookies

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur actif sur le port ${PORT}`));