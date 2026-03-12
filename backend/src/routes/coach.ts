import { Router, Request, Response } from 'express';
import Recommendation from '../models/Recommendation';
import BudgetSuggestion from '../models/BudgetSuggestion';
import Transaction from '../models/Transaction';
import Goal from '../models/Goal';
import { generateInsights } from '../lib/aiService';
import { generateAIRecommendations } from '../services/aiCoachEngine';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

// GET stored recommendations and budgets
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const recommendations = await Recommendation.find();
    const budgets = await BudgetSuggestion.find();
    res.json({ recommendations, budgets });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recommendations and budgets' });
  }
});

// POST generate NEW AI recommendations and budgets via Groq
router.post('/recommendations/generate', async (req: Request, res: Response) => {
  try {
    // 1. Fetch data for context
    const transactions = await Transaction.find().sort({ date: -1 });
    const goals = await Goal.find();

    // 2. Pass to Groq Engine
    const aiOutput = await generateAIRecommendations(transactions, goals);

    if (!aiOutput || !aiOutput.recommendations || aiOutput.recommendations.length === 0) {
      return res.status(500).json({ message: 'AI failed to generate recommendations.' });
    }

    // 3. Clear old data
    await Recommendation.deleteMany({});
    await BudgetSuggestion.deleteMany({});

    // 4. Save new data
    const savedRecs = await Recommendation.insertMany(aiOutput.recommendations);
    const savedBudgets = await BudgetSuggestion.insertMany(aiOutput.budgets);

    res.json({
      recommendations: savedRecs,
      budgets: savedBudgets
    });
  } catch (error: any) {
    console.error('Groq Generation Error:', error);
    res.status(500).json({ message: 'Error generating AI data', error: error.message });
  }
});

// GET AI-powered quick insights (teammate's feature)
router.get('/insights', async (req: Request, res: Response) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 }).limit(20);
    const goals = await Goal.find();

    let income = 0;
    let expenses = 0;
    let dailyIncome = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    transactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
        if (t.date === todayStr) dailyIncome += t.amount;
      } else {
        expenses += t.amount;
      }
    });

    const insights = await generateInsights({
      transactions,
      goals,
      income,
      expenses,
      dailyIncome
    });

    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: 'Error generating AI insights' });
  }
});

export default router;
