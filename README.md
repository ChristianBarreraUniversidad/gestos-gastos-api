# Expense Tracker API

API REST construida con Node.js y Express para gestionar gastos personales: permite crear, listar (con filtro por categoría), actualizar, eliminar gastos, y obtener un resumen de totales. Los datos se persisten en un archivo JSON local (`data/expenses.json`).

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- npm (se instala junto con Node.js)

## Instalación y ejecución local

1. Clona o descomprime el proyecto y entra a la carpeta:

   ```bash
   cd expense-tracker-api
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea tu archivo de variables de entorno a partir del ejemplo:

   ```bash
   cp .env.example .env
   ```

4. Levanta el servidor:

   ```bash
   npm start
   ```

   Para desarrollo, con reinicio automático al guardar cambios:

   ```bash
   npm run dev
   ```

5. El servidor queda disponible en `http://localhost:3000` (o el puerto que hayas definido en `.env`).

## Endpoints

| Método | URL | Descripción |
|---|---|---|
| `POST` | `/api/expenses` | Crea un nuevo gasto |
| `GET` | `/api/expenses` | Lista todos los gastos (admite `?category=` como filtro opcional) |
| `PUT` | `/api/expenses/:id` | Actualiza un gasto existente |
| `DELETE` | `/api/expenses/:id` | Elimina un gasto |
| `GET` | `/api/expenses/summary` | Devuelve el total general y el total por categoría |

### `POST /api/expenses`

```json
{
  "description": "Almuerzo",
  "amount": 45.50,
  "category": "comida"
}
```

`date` es opcional (formato `YYYY-MM-DD`); si no se envía, se usa la fecha actual.

### `GET /api/expenses?category=comida`

Sin body. El parámetro `category` es opcional; si se omite, devuelve todos los gastos.

### `PUT /api/expenses/:id`

```json
{
  "amount": 25,
  "description": "Cine + snacks"
}
```

Todos los campos son opcionales, pero debe enviarse al menos uno.

### `DELETE /api/expenses/:id`

Sin body. Responde `204 No Content` si se elimina correctamente.

### `GET /api/expenses/summary`

Sin body. Ejemplo de respuesta:

```json
{
  "total": 111.35,
  "byCategory": {
    "comida": 76.25,
    "transporte": 15.10,
    "ocio": 20
  }
}
```

## Docker

<!-- TODO: agregar instrucciones de build y ejecución con Docker -->
