import { Document, Types } from "mongoose";

export type ServiceStatus = "pending" | "approved" | "rejected";

export interface IService extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  city: string;
  images: string[]; 
  vendor: Types.ObjectId; 
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServiceRequestBody {
  title: string;
  description: string;
  price: number;
  category: string;
  city: string;
  images: string[]; 
}