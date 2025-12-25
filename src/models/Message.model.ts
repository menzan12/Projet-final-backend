import mongoose, { Schema, model, Document, Types } from "mongoose";

export interface IMessage extends Document {
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    content: string;
    isRead: boolean;
    createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
        receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true, trim: true },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Indexation pour optimiser les recherches de conversations
messageSchema.index({ sender: 1, receiver: 1 });

export default model<IMessage>("Message", messageSchema);