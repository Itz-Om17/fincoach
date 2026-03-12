import { Router } from 'express';
import type { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import { auth, AuthRequest } from '../middleware/auth';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await Transaction.find({ userId: req.user?.id }).sort({ date: -1 });
    
    // 1. Calculate current calendar month and previous calendar month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const recentTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const previousTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });

    const calcExpense = (txs: any[]) => txs.reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0);
    const calcIncome = (txs: any[]) => txs.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : 0), 0);

    const currentExpense = calcExpense(recentTx);
    const currentIncome = calcIncome(recentTx);
    const previousExpense = calcExpense(previousTx);
    const previousIncome = calcIncome(previousTx);

    // 2. Projection based on current vs previous month
    let growthRate = previousExpense > 0 ? (currentExpense - previousExpense) / previousExpense : 0;
    growthRate = Math.min(Math.max(growthRate, -0.5), 0.5);
    
    const projectedExpense = Math.round(currentExpense * (1 + (growthRate * 0.5)));

    // 3. Category Projections (current month only)
    const categories = Array.from(new Set(recentTx.filter(t => t.type === 'expense').map(t => t.category)));
    const categoryProjections = categories.map(cat => {
        const catRecent = recentTx.filter(t => t.category === cat && t.type === 'expense');
        const catTotal = catRecent.reduce((sum, t) => sum + t.amount, 0);
        return {
            category: cat,
            projected: Math.round(catTotal * (1 + (growthRate * 0.3))),
            current: catTotal
        };
    }).sort((a, b) => b.projected - a.projected).slice(0, 5);

    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    // 4. AI Summary
    const prompt = `
      You are a financial forecaster. Analyze these stats and provide a 2-sentence outlook for next month.
      - Current month (${monthNames[currentMonth]}) expenses: ₹${currentExpense}
      - Current month (${monthNames[currentMonth]}) income: ₹${currentIncome}
      - Previous month (${monthNames[prevMonth]}) expenses: ₹${previousExpense}
      - Projected expenses next month: ₹${projectedExpense}
      - Top spending categories: ${categoryProjections.map(c => c.category).join(', ')}
      
      Requirements: 
      - Be objective but helpful. 
      - If predicted expenses are higher, suggest caution.
      - Return a JSON object with a key "summary".
    `;

    const aiRes = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const summary = JSON.parse(aiRes.choices[0]?.message?.content || '{"summary": "Could not generate outlook."}').summary;

    res.json({
        currentMonthlyExpense: currentExpense,
        currentMonthlyIncome: currentIncome,
        previousMonthExpense: previousExpense,
        previousMonthIncome: previousIncome,
        projectedNextMonth: projectedExpense,
        growthRate: Math.round(growthRate * 100),
        categoryProjections,
        summary,
        currentMonthName: monthNames[currentMonth],
        previousMonthName: monthNames[prevMonth]
    });

  } catch (error) {
    console.error("Forecast Error:", error);
    res.status(500).json({ message: 'Error generating forecast' });
  }
});

export default router;
