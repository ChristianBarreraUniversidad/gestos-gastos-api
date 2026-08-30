const AppError = require('../utils/AppError');

// Middleware "factory": recibe un esquema y devuelve el middleware ya
// configurado para ese esquema. Así se reutiliza para crear, actualizar, etc.
function validateRequest(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new AppError('Datos inválidos', 422, details));
    }
    req.validatedBody = result.data;
    next();
  };
}

module.exports = validateRequest;
