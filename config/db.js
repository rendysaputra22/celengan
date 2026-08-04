const fs = require('fs/promises');
const path = require('path');
const { Pool } = require('pg');

const isProd = process.env.NODE_ENV === 'production';
const localDbPath = path.join(__dirname, '../database/local.json');

let pool;
if (isProd) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
}

// Helper to initialize local DB if it doesn't exist
const initLocalDb = async () => {
  try {
    await fs.access(localDbPath);
  } catch {
    await fs.mkdir(path.dirname(localDbPath), { recursive: true }).catch(() => {});
    const initialData = {
      transactions: [],
      goals: [],
      budgets: {
        daily: 50,
        weekly: 350,
        monthly: 1500,
        categories: {}
      },
      settings: {
        currency: 'IDR',
        theme: 'comic',
      },
      notes: []
    };
    await fs.writeFile(localDbPath, JSON.stringify(initialData, null, 2));
  }
};

const getLocalDb = async () => {
  await initLocalDb();
  const data = await fs.readFile(localDbPath, 'utf8');
  return JSON.parse(data);
};

const saveLocalDb = async (data) => {
  await fs.writeFile(localDbPath, JSON.stringify(data, null, 2));
};

module.exports = {
  isProd,
  pool,
  getLocalDb,
  saveLocalDb
};
