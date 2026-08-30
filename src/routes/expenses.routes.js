const { Router } = require('express');
const expensesController = require('../controllers/expenses.controller');
const validateRequest = require('../middlewares/validateRequest');
const { createExpenseSchema, updateExpenseSchema } = require('../validators/expense.schema');

const router = Router();

// GET /api/expenses?category=comida
router.get('/', expensesController.listExpenses);

// POST /api/expenses
router.post('/', validateRequest(createExpenseSchema), expensesController.createExpense);

// GET /api/expenses/summary
// IMPORTANTE: debe ir antes de PUT/DELETE /:id. Aunque hoy no hay un GET /:id
// (así que técnicamente no colisiona), lo dejamos acá para que la ruta esté
// a salvo si en el futuro se agrega un GET /:id por gasto individual.
router.get('/summary', expensesController.getSummary);

// PUT /api/expenses/:id
router.put('/:id', validateRequest(updateExpenseSchema), expensesController.updateExpense);

// DELETE /api/expenses/:id
router.delete('/:id', expensesController.deleteExpense);

module.exports = router;
