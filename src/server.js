const app = require('./app');
const { port } = require('./config');

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
