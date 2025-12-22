import { Document } from "mongoose";

export type UserRole = "client" | "vendor" | "admin";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isEmailVerify: boolean;
}
