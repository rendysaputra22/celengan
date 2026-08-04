const { isProd, pool, getLocalDb, saveLocalDb } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// A simple DB abstraction for Demo/Production setup.
// Note: Real production would use proper Postgres tables. We simulate simple tables if in Prod.
// For this MVP, we will assume tables: transactions, goals, budgets

const initProdDb = async () => {
  if (!isProd) return;
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(50) PRIMARY KEY,
        type VARCHAR(10),
        title VARCHAR(100),
        amount NUMERIC,
        category VARCHAR(50),
        date TIMESTAMP,
        description TEXT
      );
      CREATE TABLE IF NOT EXISTS goals (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(100),
        target_amount NUMERIC,
        current_amount NUMERIC
      );
      CREATE TABLE IF NOT EXISTS budgets (
        id VARCHAR(10) PRIMARY KEY,
        daily NUMERIC,
        weekly NUMERIC,
        monthly NUMERIC
      );
    `);
  } catch (err) {
    console.error('Error init prod db', err);
  } finally {
    client.release();
  }
};

// Initialize if prod
if (isProd) {
  initProdDb();
}

const getTransactions = async () => {
  if (isProd) {
    const res = await pool.query('SELECT * FROM transactions ORDER BY date DESC');
    return res.rows;
  }
  const db = await getLocalDb();
  return db.transactions;
};

const createTransaction = async (data) => {
  const newTx = { id: uuidv4(), date: new Date().toISOString(), ...data };
  if (isProd) {
    await pool.query(
      'INSERT INTO transactions(id, type, title, amount, category, date, description) VALUES($1, $2, $3, $4, $5, $6, $7)',
      [newTx.id, newTx.type, newTx.title, newTx.amount, newTx.category, newTx.date, newTx.description]
    );
  } else {
    const db = await getLocalDb();
    db.transactions.push(newTx);
    await saveLocalDb(db);
  }
  return newTx;
};

const deleteTransaction = async (id) => {
  if (isProd) {
    await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
  } else {
    const db = await getLocalDb();
    db.transactions = db.transactions.filter(t => t.id !== id);
    await saveLocalDb(db);
  }
};

const getGoals = async () => {
  if (isProd) {
    const res = await pool.query('SELECT * FROM goals');
    return res.rows;
  }
  const db = await getLocalDb();
  return db.goals;
};

const createGoal = async (data) => {
  const newGoal = { id: uuidv4(), current_amount: 0, ...data };
  if (isProd) {
    await pool.query(
      'INSERT INTO goals(id, title, target_amount, current_amount) VALUES($1, $2, $3, $4)',
      [newGoal.id, newGoal.title, newGoal.target_amount, newGoal.current_amount]
    );
  } else {
    const db = await getLocalDb();
    db.goals.push(newGoal);
    await saveLocalDb(db);
  }
  return newGoal;
};

const getBudgets = async () => {
  if (isProd) {
    const res = await pool.query("SELECT * FROM budgets WHERE id = 'main'");
    if (res.rows.length === 0) {
      return { daily: 50, weekly: 350, monthly: 1500 };
    }
    return res.rows[0];
  }
  const db = await getLocalDb();
  return db.budgets;
};

const updateBudgets = async (data) => {
  if (isProd) {
    await pool.query(
      "INSERT INTO budgets(id, daily, weekly, monthly) VALUES('main', $1, $2, $3) ON CONFLICT (id) DO UPDATE SET daily = EXCLUDED.daily, weekly = EXCLUDED.weekly, monthly = EXCLUDED.monthly",
      [data.daily, data.weekly, data.monthly]
    );
  } else {
    const db = await getLocalDb();
    db.budgets = { ...db.budgets, ...data };
    await saveLocalDb(db);
  }
  return data;
};

module.exports = {
  getTransactions, createTransaction, deleteTransaction,
  getGoals, createGoal, getBudgets, updateBudgets
};
