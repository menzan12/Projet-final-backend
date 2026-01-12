import { Document, Types } from "mongoose";

// Les différents états possibles d'une réservation
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

/**
 * Interface pour le document Booking en base de données
 */
export interface IBooking extends Document {
  service: Types.ObjectId | string;
  client: Types.ObjectId | string;
  vendor: Types.ObjectId | string;
  bookingDate: Date; // Date formatée (ex: 2026-10-18T10:00:00)
  status: BookingStatus;
  totalPrice: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface pour le corps de la requête (Request Body) 
 * envoyée par le frontend lors de la création
 */
export interface CreateBookingRequestBody {
  serviceId: string;
  // Correspond à l'objet sélectionné dans ServiceScheduler.tsx
  slot: {
    day: string;  // ex: "Lundi"
    date: string; // ex: "18"
    time: string; // ex: "10:00"
  };
  notes?: string;
}