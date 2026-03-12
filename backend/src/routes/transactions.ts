import { Router } from 'express';
import type { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await Transaction.find({ userId: req.user?.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions' });
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
