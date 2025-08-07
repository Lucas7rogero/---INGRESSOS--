# Sistema Completo de Venda de Ingressos

Sistema completo de venda de ingressos com frontend React e backend Node.js integrados em um único projeto.

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados (Supabase)
- **JWT** - Autenticação
- **bcrypt** - Criptografia de senhas
- **express-validator** - Validação de dados

### Frontend
- **React 18** - Biblioteca JavaScript para interfaces
- **Material-UI (MUI)** - Biblioteca de componentes UI
- **React Router** - Roteamento da aplicação
- **React Hook Form** - Gerenciamento de formulários
- **Yup** - Validação de esquemas
- **Axios** - Cliente HTTP

## 📁 Estrutura do Projeto

```
backend-ingressos/
├── controllers/          # Lógica de negócio
├── models/              # Modelos Sequelize
├── routes/              # Definição das rotas da API
├── middlewares/         # Middlewares customizados
├── config/              # Configurações (DB, JWT)
├── public/              # Arquivos estáticos do frontend (build)
├── server.js            # Servidor principal
├── package.json         # Dependências
├── .env                 # Variáveis de ambiente
└── README.md            # Esta documentação
```

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Banco PostgreSQL (Supabase configurado)

### Instalação

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   
   O arquivo `.env` já está configurado com sua string do Supabase:
   ```env
   DATABASE_URL=postgresql://postgres.odtrostmxlxguopiyjem:QEVGqz5U0JxKTfOG@aws-1-sa-east-1.pooler.supabase.com:6543/postgres
   JWT_SECRET=seu_jwt_secret_super_seguro_aqui_2024
   NODE_ENV=production
   PORT=3000
   ```

3. **Iniciar servidor:**
   ```bash
   npm start
   ```

4. **Acessar aplicação:**
   ```
   Frontend: http://localhost:3000
   API: http://localhost:3000/api
   ```

## 👥 Funcionalidades

### 🎭 Usuário Comum
- ✅ Cadastro e login
- ✅ Visualizar eventos disponíveis
- ✅ Buscar e filtrar eventos
- ✅ Ver detalhes do evento
- ✅ Comprar ingressos
- ✅ Visualizar meus ingressos
- ✅ Códigos únicos de validação
- ✅ Gerenciar perfil

### 🎪 Promotor de Eventos
- ✅ Cadastro e login como promotor
- ✅ Dashboard com estatísticas
- ✅ Criar novos eventos
- ✅ Gerenciar eventos criados
- ✅ Editar eventos existentes
- ✅ Deletar eventos
- ✅ Visualizar vendas de ingressos
- ✅ Gerenciar perfil

## 🌐 API Endpoints

### Autenticação
- `POST /api/auth/cadastrar` - Cadastro de usuários
- `POST /api/auth/login` - Login

### Eventos (Usuário)
- `GET /api/eventos` - Listar eventos
- `GET /api/eventos/:id` - Detalhes do evento

### Eventos (Promotor)
- `POST /api/eventos` - Criar evento
- `GET /api/eventos/meus` - Meus eventos
- `PUT /api/eventos/:id` - Editar evento
- `DELETE /api/eventos/:id` - Deletar evento

### Ingressos
- `POST /api/ingressos/comprar/:eventoId` - Comprar ingresso
- `GET /api/ingressos/meus` - Meus ingressos

## 🗄️ Banco de Dados

### Estrutura das Tabelas

**usuarios:**
- id (UUID, PK)
- nome (VARCHAR)
- email (VARCHAR, UNIQUE)
- senha (VARCHAR, hash)
- tipo (ENUM: 'usuario', 'promotor')
- createdAt, updatedAt

**eventos:**
- id (UUID, PK)
- nome (VARCHAR)
- descricao (TEXT)
- dataHora (DATETIME)
- local (VARCHAR)
- imagem (VARCHAR, URL)
- preco (DECIMAL)
- ingressosTotais (INTEGER)
- ingressosDisponiveis (INTEGER)
- criadoPor (UUID, FK → usuarios.id)
- createdAt, updatedAt

**ingressos:**
- id (UUID, PK)
- eventoId (UUID, FK → eventos.id)
- compradorId (UUID, FK → usuarios.id)
- codigoCompra (VARCHAR, UNIQUE)
- dataCompra (DATETIME)
- createdAt, updatedAt

## 🔐 Segurança

- **Senhas criptografadas** com bcrypt
- **Autenticação JWT** com tokens seguros
- **Validação de dados** com express-validator
- **CORS configurado** para acesso externo
- **Transações ACID** para operações críticas
- **UUIDs** em vez de IDs incrementais

## 🚀 Deploy e Produção

### Variáveis de Ambiente para Produção
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=sua_string_postgresql
JWT_SECRET=seu_jwt_secret_muito_seguro
```

### Scripts Disponíveis
```bash
npm start          # Iniciar servidor
npm run dev        # Modo desenvolvimento (se configurado)
npm test           # Executar testes (se configurados)
```

## 📱 Interface do Usuário

### Design e UX
- **Material Design** - Interface moderna e intuitiva
- **Responsivo** - Funciona em desktop e mobile
- **Tema customizado** - Cores e tipografia consistentes
- **Navegação intuitiva** - Menu baseado no tipo de usuário

### Funcionalidades da Interface
- **Sistema de notificações** - Alertas e mensagens
- **Validação em tempo real** - Formulários inteligentes
- **Estados de loading** - Indicadores visuais
- **Tratamento de erros** - Mensagens amigáveis
- **Busca e filtros** - Navegação eficiente
- **Paginação** - Performance otimizada

## 🔧 Desenvolvimento

### Estrutura de Desenvolvimento
O projeto integra frontend e backend em uma única aplicação:

1. **Frontend** é buildado para a pasta `public/`
2. **Backend** serve os arquivos estáticos do frontend
3. **API** fica disponível em `/api/*`
4. **SPA routing** é tratado pelo Express

### Fluxo de Build
1. Frontend React é compilado com Vite
2. Arquivos são copiados para `backend/public/`
3. Express serve tanto API quanto frontend
4. Roteamento SPA funciona corretamente

## 🐛 Solução de Problemas

### Problemas Comuns

1. **Erro de conexão com banco:**
   - Verifique a string de conexão no `.env`
   - Confirme se o Supabase está acessível

2. **Erro 404 no frontend:**
   - Verifique se a pasta `public/` existe
   - Confirme se o build foi gerado corretamente

3. **Problemas de CORS:**
   - CORS está configurado para aceitar qualquer origem
   - Verifique se as requisições estão indo para `/api/*`

### Logs e Debug

Para debug, verifique:
- Logs do servidor no terminal
- Console do navegador (F12)
- Network tab para requisições da API

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do servidor
2. Confirme se o banco está acessível
3. Teste as rotas da API diretamente

## 🎯 Próximos Passos

Para melhorar ainda mais:
1. **Testes automatizados** - Jest + Supertest
2. **CI/CD** - GitHub Actions
3. **Monitoramento** - Logs estruturados
4. **Cache** - Redis para performance
5. **Pagamentos** - Integração com gateway
6. **Notificações** - Email e push notifications

---

**Sistema completo desenvolvido com ❤️ usando Node.js + React + PostgreSQL**

