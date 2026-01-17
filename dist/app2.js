"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const connexion_db_1 = __importDefault(require("./db/connexion-db"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const stats_routes_1 = __importDefault(require("./routes/stats.routes"));
const service_route_1 = __importDefault(require("./routes/service.route"));
const booking_route_1 = __importDefault(require("./routes/booking.route"));
const message_route_1 = __importDefault(require("./routes/message.route"));
const image_route_1 = __importDefault(require("./routes/image.route"));
const ia_route_1 = __importDefault(require("./routes/ia.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const IAConversation_model_1 = __importDefault(require("./models/IAConversation.model"));
const node_cron_1 = __importDefault(require("node-cron"));
const cron_route_1 = __importDefault(require("./routes/cron.route"));
dotenv_1.default.config();
// Vérification des variables d'environnement critiques
console.log("Clé Gemini chargée :", !!process.env.GEMINI_API_KEY);
console.log("Clé OpenAI chargée :", !!process.env.OPENAI_API_KEY);
// Connexion à la base de données
(0, connexion_db_1.default)();
const app = (0, express_1.default)();
// Middlewares obligatoires
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)()); // Indispensable pour lire le token dans les cookies
// Routes
app.use("/api/auth", auth_route_1.default);
app.use("/api/services", service_route_1.default);
app.use("/api/bookings", booking_route_1.default);
app.use("/api/stats", stats_routes_1.default);
app.use("/api/messages", message_route_1.default);
app.use("/api/image", image_route_1.default); // Route pour ImageKit (/api/image/auth)
app.use("/api/ai", ia_route_1.default);
app.use("/api/admin", admin_route_1.default);
app.use("/api/cron", cron_route_1.default);
app.get("/", (req, res) => {
    return res.json("Bienvenu sur mon api");
});
// Middleware 404 pour les routes non définies
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} introuvable.` });
});
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur : http://localhost:${PORT}`));
// Tâche planifiée : Nettoyage mensuel des conversations IA
node_cron_1.default.schedule("0 0 1 * *", async () => {
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        await IAConversation_model_1.default.deleteMany({ createdAt: { $lt: oneMonthAgo } });
        console.log("[Auto-Cleanup] Messages de plus d'un mois supprimés.");
    }
    catch (error) {
        console.error("[Auto-Cleanup] Erreur lors du nettoyage :", error);
    }
});
exports.default = app;
