const express = require('express');
const expensesRoutes = require('./routes/expenses.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Evita que Express divulgue el framework usado vía el header X-Powered-By
app.disable('x-powered-by');

app.use(express.json());

app.use('/api/expenses', expensesRoutes);

// 404 para rutas no definidas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Siempre al final: captura cualquier error pasado con next(err)
app.use(errorHandler);

module.exports = app;