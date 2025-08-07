const express = require('express');
const { param } = require('express-validator');
const {
  comprarIngresso,
  listarMeusIngressos,
  obterIngresso,
  validarIngresso
} = require('../controllers/ingressoController');
const authMiddleware = require('../middlewares/authMiddleware');
const validationMiddleware = require('../middlewares/validationMiddleware');

const router = express.Router();

/**
 * Validações para parâmetros de ID
 */
const validacaoId = [
  param('eventoId')
    .isUUID()
    .withMessage('ID do evento deve ser um UUID válido')
];

const validacaoIngressoId = [
  param('id')
    .isUUID()
    .withMessage('ID do ingresso deve ser um UUID válido')
];

const validacaoCodigo = [
  param('codigo')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Código de ingresso deve ter pelo menos 5 caracteres')
];

/**
 * @route   POST /api/ingressos/comprar/:eventoId
 * @desc    Comprar ingresso para um evento
 * @access  Private (Usuario)
 */
router.post('/comprar/:eventoId', authMiddleware, validacaoId, validationMiddleware, comprarIngresso);

/**
 * @route   GET /api/ingressos/meus
 * @desc    Listar ingressos comprados pelo usuário autenticado
 * @access  Private (Usuario)
 */
router.get('/meus', authMiddleware, listarMeusIngressos);

/**
 * @route   GET /api/ingressos/validar/:codigo
 * @desc    Validar código de compra de ingresso
 * @access  Private (qualquer usuário autenticado)
 */
router.get('/validar/:codigo', authMiddleware, validacaoCodigo, validationMiddleware, validarIngresso);

/**
 * @route   GET /api/ingressos/:id
 * @desc    Obter detalhes de um ingresso específico
 * @access  Private (Usuario - apenas o próprio ingresso)
 */
router.get('/:id', authMiddleware, validacaoIngressoId, validationMiddleware, obterIngresso);

module.exports = router;

