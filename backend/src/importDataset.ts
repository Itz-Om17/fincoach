import mongoose from 'mongoose';
import * as XLSX from 'xlsx';
import path from 'path';
import dotenv from 'dotenv';
import Transaction from './models/Transaction';
import { connectDB } from './lib/db';

dotenv.config();

async function importExcelData() {
    try {
        await connectDB();
        console.log('Connected to MongoDB for data import...');

        const filePath = path.join(__dirname, '..', '..', 'financial_dataset_payment_method.xlsx');
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData: any[] = XLSX.utils.sheet_to_json(sheet);

        console.log(`Read ${rawData.length} rows from Excel.`);

        // Clear existing transactions to avoid duplicates and start fresh
        await Transaction.deleteMany({});
        console.log('Cleared existing transactions.');

        const transactions = rawData.map((row, index) => {
            try {
                if (!row['Type'] || !row['Amount (INR)'] || !row['Transaction Type'] || !row['Category'] || !row['Date']) {
                    console.warn(`Row ${index + 2} is missing required fields:`, row);
                }

                // Extract payment method from Payment Method column directly (our new dataset has it!)
                // But fallback to Transaction Reference logic if needed (it doesn't seem to exist in preview but just in case)
                let method = String(row['Payment Method'] || 'Other');

                return {
                    description: String(row['Type'] || 'No Description'),
                    amount: Number(row['Amount (INR)']) || 0,
                    type: row['Transaction Type'] === 'Credit' ? 'income' : 'expense',
                    category: String(row['Category'] || 'General'),
                    date: String(row['Date']),
                    method
                };
            } catch (err) {
                console.error(`Error processing row ${index + 2}:`, row);
                throw err;
            }
        });

        try {
            await Transaction.insertMany(transactions);
            console.log(`Successfully imported ${transactions.length} transactions.`);
        } catch (err: any) {
            if (err.name === 'ValidationError') {
                Object.keys(err.errors).forEach(key => {
                    console.error(`Validation error on field "${key}": ${err.errors[key].message}`);
                });
            }
            throw err;
        }

        process.exit(0);
    } catch (error) {
        console.error('Error importing Excel data:', error);
        process.exit(1);
    }
}

importExcelData();
