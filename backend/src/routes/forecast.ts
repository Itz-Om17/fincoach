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
    
    // 1. Calculate historical metrics (last 30 days vs 30-60 days ago)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

    const recentTx = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);
    const previousTx = transactions.filter(t => new Date(t.date) >= sixtyDaysAgo && new Date(t.date) < thirtyDaysAgo);

    const calcTotal = (txs: any[]) => txs.reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0);
    const currentTotal = calcTotal(recentTx);
    const previousTotal = calcTotal(previousTx);

    // 2. Simple Projection Logic
    // If no previous data, assume current continues. Otherwise, use growth rate with a cap.
    let growthRate = previousTotal > 0 ? (currentTotal - previousTotal) / previousTotal : 0;
    // Cap growth rate at 50% to avoid wild fluctuations
    growthRate = Math.min(Math.max(growthRate, -0.5), 0.5);
    
    const projectedExpense = Math.round(currentTotal * (1 + (growthRate * 0.5))); // Dampen the projection

    // 3. Category Projections
    const categories = Array.from(new Set(transactions.map(t => t.category)));
    const categoryProjections = categories.map(cat => {
        const catRecent = recentTx.filter(t => t.category === cat);
        const catTotal = calcTotal(catRecent);
        return {
            category: cat,
            projected: Math.round(catTotal * (1 + (growthRate * 0.3))),
            current: catTotal
        };
    }).sort((a, b) => b.projected - a.projected).slice(0, 5);

    // 4. AI Summary
    const prompt = `
      You are a financial forecaster. Analyze these stats and provide a 2-sentence outlook for next month.
      - Expenses last 30 days: ₹${currentTotal}
      - Expenses 30-60 days ago: ₹${previousTotal}
      - Projected expenses next 30 days: ₹${projectedExpense}
      - Top projected categories: ${categoryProjections.map(c => c.category).join(', ')}
      
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
        currentMonthlyExpense: currentTotal,
        projectedNextMonth: projectedExpense,
        growthRate: Math.round(growthRate * 100),
        categoryProjections,
        summary
    });

  } catch (error) {
    console.error("Forecast Error:", error);
    res.status(500).json({ message: 'Error generating forecast' });
  }
});

export default router;
