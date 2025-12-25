import mongoose, { Schema } from "mongoose";
import { IUser } from "../types";

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["client", "vendor", "admin"], default: "client" },
    isEmailVerify: {type: Boolean, default: false}
  },
  { timestamps: true }
);



export default mongoose.model<IUser>("User", UserSchema);