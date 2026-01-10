import mongoose, { Schema } from "mongoose";

const VendorAvailabilitySchema = new Schema(
  {
    vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, 
    endTime: { type: String, required: true },   
    isBooked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("VendorAvailability", VendorAvailabilitySchema);