"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Sous-schéma pour les créneaux (Slots)
const slotSchema = new mongoose_1.Schema({
    start: {
        type: String,
        required: true
    },
    end: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                // Validation simple : l'heure de fin doit être alphabétiquement (et donc chronologiquement) 
                // supérieure à l'heure de début (ex: "17:00" > "09:00")
                return value > this.start;
            },
            message: "L'heure de fin ({VALUE}) doit être postérieure à l'heure de début."
        }
    }
}, { _id: false }); // Pas besoin d'ID pour chaque slot individuel
// Sous-schéma pour les jours (Availability)
const availabilitySchema = new mongoose_1.Schema({
    day: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: false
    },
    slots: [slotSchema]
}, { _id: false });
const serviceSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Le titre est obligatoire"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "La description est obligatoire"]
    },
    price: {
        type: Number,
        required: [true, "Le prix est obligatoire"],
        min: [0, "Le prix ne peut pas être négatif"]
    },
    category: {
        type: String,
        required: [true, "La catégorie est obligatoire"]
    },
    city: {
        type: String,
        required: [true, "La ville est obligatoire"]
    },
    images: [{
            type: String
        }], // URLs ImageKit
    // Utilisation du sous-schéma pour la clarté
    availability: [availabilitySchema],
    vendor: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "approved"
    }
}, {
    timestamps: true,
    // Assure que les virtuels et getters sont inclus lors de la conversion en JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Index pour améliorer la vitesse de recherche par vendeur
serviceSchema.index({ vendor: 1 });
exports.default = (0, mongoose_1.model)("Service", serviceSchema);
