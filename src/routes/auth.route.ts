import express from "express";
import { register } from "../controllers/authController";
import { login } from "../controllers/login";
import User from "../models/UserModel";

const router = express.Router();

// Inscription
router.post("/register", register);

// Connexion
router.post("/login", login);

// Vérification d'email (Route appelée quand on clique dans l'email)
router.get("/verify-email/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, { isEmailVerify: true });

        if (!user) return res.status(404).send("Utilisateur non trouvé.");

        // Redirection vers ton Front-end (ex: React sur le port 3000)
        return res.redirect("http://localhost:3000/login?status=verified");
    } catch (error) {
        return res.status(500).send("Erreur lors de la validation.");
    }
});

export default router;