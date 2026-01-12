import { Document, Types } from "mongoose";

export type ServiceStatus = "pending" | "approved" | "rejected";

// Interface pour les créneaux horaires
export interface IAvailabilitySlot {
  start: string;
  end: string;
}

// Interface pour la structure d'un jour
export interface IAvailabilityDay {
  day: string;
  active: boolean;
  slots: IAvailabilitySlot[];
}

export interface IService extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  city: string;
  images: string[];
  // --- AJOUT DU CHAMP DANS L'INTERFACE ---
  availability: IAvailabilityDay[]; 
  vendor: Types.ObjectId; 
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceRequestBody {
  title: string;
  description: string;
  price: number;
  category: string;
  city: string;
  images: string[];
  // --- AJOUT ICI AUSSI POUR LE PAYLOAD ---
  availability: IAvailabilityDay[];
}