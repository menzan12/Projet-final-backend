import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "client" | "vendor" | "admin";
  isEmailVerify: boolean;
  isProfileComplete: boolean;
  isAdminApproved: boolean;
  vendorPlan: "free" | "pro" | "premium";
  phone?: string;
  bio?: string;
  address?: {
    street: string;
    city: string;
    zip: string;
  };
  // CHAMPS AJOUTÉS POUR LE VENDEUR
  serviceMainImage?: string;
  vendorCategory?: string;
  experienceYears?: number;
  skills?: string[];
  isWaitingApproval?: boolean;
  bankingInfo?: {
    accountHolder: string;
    iban: string;
    bic: string;
  };
  documents?: {
    identity: string;
    registration: string;
  };
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["client", "vendor", "admin"], default: "client" },
    isEmailVerify: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },
    isAdminApproved: { type: Boolean, default: false },
    vendorPlan: { type: String, enum: ["free", "pro", "premium"], default: "free" },
    phone: { type: String },
    bio: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      zip: { type: String },
    },
    // DÉFINITION DES NOUVEAUX CHAMPS DANS LE SCHEMA
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
  },
  { timestamps: true }
);

export default model<IUser>("User", UserSchema);