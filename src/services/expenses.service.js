const expensesRepository = require('../repositories/expenses.repository');
const AppError = require('../utils/AppError');

async function createExpense(expenseData) {
  // Si no viene fecha, usamos "hoy". La lógica de negocio vive acá,
  // no en el controller ni en el repository.
  const payload = {
    ...expenseData,
    date: expenseData.date || new Date().toISOString().slice(0, 10),
  };
  return expensesRepository.create(payload);
}

async function listExpenses({ category } = {}) {
  return expensesRepository.findAll({ category });
}

async function updateExpense(id, changes) {
  const updated = await expensesRepository.update(id, changes);
  if (!updated) {
    // "No encontrado" es una decisión de negocio, no de la capa de datos:
    // el repository solo informa que no hubo match, el service decide qué significa eso.
    throw new AppError(`No existe un gasto con id ${id}`, 404);
  }
  return updated;
}

async function deleteExpense(id) {
  const deleted = await expensesRepository.remove(id);
  if (!deleted) {
    throw new AppError(`No existe un gasto con id ${id}`, 404);
  }
}

// Redondea a 2 decimales para evitar residuos de punto flotante
// (ej. 0.1 + 0.2 = 0.30000000000000004).
function round2(n) {
  return Math.round(n * 100) / 100;
}

async function getSummary() {
  const expenses = await expensesRepository.findAll();

  const byCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = round2((acc[expense.category] || 0) + expense.amount);
    return acc;
  }, {});

  const total = round2(expenses.reduce((sum, expense) => sum + expense.amount, 0));

  return { total, byCategory };
}

module.exports = {
  createExpense,
  listExpenses,
  updateExpense,
  deleteExpense,
  getSummary,
};
