import mongoose, { Schema, Document } from "mongoose";

export interface IIAConversation extends Document {
  user: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  createdAt: Date;
}

const IAConversationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IIAConversation>(
  "IAConversation",
  IAConversationSchema
);
