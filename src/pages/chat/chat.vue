<template>
	<view class="chat-container">
		<view class="chat-header">
			<view class="back-button" @click="goBack">
				<text class="back-icon">←</text>
			</view>
			<view class="header-title">
				<text>聊天</text>
			</view>
			<view class="header-right">
				<view class="user-avatar" :style="{ backgroundColor: getAvatarColor(userInfo.name) }">
					<text>{{ getAvatarText(userInfo.name) }}</text>
				</view>
			</view>
		</view>

		<view class="chat-body">
			<scroll-view
				class="chat-messages"
				scroll-y="true"
				:scroll-top="scrollTop"
				:scroll-into-view="scrollIntoView"
				:scroll-with-animation="true"
				@scrolltoupper="loadMoreMessages"
				show-scrollbar="true"
				enhanced="true">
				<view v-if="loading" class="loading">
					<text>加载中...</text>
				</view>
				<view v-else-if="messages.length === 0" class="empty-state">
					<text>暂无消息</text>
				</view>
				<view v-else class="message-list">
					<view v-for="(message, index) in messages" :key="index" class="message-item" :id="'msg-' + index">
						<view class="message-time" v-if="shouldShowTime(index)">
							<text>{{ formatTime(message.timestamp) }}</text>
						</view>

						<!-- 技能调用消息 - 特殊UI -->
						<view v-if="message.type === 'skill-call'" class="skill-call-message">
							<view class="skill-call-container">
								<view class="skill-call-icon">
									<text>🔧</text>
								</view>
								<view class="skill-call-content">
									<view class="skill-call-title">正在调用技能</view>
									<view class="skill-call-text">{{ message.content.replace('🔧 正在调用技能:', '').trim() }}</view>
									<view class="skill-call-loading">
										<view class="loading-dot"></view>
										<view class="loading-dot"></view>
										<view class="loading-dot"></view>
									</view>
								</view>
							</view>
						</view>

						<!-- 普通消息 -->
						<view v-else :class="['message-bubble', message.sender === userInfo.name ? 'message-mine' : 'message-other']">
							<view class="message-avatar" :style="{ backgroundColor: getAvatarColor(message.sender) }">
								<text class="avatar-text">{{ getAvatarText(message.sender) }}</text>
							</view>
							<view class="message-content">
								<view class="message-sender" v-if="message.sender !== userInfo.name">{{ message.sender }}</view>
								<view class="message-text">{{ message.content }}</view>
								<view class="message-time-small">{{ formatTimeSmall(message.timestamp) }}</view>
							</view>
						</view>
					</view>
					<view id="msg-bottom" style="height: 1px;"></view>
				</view>
			</scroll-view>
		</view>

		<view class="chat-input-container">
			<view class="chat-input">
				<input type="text" v-model="messageInput" placeholder="输入消息..." @confirm="sendMessage" confirm-type="send" />
				<button @tap="sendMessage" :disabled="!messageInput.trim()">发送</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import wsService from '@/services/websocket';
import { getTokenValue } from '@/utils/auth';

// 用户信息
const userInfo = ref({
	name: '用户',
	avatar: ''
});

// 聊天消息
const messages = ref([
	{
		sender: '客服小助手',
		content: '你好，欢迎使用聊天功能！',
		timestamp: Date.now() - 3600000,
		type: 'text'
	}
]);

// 输入框内容
const messageInput = ref('');

// 加载状态
const loading = ref(false);

// 滚动位置
const scrollTop = ref(0);
const scrollIntoView = ref('');

// 是否已连接
const isConnected = ref(wsService.isConnected());

// 消息监听器
const handleMessage = (message) => {
	let messageType = 'text';
	let messageContent = message.content;

	if (typeof message.content === 'string') {
		const dataMatch = message.content.match(/data:\s*(\{.*?\})/);
		if (dataMatch) {
			try {
				const jsonData = JSON.parse(dataMatch[1]);
				if (jsonData.message && jsonData.message.includes('🔧 正在调用技能:')) {
					messageType = 'skill-call';
					messageContent = jsonData.message;
				}
			} catch (e) {
				console.error('解析消息JSON失败:', e);
			}
		} else if (message.content.includes('🔧 正在调用技能:')) {
			messageType = 'skill-call';
		}
	}

	messages.value.push({
		...message,
		content: messageContent,
		type: messageType
	});
	scrollToBottom();
};

// 连接状态监听器
const handleConnectionChange = (connected) => {
	isConnected.value = connected;
};

// 生成头像背景色
const getAvatarColor = (name) => {
	if (!name) return '#2575fc';
	const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'];
	const colorMap = { '客服小助手': '#FF4B2B' };
	if (colorMap[name]) return colorMap[name];
	const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return colors[index % colors.length];
};

// 获取头像文字
const getAvatarText = (name) => {
	if (!name) return '?';
	return name.charAt(0).toUpperCase();
};

// 判断是否显示时间
const shouldShowTime = (index) => {
	if (index === 0) return true;
	const currentMsg = messages.value[index];
	const prevMsg = messages.value[index - 1];
	return (currentMsg.timestamp - prevMsg.timestamp > 5 * 60 * 1000);
};

// 格式化时间（大）
const formatTime = (timestamp) => {
	const date = new Date(timestamp);
	return date.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// 格式化时间（小）
const formatTimeSmall = (timestamp) => {
	const date = new Date(timestamp);
	return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

// 发送消息
const sendMessage = () => {
	if (!messageInput.value.trim()) return;

	const message = {
		sender: userInfo.value.name,
		content: messageInput.value,
		timestamp: Date.now(),
		type: 'text'
	};

	messages.value.push(message);

	if (isConnected.value) {
		wsService.sendMessage(message);
	} else {
		setTimeout(() => {
			messages.value.push({
				sender: '客服小助手',
				content: '收到您的消息，客服将尽快回复',
				timestamp: Date.now(),
				type: 'text'
			});
			scrollToBottom();
		}, 1000);
	}

	messageInput.value = '';
	scrollToBottom();
};

// 滚动到底部
const scrollToBottom = () => {
	nextTick(() => {
		scrollIntoView.value = 'msg-bottom';
		const query = uni.createSelectorQuery();
		query.select('.message-list').boundingClientRect();
		query.select('.chat-messages').boundingClientRect();
		query.exec((res) => {
			if (res[0] && res[1]) {
				const messageListHeight = res[0].height;
				const scrollViewHeight = res[1].height;
				scrollTop.value = messageListHeight > scrollViewHeight ? messageListHeight - scrollViewHeight + 100 : 0;
			}
		});
	});
};

// 加载更多消息
const loadMoreMessages = () => {
	if (loading.value) return;
	loading.value = true;
	setTimeout(() => {
		messages.value = [
			{ sender: '客服小助手', content: '这是一条历史消息', timestamp: Date.now() - 7200000, type: 'text' },
			...messages.value
		];
		loading.value = false;
	}, 1000);
};

// 返回上一页
const goBack = () => {
	const pages = getCurrentPages();
	if (pages.length > 1) {
		uni.navigateBack({ delta: 1 });
	} else {
		uni.redirectTo({ url: '/pages/home/home' });
	}
};

// 页面加载
onMounted(() => {
	const storedUserInfo = uni.getStorageSync('userInfo');
	if (storedUserInfo) {
		userInfo.value = typeof storedUserInfo === 'string' ? JSON.parse(storedUserInfo) : storedUserInfo;
	}

	wsService.addMessageListener(handleMessage);
	wsService.addConnectionListener(handleConnectionChange);

	if (!wsService.isConnected()) {
		const token = getTokenValue();
		if (token) wsService.connect(token);
	}

	scrollToBottom();

	if (typeof uni.onKeyboardHeightChange === 'function') {
		uni.onKeyboardHeightChange((res) => {
			if (res.height > 0) scrollToBottom();
		});
	}
});

// 页面卸载
onUnmounted(() => {
	wsService.removeMessageListener(handleMessage);
	wsService.removeConnectionListener(handleConnectionChange);
});
</script>

<style>
.chat-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #0f0f0f 100%);
	color: #fff;
	overflow: hidden;
	position: relative;
}

.chat-header {
	display: flex;
	align-items: center;
	padding: 0 16px;
	padding-top: env(safe-area-inset-top);
	height: calc(60px + env(safe-area-inset-top));
	background: rgba(0, 0, 0, 0.85);
	backdrop-filter: blur(20px);
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	flex-shrink: 0;
	position: relative;
	z-index: 10;
}

.back-button {
	width: 36px;
	height: 36px;
	border-radius: 10px;
	background: rgba(255, 255, 255, 0.08);
	border: 1px solid rgba(255, 255, 255, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	flex-shrink: 0;
	-webkit-tap-highlight-color: transparent;
}

.back-icon {
	font-size: 18px;
	color: rgba(255, 255, 255, 0.8);
	font-weight: bold;
}

.header-title {
	flex: 1;
	text-align: center;
	font-size: 16px;
	font-weight: 600;
	background: linear-gradient(135deg, #fff 60%, rgba(167, 139, 250, 0.8));
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.header-right {
	width: 36px;
	height: 36px;
}

.user-avatar {
	width: 36px;
	height: 36px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #fff;
	font-size: 14px;
	font-weight: bold;
}

.chat-body {
	flex: 1;
	overflow: hidden;
	position: relative;
	-webkit-overflow-scrolling: touch;
}

.chat-messages {
	height: 100%;
	padding: 16px;
	box-sizing: border-box;
}

.message-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding-bottom: 16px;
	min-height: 100%;
}

.message-time {
	text-align: center;
	margin: 8px 0;
}

.message-time text {
	display: inline-block;
	padding: 3px 12px;
	background: rgba(255, 255, 255, 0.06);
	color: rgba(255, 255, 255, 0.3);
	font-size: 11px;
	border-radius: 20px;
}

.message-bubble {
	display: flex;
	gap: 10px;
	max-width: 80%;
}

.message-mine {
	flex-direction: row-reverse;
	align-self: flex-end;
}

.message-other {
	align-self: flex-start;
}

.message-avatar {
	width: 36px;
	height: 36px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.avatar-text {
	color: #fff;
	font-size: 14px;
	font-weight: bold;
}

.message-content {
	background: rgba(255, 255, 255, 0.07);
	border: 1px solid rgba(255, 255, 255, 0.08);
	padding: 10px 14px;
	border-radius: 4px 14px 14px 14px;
	min-width: 60px;
	word-break: break-word;
}

.message-mine .message-content {
	background: linear-gradient(135deg, #667eea, #764ba2);
	border-color: transparent;
	border-radius: 14px 4px 14px 14px;
	box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
}

.message-sender {
	font-size: 11px;
	color: rgba(255, 255, 255, 0.4);
	margin-bottom: 4px;
}

.message-text {
	font-size: 14px;
	color: rgba(255, 255, 255, 0.85);
	line-height: 1.6;
	word-break: break-all;
}

.message-mine .message-text {
	color: #fff;
}

.message-time-small {
	font-size: 10px;
	color: rgba(255, 255, 255, 0.25);
	margin-top: 4px;
	text-align: right;
}

.message-mine .message-time-small {
	color: rgba(255, 255, 255, 0.5);
}

.chat-input-container {
	background: rgba(0, 0, 0, 0.85);
	backdrop-filter: blur(20px);
	border-top: 1px solid rgba(255, 255, 255, 0.08);
	padding-bottom: env(safe-area-inset-bottom);
	flex-shrink: 0;
	position: relative;
	z-index: 10;
}

.chat-input {
	display: flex;
	padding: 12px 16px;
	gap: 10px;
	align-items: center;
}

.chat-input input {
	flex: 1;
	height: 42px;
	padding: 0 16px;
	background: rgba(255, 255, 255, 0.07);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 21px;
	font-size: 14px;
	color: #fff;
	transition: border-color 0.2s;
}

.chat-input input:focus {
	border-color: rgba(102, 126, 234, 0.5);
	outline: none;
}

.chat-input button {
	width: 72px;
	height: 42px;
	line-height: 42px;
	text-align: center;
	background: linear-gradient(135deg, #667eea, #764ba2);
	color: #fff;
	border-radius: 21px;
	font-size: 14px;
	flex-shrink: 0;
	border: none;
	box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	-webkit-tap-highlight-color: transparent;
	touch-action: manipulation;
}

.chat-input button:disabled {
	background: rgba(255, 255, 255, 0.08);
	box-shadow: none;
	color: rgba(255, 255, 255, 0.25);
}

.loading, .empty-state {
	text-align: center;
	padding: 40px;
	color: rgba(255, 255, 255, 0.25);
	font-size: 14px;
}

.skill-call-message {
	display: flex;
	justify-content: center;
	margin: 8px 0;
}

.skill-call-container {
	background: rgba(102, 126, 234, 0.12);
	border: 1px solid rgba(102, 126, 234, 0.25);
	border-radius: 16px;
	padding: 14px 16px;
	max-width: 80%;
	display: flex;
	align-items: center;
	gap: 12px;
	animation: slideInUp 0.3s ease-out;
}

.skill-call-icon {
	width: 36px;
	height: 36px;
	background: rgba(102, 126, 234, 0.2);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 18px;
	flex-shrink: 0;
	animation: pulse 2s ease-in-out infinite;
}

.skill-call-content { flex: 1; }

.skill-call-title {
	font-size: 12px;
	font-weight: 600;
	color: #a78bfa;
	margin-bottom: 4px;
}

.skill-call-text {
	font-size: 13px;
	color: rgba(255, 255, 255, 0.65);
	line-height: 1.5;
	margin-bottom: 8px;
}

.skill-call-loading {
	display: flex;
	gap: 4px;
	align-items: center;
}

.loading-dot {
	width: 6px;
	height: 6px;
	background: rgba(167, 139, 250, 0.6);
	border-radius: 50%;
	animation: loadingDot 1.4s ease-in-out infinite;
}

.loading-dot:nth-child(1) { animation-delay: 0s; }
.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes loadingDot {
	0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
	40% { transform: scale(1.2); opacity: 1; }
}

@keyframes slideInUp {
	from { opacity: 0; transform: translateY(10px); }
	to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
	0%, 100% { transform: scale(1); }
	50% { transform: scale(1.05); }
}

@media screen and (max-width: 768px) {
	.message-bubble { max-width: 88%; }
}
</style>
