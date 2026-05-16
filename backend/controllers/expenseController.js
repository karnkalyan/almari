const prisma = require('../prismaClient');

const getExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createExpense = async (req, res) => {
  try {
    const { title, category, amount, date, paymentMode, reference, notes } = req.body;
    const expense = await prisma.expense.create({
      data: {
        title,
        category,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        paymentMode,
        reference,
        notes,
      },
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { title, category, amount, date, paymentMode, reference, notes } = req.body;
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        title,
        category,
        amount: amount == null ? undefined : parseFloat(amount),
        date: date ? new Date(date) : undefined,
        paymentMode,
        reference,
        notes,
      },
    });
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
