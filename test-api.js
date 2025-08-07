const axios = require('axios');

// Configuração base
const BASE_URL = 'http://localhost:3000/api';
let usuarioToken = '';
let promotorToken = '';
let eventoId = '';

// Função para fazer requisições
async function makeRequest(method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Erro na requisição ${method} ${url}:`, error.response?.data || error.message);
    return null;
  }
}

// Função principal de teste
async function testarAPI() {
  console.log('🧪 Iniciando testes da API PostgreSQL + Sequelize...\n');

  // 1. Teste de Health Check
  console.log('1. Testando Health Check...');
  const health = await makeRequest('GET', '/../');
  if (health?.success) {
    console.log('✅ Health Check OK');
    console.log(`   Database: ${health.database}\n`);
  } else {
    console.log('❌ Health Check falhou\n');
    return;
  }

  // 2. Cadastrar usuário comum
  console.log('2. Cadastrando usuário comum...');
  const usuario = await makeRequest('POST', '/auth/cadastrar', {
    nome: 'Teste Usuario PostgreSQL',
    email: 'usuario.pg@teste.com',
    senha: '123456',
    tipo: 'usuario'
  });
  
  if (usuario?.success) {
    usuarioToken = usuario.data.token;
    console.log('✅ Usuário cadastrado com sucesso');
    console.log(`   ID: ${usuario.data.usuario.id}\n`);
  } else {
    console.log('❌ Falha ao cadastrar usuário\n');
  }

  // 3. Cadastrar promotor
  console.log('3. Cadastrando promotor...');
  const promotor = await makeRequest('POST', '/auth/cadastrar', {
    nome: 'Teste Promotor PostgreSQL',
    email: 'promotor.pg@teste.com',
    senha: '123456',
    tipo: 'promotor'
  });
  
  if (promotor?.success) {
    promotorToken = promotor.data.token;
    console.log('✅ Promotor cadastrado com sucesso');
    console.log(`   ID: ${promotor.data.usuario.id}\n`);
  } else {
    console.log('❌ Falha ao cadastrar promotor\n');
  }

  // 4. Login do promotor
  console.log('4. Testando login do promotor...');
  const loginPromotor = await makeRequest('POST', '/auth/login', {
    email: 'promotor.pg@teste.com',
    senha: '123456'
  });
  
  if (loginPromotor?.success) {
    promotorToken = loginPromotor.data.token;
    console.log('✅ Login do promotor realizado com sucesso\n');
  } else {
    console.log('❌ Falha no login do promotor\n');
  }

  // 5. Criar evento
  console.log('5. Criando evento...');
  const evento = await makeRequest('POST', '/eventos', {
    nome: 'Show PostgreSQL Test',
    descricao: 'Um evento de teste para validar a API com PostgreSQL e Sequelize',
    dataHora: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias no futuro
    local: 'Local de Teste PostgreSQL - São Paulo, SP',
    imagem: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    preco: 100.00,
    ingressosTotais: 50
  }, promotorToken);
  
  if (evento?.success) {
    eventoId = evento.data.id;
    console.log('✅ Evento criado com sucesso');
    console.log(`   ID: ${eventoId}\n`);
  } else {
    console.log('❌ Falha ao criar evento\n');
  }

  // 6. Listar eventos
  console.log('6. Listando eventos...');
  const eventos = await makeRequest('GET', '/eventos');
  
  if (eventos?.success && eventos.data.length > 0) {
    console.log(`✅ ${eventos.data.length} evento(s) encontrado(s)`);
    console.log(`   Primeiro evento: ${eventos.data[0].nome}\n`);
  } else {
    console.log('❌ Nenhum evento encontrado\n');
  }

  // 7. Comprar ingresso
  if (eventoId && usuarioToken) {
    console.log('7. Comprando ingresso...');
    const ingresso = await makeRequest('POST', `/ingressos/comprar/${eventoId}`, null, usuarioToken);
    
    if (ingresso?.success) {
      console.log(`✅ Ingresso comprado! Código: ${ingresso.data.codigoCompra}`);
      console.log(`   ID do ingresso: ${ingresso.data.id}\n`);
    } else {
      console.log('❌ Falha ao comprar ingresso\n');
    }
  }

  // 8. Listar meus ingressos
  if (usuarioToken) {
    console.log('8. Listando meus ingressos...');
    const meusIngressos = await makeRequest('GET', '/ingressos/meus', null, usuarioToken);
    
    if (meusIngressos?.success) {
      console.log(`✅ ${meusIngressos.data.length} ingresso(s) encontrado(s)`);
      if (meusIngressos.data.length > 0) {
        console.log(`   Código do primeiro: ${meusIngressos.data[0].codigoCompra}\n`);
      }
    } else {
      console.log('❌ Falha ao listar ingressos\n');
    }
  }

  // 9. Listar meus eventos (promotor)
  if (promotorToken) {
    console.log('9. Listando meus eventos (promotor)...');
    const meusEventos = await makeRequest('GET', '/eventos/meus', null, promotorToken);
    
    if (meusEventos?.success) {
      console.log(`✅ ${meusEventos.data.length} evento(s) do promotor encontrado(s)`);
      if (meusEventos.data.length > 0) {
        console.log(`   Ingressos disponíveis: ${meusEventos.data[0].ingressosDisponiveis}/${meusEventos.data[0].ingressosTotais}\n`);
      }
    } else {
      console.log('❌ Falha ao listar eventos do promotor\n');
    }
  }

  console.log('🎉 Testes concluídos com PostgreSQL + Sequelize!');
  console.log('📊 Resumo:');
  console.log('   - Banco de dados: PostgreSQL (Supabase)');
  console.log('   - ORM: Sequelize');
  console.log('   - IDs: UUID v4');
  console.log('   - Transações: Implementadas');
}

// Executar testes
if (require.main === module) {
  testarAPI().catch(console.error);
}

module.exports = { testarAPI };

