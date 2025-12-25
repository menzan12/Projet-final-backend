import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; 
import connectDB from "./db/connexion-db";
import authRoutes from "./routes/auth.route";
import serviceRoutes from "./routes/service.route";
import bookingRoutes from "./routes/booking.route";
import messageRoutes from "./routes/message.route";
import iaRoutes from "./routes/ia.route";

dotenv.config();
console.log("Clé Gemini chargée :", !!process.env.GEMINI_API_KEY);
console.log("Clé OpenAI chargée :", !!process.env.OPENAI_API_KEY);
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
app.use("/api/messages", messageRoutes);
app.use("/api/ia", iaRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} introuvable.` });
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur actif sur le port ${PORT}`));