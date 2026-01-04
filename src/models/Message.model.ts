import { Schema, model, Types, Document } from "mongoose";

// Interface pour TypeScript
export interface IMessage extends Document {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  booking: Types.ObjectId;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Définition du Schéma
const messageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    content: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Exportation du modèle
const Message = model<IMessage>("Message", messageSchema);
export default Message;