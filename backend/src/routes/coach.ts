import { Router } from 'express';
import Recommendation from '../models/Recommendation';
import Transaction from '../models/Transaction';
import Goal from '../models/Goal';
import { generateInsights } from '../lib/aiService';

const router = Router();

router.get('/recommendations', async (req, res) => {
  try {
    const recommendations = await Recommendation.find();
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recommendations' });
  }
});

router.get('/insights', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 }).limit(20);
    const goals = await Goal.find();
    
    // Aggregating some stats for the prompt
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
