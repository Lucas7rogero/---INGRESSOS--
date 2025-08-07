const express = require('express');
const { body } = require('express-validator');
const {
  criarEvento,
  listarMeusEventos,
  editarEvento,
  deletarEvento,
  listarEventos,
  obterEvento
} = require('../controllers/eventoController');
const authMiddleware = require('../middlewares/authMiddleware');
const isPromotor = require('../middlewares/isPromotor');
const validationMiddleware = require('../middlewares/validationMiddleware');

const router = express.Router();

/**
 * Validações para criação/edição de evento
 */
const validacoesEvento = [
  body('nome')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Nome deve ter entre 3 e 200 caracteres'),
  
  body('descricao')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
  
  body('dataHora')
    .isISO8601()
    .withMessage('Data deve estar no formato ISO 8601')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Data do evento deve ser no futuro');
      }
      return true;
    }),
  
  body('local')
    .trim()
    .isLength({ min: 5, max: 300 })
    .withMessage('Local deve ter entre 5 e 300 caracteres'),
  
  body('imagem')
    .isURL()
    .withMessage('Imagem deve ser uma URL válida'),
  
  body('preco')
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser um número maior ou igual a zero'),
  
  body('ingressosTotais')
    .isInt({ min: 1 })
    .withMessage('Quantidade de ingressos deve ser um número inteiro maior que zero')
];

/**
 * Validações para edição de evento (campos opcionais)
 */
const validacoesEdicaoEvento = [
  body('nome')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Nome deve ter entre 3 e 200 caracteres'),
  
  body('descricao')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
  
  body('dataHora')
    .optional()
    .isISO8601()
    .withMessage('Data deve estar no formato ISO 8601')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Data do evento deve ser no futuro');
      }
      return true;
    }),
  
  body('local')
    .optional()
    .trim()
    .isLength({ min: 5, max: 300 })
    .withMessage('Local deve ter entre 5 e 300 caracteres'),
  
  body('imagem')
    .optional()
    .isURL()
    .withMessage('Imagem deve ser uma URL válida'),
  
  body('preco')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser um número maior ou igual a zero'),
  
  body('ingressosTotais')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantidade de ingressos deve ser um número inteiro maior que zero')
];

/**
 * @route   GET /api/eventos
 * @desc    Listar todos os eventos com ingressos disponíveis
 * @access  Public
 */
router.get('/', listarEventos);

/**
 * @route   GET /api/eventos/meus
 * @desc    Listar eventos criados pelo promotor autenticado
 * @access  Private (Promotor)
 */
router.get('/meus', authMiddleware, isPromotor, listarMeusEventos);

/**
 * @route   POST /api/eventos
 * @desc    Criar novo evento (apenas promotores)
 * @access  Private (Promotor)
 */
router.post('/', authMiddleware, isPromotor, validacoesEvento, validationMiddleware, criarEvento);

/**
 * @route   GET /api/eventos/:id
 * @desc    Obter detalhes de um evento específico
 * @access  Public
 */
router.get('/:id', obterEvento);

/**
 * @route   PUT /api/eventos/:id
 * @desc    Editar evento (apenas o promotor que criou)
 * @access  Private (Promotor)
 */
router.put('/:id', authMiddleware, isPromotor, validacoesEdicaoEvento, validationMiddleware, editarEvento);

/**
 * @route   DELETE /api/eventos/:id
 * @desc    Deletar evento (apenas o promotor que criou)
 * @access  Private (Promotor)
 */
router.delete('/:id', authMiddleware, isPromotor, deletarEvento);

module.exports = router;

