import mongoose, { Schema } from "mongoose";
import { IBooking } from "../types/booking.types";

const BookingSchema: Schema<IBooking> = new Schema(
  {
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    client: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookingDate: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ["pending", "confirmed", "cancelled", "completed"], 
      default: "pending" 
    },
    totalPrice: { type: Number, required: true },
    notes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>("Booking", BookingSchema);