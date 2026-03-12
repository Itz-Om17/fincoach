import { Router } from 'express';
import Transaction from '../models/Transaction';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions' });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const transactions = req.body;
    if (!Array.isArray(transactions)) {
        return res.status(400).json({ message: 'Payload must be an array of transactions' });
    }
    const savedTransactions = await Transaction.insertMany(transactions);
    res.status(201).json(savedTransactions);
  } catch (error) {
    res.status(400).json({ message: 'Error bulk saving transactions' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    const savedTransaction = await newTransaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ message: 'Error saving transaction' });
  }
});

export default router;
