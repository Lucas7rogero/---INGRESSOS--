const { Sequelize } = require('sequelize');
require('dotenv').config();

// Importar modelos
const UsuarioModel = require('../models/Usuario');
const EventoModel = require('../models/Evento');
const IngressoModel = require('../models/Ingresso');

/**
 * Configuração e conexão com o banco de dados PostgreSQL usando Sequelize
 */
class Database {
  constructor() {
    this.sequelize = null;
    this.models = {};
  }

  async connect() {
    try {
      // Criar instância do Sequelize
      this.sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: process.env.DB_LOGGING === 'true' ? console.log : false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      });

      // Testar conexão
      await this.sequelize.authenticate();
      console.log('✅ Conexão com PostgreSQL estabelecida com sucesso');

      // Inicializar modelos
      this.initModels();

      // Configurar associações
      this.setupAssociations();

      // Sincronizar modelos com o banco de dados
      await this.syncModels();

      return this.sequelize;
    } catch (error) {
      console.error('❌ Erro ao conectar com o PostgreSQL:', error.message);
      throw error;
    }
  }

  initModels() {
    // Inicializar modelos
    this.models.Usuario = UsuarioModel(this.sequelize);
    this.models.Evento = EventoModel(this.sequelize);
    this.models.Ingresso = IngressoModel(this.sequelize);

    console.log('✅ Modelos inicializados');
  }

  setupAssociations() {
    const { Usuario, Evento, Ingresso } = this.models;

    // Um usuário (promotor) pode criar muitos eventos
    Usuario.hasMany(Evento, {
      foreignKey: 'criadoPor',
      as: 'eventosCreated'
    });

    // Um evento pertence a um usuário (promotor)
    Evento.belongsTo(Usuario, {
      foreignKey: 'criadoPor',
      as: 'criador'
    });

    // Um usuário pode comprar muitos ingressos
    Usuario.hasMany(Ingresso, {
      foreignKey: 'compradorId',
      as: 'ingressosComprados'
    });

    // Um ingresso pertence a um usuário (comprador)
    Ingresso.belongsTo(Usuario, {
      foreignKey: 'compradorId',
      as: 'comprador'
    });

    // Um evento pode ter muitos ingressos
    Evento.hasMany(Ingresso, {
      foreignKey: 'eventoId',
      as: 'ingressos'
    });

    // Um ingresso pertence a um evento
    Ingresso.belongsTo(Evento, {
      foreignKey: 'eventoId',
      as: 'evento'
    });

    console.log('✅ Associações configuradas');
  }

  async syncModels() {
    try {
      // Sincronizar modelos (criar tabelas se não existirem)
      await this.sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados com o banco de dados');
    } catch (error) {
      console.error('❌ Erro ao sincronizar modelos:', error.message);
      throw error;
    }
  }

  getModels() {
    return this.models;
  }

  getSequelize() {
    return this.sequelize;
  }

  async close() {
    if (this.sequelize) {
      await this.sequelize.close();
      console.log('✅ Conexão com o banco de dados fechada');
    }
  }
}

// Criar instância única do banco de dados
const database = new Database();

module.exports = database;

