import { Router } from 'express';
import Goal from '../models/Goal';
import Transaction from '../models/Transaction';

const router = Router();

// Get all goals
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find();
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals' });
  }
});

// Create a goal
router.post('/', async (req, res) => {
  try {
    const newGoal = new Goal(req.body);
    const savedGoal = await newGoal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    res.status(400).json({ message: 'Error creating goal' });
  }
});

// Update goal progress
router.patch('/:id', async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(goal);
  } catch (error) {
    res.status(400).json({ message: 'Error updating goal' });
  }
});

// Delete a goal — returns saved amount back to balance as an income transaction
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
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
      });
      await returnTransaction.save();
    }

    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Goal deleted', returnedAmount: goal.currentAmount });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting goal' });
  }
});

export default router;