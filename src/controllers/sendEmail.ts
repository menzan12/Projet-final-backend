import nodemailer from "nodemailer";

export const SendEmail = async (
    sujet: string,
    message: string,
    email: string,
    url?: string | null
) => {
    try {
        const transporter = nodemailer.createTransport({
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
    } catch (error) {
        console.error("Erreur Nodemailer :", error);
        throw new Error("Impossible d'envoyer l'email.");
    }
};