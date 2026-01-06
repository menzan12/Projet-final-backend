import mongoose, { Schema } from "mongoose";

const VendorAvailabilitySchema = new Schema(
  {
    vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "10:00"
    isBooked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("VendorAvailability", VendorAvailabilitySchema);