// api/index.ts
import app from "../src/app";
import connectDB from "../src/db/connexion-db";

// Connexion à MongoDB
connectDB();

// Export pour Vercel
export default app;