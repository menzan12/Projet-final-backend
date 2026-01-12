import mongoose, { Schema, Document } from "mongoose";

export interface IIAConversation extends Document {
  user: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
}

const IAConversationSchema = new Schema(
  {
    // On utilise "user" pour être raccord avec ton contrôleur
    user: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    question: { 
      type: String, 
      required: true 
    },
    answer: { 
      type: String, 
      required: true 
    }
  },
  { 
    // timestamps: true crée automatiquement 'createdAt' et 'updatedAt'
    // C'est parfait pour ta fonction de nettoyage (cleanup)
    timestamps: true 
  }
);

// Indexation pour accélérer les recherches par utilisateur et le nettoyage par date
IAConversationSchema.index({ user: 1 });
IAConversationSchema.index({ createdAt: 1 });

export default mongoose.model<IIAConversation>(
  "IAConversation",
  IAConversationSchema
);