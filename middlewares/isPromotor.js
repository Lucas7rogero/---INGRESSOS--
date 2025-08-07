/**
 * Middleware para verificar se o usuário autenticado é um promotor
 * Deve ser usado após o authMiddleware
 */
const isPromotor = (req, res, next) => {
  try {
    // Verifica se o usuário está autenticado (deve ter sido definido pelo authMiddleware)
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    // Verifica se o tipo do usuário é 'promotor'
    if (req.usuario.tipo !== 'promotor') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas promotores podem realizar esta ação'
      });
    }

    // Se chegou até aqui, o usuário é um promotor válido
    next();
    
  } catch (error) {
    console.error('Erro no middleware isPromotor:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = isPromotor;

