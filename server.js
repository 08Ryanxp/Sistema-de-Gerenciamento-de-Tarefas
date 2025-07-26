// Carregar configurações do .env
require('dotenv').config();

// Importar o app principal
const app = require('./src/app');
const connectDB = require('./src/config/database');

// Pegar porta do .env ou usar 3000
const PORT = process.env.PORT || 3000;

// Conectar no banco
connectDB();

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📚 Documentação: http://localhost:${PORT}/api-docs`);
});