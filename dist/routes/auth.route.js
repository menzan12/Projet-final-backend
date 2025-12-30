"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const login_1 = require("../controllers/login");
const User_model_1 = __importDefault(require("../models/User.model"));
const authController_2 = require("../controllers/authController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Inscription
router.post("/register", authController_1.register);
// Connexion
router.post("/login", login_1.login);
router.get("/me", authMiddleware_1.protect, authController_2.getMe);
// Vérification d'email (Route appelée quand on clique dans l'email)
router.get("/verify-email/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User_model_1.default.findByIdAndUpdate(id, { isEmailVerify: true });
        if (!user)
            return res.status(404).send("Utilisateur non trouvé.");
        // Redirection vers ton Front-end (ex: React sur le port 3000)
        return res.redirect("http://localhost:5173/login?status=verified");
    }
    catch (error) {
        return res.status(500).send("Erreur lors de la validation.");
    }
});
exports.default = router;
