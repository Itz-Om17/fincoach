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

export const getAIChatResponse = async (userMessage: string, context: any, history: any[]) => {
  const groq = getGroqClient();
  const { transactions, goals, stats } = context;

  const systemPrompt = `
    You are "FinCoach AI", a highly intelligent and empathetic financial advisor. 
    You have access to the user's real-time financial data.
    
    User Context:
    - Total Balance: ₹${stats.totalBalance}
    - Today's Income: ₹${stats.dailyIncome}
    - Monthly Expenses: ₹${stats.monthlyExpenses}
    - Monthly Income: ₹${stats.monthlyIncome}
    - Active Goals: ${JSON.stringify(goals.map((g: any) => ({
        name: g.name,
        target: g.targetAmount,
        current: g.currentAmount,
        deadline: g.deadline,
        progress: Math.round((g.currentAmount / g.targetAmount) * 100) + '%'
      })))}
    - Recent Transactions: ${JSON.stringify(transactions.slice(0, 10).map((t: any) => ({
        desc: t.description,
        amt: t.amount,
        type: t.type,
        cat: t.category,
        date: t.date
      })))}

    Instructions:
    - **Multilingual Support**: Detect the language of the user's query. If they ask in Hindi, Marathi, or any other language, **respond in that same language**.
    - **Context Awareness**: Only mention specific goals if the user explicitly asks about them or if their query is directly related to goal-setting. 
    - For general financial questions, provide general advice without forcing it into the context of an existing goal.
    - **Feasibility Check (Goal-Specific)**: IF and ONLY IF a goal is mentioned or queried:
      * Calculate if it's practically achievable. 
      * Formula: (Target - Current) / (Monthly Income - Monthly Expenses).
      * Compare the result with the months remaining until the Deadline.
      * If unachievable, suggest extending the deadline or increasing income/cutting costs.
    - **Formatting Requirements (Apply strictly to ALL languages)**: 
      * Use **bolding** for emphasis.
      * Use bullet points for lists.
      * When suggesting schemes or sites, use this exact format:
        **[Scheme/Site Name]**
        - *Description*: A brief, clear explanation of what it is.
        - *Link*: [Click here to visit](URL)
      * ALWAYS provide clickable, direct links to official financial sites.
    - Be proactive but relevant. celebrate progress on goals only when they are the topic.
    - Use a friendly, encouraging, but professional tone.
    - Keep responses concise but information-dense.
  `;

  const messages: any[] = [
    { role: "system", content: systemPrompt },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage }
  ];

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    return chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that right now.";
  } catch (error: any) {
    console.error("Chat Service Error DETAILS:", error);
    if (error.status === 401) return "I'm having trouble with my credentials. Please check the API key.";
    if (error.status === 429) return "I'm a bit overwhelmed right now. Please wait a minute before asking again.";
    return "I'm having trouble connecting to my brain right now. Please try again in a moment!";
  }
};
