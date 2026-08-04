const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.phcasymutpcfmfcpbkrf:MW33mfx%2Bm85d2Pg@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

pool.connect()
  .then(client => {
    console.log('Connected successfully!');
    client.release();
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection failed:', err.message);
    process.exit(1);
  });
