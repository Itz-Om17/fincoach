import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatMessageSchema: Schema = new Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
