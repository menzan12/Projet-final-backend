import { Schema, model } from "mongoose";

const serviceSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  city: { type: String, required: true },      
  provider: { type: String, required: true },  
  vendor: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
}, { timestamps: true });

export default model("Service", serviceSchema);