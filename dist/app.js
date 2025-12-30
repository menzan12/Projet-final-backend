"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const connexion_db_1 = __importDefault(require("./db/connexion-db"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const service_route_1 = __importDefault(require("./routes/service.route"));
const booking_route_1 = __importDefault(require("./routes/booking.route"));
const message_route_1 = __importDefault(require("./routes/message.route"));
const ia_route_1 = __importDefault(require("./routes/ia.route"));
const IAConversation_model_1 = __importDefault(require("./models/IAConversation.model"));
const node_cron_1 = __importDefault(require("node-cron"));
dotenv_1.default.config();
console.log("Clé Gemini chargée :", !!process.env.GEMINI_API_KEY);
console.log("Clé OpenAI chargée :", !!process.env.OPENAI_API_KEY);
(0, connexion_db_1.default)();
const app = (0, express_1.default)();
// Middlewares obligatoires
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)()); // Indispensable pour lire le token dans les cookies
// Routes
app.use("/api/auth", auth_route_1.default);
app.use("/api/services", service_route_1.default);
app.use("/api/bookings", booking_route_1.default);
app.use("/api/messages", message_route_1.default);
app.use("/api/ai", ia_route_1.default);
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} introuvable.` });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur : http://localhost:${PORT}`));
node_cron_1.default.schedule("0 0 1 * *", async () => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    await IAConversation_model_1.default.deleteMany({ createdAt: { $lt: oneMonthAgo } });
    console.log("[Auto-Cleanup] Messages de plus d'un mois supprimés.");
});
