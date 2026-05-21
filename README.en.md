# ChatAI Intelligent Experience Platform

> A multi-functional AI application built with Vue 3 + Uni-app, supporting H5, WeChat Mini Program, and other platforms. Integrates AI chat, AI image generation, global news, WeChat Bot, and more.

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 💬 **AI Assistant** | Multi-model chat (DeepSeek, Qwen, GPT, Gemini, Kimi) with skill system, memory, deep thinking, and streaming responses |
| 🎨 **AI Image Generation** | Text-to-image with multiple size options, session management, image preview and download |
| 📰 **Global News** | Aggregated news across tech, social, industry, and global trending categories |
| 🤖 **WeChat Bot** | Connects Claude Code Agent to WeChat via Tencent's official iLink Bot API |
| 💬 **Customer Service** | Group chat-based customer service system |
| 👥 **Friend Management** | Add friends, manage requests, and private messaging |
| 🛒 **Points Mall** | Service purchases, order management, supports WeChat Pay / Alipay |
| 📚 **Agent Learning** | LLM-Agent development learning resources |

---

## 🛠 Tech Stack

- **Framework**: Vue 3.4 + Uni-app 3.0 (multi-platform compilation)
- **Build**: Vite 5.2 + SCSS
- **Testing**: Vitest
- **Deployment**: Docker + Nginx
- **Dependencies**: `marked` (Markdown rendering), `highlight.js` (code highlighting), `vue-i18n` (i18n), `qrcode` (QR code generation)

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 22
- npm

### Install Dependencies

```bash
npm install
```

### Local Development

```bash
# H5 (browser)
npm run dev:h5

# WeChat Mini Program
npm run dev:mp-weixin

# Alipay Mini Program
npm run dev:mp-alipay
```

The H5 dev server runs at `http://localhost:5174` by default. API requests are proxied via Vite to the backend at `http://127.0.0.1:5000`.

### Production Build

```bash
# H5
npm run build:h5

# WeChat Mini Program
npm run build:mp-weixin
```

---

## 🐳 Docker Deployment

The project includes a complete Docker setup with Nginx as a reverse proxy to the backend.

```bash
# Build image
docker build -t yu-chat .

# Run container
docker run -p 80:80 yu-chat
```

Built-in Nginx configuration:
- `/api/*` → proxied to backend service `yuchat-backend:5000`
- `/ws` → WebSocket proxy to `yuchat-backend:5001`
- Static assets cached for 30 days
- Rate limiting (API: 5r/s, login endpoint: 1r/s, DDoS protection)

---

## ⚙️ Configuration

### API Base URL

`src/utils/api.js` automatically switches based on the runtime environment:

- **H5 Production**: uses relative paths, proxied by Nginx
- **H5 Development**: `http://127.0.0.1:5000`
- **Mini Program / App**: `http://127.0.0.1:5000`

You can also override the API base URL by setting `API_BASE_URL` in the browser's `localStorage` for easier debugging.

---

## 🤖 WeChat Bot (cc-weixin)

`cc-weixin/` is a standalone sub-project that connects Claude Code Agent to WeChat using Tencent's official iLink Bot API.

```bash
# Run directly (recommended)
npx cc-weixin
```

See [cc-weixin/README.md](./cc-weixin/README.md) for full documentation.

---

## 📁 Project Structure

```
yu-chat/
├── src/
│   ├── pages/
│   │   ├── aiChat/       # AI Assistant
│   │   ├── aiImage/      # AI Image Generation
│   │   ├── home/         # Home & Navigation
│   │   ├── login/        # Login & Registration
│   │   ├── profile/      # Profile & Points Mall
│   │   ├── news/         # Global News
│   │   ├── chat/         # Customer Service
│   │   ├── chatOne/      # Private Chat
│   │   ├── friend/       # Friend Management
│   │   └── roadmap/      # Agent Learning
│   ├── utils/
│   │   ├── api.js        # API URL configuration
│   │   ├── auth.js       # Auth utilities
│   │   └── markdown/     # Markdown rendering
│   ├── services/         # WebSocket, payment, and other services
│   ├── App.vue
│   └── main.js
├── cc-weixin/            # WeChat Bot sub-project
├── nginx/conf.d/         # Nginx configuration
├── Dockerfile
└── package.json
```

---

## 🧪 Testing

```bash
# Single run
npm run test:run

# Watch mode
npm run test
```

---

## 📄 License

MIT
