import mongoose, { Schema, Document } from 'mongoose';

export interface IGoal extends Document {
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  status: 'active' | 'completed' | 'failed';
  userId: mongoose.Types.ObjectId;
}

const GoalSchema: Schema = new Schema({
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['active', 'completed', 'failed'], default: 'active' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<IGoal>('Goal', GoalSchema);
