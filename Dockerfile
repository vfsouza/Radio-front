# Stage 1: Build da aplicação Angular
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação para produção
RUN npm run build:prod

# Debug: Listar estrutura de diretórios
RUN ls -la dist/

# Stage 2: Servir com Nginx
FROM nginx:alpine

# Copiar arquivos de build do Angular
COPY --from=build /app/dist/radio/browser /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 8080 (Railway usa esta porta por padrão)
EXPOSE 8080

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
