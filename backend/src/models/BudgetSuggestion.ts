import mongoose, { Schema, Document } from 'mongoose';

export interface IBudgetSuggestion extends Document {
    category: string;
    target: number;
    current: number;
}

const BudgetSuggestionSchema: Schema = new Schema({
    category: { type: String, required: true },
    target: { type: Number, required: true },
    current: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<IBudgetSuggestion>('BudgetSuggestion', BudgetSuggestionSchema);
