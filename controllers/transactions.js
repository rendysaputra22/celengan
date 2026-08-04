const dbService = require('../services/dbService');

exports.getAll = async (req, res) => {
  try {
    const data = await dbService.getTransactions();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    // Basic validation
    const { type, title, amount, category } = req.body;
    if (!type || !title || amount === undefined || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newTx = await dbService.createTransaction(req.body);
    res.status(201).json(newTx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await dbService.deleteTransaction(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
