require('dotenv').config();

/**
 * Configurações do JWT
 */
const jwtConfig = {
  secret: process.env.JWT_SECRET || 'fallback_secret_key',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};

module.exports = jwtConfig;

