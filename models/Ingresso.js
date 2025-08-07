const { DataTypes } = require('sequelize');

/**
 * Modelo do ingresso usando Sequelize
 * Representa a compra de um ingresso por um usuário para um evento específico
 */
const Ingresso = (sequelize) => {
  const IngressoModel = sequelize.define('Ingresso', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    eventoId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'eventos',
        key: 'id'
      },
      validate: {
        notNull: {
          msg: 'ID do evento é obrigatório'
        }
      }
    },
    compradorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      validate: {
        notNull: {
          msg: 'ID do comprador é obrigatório'
        }
      }
    },
    codigoCompra: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Código de compra deve ser único'
      }
    },
    dataCompra: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'ingressos',
    timestamps: true,
    indexes: [
      // Índice composto para garantir que um usuário não compre múltiplos ingressos do mesmo evento
      {
        unique: true,
        fields: ['eventoId', 'compradorId'],
        name: 'unique_evento_comprador'
      }
    ],
    hooks: {
      // Hook para gerar código de compra único antes de salvar
      beforeCreate: (ingresso) => {
        if (!ingresso.codigoCompra) {
          // Gera um código único baseado em timestamp e números aleatórios
          const timestamp = Date.now().toString(36);
          const random = Math.random().toString(36).substr(2, 5);
          ingresso.codigoCompra = `ING-${timestamp}-${random}`.toUpperCase();
        }
      }
    }
  });

  return IngressoModel;
};

module.exports = Ingresso;

