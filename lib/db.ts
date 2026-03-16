import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'finance.db');
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS banks (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    bankId TEXT NOT NULL,
    accountName TEXT NOT NULL,
    accountNumber TEXT NOT NULL,
    lastFourDigits TEXT NOT NULL,
    accountType TEXT NOT NULL,
    openingBalance REAL NOT NULL,
    currentBalance REAL NOT NULL,
    FOREIGN KEY (userId) REFERENCES users (id),
    FOREIGN KEY (bankId) REFERENCES banks (id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    accountId TEXT NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    note TEXT,
    FOREIGN KEY (userId) REFERENCES users (id),
    FOREIGN KEY (accountId) REFERENCES accounts (id)
  );
`);

export default db;
