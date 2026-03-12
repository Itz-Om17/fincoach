import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendation extends Document {
  title: string;
  description: string;
  savings: string;
  priority: 'high' | 'medium' | 'low';
  userId: mongoose.Types.ObjectId;
}

const RecommendationSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  savings: { type: String, required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
