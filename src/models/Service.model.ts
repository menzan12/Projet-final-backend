import mongoose, { Schema } from "mongoose";
import { IService } from "../types";

const ServiceSchema: Schema<IService> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected"], 
      default: "pending" 
    },
  },
  { timestamps: true }
);

export default mongoose.model<IService>("Service", ServiceSchema);