const jwt = require('jsonwebtoken');
const database = require('../config/database');
const jwtConfig = require('../config/jwt');

/**
 * Middleware para verificar autenticação JWT
 * Protege rotas que requerem usuário logado
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Verifica se o token foi enviado no header Authorization
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }

    // Extrai o token do header (formato: "Bearer token")
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso inválido'
      });
    }

    // Verifica e decodifica o token
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Busca o usuário no banco de dados
    const { Usuario } = database.getModels();
    const usuario = await Usuario.findByPk(decoded.id);
    
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Adiciona o usuário ao objeto request para uso nas próximas funções
    req.usuario = usuario;
    next();
    
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = authMiddleware;

