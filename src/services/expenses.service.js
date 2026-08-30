const fs = require('node:fs/promises');
const crypto = require('node:crypto');
const { dataFilePath } = require('../config');

// Lee el archivo JSON completo. Si no existe todavía, lo crea vacío.
async function readAll() {
  try {
    const raw = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(dataFilePath, '[]');
      return [];
    }
    throw err;
  }
}

async function writeAll(expenses) {
  await fs.writeFile(dataFilePath, JSON.stringify(expenses, null, 2));
}

async function create(expenseData) {
  const expenses = await readAll();
  const newExpense = {
    id: crypto.randomUUID(),
    ...expenseData,
    createdAt: new Date().toISOString(),
  };
  expenses.push(newExpense);
  await writeAll(expenses);
  return newExpense;
}

async function findAll(filters = {}) {
  const expenses = await readAll();
  if (!filters.category) return expenses;
  return expenses.filter(
    (e) => e.category.toLowerCase() === filters.category.toLowerCase()
  );
}

async function findById(id) {
  const expenses = await readAll();
  return expenses.find((e) => e.id === id) || null;
}

async function update(id, changes) {
  const expenses = await readAll();
  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1) return null;
  expenses[index] = { ...expenses[index], ...changes, updatedAt: new Date().toISOString() };
  await writeAll(expenses);
  return expenses[index];
}

async function remove(id) {
  const expenses = await readAll();
  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1) return false;
  expenses.splice(index, 1);
  await writeAll(expenses);
  return true;
}

module.exports = { create, findAll, findById, update, remove };