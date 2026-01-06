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
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["client", "vendor", "admin"], default: "client" },
  isEmailVerify: { type: Boolean, default: false },
  isProfileComplete: { type: Boolean, default: false },
  isAdminApproved: { type: Boolean, default: false },
  vendorPlan: { type: String, enum: ["free", "pro", "premium"], default: "free" }
}, { timestamps: true });

export default model<IUser>("User", UserSchema);