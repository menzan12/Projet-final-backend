import { Request, Response } from "express";
import { Types } from "mongoose";
import Service from "../models/Service.model";

/**
 * CRÉER UN SERVICE
 */
export const createService = async (req: Request, res: Response) => {
  console.log("🚀 [DEBUG] DÉBUT createService");
  console.log("📦 [BODY] :", JSON.stringify(req.body, null, 2));

  try {
    const userAuth = (req as any).user;
    
    if (!userAuth) {
      console.error("❌ [ERREUR AUTH] req.user est vide. Le token n'est pas passé ou mal décodé.");
      return res.status(401).json({ message: "Utilisateur non identifié." });
    }

    // On s'assure de récupérer l'ID peu importe le format du payload JWT
    const vendorId = userAuth._id || userAuth.id;
    console.log("👤 [VENDOR ID] :", vendorId);

    // Extraction des champs
    let { title, description, price, category, city, images, availability } = req.body;

    // --- LOGIQUE DE PARSING ---
    if (availability && typeof availability === "string") {
      try {
        console.log("⚙️ [PARSING] Transformation de la chaîne availability...");
        availability = JSON.parse(availability);
      } catch (e) {
        console.error("❌ [PARSING ERROR] Échec du JSON.parse sur availability :", e);
      }
    }

    // Validation manuelle de sécurité
    if (!title || !price || !vendorId) {
      console.error("⚠️ [VALIDATION FAIL] Champs manquants :", { 
        hasTitle: !!title, 
        hasPrice: !!price, 
        hasVendor: !!vendorId 
      });
      return res.status(400).json({ message: "Données obligatoires manquantes (titre, prix ou ID vendeur)." });
    }

    // --- CRÉATION EN BASE ---
    console.log("💾 [DB] Tentative d'écriture dans MongoDB...");
    
    const service = await Service.create({
      title,
      description,
      price: Number(price),
      category,
      city,
      images: images || [], 
      availability: availability || [],
      vendor: new Types.ObjectId(vendorId as string),
      status: "approved"
    });

    console.log("✅ [SUCCÈS] Service créé avec l'ID :", service._id);
    return res.status(201).json(service);

  } catch (error: any) {
    console.error("🔥 [CRASH] Erreur capturée dans createService :");
    console.error("Message :", error.message);
    
    if (error.name === "ValidationError") {
      console.error("❌ [MONGOOSE VALIDATION ERROR] :", JSON.stringify(error.errors, null, 2));
      return res.status(400).json({ 
        message: "Erreur de validation des données.", 
        details: error.errors 
      });
    }

    console.error("Stack :", error.stack);
    return res.status(500).json({ 
      message: "Erreur serveur lors de la création.", 
      error: error.message 
    });
  }
};

/**
 * RÉCUPÉRER TOUS LES SERVICES (PUBLIC)
 */
export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find({ status: "approved" })
      .populate("vendor", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error: any) {
    console.error("❌ [ERREUR] getAllServices :", error.message);
    res.status(500).json({ message: "Erreur récupération des services." });
  }
};

/**
 * RÉCUPÉRER LES SERVICES DU VENDEUR (DASHBOARD)
 */
export const getVendorServices = async (req: Request, res: Response) => {
  console.log("🔍 [DEBUG] Récupération services vendeur");
  try {
    const user = (req as any).user;
    if (!user) {
      console.error("❌ [ERREUR] req.user absent");
      return res.status(401).json({ message: "Veuillez vous reconnecter." });
    }

    const vendorId = user._id || user.id;
    console.log("📡 [QUERY] Recherche pour vendorId :", vendorId);

    if (!Types.ObjectId.isValid(vendorId)) {
      console.error("❌ [INVALID ID] ID Vendeur non conforme.");
      return res.status(400).json({ message: "ID Vendeur invalide." });
    }

    const services = await Service.find({ vendor: vendorId }).sort({ createdAt: -1 });
    console.log(`📊 [INFO] ${services.length} services trouvés.`);
    res.status(200).json(services);
  } catch (error: any) {
    console.error("❌ [ERREUR] getVendorServices :", error.message);
    res.status(500).json({ message: "Erreur lors de la récupération." });
  }
};

/**
 * METTRE À JOUR
 */
export const updateService = async (req: Request, res: Response) => {
  console.log(`📝 [DEBUG] Mise à jour service ${req.params.id}`);
  try {
    const { id } = req.params;
    const userAuth = (req as any).user;
    const vendorId = userAuth._id || userAuth.id;

    if (!Types.ObjectId.isValid(id)) {
      console.error("❌ [INVALID ID] ID Service invalide.");
      return res.status(400).json({ message: "ID invalide." });
    }

    if (req.body.availability && typeof req.body.availability === "string") {
      req.body.availability = JSON.parse(req.body.availability);
    }

    const service = await Service.findOneAndUpdate(
      { _id: id, vendor: vendorId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      console.warn("🚫 [NOT FOUND] Service non trouvé ou propriétaire différent.");
      return res.status(404).json({ message: "Service non trouvé ou non autorisé." });
    }

    console.log("✅ [SUCCÈS] Mise à jour effectuée.");
    res.status(200).json(service);
  } catch (error: any) {
    console.error("❌ [ERREUR] updateService :", error.message);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: "Données invalides", details: error.errors });
    }
    res.status(500).json({ message: "Erreur mise à jour." });
  }
};

/**
 * SUPPRIMER
 */
export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userAuth = (req as any).user;
    const vendorId = userAuth._id || userAuth.id;

    const result = await Service.deleteOne({ _id: id, vendor: vendorId });
    
    if (result.deletedCount === 0) {
      console.warn("🚫 [NOT FOUND] Échec suppression : service introuvable.");
      return res.status(404).json({ message: "Service non trouvé." });
    }
    
    console.log("✅ [SUCCÈS] Service supprimé.");
    res.json({ message: "Service supprimé." });
  } catch (error: any) {
    console.error("❌ [ERREUR] deleteService :", error.message);
    res.status(500).json({ message: "Erreur suppression." });
  }
};

/**
 * RÉCUPÉRER LES CATÉGORIES ACTIVES AVEC LEUR NOMBRE DE SERVICES
 */
export const getActiveCategories = async (req: Request, res: Response) => {
  try {
    const categoriesStats = await Service.aggregate([
      { $match: { status: "approved" } }, // On ne prend que les services approuvés
      {
        $group: {
          _id: "$category", // On groupe par le champ "category"
          count: { $sum: 1 } // On compte le nombre d'entrées
        }
      },
      {
        $project: {
          _id: 0,
          name: "$_id", // On renomme _id en name pour le frontend
          count: 1
        }
      },
      { $sort: { name: 1 } } // Tri alphabétique
    ]);

    res.status(200).json(categoriesStats);
  } catch (error: any) {
    console.error("❌ [ERREUR] getActiveCategories :", error.message);
    res.status(500).json({ message: "Erreur lors de la récupération des catégories." });
  }
};

/**
 * RÉCUPÉRER UN SERVICE PAR SON ID (PUBLIQUE)
 */
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Vérification de la validité de l'ID MongoDB
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID service invalide." });
    }

    const service = await Service.findById(id).populate("vendor", "name email");

    if (!service) {
      return res.status(404).json({ message: "Service introuvable." });
    }

    res.status(200).json(service);
  } catch (error: any) {
    console.error("❌ [ERREUR] getServiceById :", error.message);
    res.status(500).json({ message: "Erreur serveur lors de la récupération du service." });
  }
};