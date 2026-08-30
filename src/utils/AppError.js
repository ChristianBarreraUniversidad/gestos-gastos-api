class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // distingue errores "esperados" de bugs inesperados
  }
}

module.exports = AppError;
