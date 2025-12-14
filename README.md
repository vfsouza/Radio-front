# RadiologyAI - Sistema de Detecção de Fraturas

Sistema inteligente de análise de radiografias utilizando Inteligência Artificial para detecção de fraturas ósseas.

## 🩺 Sobre o Projeto

RadiologyAI é uma aplicação web desenvolvida em Angular que permite o upload e análise de imagens de radiografias. O sistema utiliza IA para detectar possíveis fraturas ósseas, fornecendo informações detalhadas sobre:

- Tipo de fratura
- Localização específica
- Grau de confiança da detecção
- Severidade (Leve, Moderada, Grave)

## ⚠️ Disclaimer

**IMPORTANTE**: Este sistema utiliza Inteligência Artificial como ferramenta de apoio ao diagnóstico médico. **NÃO substitui** a avaliação de um profissional qualificado. Os resultados podem conter falsos positivos ou negativos. **Sempre consulte um médico especialista** para diagnóstico definitivo.

## 🚀 Tecnologias Utilizadas

- **Framework**: Angular 21
- **Estilização**: Tailwind CSS
- **Geração de PDF**: jsPDF
- **Servidor de Produção**: Nginx
- **Containerização**: Docker
- **Deploy**: Railway
- **API Backend**: FastAPI (Python)

## 📋 Funcionalidades

### Upload de Radiografias
- Drag & drop de imagens
- Suporte a múltiplos formatos (PNG, JPG, JPEG, DICOM)
- Preview da imagem antes do envio
- Validação de arquivo

### Análise por IA
- Detecção automática de fraturas
- Marcação visual com bounding boxes
- Cálculo de confiança da detecção
- Classificação de severidade

### Histórico
- Armazenamento local de análises
- Filtros por status e data
- Busca por paciente ou região
- Visualização detalhada de cada análise

### Relatórios em PDF
- Geração automática de relatórios profissionais
- Inclusão de imagem com marcações
- Informações completas do paciente e análise
- Disclaimer médico

### Gerenciamento
- Sistema de informações do paciente
- Exclusão individual ou em lote
- Exportação de dados

## 🏗️ Estrutura do Projeto

```
radio/
├── src/
│   ├── app/
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── header/
│   │   │   ├── disclaimer-modal/
│   │   │   └── detection-modal/
│   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── upload/
│   │   │   └── history/
│   │   ├── services/         # Serviços Angular
│   │   ├── app.ts
│   │   ├── app.html
│   │   └── app.routes.ts
│   ├── styles.css            # Estilos globais
│   └── index.html
├── Dockerfile                # Configuração Docker
├── nginx.conf               # Configuração Nginx
├── railway.json             # Configuração Railway
├── package.json
└── README.md
```

## 🛠️ Instalação e Execução

### Pré-requisitos

- Node.js 20+
- npm 11+
- Angular CLI

### Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>

# Entre no diretório
cd radio

# Instale as dependências
npm install
```

### Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
npm start

# A aplicação estará disponível em http://localhost:4200
```

### Build de Produção

```bash
# Build otimizado para produção
npm run build:prod

# Os arquivos estarão em dist/radio/browser
```

### Docker (Local)

```bash
# Build da imagem Docker
npm run docker:build

# Executar o container
npm run docker:run

# Acesse http://localhost:8080
```

## 🚢 Deploy

Para instruções detalhadas de deploy no Railway, consulte [DEPLOY.md](DEPLOY.md).

### Deploy Rápido

1. Conecte o repositório ao Railway
2. Railway detectará automaticamente o Dockerfile
3. O build e deploy serão feitos automaticamente
4. A aplicação estará disponível na URL fornecida

## 🔗 API Backend

A aplicação consome uma API REST hospedada no Railway:

**URL**: `https://web-production-529f.up.railway.app/api/detect/`

**Método**: POST

**Payload**: FormData com arquivo de imagem

**Resposta**:
```json
{
  "detections": [
    {
      "class_name": "fracture",
      "confidence": 0.95,
      "bbox": [x, y, width, height]
    }
  ],
  "image_url": "data:image/png;base64,..."
}
```

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:

- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎨 Design

### Paleta de Cores

- **Primary**: Gradiente Roxo (#667eea → #764ba2)
- **Success**: Verde (#48bb78)
- **Warning**: Laranja (#ed8936)
- **Error**: Vermelho (#f56565)
- **Neutral**: Tons de Cinza

### Componentes

- Modais com overlay e backdrop blur
- Botões com estados hover e active
- Cards informativos
- Formulários estilizados
- Badges de status

## 📄 Licença

Este projeto é destinado a fins educacionais e de pesquisa.

## 👥 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para questões e suporte, abra uma issue no repositório.

---

**Desenvolvido com Angular e ❤️**
