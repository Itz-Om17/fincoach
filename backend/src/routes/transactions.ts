import { Router } from 'express';
import type { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { type, category } = req.query;
    const filter: any = { userId: req.user?.id };

    if (type) filter.type = type;
    if (category) filter.category = category;

    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

router.get('/categories', auth, async (req: AuthRequest, res: Response) => {
  try {
    const categories = await Transaction.distinct('category', { userId: req.user?.id });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

router.post('/bulk', auth, async (req: AuthRequest, res: Response) => {
  try {
    let transactions = req.body;
    if (!Array.isArray(transactions)) {
        return res.status(400).json({ message: 'Payload must be an array of transactions' });
    }
    transactions = transactions.map((t: any) => ({ ...t, userId: req.user?.id }));
    const savedTransactions = await Transaction.insertMany(transactions);
    res.status(201).json(savedTransactions);
  } catch (error) {
    res.status(400).json({ message: 'Error bulk saving transactions' });
  }
});

router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const newTransaction = new Transaction({ ...req.body, userId: req.user?.id });
    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ message: 'Error saving transaction' });
  }
});

export default router;
