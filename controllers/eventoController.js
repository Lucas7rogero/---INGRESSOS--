const { Op } = require('sequelize');
const database = require('../config/database');

/**
 * Criar novo evento (apenas promotores)
 * POST /api/eventos
 */
const criarEvento = async (req, res) => {
  try {
    const { nome, descricao, dataHora, local, imagem, preco, ingressosTotais } = req.body;
    const { Evento, Usuario } = database.getModels();
    
    // O ID do promotor vem do middleware de autenticação
    const criadoPor = req.usuario.id;

    const novoEvento = await Evento.create({
      nome,
      descricao,
      dataHora,
      local,
      imagem,
      preco,
      ingressosTotais,
      criadoPor
    });

    // Busca o evento com os dados do criador
    const eventoCompleto = await Evento.findByPk(novoEvento.id, {
      include: [{
        model: Usuario,
        as: 'criador',
        attributes: ['id', 'nome', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Evento criado com sucesso',
      data: eventoCompleto
    });

  } catch (error) {
    console.error('Erro ao criar evento:', error);
    
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

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Listar eventos do promotor autenticado
 * GET /api/eventos/meus
 */
const listarMeusEventos = async (req, res) => {
  try {
    const promotorId = req.usuario.id;
    const { Evento, Usuario } = database.getModels();
    
    const eventos = await Evento.findAll({
      where: { criadoPor: promotorId },
      include: [{
        model: Usuario,
        as: 'criador',
        attributes: ['id', 'nome', 'email']
      }],
      order: [['createdAt', 'DESC']] // Mais recentes primeiro
    });

    res.json({
      success: true,
      message: 'Eventos listados com sucesso',
      data: eventos,
      total: eventos.length
    });

  } catch (error) {
    console.error('Erro ao listar eventos do promotor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Editar evento (apenas o promotor que criou)
 * PUT /api/eventos/:id
 */
const editarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const promotorId = req.usuario.id;
    const { nome, descricao, dataHora, local, imagem, preco, ingressosTotais } = req.body;
    const { Evento, Usuario } = database.getModels();

    // Busca o evento
    const evento = await Evento.findByPk(id);
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento não encontrado'
      });
    }

    // Verifica se o promotor é o criador do evento
    if (evento.criadoPor !== promotorId) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para editar este evento'
      });
    }

    // Verifica se está tentando diminuir ingressos totais abaixo dos já vendidos
    const ingressosVendidos = evento.ingressosTotais - evento.ingressosDisponiveis;
    if (ingressosTotais && ingressosTotais < ingressosVendidos) {
      return res.status(400).json({
        success: false,
        message: `Não é possível reduzir ingressos totais para ${ingressosTotais}. Já foram vendidos ${ingressosVendidos} ingressos.`
      });
    }

    // Prepara os dados para atualização
    const dadosAtualizacao = {};
    if (nome) dadosAtualizacao.nome = nome;
    if (descricao) dadosAtualizacao.descricao = descricao;
    if (dataHora) dadosAtualizacao.dataHora = dataHora;
    if (local) dadosAtualizacao.local = local;
    if (imagem) dadosAtualizacao.imagem = imagem;
    if (preco !== undefined) dadosAtualizacao.preco = preco;
    if (ingressosTotais) {
      const diferenca = ingressosTotais - evento.ingressosTotais;
      dadosAtualizacao.ingressosTotais = ingressosTotais;
      dadosAtualizacao.ingressosDisponiveis = evento.ingressosDisponiveis + diferenca;
    }

    // Atualiza o evento
    await evento.update(dadosAtualizacao);

    // Busca o evento atualizado com os dados do criador
    const eventoAtualizado = await Evento.findByPk(id, {
      include: [{
        model: Usuario,
        as: 'criador',
        attributes: ['id', 'nome', 'email']
      }]
    });

    res.json({
      success: true,
      message: 'Evento atualizado com sucesso',
      data: eventoAtualizado
    });

  } catch (error) {
    console.error('Erro ao editar evento:', error);
    
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

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Deletar evento (apenas o promotor que criou)
 * DELETE /api/eventos/:id
 */
const deletarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const promotorId = req.usuario.id;
    const { Evento } = database.getModels();

    // Busca o evento
    const evento = await Evento.findByPk(id);
    
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento não encontrado'
      });
    }

    // Verifica se o promotor é o criador do evento
    if (evento.criadoPor !== promotorId) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar este evento'
      });
    }

    // Verifica se já há ingressos vendidos
    const ingressosVendidos = evento.ingressosTotais - evento.ingressosDisponiveis;
    if (ingressosVendidos > 0) {
      return res.status(400).json({
        success: false,
        message: `Não é possível deletar o evento. Já foram vendidos ${ingressosVendidos} ingressos.`
      });
    }

    await evento.destroy();

    res.json({
      success: true,
      message: 'Evento deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Listar todos os eventos com ingressos disponíveis (para usuários)
 * GET /api/eventos
 */
const listarEventos = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const { Evento, Usuario } = database.getModels();
    
    // Filtros
    let filtros = {
      ingressosDisponiveis: { [Op.gt]: 0 }, // Apenas eventos com ingressos disponíveis
      dataHora: { [Op.gt]: new Date() } // Apenas eventos futuros
    };

    // Busca por nome se fornecido
    if (search) {
      filtros.nome = { [Op.iLike]: `%${search}%` };
    }

    const offset = (page - 1) * limit;

    const { count, rows: eventos } = await Evento.findAndCountAll({
      where: filtros,
      include: [{
        model: Usuario,
        as: 'criador',
        attributes: ['id', 'nome', 'email']
      }],
      order: [['dataHora', 'ASC']], // Ordenar por data (mais próximos primeiro)
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      message: 'Eventos listados com sucesso',
      data: eventos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

/**
 * Obter detalhes de um evento específico
 * GET /api/eventos/:id
 */
const obterEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { Evento, Usuario } = database.getModels();

    const evento = await Evento.findByPk(id, {
      include: [{
        model: Usuario,
        as: 'criador',
        attributes: ['id', 'nome', 'email']
      }]
    });

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Evento encontrado',
      data: evento
    });

  } catch (error) {
    console.error('Erro ao obter evento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  criarEvento,
  listarMeusEventos,
  editarEvento,
  deletarEvento,
  listarEventos,
  obterEvento
};

