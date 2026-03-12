const XLSX = require('xlsx');
const path = require('path');
const wb = XLSX.readFile(path.join('c:', 'MERN_B1', 'fincoach', 'sample_financial_statement_dataset.xlsx'));
console.log('Sheet names:', wb.SheetNames);
const sheet = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);
console.log('Total rows:', data.length);
console.log('First 3 rows:', JSON.stringify(data.slice(0, 3), null, 2));
console.log('Column keys:', Object.keys(data[0]));
