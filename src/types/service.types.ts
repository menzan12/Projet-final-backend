import { Document, Schema } from "mongoose";

export type ServiceStatus = "pending" | "approved" | "rejected";

export interface IService extends Document {   
    title: string;
    description: string;
    price: number;
    category: string;
    status: ServiceStatus;
    vendor: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface ServiceResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  vendor: { id: string; name: string };
  status: ServiceStatus;
  createdAt: Date;
}

export interface CreateServiceRequestBody {
  title: string;
  description: string;
  price: number;
  category: string;
}

export interface UpdateServiceRequestBody {
    title?: string;
    description?: string;
    price?: number;
    category?: string;
    status?: ServiceStatus;
}