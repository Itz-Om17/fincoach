import { Router } from 'express';
import Recommendation from '../models/Recommendation';

const router = Router();

router.get('/recommendations', async (req, res) => {
  try {
    const recommendations = await Recommendation.find();
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recommendations' });
  }
});

export default router;
