const { z } = require('zod');

const createExpenseSchema = z.object({
  description: z.string().min(1, 'La descripción es obligatoria'),
  amount: z.number().positive('El monto debe ser mayor a 0'),
  category: z.string().min(1, 'La categoría es obligatoria'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD')
    .optional(),
});

// Reutiliza las mismas reglas de createExpenseSchema pero con todo opcional,
// ya que en un update el usuario puede mandar solo el campo que quiere cambiar.
const updateExpenseSchema = createExpenseSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  });

module.exports = { createExpenseSchema, updateExpenseSchema };
