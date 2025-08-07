const database = require('../config/database');

/**
 * Comprar ingresso para um evento
 * POST /api/ingressos/comprar/:eventoId
 */
const comprarIngresso = async (req, res) => {
  const transaction = await database.getSequelize().transaction();
  
  try {
    const { eventoId } = req.params;
    const compradorId = req.usuario.id;
    const { Ingresso, Evento, Usuario } = database.getModels();

    // Verifica se o evento existe
    const evento = await Evento.findByPk(eventoId, { transaction });
    if (!evento) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Evento não encontrado'
      });
    }

    // Verifica se o evento é no futuro
    if (evento.dataHora <= new Date()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Não é possível comprar ingressos para eventos passados'
      });
    }

    // Verifica se há ingressos disponíveis
    if (evento.ingressosDisponiveis <= 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Não há ingressos disponíveis para este evento'
      });
    }

    // Verifica se o usuário já comprou ingresso para este evento
    const ingressoExistente = await Ingresso.findOne({
      where: {
        eventoId,
        compradorId
      },
      transaction
    });

    if (ingressoExistente) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Você já possui um ingresso para este evento'
      });
    }

    // Cria o ingresso
    const novoIngresso = await Ingresso.create({
      eventoId,
      compradorId,
      dataCompra: new Date()
    }, { transaction });

    // Decrementa os ingressos disponíveis
    await evento.decrementarIngressos();

    // Commit da transação
    await transaction.commit();

    // Busca o ingresso com os dados relacionados
    const ingressoCompleto = await Ingresso.findByPk(novoIngresso.id, {
      include: [
        {
          model: Evento,
          as: 'evento',
          attributes: ['id', 'nome', 'dataHora', 'local', 'preco']
        },
        {
          model: Usuario,
          as: 'comprador',
          attributes: ['id', 'nome', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Ingresso comprado com sucesso',
      data: ingressoCompleto
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao comprar ingresso:', error);
    
    // Tratamento específico para erro de duplicação (usuário já tem ingresso)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Você já possui um ingresso para este evento'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Listar ingressos comprados pelo usuário autenticado
 * GET /api/ingressos/meus
 */
const listarMeusIngressos = async (req, res) => {
  try {
    const compradorId = req.usuario.id;
    const { Ingresso, Evento, Usuario } = database.getModels();
    
    const ingressos = await Ingresso.findAll({
      where: { compradorId },
      include: [
        {
          model: Evento,
          as: 'evento',
          attributes: ['id', 'nome', 'descricao', 'dataHora', 'local', 'imagem', 'preco'],
          include: [{
            model: Usuario,
            as: 'criador',
            attributes: ['id', 'nome', 'email']
          }]
        },
        {
          model: Usuario,
          as: 'comprador',
          attributes: ['id', 'nome', 'email']
        }
      ],
      order: [['dataCompra', 'DESC']] // Mais recentes primeiro
    });

    res.json({
      success: true,
      message: 'Ingressos listados com sucesso',
      data: ingressos,
      total: ingressos.length
    });

  } catch (error) {
    console.error('Erro ao listar ingressos do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter detalhes de um ingresso específico
 * GET /api/ingressos/:id
 */
const obterIngresso = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;
    const { Ingresso, Evento, Usuario } = database.getModels();

    const ingresso = await Ingresso.findByPk(id, {
      include: [
        {
          model: Evento,
          as: 'evento',
          attributes: ['id', 'nome', 'descricao', 'dataHora', 'local', 'imagem', 'preco'],
          include: [{
            model: Usuario,
            as: 'criador',
            attributes: ['id', 'nome', 'email']
          }]
        },
        {
          model: Usuario,
          as: 'comprador',
          attributes: ['id', 'nome', 'email']
        }
      ]
    });

    if (!ingresso) {
      return res.status(404).json({
        success: false,
        message: 'Ingresso não encontrado'
      });
    }

    // Verifica se o ingresso pertence ao usuário autenticado
    if (ingresso.compradorId !== usuarioId) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para visualizar este ingresso'
      });
    }

    res.json({
      success: true,
      message: 'Ingresso encontrado',
      data: ingresso
    });

  } catch (error) {
    console.error('Erro ao obter ingresso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Validar código de compra de ingresso
 * GET /api/ingressos/validar/:codigo
 */
const validarIngresso = async (req, res) => {
  try {
    const { codigo } = req.params;
    const { Ingresso, Evento, Usuario } = database.getModels();

    const ingresso = await Ingresso.findOne({
      where: { codigoCompra: codigo },
      include: [
        {
          model: Evento,
          as: 'evento',
          attributes: ['id', 'nome', 'dataHora', 'local'],
          include: [{
            model: Usuario,
            as: 'criador',
            attributes: ['id', 'nome', 'email']
          }]
        },
        {
          model: Usuario,
          as: 'comprador',
          attributes: ['id', 'nome', 'email']
        }
      ]
    });

    if (!ingresso) {
      return res.status(404).json({
        success: false,
        message: 'Código de ingresso inválido'
      });
    }

    // Verifica se o evento já passou
    const eventoPassou = ingresso.evento.dataHora < new Date();

    res.json({
      success: true,
      message: 'Ingresso válido',
      data: {
        ...ingresso.toJSON(),
        eventoPassou
      }
    });

  } catch (error) {
    console.error('Erro ao validar ingresso:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  comprarIngresso,
  listarMeusIngressos,
  obterIngresso,
  validarIngresso
};

