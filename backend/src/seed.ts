import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from './models/Transaction';
import Recommendation from './models/Recommendation';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fincoach';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Transaction.deleteMany({});
    await Recommendation.deleteMany({});
    console.log('Cleared existing data.');

    // Sample Transactions
    const transactions = [
      { description: "Monthly Salary", amount: 65000, type: "income", category: "Income", date: "2024-03-01", method: "Bank Transfer" },
      { description: "Swiggy Order", amount: 450, type: "expense", category: "Food", date: "2024-03-10", method: "UPI" },
      { description: "Electricity Bill", amount: 1800, type: "expense", category: "Bills", date: "2024-03-08", method: "Auto-Pay" },
      { description: "Amazon Shopping", amount: 2300, type: "expense", category: "Shopping", date: "2024-03-07", method: "Credit Card" },
      { description: "Uber Ride", amount: 380, type: "expense", category: "Travel", date: "2024-03-06", method: "UPI" },
      { description: "Netflix Subscription", amount: 649, type: "expense", category: "Entertainment", date: "2024-03-05", method: "Credit Card" },
      { description: "Freelance Project", amount: 15000, type: "income", category: "Income", date: "2024-03-04", method: "Bank Transfer" },
      { description: "Grocery Shopping", amount: 2100, type: "expense", category: "Food", date: "2024-03-03", method: "UPI" },
    ];

    await Transaction.insertMany(transactions);
    console.log('Inserted sample transactions.');

    // Sample Recommendations
    const recommendations = [
      {
        title: "Reduce Food Delivery Spending",
        description: "Reducing food delivery by ₹1,000 monthly can increase your yearly savings by ₹12,000.",
        savings: "₹12,000/year",
        priority: "high",
      },
      {
        title: "Switch to Annual Subscriptions",
        description: "Switching Netflix & Spotify to annual plans saves ~20% compared to monthly billing.",
        savings: "₹1,800/year",
        priority: "medium",
      },
      {
        title: "Set Up Auto-Transfer to Savings",
        description: "Automatically move ₹5,000 on salary day to your savings account for painless saving.",
        savings: "₹60,000/year",
        priority: "high",
      },
      {
        title: "Review Unused Subscriptions",
        description: "You have 2 subscriptions with no usage in the last 30 days. Consider cancelling.",
        savings: "₹1,200/year",
        priority: "low",
      },
    ];

    await Recommendation.insertMany(recommendations);
    console.log('Inserted sample recommendations.');

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
