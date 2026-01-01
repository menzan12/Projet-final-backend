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
import IAConversationModel from "./models/IAConversation.model";
import cron from "node-cron";

dotenv.config();
console.log("Clé Gemini chargée :", !!process.env.GEMINI_API_KEY);
console.log("Clé OpenAI chargée :", !!process.env.OPENAI_API_KEY);
connectDB();

const app = express();

// Middlewares obligatoires
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173", 
  credentials: true 
})); 
app.use(express.json());
app.use(cookieParser()); // Indispensable pour lire le token dans les cookies

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/ai", iaRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} introuvable.` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur : http://localhost:${PORT}`));


cron.schedule("0 0 1 * *", async () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  await IAConversationModel.deleteMany({ createdAt: { $lt: oneMonthAgo } });
  console.log("[Auto-Cleanup] Messages de plus d'un mois supprimés.");
});