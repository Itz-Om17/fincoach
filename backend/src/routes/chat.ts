import { Router } from 'express';
import ChatMessage from '../models/ChatMessage';
import Transaction from '../models/Transaction';
import Goal from '../models/Goal';
import { getAIChatResponse } from '../lib/chatService';

const router = Router();

// Get chat history
router.get('/history', async (req, res) => {
  try {
    const history = await ChatMessage.find().sort({ timestamp: 1 }).limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat history' });
  }
});

// Post a new message and get AI response
router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });

  try {
    // 1. Save user message
    const userMsg = new ChatMessage({ role: 'user', content: message });
    await userMsg.save();

    // 2. Gather context
    const transactions = await Transaction.find().sort({ date: -1 });
    const goals = await Goal.find();
    
    // Simple stats aggregation
    let totalBalance = 0;
    let dailyIncome = 0;
    let monthlyExpenses = 0;
    let monthlyIncome = 0;
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = today.substring(0, 7);

    transactions.forEach(t => {
      if (t.type === 'income') {
        totalBalance += t.amount;
        if (t.date === today) dailyIncome += t.amount;
        if (t.date.startsWith(thisMonth)) monthlyIncome += t.amount;
      } else {
        totalBalance -= t.amount;
        if (t.date.startsWith(thisMonth)) monthlyExpenses += t.amount;
      }
    });

    // 3. Get history for context
    const history = await ChatMessage.find().sort({ timestamp: 1 }).limit(10);

    // 4. Get AI Response
    const aiResponseContent = await getAIChatResponse(
      message,
      { transactions, goals, stats: { totalBalance, dailyIncome, monthlyExpenses, monthlyIncome } },
      history
    );

    // 5. Save AI message
    const aiMsg = new ChatMessage({ role: 'assistant', content: aiResponseContent });
    await aiMsg.save();

    res.json(aiMsg);
  } catch (error) {
    console.error("Chat Router Error:", error);
    res.status(500).json({ message: 'Error processing chat message' });
  }
});

// Clear history
router.delete('/history', async (req, res) => {
  try {
    await ChatMessage.deleteMany({});
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing history' });
  }
});

export default router;
