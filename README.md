# ChatAI 智能体验平台

> 基于 Vue 3 + Uni-app 构建的多功能 AI 应用，支持 H5、微信小程序等多端部署。集成 AI 对话、AI 绘图、全球新闻、微信 Bot 等功能。

---

## ✨ 功能特性

| 模块 | 描述 |
|------|------|
| 💬 **AI 智能助手** | 多模型对话（DeepSeek、Qwen、GPT、Gemini、Kimi），支持技能系统、记忆、深度思考、流式响应 |
| 🎨 **AI 绘图** | 文生图，支持多种尺寸，会话管理，图片预览与下载 |
| 📰 **全球新闻** | 聚合科技、社交、行业、全球热点等分类新闻 |
| 🤖 **微信 Bot** | 基于腾讯官方 iLink Bot API，将 Claude Code Agent 接入微信 |
| 💬 **客服小助手** | 群聊模式客服系统 |
| 👥 **好友管理** | 添加好友、申请管理、私信单聊 |
| 🛒 **积分商城** | 服务购买、订单管理，支持微信支付 / 支付宝 |
| 📚 **Agent 学习** | LLM-Agent 开发学习资源 |

---

## 🛠 技术栈

- **框架**：Vue 3.4 + Uni-app 3.0（多端编译）
- **构建**：Vite 5.2 + SCSS
- **测试**：Vitest
- **部署**：Docker + Nginx
- **依赖**：`marked`（Markdown 渲染）、`highlight.js`（代码高亮）、`vue-i18n`（国际化）、`qrcode`（二维码）

---

## 🚀 快速开始

### 环境要求

- Node.js >= 22
- npm

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
# H5（浏览器）
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# 支付宝小程序
npm run dev:mp-alipay
```

H5 开发服务器默认运行在 `http://localhost:5174`，API 请求通过 Vite 代理转发到后端 `http://127.0.0.1:5000`。

### 生产构建

```bash
# H5
npm run build:h5

# 微信小程序
npm run build:mp-weixin
```

---

## 🐳 Docker 部署

项目提供了完整的 Docker 配置，前端通过 Nginx 反向代理访问后端。

```bash
# 构建镜像
docker build -t yu-chat .

# 运行容器
docker run -p 80:80 yu-chat
```

Nginx 配置已内置：
- `/api/*` → 代理到后端服务 `yuchat-backend:5000`
- `/ws` → WebSocket 代理到 `yuchat-backend:5001`
- 静态资源 30 天缓存
- 限流保护（API 5r/s，登录接口 1r/s，防 DDoS）

---

## ⚙️ 配置

### API 地址

`src/utils/api.js` 会根据运行环境自动切换：

- **H5 生产环境**：使用相对路径，由 Nginx 反代
- **H5 本地开发**：`http://127.0.0.1:5000`
- **小程序 / App**：`http://127.0.0.1:5000`

也可以在浏览器 `localStorage` 中设置 `API_BASE_URL` 来覆盖地址，方便调试。

---

## 🤖 微信 Bot（cc-weixin）

`cc-weixin/` 是一个独立子项目，将 Claude Code Agent 接入微信，基于腾讯官方 iLink Bot API。

```bash
# 直接运行（推荐）
npx cc-weixin
```

详细说明见 [cc-weixin/README.md](./cc-weixin/README.md)。

---

## 📁 项目结构

```
yu-chat/
├── src/
│   ├── pages/
│   │   ├── aiChat/       # AI 智能助手
│   │   ├── aiImage/      # AI 绘图
│   │   ├── home/         # 主页 & 导航
│   │   ├── login/        # 登录 & 注册
│   │   ├── profile/      # 个人中心 & 商城
│   │   ├── news/         # 全球新闻
│   │   ├── chat/         # 客服小助手
│   │   ├── chatOne/      # 单聊
│   │   ├── friend/       # 好友管理
│   │   └── roadmap/      # Agent 学习
│   ├── utils/
│   │   ├── api.js        # API 地址配置
│   │   ├── auth.js       # 认证工具
│   │   └── markdown/     # Markdown 渲染
│   ├── services/         # WebSocket、支付等服务层
│   ├── App.vue
│   └── main.js
├── cc-weixin/            # 微信 Bot 子项目
├── nginx/conf.d/         # Nginx 配置
├── Dockerfile
└── package.json
```

---

## 🧪 测试

```bash
# 单次运行
npm run test:run

# Watch 模式
npm run test
```

---

## 📄 License

MIT
