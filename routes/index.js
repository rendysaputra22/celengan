const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactions');
const goalsController = require('../controllers/goals');
const budgetsController = require('../controllers/budgets');

// Transactions (Income/Expense)
router.get('/transactions', transactionsController.getAll);
router.post('/transactions', transactionsController.create);
router.delete('/transactions/:id', transactionsController.remove);

// Savings Goals
router.get('/goals', goalsController.getAll);
router.post('/goals', goalsController.create);
router.patch('/goals/:id', goalsController.update);

// Budgets
router.get('/budgets', budgetsController.get);
router.patch('/budgets', budgetsController.update);

// Basic health check
router.get('/health', (req, res) => res.json({ status: 'OK', message: 'API is running' }));

module.exports = router;
