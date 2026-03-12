import Groq from 'groq-sdk';
import { ITransaction } from '../models/Transaction';
import { IGoal } from '../models/Goal';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateAIRecommendations(transactions: ITransaction[], goals: IGoal[]) {
    try {
        // 1. Summarize transactions to save prompt tokens
        let totalIncome = 0;
        let totalExpense = 0;
        const expenseByCategory: Record<string, number> = {};

        transactions.forEach(t => {
            if (t.type === 'income') {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;
                expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
            }
        });

        const savings = totalIncome - totalExpense;

        const financialSummary = {
            totalIncome,
            totalExpense,
            savings,
            expenseByCategory,
            goals: goals.map(g => ({
                name: g.name,
                target: g.targetAmount,
                current: g.currentAmount,
                deadline: g.deadline,
                status: g.status
            })),
            recentTransactions: transactions.slice(0, 15).map(t => ({
                description: t.description,
                amount: t.amount,
                type: t.type,
                category: t.category,
                date: t.date
            }))
        };

        console.log('[AI Coach] Financial Summary:', JSON.stringify({ totalIncome, totalExpense, savings, categories: Object.keys(expenseByCategory).length, txCount: transactions.length }));

        // 2. Build the System Prompt
        const systemPrompt = `You are an expert AI personalized financial coach.
Analyze the user's financial summary and recent transactions.
Identify areas where they can save money, optimize spending, or avoid risks.

You MUST respond with a JSON object containing exactly TWO keys: "recommendations" (array) and "budgets" (array).
Example format:
{
  "recommendations": [
    {
      "title": "Reduce Food Delivery Spending",
      "description": "Your food expenses are 30% of total spending. Consider cooking at home more often.",
      "savings": "₹12,000/year",
      "priority": "high"
    }
  ],
  "budgets": [
    {
      "category": "Food",
      "target": 8000,
      "current": 8500
    }
  ]
}

Rules for recommendations (provide exactly 4):
- title: Short, actionable title
- description: 1-2 sentence personalized explanation
- savings: Estimated savings as a string with ₹ symbol
- priority: must be exactly "high", "medium", or "low"

Rules for budgets (provide exactly 5 based on top spending categories):
- category: The spending category name (e.g., Food, Travel, Shopping, Bills)
- target: A realistic, numeric suggested target limit that challenges them to save a bit compared to current spending
- current: The EXACT numeric amount they actually spent in this category according to the summary`;

        const userPrompt = `Here is my financial data:\n${JSON.stringify(financialSummary, null, 2)}\n\nGenerate personalized recommendations AND suggested budgets.`;

        // 3. Call Groq
        console.log('[AI Coach] Calling Groq API with model llama-3.3-70b-versatile...');
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            response_format: { type: 'json_object' }
        });

        const responseContent = chatCompletion.choices[0]?.message?.content || '{}';
        console.log('[AI Coach] Raw Groq response:', responseContent.substring(0, 500));

        // 4. Parse JSON
        let parsedResult: any = { recommendations: [], budgets: [] };
        try {
            const rawJSON = JSON.parse(responseContent);
            parsedResult.recommendations = Array.isArray(rawJSON.recommendations) ? rawJSON.recommendations : [];
            parsedResult.budgets = Array.isArray(rawJSON.budgets) ? rawJSON.budgets : [];
        } catch (err) {
            console.error('[AI Coach] Failed to parse LLM JSON:', responseContent);
        }

        console.log(`[AI Coach] Parsed ${parsedResult.recommendations.length} recommendations and ${parsedResult.budgets.length} budgets`);

        // Validate structure
        const validRecs = parsedResult.recommendations.map((r: any) => ({
            title: r.title || 'General Advice',
            description: r.description || '',
            savings: r.savings || 'Varying amount',
            priority: ['high', 'medium', 'low'].includes(r.priority) ? r.priority : 'medium'
        }));

        const validBudgets = parsedResult.budgets.map((b: any) => ({
            category: b.category || 'General',
            target: Number(b.target) || 0,
            current: Number(b.current) || 0
        }));

        return { recommendations: validRecs, budgets: validBudgets };

    } catch (error: any) {
        console.error('[AI Coach] Error generating details:', error?.message || error);
        throw error;
    }
}
