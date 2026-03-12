import { Router } from 'express';
import type { Request, Response } from 'express';
import Goal from '../models/Goal';
import Transaction from '../models/Transaction';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all goals
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const goals = await Goal.find({ userId: req.user?.id });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals' });
  }
});

// Create a goal
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const newGoal = new Goal({ ...req.body, userId: req.user?.id });
    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    res.status(400).json({ message: 'Error creating goal' });
  }
});

// Update goal progress
router.patch('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const goal = await Goal.findOneAndUpdate({ _id: req.params.id, userId: req.user?.id }, req.body, { new: true });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (error) {
    res.status(400).json({ message: 'Error updating goal' });
  }
});

// Delete a goal — returns saved amount back to balance as an income transaction
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user?.id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // If the goal had any saved amount, create an income transaction to return it
    if (goal.currentAmount > 0) {
      const returnTransaction = new Transaction({
        description: `Goal cancelled: ${goal.name} — savings returned`,
        amount: goal.currentAmount,
        type: 'income',
        category: 'Income',
        date: new Date().toISOString().split('T')[0],
        method: 'Internal Transfer',
        userId: req.user?.id,
      });
      await returnTransaction.save();
    }

    await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user?.id });
    res.json({ message: 'Goal deleted', returnedAmount: goal.currentAmount });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting goal' });
  }
});

export default router;