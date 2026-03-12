import { Router } from 'express';
import type { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import Goal from '../models/Goal';
import BudgetSuggestion from '../models/BudgetSuggestion';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/stats', auth, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await Transaction.find({ userId: req.user?.id });
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    let totalIncome = 0;
    let dailyIncome = 0;
    let totalExpenses = 0;

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    transactions.forEach(t => {
      const isIncome = t.type === 'income';
      const isToday = t.date === todayStr;
      
      const tDate = new Date(t.date);
      const isCurrentMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;

      if (isIncome) {
        if (isToday) dailyIncome += t.amount;
        if (isCurrentMonth) totalIncome += t.amount;
      } else {
        if (isCurrentMonth) totalExpenses += t.amount;
      }
    });

    // Calculate total balance from all-time data (ignoring the filter above for balance)
    let allTimeBalance = 0;
    transactions.forEach(t => {
        if (t.type === 'income') allTimeBalance += t.amount;
        else allTimeBalance -= t.amount;
    });
    
    // Total Balance should also subtract goal savings
    const goalsData = await Goal.find({ userId: req.user?.id });
    const totalGoalSavings = goalsData.reduce((sum, g) => sum + g.currentAmount, 0);
    const balance = allTimeBalance - totalGoalSavings;

    // --- MATH-BASED ALERTS LOGIC ---
    const alerts: any[] = [];
    const goals = await Goal.find({ userId: req.user?.id });
    const suggestions = await BudgetSuggestion.find({ userId: req.user?.id });

    // Aggregate real-time spending for budget matching
    const categoryTotals: Record<string, number> = {};
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (t.type === 'expense' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      }
    });

    // 1. Goal Alerts (Math-based)
    const nowTime = now.getTime();
    goals.forEach(g => {
      if (g.status !== 'active') return;
      
      const deadline = new Date(g.deadline).getTime();
      const daysLeft = Math.ceil((deadline - nowTime) / (1000 * 60 * 60 * 24));
      const progress = (g.currentAmount / g.targetAmount) * 100;

      if (daysLeft > 0 && daysLeft < 14 && progress < 80) {
        alerts.push({
          title: `Goal at Risk: ${g.name}`,
          message: `Only ${daysLeft} days left and you're at ${Math.round(progress)}%. Consider increasing your daily savings.`,
          type: 'warning'
        });
      }
    });

    // 2. Budget Alerts (Math-based, use real-time categoryTotals)
    suggestions.forEach(b => {
      const currentSpent = categoryTotals[b.category] || 0;
      if (currentSpent > b.target) {
        alerts.push({
          title: `Budget Exceeded: ${b.category}`,
          message: `You've spent ₹${(currentSpent - b.target).toLocaleString('en-IN')} more than your ₹${b.target.toLocaleString('en-IN')} limit.`,
          type: 'error'
        });
      } else if (currentSpent > b.target * 0.9) {
          alerts.push({
            title: `Near Budget Limit: ${b.category}`,
            message: `You've used ${Math.round((currentSpent/b.target)*100)}% of your ₹${b.target.toLocaleString('en-IN')} budget for ${b.category}.`,
            type: 'warning'
          });
      }
    });

    res.json({
      totalBalance: `₹${balance.toLocaleString('en-IN')}`,
      dailyIncome: `₹${dailyIncome.toLocaleString('en-IN')}`,
      monthlyIncome: `₹${totalIncome.toLocaleString('en-IN')}`,
      monthlyExpenses: `₹${totalExpenses.toLocaleString('en-IN')}`,
      changes: {
        totalBalance: "Real-time from DB",
        dailyIncome: "Earned today",
        monthlyIncome: "Total earned this month",
        monthlyExpenses: "Total spent",
      },
      raw: {
        balance,
        dailyIncome,
        monthlyIncome: totalIncome,
        monthlyExpenses: totalExpenses
      },
      alerts // New array of math-based alerts
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating stats' });
  }
});

router.get('/charts', auth, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await Transaction.find({ userId: req.user?.id });
    
    const categories: Record<string, number> = {};
    const weekly: Record<string, number> = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const isCurrentMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;

      // Category aggregation (only for current month)
      if (t.type === 'expense' && isCurrentMonth) {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      }
      
      // Weekly aggregation (last 7 days logic would be better, but keeping simple day mapping for now)
      // If we want "this week", we should filter similarly. 
      // For now, let's just ensure category reflects the user's specific request.
      const day = tDate.toLocaleDateString('en-US', { weekday: 'short' });
      if (weekly[day] !== undefined && isCurrentMonth) {
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
