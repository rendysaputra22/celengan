const dbService = require('../services/dbService');

exports.getAll = async (req, res) => {
  try {
    const data = await dbService.getGoals();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, target_amount } = req.body;
    if (!title || !target_amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newGoal = await dbService.createGoal(req.body);
    res.status(201).json(newGoal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  // Mock update for now
  res.json({ success: true });
};
