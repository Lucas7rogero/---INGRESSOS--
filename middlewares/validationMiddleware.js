const { validationResult } = require('express-validator');

/**
 * Middleware para processar resultados de validação do express-validator
 * Retorna erros de validação em formato padronizado
 */
const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

module.exports = validationMiddleware;

