# Expense Tracker API

API REST construida con Node.js y Express para gestionar gastos personales: permite crear, listar (con filtro por categoría), actualizar, eliminar gastos, y obtener un resumen de totales. Los datos se persisten en un archivo JSON local (`data/expenses.json`).

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- npm (se instala junto con Node.js)

## Instalación y ejecución local

1. Clona o descomprime el proyecto y entra a la carpeta:

   ```bash
   cd gestor-gastos-api
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

Requiere tener [Docker](https://docs.docker.com/get-docker/) instalado.

### Build

Desde la raíz del proyecto (donde está el `Dockerfile`):

```bash
docker build -t expense-tracker-api .
```

### Run

```bash
docker run -p 3000:3000 --env-file .env expense-tracker-api
```

- `-p 3000:3000` mapea el puerto del contenedor al de tu máquina (formato `host:contenedor`). Si cambiaste `PORT` en tu `.env`, ajusta el segundo número igual.
- `--env-file .env` pasa tus variables de entorno al contenedor en tiempo de ejecución. El `.env` **no** viaja dentro de la imagen (está en `.dockerignore` a propósito), así que sin esta bandera la app arranca igual con sus valores por defecto (puerto `3000`).

El servidor queda disponible en `http://localhost:3000`, igual que corriéndolo en local.

### Persistir los datos entre reinicios

Por defecto, `data/expenses.json` vive **dentro** del contenedor: si lo eliminas (`docker rm`), pierdes los gastos guardados. Para que los datos sobrevivan, monta la carpeta `data` de tu máquina como volumen:

```bash
docker run -p 3000:3000 --env-file .env -v "$(pwd)/data:/app/data" expense-tracker-api
```

En Windows (PowerShell), reemplaza `$(pwd)` por `${PWD}`.

### Verificar que corre como usuario no-root

```bash
docker exec <container_id> whoami
```

Debería responder `node`, no `root` — es la medida de seguridad principal del `Dockerfile` (ver comentarios dentro del archivo para el detalle de cada instrucción).

## Uso de IA como apoyo

Se utilizó IA (Claude) como copiloto durante el desarrollo, revisando y validando cada propuesta antes de aplicarla. A continuación, los prompts más relevantes usados y qué aportó cada uno:

### 1. Estructura inicial del proyecto
> "Ayúdame a diseñar la estructura de una API REST en Node.js/Express para un gestor de gastos personales, con endpoints para crear, listar (con filtro por categoría), obtener un resumen de totales, actualizar y eliminar gastos. Antes de darme código, explícame qué archivos y carpetas propones y por qué."

**Aportó:** la arquitectura en capas (repository → service → controller → routes), con cada archivo responsable de una sola cosa, lo que facilitó agregar los endpoints restantes sin reescribir código ya probado.

### 2. Generación del README
> "Genera un README.md para este proyecto de gestor de gastos en Node.js/Express. Debe incluir: descripción breve, requisitos previos, pasos para instalar y correr localmente, la lista de los 5 endpoints con método, URL y ejemplo de body, y un espacio en blanco para las instrucciones de Docker. Explícame por qué organizas las secciones en ese orden."

**Aportó:** una estructura de documentación clara y en el orden en que alguien nuevo necesitaría la información (instalación antes que referencia de endpoints).

### 3. Interpretación de hallazgos de SonarCloud
> "SonarCloud me reportó estos 3 hallazgos [...]. Para cada uno, explícame primero qué riesgo o problema real representa y por qué Sonar lo marca, antes de darme el código corregido."

**Aportó:** entender que el hallazgo de seguridad (header `X-Powered-By` de Express) exponía la versión del framework, y que los otros dos eran convenciones modernas de Node (prefijo `node:` en imports nativos), no bugs. Los 3 se corrigieron.

### 4. Dockerfile seguro
> "Genera un Dockerfile sencillo y seguro para esta API [...]. Usa una imagen base ligera y reciente, corre la app con un usuario no-root, y expón el puerto que usa la app. Explícame qué hace cada instrucción y por qué es una buena práctica de seguridad."

**Aportó:** una imagen basada en `node:24-alpine` (ligera, LTS activa), con `npm ci` en vez de `npm install` para builds reproducibles, y ejecución con el usuario `node` en vez de root — verificado con `docker exec <id> whoami`.

### 5. Corrección de vulnerabilidades HIGH detectadas por Trivy
> "Trivy encontró 6 vulnerabilidades HIGH [...]. Ayúdame a: 1) actualizar los paquetes de Alpine para tomar la versión parchada de OpenSSL, y 2) eliminar npm de la imagen final ya que la app no lo necesita en producción. Explícame cada cambio antes de aplicarlo."

**Aportó:** dos cambios al Dockerfile (`apk update && apk upgrade` para parchar OpenSSL, y borrar `npm`/`npx`/`corepack` de la imagen final). Redujo las vulnerabilidades HIGH de 2 a 0 tras volver a escanear con Trivy.