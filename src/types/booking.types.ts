import { Document, Types } from "mongoose";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface IBooking extends Document {
  service: Types.ObjectId | string;
  client: Types.ObjectId | string;
  vendor: Types.ObjectId | string;
  bookingDate: Date;
  status: BookingStatus;
  totalPrice: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingRequestBody {
  serviceId: string;
  bookingDate: string;
  notes?: string;
}