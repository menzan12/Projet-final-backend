"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const SendEmail = async (sujet, message, email, url) => {
    try {
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_SENDER,
                pass: process.env.PASSWORD_SENDER,
            },
        });
        await transporter.sendMail({
            from: `"Support App" <${process.env.EMAIL_SENDER}>`,
            to: email,
            subject: sujet,
            text: message,
            html: url ? `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h2>${sujet}</h2>
                    <p>${message}</p>
                    <a href="${url}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Valider mon compte
                    </a>
                </div>` : `<p>${message}</p>`,
        });
        console.log("Email envoyé avec succès à :", email);
    }
    catch (error) {
        console.error("Erreur Nodemailer :", error);
        throw new Error("Impossible d'envoyer l'email.");
    }
};
exports.SendEmail = SendEmail;
