"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["client", "vendor", "admin"], default: "client" },
    isEmailVerify: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },
    isAdminApproved: { type: Boolean, default: false },
    vendorPlan: { type: String, enum: ["free", "pro", "premium"], default: "free" },
    // AJOUT DANS LE SCHEMA POUR MONGOOSE
    upgradeRequested: { type: Boolean, default: false },
    requestedPlan: { type: String, default: "" },
    phone: { type: String },
    bio: { type: String },
    address: {
        street: { type: String },
        city: { type: String },
        zip: { type: String },
    },
    serviceMainImage: { type: String, default: "" },
    vendorCategory: { type: String },
    experienceYears: { type: Number },
    skills: { type: [String], default: [] },
    isWaitingApproval: { type: Boolean, default: false },
    bankingInfo: {
        accountHolder: { type: String },
        iban: { type: String },
        bic: { type: String },
    },
    documents: {
        identity: { type: String },
        registration: { type: String },
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("User", UserSchema);
