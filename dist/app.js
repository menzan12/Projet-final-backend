"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const connexion_db_1 = __importDefault(require("./db/connexion-db"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const service_routes_1 = __importDefault(require("./routes/service.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
dotenv_1.default.config();
(0, connexion_db_1.default)();
const app = (0, express_1.default)();
// Middlewares obligatoires
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)()); // Indispensable pour lire le token dans les cookies
// Routes
app.use("/api/auth", auth_route_1.default);
app.use("/api/services", service_routes_1.default);
app.use("/api/bookings", booking_routes_1.default);
const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur actif sur le port ${PORT}`));
