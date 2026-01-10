import ImageKit from "imagekit";
import dotenv from "dotenv";
import path from "path";

// Force le chargement du .env depuis la racine du projet
dotenv.config({ path: path.join(__dirname, "../../.env") });

// Debug pour voir si les clés sont bien lues (à retirer après)
console.log("IK Public Key check:", process.env.IMAGEKIT_PUBLIC_KEY ? "Présente" : "ABSENTE");

if (!process.env.IMAGEKIT_PUBLIC_KEY) {
    throw new Error("La variable IMAGEKIT_PUBLIC_KEY est manquante dans le .env backend");
}

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!
});

export default imagekit;