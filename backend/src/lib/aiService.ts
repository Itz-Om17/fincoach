import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

let _groq: Groq | null = null;
const getGroqClient = () => {
  if (!_groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY environment variable is missing");
    }
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
};

export const generateInsights = async (userData: any) => {
  const groq = getGroqClient();
  const { transactions, goals, income, expenses, dailyIncome } = userData;

  const prompt = `
    You are an AI Financial Coach. Based on the following user data, provide 3 short, actionable, and encouraging financial insights or notifications.
    
    User Data:
    - Today's Income: ₹${dailyIncome}
    - Total Monthly Income: ₹${income}
    - Total Monthly Expenses: ₹${expenses}
    - Recent Transactions: ${JSON.stringify(transactions.slice(0, 5))}
    - Active Goals: ${JSON.stringify(goals.map((g: any) => ({
        name: g.name,
        target: g.targetAmount,
        current: g.currentAmount,
        deadline: g.deadline,
        pct: Math.round((g.currentAmount / g.targetAmount) * 100)
      })))}

    Requirements:
    - Focus on how recent spending/income affects their goals.
    - If a goal deadline is near, mention it.
    - Provide precisely 3 insights.
    - Each insight should be a JSON object with: "message" (string), "type" (one of: "info", "success", "warning"), and "title" (short 2-4 word string).
    - Return a JSON object with a key "insights" containing the array.
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) return [];
    
    // The response might be wrapped in an object depending on prompt instructions
    const result = JSON.parse(content);
    return result.insights || result; 
  } catch (error) {
    console.error("Groq AI Error:", error);
    return [
      { message: "Set a new goal today to improve your savings rate!", type: "info" },
      { message: "Your spending on categories like Food is higher than usual.", type: "warning" },
      { message: "Great job on logging your daily income!", type: "success" }
    ];
  }
};
