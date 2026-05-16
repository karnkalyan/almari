const express = require('express');
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');

const router = express.Router();

router.get('/', getExpenses);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
