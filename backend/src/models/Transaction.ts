import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  method: string;
  userId: mongoose.Types.ObjectId;
}

const TransactionSchema: Schema = new Schema({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  method: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
