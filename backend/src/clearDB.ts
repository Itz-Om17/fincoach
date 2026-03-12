import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from './models/Transaction';
import Recommendation from './models/Recommendation';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fincoach';

const clearData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for clearing...');

    await Transaction.deleteMany({});
    console.log('Cleared Transactions.');

    await Recommendation.deleteMany({});
    console.log('Cleared Recommendations.');

    console.log('Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearData();
