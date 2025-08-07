const express = require('express');
const { body } = require('express-validator');
const { cadastrar, login } = require('../controllers/authController');
const validationMiddleware = require('../middlewares/validationMiddleware');

const router = express.Router();

/**
 * Validações para cadastro
 */
const validacoesCadastro = [
  body('nome')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser válido'),
  
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  
  body('tipo')
    .optional()
    .isIn(['usuario', 'promotor'])
    .withMessage('Tipo deve ser "usuario" ou "promotor"')
];

/**
 * Validações para login
 */
const validacoesLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser válido'),
  
  body('senha')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

/**
 * @route   POST /api/auth/cadastrar
 * @desc    Cadastrar novo usuário
 * @access  Public
 */
router.post('/cadastrar', validacoesCadastro, validationMiddleware, cadastrar);

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuário
 * @access  Public
 */
router.post('/login', validacoesLogin, validationMiddleware, login);

module.exports = router;

