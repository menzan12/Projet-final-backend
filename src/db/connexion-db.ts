import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI non défini dans .env");
    }

    await mongoose.connect(uri, {
        dbName: "projetFinal" 
    });

    console.log("MongoDB connecté ");
  } catch (error: any) {
    console.error(" Erreur de connexion MongoDB :", error.message);
    process.exit(1); 
  }
};

export default connectDB;