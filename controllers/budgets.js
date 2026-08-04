const dbService = require('../services/dbService');

exports.get = async (req, res) => {
  try {
    const data = await dbService.getBudgets();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await dbService.updateBudgets(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
