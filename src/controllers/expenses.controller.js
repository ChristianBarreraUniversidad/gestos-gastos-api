const expensesService = require('../services/expenses.service');

async function createExpense(req, res, next) {
  try {
    const expense = await expensesService.createExpense(req.validatedBody);
    res.status(201).json(expense);
  } catch (err) {
    next(err); // delega al errorHandler, no responde el error acá
  }
}

async function listExpenses(req, res, next) {
  try {
    const { category } = req.query;
    const expenses = await expensesService.listExpenses({ category });
    res.status(200).json(expenses);
  } catch (err) {
    next(err);
  }
}

async function updateExpense(req, res, next) {
  try {
    const { id } = req.params;
    const expense = await expensesService.updateExpense(id, req.validatedBody);
    res.status(200).json(expense);
  } catch (err) {
    next(err);
  }
}

async function deleteExpense(req, res, next) {
  try {
    const { id } = req.params;
    await expensesService.deleteExpense(id);
    res.status(204).send(); // sin body: la eliminación fue exitosa, no hay nada que devolver
  } catch (err) {
    next(err);
  }
}

async function getSummary(req, res, next) {
  try {
    const summary = await expensesService.getSummary();
    res.status(200).json(summary);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createExpense,
  listExpenses,
  updateExpense,
  deleteExpense,
  getSummary,
};
