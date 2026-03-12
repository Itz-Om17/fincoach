import { Router } from 'express';
import Transaction from '../models/Transaction';

const router = Router();

router.get('/stats', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    let totalIncome = 0;
    let dailyIncome = 0;
    let totalExpenses = 0;
    
    transactions.forEach(t => {
      const isIncome = t.type === 'income';
      const isToday = t.date === todayStr;

      if (isIncome) {
        totalIncome += t.amount;
        if (isToday) dailyIncome += t.amount;
      } else {
        totalExpenses += t.amount;
      }
    });

    const balance = totalIncome - totalExpenses;

    res.json({
      totalBalance: `₹${balance.toLocaleString()}`,
      dailyIncome: `₹${dailyIncome.toLocaleString()}`,
      monthlyIncome: `₹${totalIncome.toLocaleString()}`,
      monthlyExpenses: `₹${totalExpenses.toLocaleString()}`,
      changes: {
        totalBalance: "Real-time from DB",
        dailyIncome: "Earned today",
        monthlyIncome: "Total earned this month",
        monthlyExpenses: "Total spent",
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating stats' });
  }
});

router.get('/charts', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    
    const categories: Record<string, number> = {};
    const weekly: Record<string, number> = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };

    transactions.forEach(t => {
      // Category aggregation
      if (t.type === 'expense') {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
      
      // Weekly aggregation (simple mapping for now)
      const day = new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' });
      if (weekly[day] !== undefined) {
        weekly[day] += t.amount;
      }
    });

    const spendingByCategory = Object.keys(categories).map((name, i) => ({
      name,
      value: categories[name],
      color: `hsl(${i * 60}, 70%, 50%)`
    }));

    const weeklySpending = Object.keys(weekly).map(day => ({
      day,
      amount: weekly[day]
    }));

    res.json({
      spendingByCategory,
      weeklySpending
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chart data' });
  }
});

export default router;
