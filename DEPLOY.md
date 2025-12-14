# Guia de Deploy no Railway

Este documento explica como fazer o deploy da aplicação RadiologyAI no Railway usando Docker.

## Pré-requisitos

- Conta no [Railway](https://railway.app)
- Projeto criado no Railway
- Git instalado localmente

## Arquivos de Configuração

Os seguintes arquivos foram criados para o deploy:

- `Dockerfile` - Configuração multi-stage para build e deploy
- `nginx.conf` - Configuração do Nginx para servir a aplicação
- `.dockerignore` - Arquivos a serem ignorados no build do Docker
- `railway.json` - Configuração específica do Railway

## Passos para Deploy

### 1. Preparar o Repositório

Certifique-se de que todos os arquivos estão commitados:

```bash
git add .
git commit -m "Preparar para deploy no Railway"
git push origin master
```

### 2. Conectar ao Railway

1. Acesse [Railway](https://railway.app)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório do projeto
5. Railway detectará automaticamente o Dockerfile

### 3. Configurar Variáveis de Ambiente (Opcional)

Se necessário, adicione variáveis de ambiente no painel do Railway:

- Acesse o projeto no Railway
- Vá em "Variables"
- Adicione as variáveis necessárias

### 4. Deploy Automático

O Railway fará o deploy automaticamente após detectar o Dockerfile:

1. Build da aplicação Angular
2. Criação da imagem Docker
3. Deploy no Nginx
4. Aplicação disponível na URL fornecida pelo Railway

### 5. Acessar a Aplicação

Após o deploy bem-sucedido:

1. Acesse o painel do Railway
2. Clique em "Settings" > "Domains"
3. Gere um domínio público ou configure um domínio customizado

## Testar Localmente com Docker

Para testar o build Docker localmente:

```bash
# Build da imagem
npm run docker:build

# Executar o container
npm run docker:run
```

Acesse `http://localhost:8080` para ver a aplicação.

## Estrutura do Deploy

### Multi-Stage Build

O Dockerfile usa uma estratégia multi-stage:

1. **Stage 1 (Build)**: Compila a aplicação Angular
2. **Stage 2 (Production)**: Serve os arquivos estáticos com Nginx

### Nginx

O Nginx está configurado para:

- Servir a aplicação na porta 8080
- Rotear todas as requisições para `index.html` (suporte a rotas do Angular)
- Habilitar compressão Gzip
- Adicionar headers de segurança
- Cache de assets estáticos
- Health check endpoint em `/health`

## Troubleshooting

### Build Falha

Se o build falhar:

1. Verifique os logs no Railway
2. Certifique-se de que `package.json` está correto
3. Verifique se todas as dependências estão instaladas

### Aplicação não Carrega

Se a aplicação não carregar após deploy:

1. Verifique os logs do Nginx no Railway
2. Certifique-se de que a URL da API está correta
3. Verifique se há erros no console do navegador

### CORS Issues

Se houver problemas de CORS ao chamar a API:

1. Configure CORS no backend da API
2. Certifique-se de que a URL da API está correta no código

## URLs Importantes

- **Aplicação**: Fornecida pelo Railway após deploy
- **API Backend**: `https://web-production-529f.up.railway.app`
- **Health Check**: `[URL_DA_APLICACAO]/health`

## Atualizações

Para atualizar a aplicação:

```bash
git add .
git commit -m "Descrição das mudanças"
git push origin master
```

O Railway fará o redeploy automaticamente.
