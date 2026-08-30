// Debe registrarse al final de app.js, después de las rutas.
// Express lo reconoce como error handler por tener 4 argumentos (err primero).
function errorHandler(err, req, res, next) {
  const statusCode = err.isOperational ? err.statusCode : 500;
  const message = err.isOperational ? err.message : 'Error interno del servidor';

  if (!err.isOperational) {
    console.error(err); // errores no esperados sí se loguean completos
  }

  res.status(statusCode).json({
    error: message,
    ...(err.details ? { details: err.details } : {}),
  });
}

module.exports = errorHandler;
