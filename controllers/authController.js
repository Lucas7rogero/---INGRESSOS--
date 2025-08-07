const jwt = require('jsonwebtoken');
const database = require('../config/database');
const jwtConfig = require('../config/jwt');

/**
 * Gera token JWT para o usuário
 */
const gerarToken = (userId) => {
  return jwt.sign({ id: userId }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
};

/**
 * Cadastrar novo usuário
 * POST /api/auth/cadastrar
 */
const cadastrar = async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;
    const { Usuario } = database.getModels();

    // Verifica se o usuário já existe
    const usuarioExistente = await Usuario.findOne({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe com este email'
      });
    }

    // Cria novo usuário
    const novoUsuario = await Usuario.create({
      nome,
      email: email.toLowerCase(),
      senha,
      tipo: tipo || 'usuario' // Default para 'usuario' se não especificado
    });

    // Gera token para o usuário recém-criado
    const token = gerarToken(novoUsuario.id);

    res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso',
      data: {
        token,
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          tipo: novoUsuario.tipo
        }
      }
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    
    // Tratamento de erros de validação do Sequelize
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors
      });
    }

    // Tratamento de erro de duplicação (email único)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Login de usuário
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const { Usuario } = database.getModels();

    // Busca o usuário pelo email
    const usuario = await Usuario.findOne({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Verifica a senha
    const senhaCorreta = await usuario.compararSenha(senha);
    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Gera token
    const token = gerarToken(usuario.id);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo
        }
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  cadastrar,
  login
};

