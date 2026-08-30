# Imagen base ligera (Alpine) sobre Node 24, la línea LTS activa actual.
# Fijar una versión concreta (no "latest") evita que un build futuro
# cambie de versión de Node sin que lo decidas explícitamente.
FROM node:24-alpine

# Actualiza los paquetes del sistema operativo (Alpine) al momento del build,
# tomando los últimos parches de seguridad disponibles -incluye libssl3/libcrypto3-
# sin depender de que Docker Hub publique una nueva imagen node:24-alpine.
# --no-cache evita que el índice de paquetes quede guardado dentro de la imagen.
# Nota: esto hace el build no 100% reproducible en el tiempo (dos builds en
# fechas distintas pueden traer versiones de paquete distintas); es el
# trade-off normal de perseguir parches automáticamente.
RUN apk update && apk upgrade --no-cache

# Todo lo que sigue ocurre dentro de esta carpeta en el contenedor.
WORKDIR /app

# Indicarle a Express (y a cualquier librería que lo consulte) que estamos
# en producción: desactiva mensajes de debug/verbose y activa optimizaciones.
ENV NODE_ENV=production

# Se copian primero SOLO los manifiestos de dependencias, no el código fuente.
# Docker cachea esta capa: mientras no cambien package.json/package-lock.json,
# los builds siguientes reusan el cache y no vuelven a ejecutar npm ci.
COPY package.json package-lock.json ./

# npm ci (no npm install) instala exactamente lo que dice package-lock.json,
# de forma reproducible. --omit=dev excluye devDependencies (nodemon, etc.):
# menos paquetes de terceros en la imagen final = menos superficie de ataque.
#
# La app en producción solo necesita el binario "node" para correr
# (CMD usa "node src/server.js", nunca "npm"), así que en el mismo RUN se
# borran npm/npx/corepack: son herramientas con sus propias dependencias
# internas (brace-expansion, tar, ip-address, undici) que no aportan nada
# en runtime y sí aumentan la superficie de vulnerabilidades reportadas.
# Se hace en el MISMO RUN que la instalación para que esta capa nunca
# llegue a "contener" esos archivos en su resultado final -si se borraran
# en un RUN aparte, la capa anterior seguiría pesando esos MB en la imagen-.
RUN npm ci --omit=dev && \
    rm -rf /usr/local/lib/node_modules/npm \
           /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm \
           /usr/local/bin/npx \
           /usr/local/bin/corepack

# Recién ahora se copia el código fuente, y solo lo que la app necesita en
# runtime (el .dockerignore se encarga de excluir tests, .env, .git, etc.)
COPY src ./src
COPY data ./data

# La imagen oficial de Node ya trae un usuario sin privilegios llamado "node"
# (uid 1000). Le damos permisos de escritura sobre /app (necesita escribir
# en data/expenses.json) y luego cambiamos a ese usuario.
RUN chown -R node:node /app
USER node

# Documenta qué puerto expone la app. No publica el puerto por sí solo
# (eso lo decide quien corre "docker run -p"), pero sirve como metadata
# clara para quien lea o use esta imagen.
EXPOSE 3000

# Forma "exec" (array), no "shell" (string): el proceso de Node se
# convierte en el PID 1 del contenedor y recibe directamente señales
# como SIGTERM, permitiendo un apagado ordenado (graceful shutdown).
CMD ["node", "src/server.js"]
