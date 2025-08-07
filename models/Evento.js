const { DataTypes } = require('sequelize');

/**
 * Modelo do evento usando Sequelize
 * Eventos são criados por promotores e podem ter ingressos comprados por usuários
 */
const Evento = (sequelize) => {
  const EventoModel = sequelize.define('Evento', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nome: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nome do evento é obrigatório'
        },
        len: {
          args: [3, 200],
          msg: 'Nome deve ter entre 3 e 200 caracteres'
        }
      }
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Descrição é obrigatória'
        },
        len: {
          args: [10, 1000],
          msg: 'Descrição deve ter entre 10 e 1000 caracteres'
        }
      }
    },
    dataHora: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Data e hora são obrigatórias'
        },
        isDate: {
          msg: 'Data deve ser válida'
        },
        isAfter: {
          args: new Date().toISOString(),
          msg: 'Data do evento deve ser no futuro'
        }
      }
    },
    local: {
      type: DataTypes.STRING(300),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Local é obrigatório'
        },
        len: {
          args: [5, 300],
          msg: 'Local deve ter entre 5 e 300 caracteres'
        }
      }
    },
    imagem: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'URL da imagem é obrigatória'
        },
        isUrl: {
          msg: 'URL da imagem deve ser válida'
        }
      }
    },
    preco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Preço é obrigatório'
        },
        min: {
          args: [0],
          msg: 'Preço deve ser maior ou igual a zero'
        },
        isDecimal: {
          msg: 'Preço deve ser um número válido'
        }
      }
    },
    ingressosTotais: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Quantidade total de ingressos é obrigatória'
        },
        min: {
          args: [1],
          msg: 'Deve haver pelo menos 1 ingresso'
        },
        isInt: {
          msg: 'Quantidade de ingressos deve ser um número inteiro'
        }
      }
    },
    ingressosDisponiveis: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Ingressos disponíveis é obrigatório'
        },
        min: {
          args: [0],
          msg: 'Ingressos disponíveis não pode ser negativo'
        },
        isInt: {
          msg: 'Ingressos disponíveis deve ser um número inteiro'
        }
      }
    },
    criadoPor: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      },
      validate: {
        notNull: {
          msg: 'Criador do evento é obrigatório'
        }
      }
    }
  }, {
    tableName: 'eventos',
    timestamps: true,
    hooks: {
      // Hook para definir ingressosDisponiveis igual a ingressosTotais na criação
      beforeCreate: (evento) => {
        if (evento.ingressosDisponiveis === null || evento.ingressosDisponiveis === undefined) {
          evento.ingressosDisponiveis = evento.ingressosTotais;
        }
      },
      // Validação customizada para ingressosDisponiveis
      beforeSave: (evento) => {
        if (evento.ingressosDisponiveis > evento.ingressosTotais) {
          throw new Error('Ingressos disponíveis não pode ser maior que o total de ingressos');
        }
      }
    }
  });

  // Método de instância para verificar se há ingressos disponíveis
  EventoModel.prototype.temIngressosDisponiveis = function() {
    return this.ingressosDisponiveis > 0;
  };

  // Método de instância para decrementar ingressos disponíveis
  EventoModel.prototype.decrementarIngressos = async function() {
    if (this.ingressosDisponiveis > 0) {
      this.ingressosDisponiveis -= 1;
      return await this.save();
    }
    throw new Error('Não há ingressos disponíveis');
  };

  return EventoModel;
};

module.exports = Evento;

