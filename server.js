const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar configuração do banco de dados
const database = require('./config/database');

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const ingressoRoutes = require('./routes/ingressoRoutes');

// Criar aplicação Express
const app = express();

// Função para inicializar o servidor
async function initializeServer() {
  try {
    // Conectar ao banco de dados
    await database.connect();

    // Middlewares globais
    app.use(cors({
      origin: '*', // Permite requisições de qualquer origem
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    app.use(express.json({ limit: '10mb' })); // Parser para JSON
    app.use(express.urlencoded({ extended: true })); // Parser para URL encoded

    // Servir arquivos estáticos do frontend
    app.use(express.static(path.join(__dirname, 'public')));

    // Middleware para log de requisições (desenvolvimento)
    app.use((req, res, next) => {
      // Não logar requisições de arquivos estáticos
      if (!req.path.startsWith('/api') && !req.path.includes('.')) {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      }
      next();
    });

    // Rota de health check da API
    app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        message: 'API de Ingressos funcionando!',
        version: '1.0.0',
        database: 'PostgreSQL + Sequelize',
        timestamp: new Date().toISOString()
      });
    });

    // Rotas da API
    app.use('/api/auth', authRoutes);
    app.use('/api/eventos', eventoRoutes);
    app.use('/api/ingressos', ingressoRoutes);

    // Servir o frontend para todas as outras rotas (SPA)
    app.get('*', (req, res) => {
      // Se a rota começar com /api, retornar 404 para API
      if (req.path.startsWith('/api')) {
        return res.status(404).json({
          success: false,
          message: 'Rota da API não encontrada',
          path: req.originalUrl
        });
      }
      
      // Caso contrário, servir o frontend
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Middleware global para tratamento de erros
    app.use((error, req, res, next) => {
      console.error('Erro não tratado:', error);
      
      res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    });

    // Configuração da porta
    const PORT = process.env.PORT || 3000;

    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📱 Frontend disponível em: http://localhost:${PORT}`);
      console.log(`🔗 API disponível em: http://localhost:${PORT}/api`);
      console.log(`🗄️ Banco: PostgreSQL (Supabase)`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Tratamento de encerramento graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await database.close();
  process.exit(0);
});

// Inicializar servidor
initializeServer();

module.exports = app;

