const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * Modelo do usuário usando Sequelize
 * Suporta dois tipos: 'usuario' (comprador) e 'promotor' (organizador)
 */
const Usuario = (sequelize) => {
  const UsuarioModel = sequelize.define('Usuario', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Nome é obrigatório'
        },
        len: {
          args: [2, 100],
          msg: 'Nome deve ter entre 2 e 100 caracteres'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Este email já está em uso'
      },
      validate: {
        isEmail: {
          msg: 'Email deve ser válido'
        },
        notEmpty: {
          msg: 'Email é obrigatório'
        }
      }
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Senha é obrigatória'
        },
        len: {
          args: [6, 255],
          msg: 'Senha deve ter no mínimo 6 caracteres'
        }
      }
    },
    tipo: {
      type: DataTypes.ENUM('usuario', 'promotor'),
      allowNull: false,
      defaultValue: 'usuario',
      validate: {
        isIn: {
          args: [['usuario', 'promotor']],
          msg: 'Tipo deve ser "usuario" ou "promotor"'
        }
      }
    }
  }, {
    tableName: 'usuarios',
    timestamps: true,
    hooks: {
      // Hook para criptografar a senha antes de salvar
      beforeCreate: async (usuario) => {
        if (usuario.senha) {
          const salt = await bcrypt.genSalt(10);
          usuario.senha = await bcrypt.hash(usuario.senha, salt);
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('senha')) {
          const salt = await bcrypt.genSalt(10);
          usuario.senha = await bcrypt.hash(usuario.senha, salt);
        }
      }
    }
  });

  // Método de instância para comparar senhas
  UsuarioModel.prototype.compararSenha = async function(senhaInformada) {
    return await bcrypt.compare(senhaInformada, this.senha);
  };

  // Método para retornar dados públicos do usuário (sem senha)
  UsuarioModel.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.senha;
    return values;
  };

  return UsuarioModel;
};

module.exports = Usuario;

