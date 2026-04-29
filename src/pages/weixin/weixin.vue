<template>
	<view class="wx-container">
		<!-- Header -->
		<view class="wx-header">
			<view class="back-btn" @click="backToHome">
				<text class="back-icon">←</text>
			</view>
			<view class="header-center">
				<text class="header-title">微信 Bot</text>
				<view class="status-dot" :class="statusClass"></view>
			</view>
			<view class="header-right">
				<text class="status-label">{{ statusText }}</text>
			</view>
		</view>

		<!-- 未登录：扫码区 -->
		<view v-if="phase === 'login'" class="login-panel">
			<view class="list-hero">
				<view class="list-hero-icon">💬</view>
				<view class="list-hero-title">微信 iLink Bot</view>
				<view class="list-hero-sub">基于腾讯官方 iLink Bot API · 合法接入个人微信</view>
			</view>

			<view class="qr-card" v-if="qrDataUrl">
				<view class="qr-tip">用微信扫描二维码登录</view>
				<image class="qr-image" :src="qrDataUrl" mode="aspectFit" />
				<view class="qr-status-row">
					<view class="spinner" v-if="polling && !qrDataUrl"></view>
					<text class="qr-status-text">{{ qrStatusMsg }}</text>
				</view>
				<view class="qr-refresh-btn" @click="startLogin">刷新二维码</view>
			</view>

			<view class="login-btn-wrap" v-else>
				<view class="login-btn" @click="startLogin" :class="{ loading: loginLoading }">
					<text v-if="!loginLoading">获取登录二维码</text>
					<view v-else class="spinner"></view>
				</view>
				<text class="login-hint">首次使用需要微信扫码授权</text>
			</view>

			<view class="feature-list">
				<view class="feature-item" v-for="f in features" :key="f.icon">
					<text class="feature-icon">{{ f.icon }}</text>
					<view class="feature-text">
						<text class="feature-name">{{ f.name }}</text>
						<text class="feature-desc">{{ f.desc }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 已登录：主界面 -->
		<view v-else class="main-panel">
			<!-- 账号信息栏 -->
			<view class="account-bar">
				<view class="account-avatar">
					<text>🤖</text>
				</view>
				<view class="account-info">
					<text class="account-id">{{ session.botId || 'Bot 已连接' }}</text>
					<text class="account-base">{{ session.baseUrl }}</text>
				</view>
				<view class="logout-btn" @click="logout">退出</view>
			</view>

			<!-- AI 配置 -->
			<view class="config-card">
				<view class="config-row">
					<text class="config-label">AI 模型</text>
					<picker
						class="config-select"
						mode="selector"
						:range="aiModelOptions"
						range-key="label"
						:value="aiModelIndex"
						@change="onAiModelChange"
					>
						<view class="picker-value">{{ aiModelOptions[aiModelIndex].label }}</view>
					</picker>
				</view>
				<view class="config-row">
					<text class="config-label">仅允许用户</text>
					<input
						class="config-input"
						v-model="allowFrom"
						placeholder="留空=所有人，多个用逗号分隔"
						@blur="saveConfig"
					/>
				</view>
			</view>

			<!-- 监听控制 -->
			<view class="monitor-card">
				<view class="monitor-header">
					<text class="monitor-title">消息监听</text>
					<view class="monitor-toggle" @click="toggleMonitor">
						<view class="toggle-track" :class="{ active: monitoring }">
							<view class="toggle-thumb"></view>
						</view>
						<text class="toggle-label">{{ monitoring ? '运行中' : '已停止' }}</text>
					</view>
				</view>
				<view class="monitor-stats">
					<view class="stat-item">
						<text class="stat-num">{{ stats.received }}</text>
						<text class="stat-label">收到消息</text>
					</view>
					<view class="stat-item">
						<text class="stat-num">{{ stats.replied }}</text>
						<text class="stat-label">已回复</text>
					</view>
					<view class="stat-item">
						<text class="stat-num">{{ stats.errors }}</text>
						<text class="stat-label">错误</text>
					</view>
				</view>
			</view>

			<!-- 消息日志 -->
			<view class="log-card">
				<view class="log-header">
					<text class="log-title">消息日志</text>
					<text class="log-clear" @click="clearLogs">清空</text>
				</view>
				<scroll-view class="log-scroll" scroll-y="true" :scroll-top="logScrollTop">
					<view v-if="logs.length === 0" class="log-empty">
						<text>暂无消息，开启监听后等待微信消息...</text>
					</view>
					<view
						v-for="(log, i) in logs"
						:key="i"
						class="log-item"
						:class="'log-' + log.type"
					>
						<view class="log-meta">
							<text class="log-time">{{ log.time }}</text>
							<text class="log-tag">{{ logTag(log.type) }}</text>
						</view>
						<text class="log-body">{{ log.text }}</text>
					</view>
				</scroll-view>
			</view>

			<!-- 手动发消息 -->
			<view class="send-card">
				<text class="send-title">手动发消息</text>
				<view class="send-row">
					<input class="send-input" v-model="sendTo" placeholder="收件人 ID" />
					<view class="help-btn" @click="showTooltip = !showTooltip">?</view>
				</view>
				<view class="help-bubble" v-if="showTooltip">
					<text class="help-bubble-title">收件人 ID 是什么？</text>
					<text class="help-bubble-body">微信用户在 iLink 系统中的唯一标识，格式为 xxx@im.wechat。</text>
					<text class="help-bubble-body">当有用户给 Bot 发消息后，消息日志中会显示对方的 ID，复制过来填入即可。</text>
					<view class="help-bubble-arrow"></view>
				</view>
				<view class="send-row">
					<input class="send-input" v-model="sendText" placeholder="消息内容" @confirm="sendManual" />
					<view class="send-btn" @click="sendManual" :class="{ loading: sending }">
						<text v-if="!sending">发送</text>
						<view v-else class="spinner sm"></view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import QRCode from 'qrcode';
import API_URL from '@/utils/api';
import { getTokenValue } from '@/utils/auth';

// ── 常量 ──────────────────────────────────────────────────────────────────
const ILINK_ORIGIN = 'https://ilinkai.weixin.qq.com';
// 开发环境走 Vite 代理，生产环境走 nginx 代理，都用相对路径 /ilink-proxy
const DEFAULT_BASE_URL = `${location.origin}/ilink-proxy`;
const BOT_TYPE = 3;
const STORAGE_KEY = 'wx_ilink_session';
const CONFIG_KEY  = 'wx_ilink_config';

// ── 状态 ──────────────────────────────────────────────────────────────────
const phase        = ref('login');   // 'login' | 'main'
const loginLoading = ref(false);
const qrDataUrl    = ref('');
const qrStatusMsg  = ref('等待扫码...');
const polling      = ref(false);
const session      = ref({ token: '', baseUrl: DEFAULT_BASE_URL, botId: '' });

const anthropicKey  = ref('');
const anthropicBase = ref('https://api.anthropic.com');
const allowFrom     = ref('');
const aiModel       = ref('deepseek');
const aiModelOptions = [
	{ label: 'DeepSeek', value: 'deepseek' },
	{ label: 'Qwen3.5-plus', value: 'alibl' },
	{ label: 'Kimi', value: 'kimi' }
];
const aiModelIndex = ref(0);
const onAiModelChange = (e) => {
	aiModelIndex.value = e.detail.value;
	aiModel.value = aiModelOptions[e.detail.value].value;
	saveConfig();
};
// 每个微信用户维护独立的 conversationId
const userConvMap   = new Map();

const monitoring    = ref(false);
const stats         = ref({ received: 0, replied: 0, errors: 0 });
const logs          = ref([]);
const logScrollTop  = ref(0);

const sendTo   = ref('');
const sendText = ref('');
const sending  = ref(false);
const showTooltip = ref(false);

let pollTimer    = null;
let monitorTimer = null;
let getUpdatesBuf = '';

// ── 计算属性 ──────────────────────────────────────────────────────────────
const statusClass = computed(() => {
	if (phase.value === 'login') return 'dot-offline';
	return monitoring.value ? 'dot-online' : 'dot-idle';
});
const statusText = computed(() => {
	if (phase.value === 'login') return '未登录';
	return monitoring.value ? '监听中' : '已连接';
});

const features = [
	{ icon: '🔐', name: '官方合法', desc: '腾讯 iLink Bot API，有法律文件背书' },
	{ icon: '🤖', name: 'AI集成', desc: '完整工具能力：Bash、文件读写、Web 搜索' },
	{ icon: '📨', name: '长轮询收消息', desc: '服务器 hold 35 秒，实时推送' },
	{ icon: '🔒', name: '媒体加密', desc: 'AES-128-ECB 加密传输图片/文件/语音' },
];

// ── 工具函数 ──────────────────────────────────────────────────────────────
function randomWechatUin() {
	const arr = new Uint32Array(1);
	crypto.getRandomValues(arr);
	return btoa(String(arr[0]));
}

function buildHeaders(token) {
	const h = {
		'Content-Type': 'application/json',
		'AuthorizationType': 'ilink_bot_token',
		'X-WECHAT-UIN': randomWechatUin(),
	};
	if (token) h['Authorization'] = `${token}`;
	return h;
}

async function apiGet(path, token = '') {
	const url = `${session.value.baseUrl.replace(/\/$/, '')}/${path}`;
	const res = await fetch(url, { headers: buildHeaders(token) });
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.json();
}

async function apiPost(path, body, token = '', timeoutMs = 15000) {
	const url = `${session.value.baseUrl.replace(/\/$/, '')}/${path}`;
	const payload = { ...body, base_info: { channel_version: '1.0.2' } };
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), timeoutMs);
	try {
		const res = await fetch(url, {
			method: 'POST',
			headers: buildHeaders(token),
			body: JSON.stringify(payload),
			signal: ctrl.signal,
		});
		clearTimeout(t);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return res.json();
	} catch (e) {
		clearTimeout(t);
		throw e;
	}
}

function addLog(type, text) {
	const now = new Date();
	const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
	logs.value.push({ type, text, time });
	if (logs.value.length > 200) logs.value.shift();
	logScrollTop.value = 99999;
}

function logTag(type) {
	const map = { inbound: '收', outbound: '发', system: '系统', error: '错误', claude: 'Claude' };
	return map[type] || type;
}

function extractText(msg) {
	for (const item of msg.item_list ?? []) {
		if (item.type === 1 && item.text_item?.text) return item.text_item.text;
	}
	return '[非文本消息]';
}

// ── 持久化 ────────────────────────────────────────────────────────────────
function loadSession() {
	try {
		const raw = uni.getStorageSync(STORAGE_KEY);
		if (raw) return JSON.parse(raw);
	} catch {}
	return null;
}

function saveSession(data) {
	uni.setStorageSync(STORAGE_KEY, JSON.stringify(data));
}

function loadConfig() {
	try {
		const raw = uni.getStorageSync(CONFIG_KEY);
		if (raw) return JSON.parse(raw);
	} catch {}
	return {};
}

function saveConfig() {
	uni.setStorageSync(CONFIG_KEY, JSON.stringify({
		aiModel: aiModel.value,
		allowFrom: allowFrom.value,
	}));
}

// ── 初始化 ────────────────────────────────────────────────────────────────
(function init() {
	const saved = loadSession();
	if (saved?.token) {
		// 强制把 baseUrl 修正为代理路径，兼容旧存储
		saved.baseUrl = `${location.origin}/ilink-proxy`;
		session.value = saved;
		saveSession(saved);
		phase.value = 'main';
		addLog('system', `已恢复登录状态，Bot ID: ${saved.botId}`);
	}
	const cfg = loadConfig();
	if (cfg.aiModel) {
		aiModel.value = cfg.aiModel;
		const idx = aiModelOptions.findIndex(o => o.value === cfg.aiModel);
		if (idx !== -1) aiModelIndex.value = idx;
	}
	if (cfg.allowFrom) allowFrom.value = cfg.allowFrom;
})();

// ── 登录流程 ──────────────────────────────────────────────────────────────
async function startLogin() {
	loginLoading.value = true;
	qrDataUrl.value = '';
	qrStatusMsg.value = '获取二维码中...';
	try {
		const resp = await apiGet(`ilink/bot/get_bot_qrcode?bot_type=${BOT_TYPE}`);
		// qrcode_img_content 是微信扫码 URL，用 qrcode 库把它渲染成二维码图片
		const qrUrl = resp.qrcode_img_content || resp.qrcode;
		qrDataUrl.value = await QRCode.toDataURL(qrUrl, {
			width: 240,
			margin: 2,
			color: { dark: '#000000', light: '#ffffff' },
		});
		qrStatusMsg.value = '请用微信扫描二维码';
		loginLoading.value = false;
		polling.value = true;
		pollQrStatus(resp.qrcode);
	} catch (e) {
		loginLoading.value = false;
		qrStatusMsg.value = `获取失败: ${e.message}`;
		addLog('error', `获取二维码失败: ${e.message}`);
	}
}

async function pollQrStatus(qrcode) {
	const deadline = Date.now() + 5 * 60 * 1000;
	while (Date.now() < deadline && polling.value) {
		try {
			const status = await apiGet(`ilink/bot/get_qrcode_status?qrcode=${encodeURIComponent(qrcode)}`);
			if (status.status === 'confirmed' || status.bot_token) {
				polling.value = false;
				session.value = {
					token: status.bot_token,
					baseUrl: `${location.origin}/ilink-proxy`,
					botId: status.ilink_bot_id || '',
				};
				saveSession(session.value);
				phase.value = 'main';
				addLog('system', `登录成功！Bot ID: ${session.value.botId}`);
				startMonitor();
				return;
			}
			if (status.status === 'scanned') {
				qrStatusMsg.value = '已扫码，等待确认...';
			} else if (status.status === 'expired') {
				qrStatusMsg.value = '二维码已过期，请刷新';
				polling.value = false;
				return;
			}
		} catch (e) {
			// 轮询失败静默重试
		}
		await new Promise(r => setTimeout(r, 2000));
	}
	polling.value = false;
	qrStatusMsg.value = '二维码已过期，请刷新';
}

function logout() {
	uni.showModal({
		title: '确认退出',
		content: '退出后需要重新扫码登录',
		success: (res) => {
			if (res.confirm) {
				uni.removeStorageSync(STORAGE_KEY);
				session.value = { token: '', baseUrl: DEFAULT_BASE_URL, botId: '' };
				phase.value = 'login';
				qrDataUrl.value = '';
				monitoring.value = false;
				stopMonitor();
				logs.value = [];
				stats.value = { received: 0, replied: 0, errors: 0 };
			}
		}
	});
}

// ── 消息监听 ──────────────────────────────────────────────────────────────
function toggleMonitor() {
	if (monitoring.value) {
		stopMonitor();
	} else {
		startMonitor();
	}
}

function startMonitor() {
	if (!session.value.token) {
		uni.showToast({ title: '请先登录', icon: 'none' });
		return;
	}
	monitoring.value = true;
	getUpdatesBuf = '';
	addLog('system', '开始监听消息...');
	pollLoop();
}

function stopMonitor() {
	monitoring.value = false;
	if (monitorTimer) { clearTimeout(monitorTimer); monitorTimer = null; }
	addLog('system', '已停止监听');
}

async function pollLoop() {
	if (!monitoring.value) return;
	try {
		const resp = await apiPost(
			'ilink/bot/getupdates',
			{ get_updates_buf: getUpdatesBuf },
			session.value.token,
			38000,
		);
		if (resp.get_updates_buf) getUpdatesBuf = resp.get_updates_buf;
		for (const msg of resp.msgs ?? []) {
			if (msg.message_type === 1) { // 用户消息
				await handleInbound(msg);
			}
		}
	} catch (e) {
		if (monitoring.value) {
			stats.value.errors++;
			addLog('error', `轮询失败: ${e.message}`);
			await new Promise(r => setTimeout(r, 2000));
		}
	}
	if (monitoring.value) {
		monitorTimer = setTimeout(pollLoop, 100);
	}
}

async function handleInbound(msg) {
	const text = extractText(msg);
	const from = msg.from_user_id;
	stats.value.received++;
	addLog('inbound', `${from}: ${text}`);

	// 检查 allowFrom 白名单
	const allowed = allowFrom.value.trim();
	if (allowed) {
		const list = allowed.split(',').map(s => s.trim()).filter(Boolean);
		if (!list.includes(from)) {
			addLog('system', `忽略非白名单用户: ${from}`);
			return;
		}
	}

	// 调用 AI
	try {
		addLog('claude', `正在处理: ${text}`);
		const reply = await askAI(text, from);
		await sendMessage(from, reply, msg.context_token);
		stats.value.replied++;
		addLog('outbound', `→ ${from}: ${reply.slice(0, 100)}${reply.length > 100 ? '...' : ''}`);
	} catch (e) {
		stats.value.errors++;
		addLog('error', `AI 回复失败: ${e.message}`);
	}
}

// ── AI 问答（复用项目 /api/chat/completion）────────────────────────────────
function getOrCreateConvId(userId) {
	if (!userConvMap.has(userId)) {
		userConvMap.set(userId, 'conv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9));
	}
	return userConvMap.get(userId);
}

async function askAI(userText, fromUserId) {
	const convId = getOrCreateConvId(fromUserId);
	const isNew  = !userConvMap.has(fromUserId + '_started');
	userConvMap.set(fromUserId + '_started', true);

	const token = getTokenValue();
	const userInfo = uni.getStorageSync('userInfo');
	const userId = userInfo ? (JSON.parse(userInfo)?.uid || '1') : '1';
	const model = aiModel.value;

	const res = await fetch(API_URL.completion, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `${token}`,
		},
		body: JSON.stringify({
			message: userText,
			userId: String(userId),
			model,
			conversationId: convId,
			new_conversation: isNew,
			max_history: 10,
			enableSkills: false,
		}),
	});

	if (!res.ok) throw new Error(`AI API ${res.status}`);

	// 支持流式和非流式
	const contentType = res.headers.get('content-type') || '';
	if (contentType.includes('text/event-stream')) {
		// SSE 流式读取，后端格式: { message: "..." } 或 { choices:[{delta:{content}}] }
		const reader = res.body.getReader();
		const decoder = new TextDecoder();
		let full = '';
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			const chunk = decoder.decode(value);
			for (const line of chunk.split('\n')) {
				if (!line.startsWith('data: ')) continue;
				const data = line.slice(6).trim();
				if (data === '[DONE]') break;
				try {
					const json = JSON.parse(data);
					const delta = json.choices?.[0]?.delta?.content
						?? json.message
						?? json.content
						?? json.data
						?? '';
					full += delta;
				} catch {}
			}
		}
		return full || '（无回复）';
	} else {
		const data = await res.json();
		console.log('[weixin askAI] response:', JSON.stringify(data).slice(0, 300));
		// 兼容后端多种格式
		const reply = data?.content
			?? data?.data?.content
			?? data?.data
			?? data?.message
			?? data?.choices?.[0]?.message?.content
			?? '';
		return (typeof reply === 'string' ? reply : JSON.stringify(reply)) || '（无回复）';
	}
}

// ── 发消息 ────────────────────────────────────────────────────────────────
async function sendMessage(toUserId, text, contextToken = '') {
	const clientId = `wcb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	await apiPost(
		'ilink/bot/sendmessage',
		{
			msg: {
				from_user_id: '',
				to_user_id: toUserId,
				client_id: clientId,
				message_type: 2,
				message_state: 2,
				context_token: contextToken,
				item_list: [{ type: 1, text_item: { text } }],
			},
		},
		session.value.token,
	);
}

async function sendManual() {
	if (!sendTo.value.trim() || !sendText.value.trim()) {
		uni.showToast({ title: '请填写收件人和内容', icon: 'none' });
		return;
	}
	if (!session.value.token) {
		uni.showToast({ title: '请先登录', icon: 'none' });
		return;
	}
	sending.value = true;
	try {
		await sendMessage(sendTo.value.trim(), sendText.value.trim());
		addLog('outbound', `手动发送 → ${sendTo.value}: ${sendText.value}`);
		sendText.value = '';
	} catch (e) {
		addLog('error', `发送失败: ${e.message}`);
		uni.showToast({ title: `发送失败: ${e.message}`, icon: 'none' });
	} finally {
		sending.value = false;
	}
}

function clearLogs() {
	logs.value = [];
}

function backToHome() {
	uni.reLaunch({ url: '/pages/home/home' });
}

onUnmounted(() => {
	polling.value = false;
	stopMonitor();
});
</script>

<style lang="scss" scoped>
.wx-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #0f0f0f 100%);
	color: #fff;
	display: flex;
	flex-direction: column;
}

// ── Header ────────────────────────────────────────────────────────────────
.wx-header {
	display: flex;
	align-items: center;
	padding: 16px 16px;
	padding-top: calc(16px + env(safe-area-inset-top));
	background: rgba(0,0,0,0.6);
	backdrop-filter: blur(20px);
	border-bottom: 1px solid rgba(255,255,255,0.07);
	position: sticky;
	top: 0;
	z-index: 10;
}

.back-btn {
	width: 36px;
	height: 36px;
	border-radius: 10px;
	background: rgba(255,255,255,0.08);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	.back-icon { font-size: 18px; color: rgba(255,255,255,0.7); }
}

.header-center {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
}

.header-title {
	font-size: 17px;
	font-weight: 700;
	color: #fff;
}

.status-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	&.dot-online  { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
	&.dot-idle    { background: #f59e0b; }
	&.dot-offline { background: rgba(255,255,255,0.25); }
}

.header-right { width: 60px; text-align: right; }
.status-label { font-size: 12px; color: rgba(255,255,255,0.4); }

// ── list-hero ─────────────────────────────────────────────────────────────
.list-hero {
	text-align: center;
	padding: 32px 20px 24px;
	margin: 16px;
	background: rgba(255,255,255,0.03);
	border: 1px solid rgba(255,255,255,0.07);
	border-radius: 20px;
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at 50% 0%, rgba(102,126,234,0.12) 0%, transparent 70%);
		pointer-events: none;
	}

	.list-hero-icon { font-size: 40px; display: block; margin-bottom: 12px; }
	.list-hero-title {
		font-size: 22px;
		font-weight: 700;
		margin-bottom: 6px;
		background: linear-gradient(135deg, #fff, #a78bfa);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.list-hero-sub { font-size: 13px; color: rgba(255,255,255,0.4); }
}

// ── 登录面板 ──────────────────────────────────────────────────────────────
.login-panel {
	flex: 1;
	overflow-y: auto;
	padding-bottom: 40px;
}

.qr-card {
	margin: 0 16px 16px;
	background: rgba(255,255,255,0.04);
	border: 1px solid rgba(255,255,255,0.08);
	border-radius: 20px;
	padding: 24px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
}

.qr-tip { font-size: 14px; color: rgba(255,255,255,0.6); }

.qr-image {
	width: 200px;
	height: 200px;
	border-radius: 12px;
	background: #fff;
	padding: 8px;
	box-sizing: border-box;
}

.qr-status-row {
	display: flex;
	align-items: center;
	gap: 8px;
}

.qr-status-text { font-size: 13px; color: rgba(255,255,255,0.5); }

.qr-refresh-btn {
	padding: 8px 24px;
	border-radius: 20px;
	background: rgba(102,126,234,0.15);
	border: 1px solid rgba(102,126,234,0.3);
	color: #a78bfa;
	font-size: 13px;
	cursor: pointer;
	&:active { opacity: 0.7; }
}

.login-btn-wrap {
	margin: 0 16px 16px;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
}

.login-btn {
	width: 100%;
	height: 52px;
	border-radius: 16px;
	background: linear-gradient(135deg, #667eea, #764ba2);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
	font-weight: 600;
	color: #fff;
	cursor: pointer;
	transition: opacity 0.2s;
	&.loading { opacity: 0.7; }
	&:active { opacity: 0.8; }
}

.login-hint { font-size: 12px; color: rgba(255,255,255,0.3); }

.feature-list {
	margin: 0 16px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.feature-item {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 14px 16px;
	background: rgba(255,255,255,0.03);
	border: 1px solid rgba(255,255,255,0.06);
	border-radius: 14px;
}

.feature-icon { font-size: 24px; flex-shrink: 0; }

.feature-text { display: flex; flex-direction: column; gap: 2px; }
.feature-name { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.85); }
.feature-desc { font-size: 12px; color: rgba(255,255,255,0.35); }

// ── 主面板 ────────────────────────────────────────────────────────────────
.main-panel {
	flex: 1;
	overflow-y: auto;
	padding: 12px 16px 40px;
	display: flex;
	flex-direction: column;
	gap: 12px;
}

// 账号栏
.account-bar {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 14px 16px;
	background: rgba(255,255,255,0.04);
	border: 1px solid rgba(255,255,255,0.08);
	border-radius: 16px;
}

.account-avatar {
	width: 40px;
	height: 40px;
	border-radius: 12px;
	background: linear-gradient(135deg, #667eea, #764ba2);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
	flex-shrink: 0;
}

.account-info { flex: 1; min-width: 0; }
.account-id {
	font-size: 13px;
	font-weight: 600;
	color: rgba(255,255,255,0.85);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	display: block;
}
.account-base { font-size: 11px; color: rgba(255,255,255,0.3); display: block; }

.logout-btn {
	padding: 6px 14px;
	border-radius: 10px;
	background: rgba(239,68,68,0.12);
	border: 1px solid rgba(239,68,68,0.25);
	color: #f87171;
	font-size: 12px;
	cursor: pointer;
	flex-shrink: 0;
}

// 配置卡片
.config-card {
	background: rgba(255,255,255,0.04);
	border: 1px solid rgba(255,255,255,0.08);
	border-radius: 16px;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.config-row {
	display: flex;
	align-items: center;
	gap: 10px;
}

.config-label {
	font-size: 12px;
	color: rgba(255,255,255,0.4);
	width: 80px;
	flex-shrink: 0;
}

.config-input {
	flex: 1;
	height: 36px;
	background: rgba(255,255,255,0.06);
	border: 1px solid rgba(255,255,255,0.1);
	border-radius: 10px;
	padding: 0 12px;
	font-size: 13px;
	color: rgba(255,255,255,0.85);
	&::placeholder { color: rgba(255,255,255,0.2); }
}

.config-select {
	flex: 1;
	height: 36px;
	background: rgba(255,255,255,0.06);
	border: 1px solid rgba(255,255,255,0.1);
	border-radius: 10px;
	padding: 0 12px;
	font-size: 13px;
	color: rgba(255,255,255,0.85);
	cursor: pointer;
	display: flex;
	align-items: center;
}

.picker-value {
	flex: 1;
	font-size: 13px;
	color: rgba(255,255,255,0.85);
}

// 监听卡片
.monitor-card {
	background: rgba(255,255,255,0.04);
	border: 1px solid rgba(255,255,255,0.08);
	border-radius: 16px;
	padding: 16px;
}

.monitor-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
}

.monitor-title { font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.85); }

.monitor-toggle {
	display: flex;
	align-items: center;
	gap: 8px;
	cursor: pointer;
}

.toggle-track {
	width: 44px;
	height: 24px;
	border-radius: 12px;
	background: rgba(255,255,255,0.1);
	position: relative;
	transition: background 0.3s;
	&.active { background: #22c55e; }
}

.toggle-thumb {
	position: absolute;
	top: 3px;
	left: 3px;
	width: 18px;
	height: 18px;
	border-radius: 50%;
	background: #fff;
	transition: transform 0.3s;
	.toggle-track.active & { transform: translateX(20px); }
}

.toggle-label { font-size: 12px; color: rgba(255,255,255,0.5); }

.monitor-stats {
	display: flex;
	gap: 12px;
}

.stat-item {
	flex: 1;
	text-align: center;
	padding: 10px;
	background: rgba(255,255,255,0.04);
	border-radius: 10px;
}

.stat-num { display: block; font-size: 22px; font-weight: 700; color: #a78bfa; }
.stat-label { font-size: 11px; color: rgba(255,255,255,0.35); }

// 日志卡片
.log-card {
	background: rgba(255,255,255,0.04);
	border: 1px solid rgba(255,255,255,0.08);
	border-radius: 16px;
	padding: 16px;
	flex: 1;
}

.log-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12px;
}

.log-title { font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.85); }
.log-clear { font-size: 12px; color: rgba(255,255,255,0.3); cursor: pointer; }

.log-scroll {
	height: 280px;
}

.log-empty {
	padding: 40px 0;
	text-align: center;
	font-size: 13px;
	color: rgba(255,255,255,0.2);
}

.log-item {
	padding: 8px 10px;
	border-radius: 8px;
	margin-bottom: 6px;
	background: rgba(255,255,255,0.03);

	&.log-inbound  { border-left: 3px solid #667eea; }
	&.log-outbound { border-left: 3px solid #22c55e; }
	&.log-claude   { border-left: 3px solid #a78bfa; }
	&.log-error    { border-left: 3px solid #ef4444; background: rgba(239,68,68,0.05); }
	&.log-system   { border-left: 3px solid rgba(255,255,255,0.2); }
}

.log-meta {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 4px;
}

.log-time { font-size: 10px; color: rgba(255,255,255,0.25); }
.log-tag {
	font-size: 10px;
	padding: 1px 6px;
	border-radius: 4px;
	background: rgba(255,255,255,0.08);
	color: rgba(255,255,255,0.5);
}

.log-body {
	font-size: 12px;
	color: rgba(255,255,255,0.7);
	word-break: break-all;
	line-height: 1.5;
}

// 发消息卡片
.send-card {
	background: rgba(255,255,255,0.04);
	border: 1px solid rgba(255,255,255,0.08);
	border-radius: 16px;
	padding: 16px;
}

.send-title {
	font-size: 14px;
	font-weight: 600;
	color: rgba(255,255,255,0.7);
	display: block;
	margin-bottom: 12px;
}

.send-row {
	display: flex;
	gap: 8px;
	margin-bottom: 8px;
	&:last-child { margin-bottom: 0; }
}

.send-input {
	flex: 1;
	height: 40px;
	background: rgba(255,255,255,0.06);
	border: 1px solid rgba(255,255,255,0.1);
	border-radius: 10px;
	padding: 0 12px;
	font-size: 13px;
	color: rgba(255,255,255,0.85);
	&::placeholder { color: rgba(255,255,255,0.2); }
}

.send-btn {
	width: 64px;
	height: 40px;
	border-radius: 10px;
	background: linear-gradient(135deg, #667eea, #764ba2);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 13px;
	font-weight: 600;
	color: #fff;
	cursor: pointer;
	flex-shrink: 0;
	&.loading { opacity: 0.7; }
}

.help-btn {
	width: 28px;
	height: 28px;
	border-radius: 50%;
	background: rgba(167, 139, 250, 0.15);
	border: 1px solid rgba(167, 139, 250, 0.3);
	color: #a78bfa;
	font-size: 13px;
	font-weight: 700;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	flex-shrink: 0;
	margin-left: 6px;
	&:active { opacity: 0.7; }
}

.help-bubble {
	position: relative;
	background: #2a2a3e;
	border: 1px solid rgba(167, 139, 250, 0.25);
	border-radius: 12px;
	padding: 12px 14px;
	margin-bottom: 4px;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.help-bubble-arrow {
	position: absolute;
	top: -7px;
	right: 18px;
	width: 12px;
	height: 12px;
	background: #2a2a3e;
	border-left: 1px solid rgba(167, 139, 250, 0.25);
	border-top: 1px solid rgba(167, 139, 250, 0.25);
	transform: rotate(45deg);
}

.help-bubble-title {
	font-size: 13px;
	font-weight: 600;
	color: #a78bfa;
}

.help-bubble-body {
	font-size: 12px;
	color: rgba(255, 255, 255, 0.55);
	line-height: 1.6;
}

// ── Spinner ───────────────────────────────────────────────────────────────
.spinner {
	width: 20px;
	height: 20px;
	border: 2px solid rgba(255,255,255,0.2);
	border-top-color: #fff;
	border-radius: 50%;
	animation: spin 0.7s linear infinite;
	&.sm { width: 16px; height: 16px; }
}

@keyframes spin {
	to { transform: rotate(360deg); }
}
</style>
