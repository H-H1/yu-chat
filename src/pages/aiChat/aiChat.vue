<template>
	<view class="ai-chat-container" :class="{ 'page-loaded': pageLoaded }" @click="closeModelSelector">
		<!-- 顶部导航栏 -->
		<view class="chat-header">
			<view class="header-left">
				<view class="back-btn" @click="goBack">
					<text class="back-icon">←</text>
				</view>
				<view class="chat-info">
					<text class="chat-title">{{ currentConversation.title || 'AI 助手' }}</text>
					<text class="chat-subtitle">{{ isTyping ? '正在输入...' : '在线' }}</text>
				</view>
			</view>
			<view class="header-right">
				<view class="model-selector" @click="toggleModelSelector">
					<text class="model-name">{{ currentModelName }}</text>
					<view class="dropdown-arrow" :class="{ 'open': showModelSelector }">▼</view>
					
					<!-- 下拉列表 -->
					<view class="model-dropdown" v-if="showModelSelector" @click.stop>
						<view v-for="model in availableModels" :key="model.id" class="model-group">
							<!-- 厂商行 -->
							<view
								class="model-option"
								:class="{ 'active': model.id === aiConfig.model && !model.subModels, 'disabled': model.disabled }"
								@click="model.subModels ? null : selectModel(model)">
								<view class="model-info">
									<text class="option-name">{{ model.name }}</text>
									<text class="option-desc">{{ model.description }}</text>
								</view>
								<view class="model-status">
									<view v-if="model.disabled" class="option-badge">未上线</view>
									<view v-else-if="model.subModels" class="option-badge sub-hint">{{ model.subModels.length }} 个版本</view>
									<view v-else-if="model.id === aiConfig.model" class="option-badge active">✓</view>
								</view>
							</view>
							<!-- 子模型行 -->
							<view v-if="model.subModels && !model.disabled" class="sub-model-list">
								<view
									v-for="sub in model.subModels"
									:key="sub.id"
									class="sub-model-option"
									:class="{ 'active': sub.id === aiConfig.subModel && model.id === aiConfig.model }"
									@click="selectSubModel(model, sub)">
									<view class="sub-model-info">
										<text class="sub-option-name">{{ sub.name }}</text>
										<text class="sub-option-desc">{{ sub.description }}</text>
									</view>
									<view v-if="sub.id === aiConfig.subModel && model.id === aiConfig.model" class="sub-check">✓</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="action-btn" @click="toggleSkillsPanel" @mouseenter="showTooltip('skills')" @mouseleave="hideTooltip">
					<view class="icon-wrapper">
						<view class="icon skills-icon" :class="{ 'active': aiConfig.enableSkills }"></view>
					</view>
					<view class="tooltip" v-if="activeTooltip === 'skills'">{{ aiConfig.enableSkills ? '技能已开启' : '技能已关闭' }}</view>
				</view>
				<view class="action-btn" @click="showConversationList = true" @mouseenter="showTooltip('history')" @mouseleave="hideTooltip">
					<view class="icon-wrapper">
						<view class="icon history-icon"></view>
					</view>
					<view class="tooltip" v-if="activeTooltip === 'history'">会话历史</view>
				</view>
				<view class="action-btn" @click="newConversation" @mouseenter="showTooltip('new')" @mouseleave="hideTooltip">
					<view class="icon-wrapper">
						<view class="icon new-icon"></view>
					</view>
					<view class="tooltip" v-if="activeTooltip === 'new'">新建对话</view>
				</view>
				<view class="action-btn" @click="toggleMemory" @mouseenter="showTooltip('memory')" @mouseleave="hideTooltip">
					<view class="icon-wrapper">
						<view class="icon memory-icon" :class="{ 'active': memory }"></view>
					</view>
					<view class="tooltip" v-if="activeTooltip === 'memory'">{{ memory ? '记忆已开启' : '记忆已关闭' }}</view>
				</view>
			</view>
		</view>

		<!-- 技能面板 -->
		<view class="skills-panel" v-if="showSkillsPanel" @click.stop>
			<view class="skills-panel-header">
				<text class="skills-panel-title">技能列表</text>
				<view class="skills-total-toggle">
					<text class="skills-count">共 {{ skillsList.length }} 个技能</text>
					<view class="toggle-switch" :class="{ 'on': aiConfig.enableSkills }" @click="toggleSkills">
						<view class="toggle-thumb"></view>
					</view>
					<text class="toggle-label">{{ aiConfig.enableSkills ? '已开启' : '已关闭' }}</text>
				</view>
				<view class="skills-close-btn" @click="showSkillsPanel = false">×</view>
			</view>
			<view class="skills-loading" v-if="skillsLoading">
				<view class="loading-dot"></view>
				<view class="loading-dot"></view>
				<view class="loading-dot"></view>
			</view>
			<scroll-view class="skills-list" scroll-y="true" v-else>
				<view class="skill-item" v-for="(skill, index) in skillsList" :key="skill.name" @click="toggleSkillTooltip(skill.name)">
					<view class="skill-item-left">
						<view class="skill-icon-wrap">
							<text class="skill-emoji">🔧</text>
						</view>
						<view class="skill-info">
							<text class="skill-name">{{ skill.name }}</text>
							<text class="skill-desc">{{ skill.description }}</text>
							<view class="skill-meta">
								<text class="skill-version">v{{ skill.version }}</text>
								<text class="skill-category">{{ skill.category }}</text>
							</view>
						</view>
					</view>
					<view class="skill-actions" @click.stop>
						<view
							class="skill-toggle-btn"
							:class="skill.enabled ? 'btn-disable' : 'btn-enable'"
							@click="toggleSkillEnabled(skill)"
						>
							{{ skill.enabled ? '禁用' : '启用' }}
						</view>
					</view>
					<!-- 完整描述气泡 -->
					<view class="skill-tooltip" 
						v-if="activeSkillTooltip === skill.name" 
						:class="{ 'tooltip-down': index === 0 }"
						@click.stop>
						<view class="skill-tooltip-arrow"></view>
						<text class="skill-tooltip-name">{{ skill.name }}</text>
						<text class="skill-tooltip-desc">{{ skill.description }}</text>
						<view class="skill-tooltip-tags" v-if="skill.tags && skill.tags.length">
							<text class="skill-tag" v-for="tag in skill.tags" :key="tag">{{ tag }}</text>
						</view>
						<view class="skill-tooltip-meta">
							<text>版本：v{{ skill.version }}</text>
							<text>分类：{{ skill.category }}</text>
						</view>
					</view>
				</view>
				<view class="skills-empty" v-if="skillsList.length === 0 && !skillsLoading">
					<text>暂无可用技能</text>
				</view>
			</scroll-view>
		</view>

		<!-- 消息列表 -->
		<scroll-view class="message-container" scroll-y="true" :scroll-top="scrollTop" scroll-with-animation="true" @contextmenu="handleContextMenu" @click="closeContextMenu">
			<!-- 欢迎消息 -->
			<view class="welcome-section" v-if="messages.length === 0">
				<view class="ai-avatar-large">
					<view class="icon-bg"></view>
					<text class="avatar-emoji">💻</text>
				</view>
				<text class="welcome-title">你好！我是 AI 助手</text>
				<text class="welcome-subtitle">我可以帮助你解答问题、创作内容、分析数据等</text>
				
				<!-- 快捷提示 -->
				<view class="quick-prompts">
					<view class="prompt-item" v-for="(prompt, index) in quickPrompts" :key="index" @click="sendQuickPrompt(prompt)">
						<text class="prompt-icon">{{ prompt.icon }}</text>
						<text class="prompt-text">{{ prompt.text }}</text>
					</view>
				</view>
			</view>

			<!-- 消息列表 -->
			<view class="messages-list">
				<view v-for="(message, index) in messages" :key="message.id" 
					:class="['message-item', message.role === 'user' ? 'user-message' : 'ai-message']">
					
					<!-- AI 消息 -->
					<view v-if="message.role === 'assistant'" class="ai-message-wrapper">
						<view class="ai-avatar">
							<view class="icon-bg"></view>
							<text class="avatar-emoji">💻</text>
						</view>
						<view class="message-content">
							<!-- 技能调用提示 - 仅当消息以技能调用开头时显示 -->
							<view v-if="message.content && message.content.startsWith('🔧 正在调用技能:')" class="skill-call-tip">
								<text class="skill-icon">🔧</text>
								<text class="skill-text">{{ message.content.replace('🔧 正在调用技能:', '正在调用技能:') }}</text>
								<view class="skill-loading">
									<view class="loading-dot"></view>
									<view class="loading-dot"></view>
									<view class="loading-dot"></view>
								</view>
							</view>
							
							<!-- 普通AI消息 -->
							<view v-else class="message-bubble ai-bubble" tabindex="0">
								<!-- 等待响应转圈 -->
								<view v-if="message.isStreaming && !message.content" class="ai-waiting-spinner">
									<view class="spinner-ring"></view>
								</view>
								<!-- #ifdef H5 -->
								<view v-if="!message.isStreaming || message.content" v-html="message.rendered || renderMarkdownContent(message.content)"></view>
								<!-- #endif -->
								<!-- #ifndef H5 -->
								<text v-if="!message.isStreaming || message.content">{{ message.content }}</text>
								<!-- #endif -->
							</view>
							
							<view class="message-actions" v-if="!message.isStreaming && !(message.content && message.content.startsWith('🔧 正在调用技能:'))">
								<view class="action-btn-small" @click="copyMessage(message.content)" @mouseenter="showTooltip('copy-' + message.id)" @mouseleave="hideTooltip">
									<view class="action-icon copy-icon"></view>
									<view class="tooltip" v-if="activeTooltip === 'copy-' + message.id">复制</view>
								</view>
								<view class="action-btn-small" @click="regenerateResponse(index)" @mouseenter="showTooltip('regen-' + message.id)" @mouseleave="hideTooltip">
									<view class="action-icon refresh-icon"></view>
									<view class="tooltip" v-if="activeTooltip === 'regen-' + message.id">重新生成</view>
								</view>
								<view class="action-btn-small" @click="likeMessage(message.id)" @mouseenter="showTooltip('like-' + message.id)" @mouseleave="hideTooltip">
									<view class="action-icon like-icon" :class="{ 'liked': message.liked }"></view>
									<view class="tooltip" v-if="activeTooltip === 'like-' + message.id">{{ message.liked ? '取消点赞' : '点赞' }}</view>
								</view>
							</view>
						</view>
					</view>

					<!-- 用户消息 -->
					<view v-else class="user-message-wrapper">
						<view class="message-content">
							<view class="message-bubble user-bubble" tabindex="0">
								<text>{{ message.content }}</text>
							</view>
							<view class="message-actions user-actions">
								<view class="action-btn-small" @click="copyMessage(message.content)" @mouseenter="showTooltip('copy-' + message.id)" @mouseleave="hideTooltip">
									<view class="action-icon copy-icon"></view>
									<view class="tooltip" v-if="activeTooltip === 'copy-' + message.id">复制</view>
								</view>
							</view>
						</view>
						<view class="user-avatar">
							<text class="avatar-text">{{ getAvatarText(userInfo.name) }}</text>
						</view>
					</view>

					<!-- 时间戳 -->
					<view class="message-time" v-if="shouldShowTime(index)">
						<text>{{ formatTime(message.timestamp) }}</text>
					</view>
				</view>

				<!-- 正在输入指示器 - 只在等待响应且没有流式消息时显示 -->
				<view v-if="isTyping && !hasStreamingMessage" class="typing-indicator">
					<view class="ai-avatar">
						<view class="icon-bg"></view>
						<text class="avatar-emoji">💻</text>
					</view>
					<view class="typing-dots">
						<view class="dot"></view>
						<view class="dot"></view>
						<view class="dot"></view>
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 输入区域 -->
		<view class="input-container">
			<view class="input-wrapper">
				<view class="input-toolbar">
					<view
						class="deep-think-btn"
						:class="{ 'active': deepThink }"
						@click="toggleDeepThink"
					>
						<text class="deep-think-icon">🧠</text>
						<text class="deep-think-label">深度思考</text>
					</view>
				</view>
				<textarea 
					class="message-input" 
					v-model="inputText" 
					placeholder="输入消息..." 
					:maxlength="2000"
					@input="onInputChange"
					@keydown="handleInputKeydown"
				></textarea>
				<view class="input-actions">
					<view class="char-count">{{ inputText.length }}/2000</view>
					<view class="send-btn" :class="{ 'active': canSend, 'sending': isSending }" @click="sendMessage">
						<text class="send-icon">{{ isLoading ? '⏳' : '🚀' }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 会话列表弹窗 -->
		<view class="conversation-modal" v-if="showConversationList" @click="showConversationList = false">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">会话历史</text>
					<view class="close-btn" @click="showConversationList = false">
						<text>×</text>
					</view>
				</view>
				<scroll-view class="conversation-list" scroll-y="true">
					<view v-for="(conv, index) in conversations" :key="conv.id" 
						class="conversation-item" 
						:class="{ 'active': conv.id === currentConversation.id }"
						@click="switchConversation(conv)">
						<view class="conv-info">
							<text class="conv-title">{{ conv.title }}</text>
							<text class="conv-preview">{{ conv.lastMessage }}</text>
						</view>
						<view class="conv-meta">
							<text class="conv-time">{{ formatTime(conv.updatedAt) }}</text>
							<view class="delete-btn" @click.stop="deleteConversation(conv.id)" @mouseenter="showTooltip('delete-' + conv.id)" @mouseleave="hideTooltip">
								<view class="delete-icon"></view>
								<view class="tooltip" v-if="activeTooltip === 'delete-' + conv.id">删除会话</view>
							</view>
						</view>
					</view>
				</scroll-view>
				<view class="modal-footer">
					<view class="new-chat-btn" @click="newConversation">
						<text>+ 新建对话</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 右键菜单 -->
		<view v-if="showContextMenu" class="context-menu" :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }" @click.stop>
			<view class="context-menu-item" @click="copySelectedText">
				<view class="menu-icon copy-icon"></view>
				<text class="menu-text">复制选中内容</text>
			</view>
		</view>

		<!-- 快捷键帮助弹窗 -->
		<view class="shortcut-modal" v-if="showShortcutHelp" @click="showShortcutHelp = false">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">快捷键帮助</text>
					<view class="close-btn" @click="showShortcutHelp = false">
						<text>×</text>
					</view>
				</view>
				<view class="shortcut-list">
					<view class="shortcut-item">
						<view class="shortcut-key">Ctrl + C</view>
						<view class="shortcut-desc">复制选中的文本</view>
					</view>
					<view class="shortcut-item">
						<view class="shortcut-key">Ctrl + A</view>
						<view class="shortcut-desc">全选当前消息（需先点击消息）</view>
					</view>
					<view class="shortcut-item">
						<view class="shortcut-key">Ctrl + Shift + C</view>
						<view class="shortcut-desc">复制最后一条AI回复</view>
					</view>
					<view class="shortcut-item">
						<view class="shortcut-key">右键点击</view>
						<view class="shortcut-desc">选中文本后右键显示复制菜单</view>
					</view>
					<view class="shortcut-item">
						<view class="shortcut-key">Escape</view>
						<view class="shortcut-desc">关闭右键菜单</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import API_URL from '@/utils/api';
import { getTokenValue } from '@/utils/auth';
import { renderMarkdown } from '@/utils/markdown/simpleMarkdown.js';

// 用户信息
const userInfo = ref({
	name: '用户',
	uid: null
});

// 消息相关
const messages = ref([]);
const inputText = ref('');
const isLoading = ref(false);
const isTyping = ref(false);
const scrollTop = ref(0);

// 会话相关
const conversations = ref([]);
const currentConversation = ref({
	id: null,
	title: 'AI 助手',
	messages: [],
	createdAt: new Date(),
	updatedAt: new Date()
});
const showConversationList = ref(false);
const showModelSelector = ref(false);
const showShortcutHelp = ref(false);

// AI 配置
const aiConfig = ref({
	model: 'deepseek',
	subModel: 'deepseek-v4-flash',
	maxHistory: 10,
	temperature: 0.7,
	enableSkills: false
});

// 可用模型列表
const availableModels = ref([
	{
		id: 'deepseek',
		name: 'DeepSeek',
		description: '强大的推理能力，支持长文本对话',
		disabled: false,
		subModels: [
			{ id: 'deepseek-v4-flash', name: 'DeepSeek V4 Flash', description: '响应更快，适合日常对话' },
			{ id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', description: '更强推理，适合复杂任务' }
		]
	},
	{
		id: 'alibl',
		name: 'Qwen (阿里)',
		description: '支持思考与非思考模式，能处理复杂逻辑、数学计算、代码生成及常识推理',
		disabled: false,
		subModels: [
			{ id: 'qwen3.6-plus', name: 'Qwen3.6-plus', description: '均衡性能，适合通用场景' },
			{ id: 'qwen3.5-plus', name: 'qwen3.5-plus', description: '深度推理，擅长逻辑与数学' }
		]
	},
	{
		id: 'gpt5.2',
		name: 'GPT 5.2',
		description: '最新的GPT模型，更强的理解能力',
		disabled: true
	},
	{
		id: 'gemini3',
		name: 'Gemini 3',
		description: 'Google最新多模态AI模型',
		disabled: true
	},
	{
		id: 'kimi',
		name: 'Kimi',
		description: '月之暗面出品，擅长长文本处理',
		disabled: true
	},
]);

// 快捷提示
const quickPrompts = ref([
	{ icon: '💡', text: '帮我解释一个概念' },
	{ icon: '✍️', text: '帮我写一段文案' },
	{ icon: '🔍', text: '帮我分析问题' },
	{ icon: '🎨', text: '给我一些创意想法' },
	{ icon: '📊', text: '帮我整理信息' },
	{ icon: '🤔', text: '我有个问题想问' }
]);

// 页面动画状态
const pageLoaded = ref(false);

// 发送动画状态
const isSending = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
const selectedText = ref('');
const showContextMenu = ref(false);
const activeTooltip = ref(null);

// 处理右键菜单
const handleContextMenu = (event) => {
	const selection = window.getSelection();
	const selectedContent = selection.toString().trim();
	
	if (selectedContent) {
		event.preventDefault();
		selectedText.value = selectedContent;
		contextMenuPosition.value = {
			x: event.clientX,
			y: event.clientY
		};
		showContextMenu.value = true;
	}
};

// 复制选中文本
const copySelectedText = () => {
	if (selectedText.value) {
		copyToClipboard(selectedText.value, '已复制选中内容');
	}
	showContextMenu.value = false;
};

// 关闭右键菜单
const closeContextMenu = () => {
	showContextMenu.value = false;
	selectedText.value = '';
};

// 计算属性
const canSend = computed(() => {
	return inputText.value.trim().length > 0 && !isLoading.value;
});

// 检查是否有正在流式输出的消息
const hasStreamingMessage = computed(() => {
	return messages.value.some(msg => msg.isStreaming);
});

// 当前模型名字
const currentModelName = computed(() => {
	const model = availableModels.value.find(m => m.id === aiConfig.value.model);
	if (!model) return 'DeepSeek V4 Flash';
	if (model.subModels) {
		const sub = model.subModels.find(s => s.id === aiConfig.value.subModel);
		return sub ? sub.name : model.subModels[0].name;
	}
	return model.name;
});

// 获取头像文字
const getAvatarText = (name) => {
	if (!name) return '?';
	const firstChar = name.charAt(0);
	if (/[\u4e00-\u9fa5]/.test(firstChar)) {
		return firstChar;
	}
	return firstChar.toUpperCase();
};

// 判断是否显示时间
const shouldShowTime = (index) => {
	if (index === 0) return true;
	const current = messages.value[index];
	const previous = messages.value[index - 1];
	return (current.timestamp - previous.timestamp) > 5 * 60 * 1000; // 5分钟
};

// 格式化时间
const formatTime = (timestamp) => {
	const date = new Date(timestamp);
	const now = new Date();
	
	if (date.toDateString() === now.toDateString()) {
		return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
	}
	
	const dayDiff = (now - date) / (1000 * 60 * 60 * 24);
	if (dayDiff < 7) {
		const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
		return weekdays[date.getDay()] + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
	}
	
	return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

// 渲染Markdown内容
// 渲染Markdown内容 - 修复闪动问题
const renderMarkdownContent = (content) => {
	if (!content) return '';
	
	try {
		// 直接调用renderMarkdown，不再进行额外处理
		return renderMarkdown(content);
	} catch (error) {
		console.error('❌ Markdown渲染失败:', error);
		// 降级到纯文本
		return content.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/\n/g, '<br>');
	}
};

// 发送快捷提示
const sendQuickPrompt = (prompt) => {
	inputText.value = prompt.text;
	sendMessage();
};

// 发送消息
const sendMessage = async () => {
	if (!canSend.value) return;
	
	const userMessage = inputText.value.trim();
	inputText.value = '';
	
	// 触发发送动画
	isSending.value = true;
	setTimeout(() => {
		isSending.value = false;
	}, 600);
	
	// 添加用户消息
	const userMsg = {
		id: Date.now(),
		role: 'user',
		content: userMessage,
		timestamp: Date.now()
	};
	messages.value.push(userMsg);
	
	// 滚动到底部
	scrollToBottom();
	
	// 显示正在输入
	isTyping.value = true;
	isLoading.value = true;
	
	let aiMsg = null;
	try {
		// 创建 AI 消息占位符
		aiMsg = {
			id: Date.now() + 1,
			role: 'assistant',
			content: '',
			rendered: '',
			timestamp: Date.now(),
			isStreaming: true
		};
		messages.value.push(aiMsg);
		
		// 调用 AI API
		await callAIAPI(userMessage, aiMsg);
		
	} catch (error) {
		console.error('AI 请求失败:', error);
		// 确保失败时消息状态正确，显示操作按钮（复制/重试）
		if (aiMsg) {
			const msgIndex = messages.value.findIndex(m => m.id === aiMsg.id);
			if (msgIndex !== -1) {
				messages.value[msgIndex] = {
					...messages.value[msgIndex],
					content: messages.value[msgIndex].content || `请求失败：${error.message || '网络错误'}`,
					isStreaming: false
				};
			}
		}
		uni.showToast({
			title: '请求失败，请重试',
			icon: 'none'
		});
	} finally {
		isTyping.value = false;
		isLoading.value = false;
	}
};

// 调用 AI API - 参考 ChatView.vue 的实现方式
const callAIAPI = async (userMessage, aiMsg) => {
	const storedUserInfo = uni.getStorageSync('userInfo');
	let userInfoData = null;
	
	// 安全地解析用户信息
	if (storedUserInfo) {
		try {
			if (typeof storedUserInfo === 'string') {
				userInfoData = JSON.parse(storedUserInfo);
			} else {
				userInfoData = storedUserInfo;
			}
		} catch (error) {
			console.error('解析用户信息失败:', error);
			userInfoData = null;
		}
	}
	
	// #ifdef H5
	try {
		const response = await fetch(API_URL.completion, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'text/event-stream',
				'Authorization': getTokenValue()
			},
			body: JSON.stringify({
				message: userMessage,
				userId: userInfoData?.uid?.toString() || '1',
				model: aiConfig.value.model,
				subModel: aiConfig.value.subModel || undefined,
				conversationId: currentConversation.value.id || generateConversationId(userInfoData?.uid),
				new_conversation: !currentConversation.value.id,
				max_history: aiConfig.value.maxHistory,
				enableSkills: aiConfig.value.enableSkills,
				disabledSkills: disabledSkills.value.length > 0 ? disabledSkills.value : undefined,
				deepThink: deepThink.value || undefined,
				memory: memory.value || undefined
			})
		});

		if (!response.ok) {
			throw new Error(`请求失败: ${response.status}`);
		}

		// 流式响应处理 - 参考 messageHandler.processStreamResponse
		await processStreamResponse(response, aiMsg);
		
	} catch (error) {
		console.error('SSE 错误:', error);
		updateMessage(aiMsg.id, `请求出错：${error.message}`, false);
		updateConversation();
	}
	// #endif
	
	// #ifndef H5
	uni.request({
		url: API_URL.completion,
		method: 'POST',
		header: {
			'Content-Type': 'application/json',
			'Authorization': getTokenValue(),
		},
		data: {
			message: userMessage,
			userId: userInfoData?.uid || '1',
			model: aiConfig.value.model,
			subModel: aiConfig.value.subModel || undefined,
			conversationId: currentConversation.value.id || generateConversationId(userInfoData?.uid),
			new_conversation: !currentConversation.value.id,
			max_history: aiConfig.value.maxHistory,
			enableSkills: aiConfig.value.enableSkills,
			disabledSkills: disabledSkills.value.length > 0 ? disabledSkills.value : undefined,
			deepThink: deepThink.value || undefined,
			memory: memory.value || undefined
		},
		success: (res) => {
			const content = res.data?.content || res.data?.data || res.data?.message || res.data || '';
			const finalContent = typeof content === 'string' ? content : JSON.stringify(content);
			updateMessage(aiMsg.id, finalContent, false);
			updateConversation();
		},
		fail: (err) => {
			console.error('请求失败:', err);
			updateMessage(aiMsg.id, `请求失败：${err.errMsg || '网络错误'}`, false);
			updateConversation();
		}
	});
	// #endif
};

/**
 * 处理流式响应 - 参考 messageHandler.processStreamResponse
 * @param {Response} response - fetch 响应对象
 * @param {Object} aiMsg - AI 消息对象
 */
const processStreamResponse = async (response, aiMsg) => {
	try {
		let fullResponse = '';
		const reader = response.body.getReader();
		const decoder = new TextDecoder('utf-8');
		let buffer = ''; // 用于处理跨块的不完整数据
		
		// 1. 读取流数据
		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				console.log('流式响应完成');
				break;
			}
			
			// 2. 解码数据块并添加到缓冲区
			buffer += decoder.decode(value, { stream: true });
			
			// 3. 按行处理缓冲区数据
			const lines = buffer.split('\n');
			// 保留最后一个可能不完整的行
			buffer = lines.pop() || '';
			
			for (const line of lines) {
				const trimmedLine = line.trim();
				if (!trimmedLine) continue;
				
				// 检查是否是 SSE 数据行
				if (trimmedLine.startsWith('data:')) {
					// 提取 JSON 字符串（支持 "data:" 和 "data: " 两种格式）
					const jsonStr = trimmedLine.replace(/^data:\s*/, '').trim();
					
					// 检查是否结束
					if (jsonStr === '[DONE]') {
						console.log('流式响应完成，读取完毕');
						continue;
					}
					
					// 跳过空数据
					if (!jsonStr) continue;
					
					// 尝试解析 JSON
					try {
						const jsData = JSON.parse(jsonStr);
						
						// 提取内容 - 支持多种响应格式
						let content = '';
						if (jsData.choices && jsData.choices[0]?.delta?.content) {
							// OpenAI 格式
							content = jsData.choices[0].delta.content;
						} else if (jsData.message !== undefined) {
							// 后端 sendSSEData(c, "message", content) 格式
							content = jsData.message;
						} else if (jsData.content !== undefined) {
							// 简单格式
							content = jsData.content;
						} else if (jsData.data !== undefined) {
							// 其他格式
							content = jsData.data;
						}
						
						if (content) {
							fullResponse += content;
							// 更新消息
							updateMessage(aiMsg.id, fullResponse, true);
						}
					} catch (e) {
						console.warn('JSON 解析失败:', jsonStr, e);
						// 如果不是 JSON，可能是纯文本
						if (jsonStr && jsonStr !== '[DONE]') {
							fullResponse += jsonStr;
							updateMessage(aiMsg.id, fullResponse, true);
						}
					}
				}
			}
		}
		
		// 处理缓冲区中剩余的数据
		if (buffer.trim()) {
			const trimmedLine = buffer.trim();
			if (trimmedLine.startsWith('data:')) {
				const jsonStr = trimmedLine.replace(/^data:\s*/, '').trim();
				if (jsonStr && jsonStr !== '[DONE]') {
					try {
						const jsData = JSON.parse(jsonStr);
						let content = jsData.message || jsData.content || jsData.data || '';
						if (content) {
							fullResponse += content;
						}
					} catch (e) {
						fullResponse += jsonStr;
					}
				}
			}
		}
		
		// 完成流式传输
		updateMessage(aiMsg.id, fullResponse, false);
		updateConversation();
		
	} catch (error) {
		console.error('流处理错误:', error);
		throw error;
	}
};

/**
 * 更新消息内容 - 修复闪动问题，并处理技能调用
 * @param {number} msgId - 消息 ID
 * @param {string} content - 消息内容
 * @param {boolean} isStreaming - 是否正在流式传输
 */
const updateMessage = async (msgId, content, isStreaming) => {
	const msgIndex = messages.value.findIndex(m => m.id === msgId);
	if (msgIndex !== -1) {
		// 检查是否是技能调用消息
		const isSkillCall = content && content.startsWith('🔧 正在调用技能:');
		
		// 如果是技能调用消息，需要分离技能调用提示和实际内容
		if (isSkillCall && !isStreaming) {
			// 提取技能调用行
			const lines = content.split('\n');
			const skillLine = lines[0]; // 第一行是技能调用
			const actualContent = lines.slice(1).join('\n').trim(); // 其余是实际内容
			
			// 如果有实际内容，创建两条消息
			if (actualContent) {
				// 1. 更新当前消息为技能调用提示
				messages.value[msgIndex] = {
					...messages.value[msgIndex],
					content: skillLine,
					rendered: skillLine,
					isStreaming: false
				};
				
				// 2. 创建新消息显示实际内容
				const newMsg = {
					id: Date.now() + Math.random(),
					role: 'assistant',
					content: actualContent,
					rendered: '',
					timestamp: Date.now(),
					isStreaming: false
				};
				
				// 渲染实际内容
				try {
					const { renderMarkdownForNewMessage } = await import('@/utils/markdown/simpleMarkdown.js');
					newMsg.rendered = await renderMarkdownForNewMessage(actualContent);
				} catch (error) {
					console.error('❌ 异步渲染失败:', error);
					newMsg.rendered = renderMarkdownContent(actualContent);
				}
				
				// 插入新消息到当前消息后面
				messages.value.splice(msgIndex + 1, 0, newMsg);
				
				// 检测复制按钮
				nextTick(() => {
					detectCopyButtons();
				});
				
				return;
			}
		}
		
		// 普通消息处理
		let rendered;
		if (isStreaming) {
			// 流式传输时使用简单渲染，避免频繁的高亮计算
			rendered = renderMarkdownContent(content);
		} else {
			// 流式传输完成后，使用完整的高亮渲染
			try {
				const { renderMarkdownForNewMessage } = await import('@/utils/markdown/simpleMarkdown.js');
				rendered = await renderMarkdownForNewMessage(content);
			} catch (error) {
				console.error('❌ 异步渲染失败:', error);
				rendered = renderMarkdownContent(content);
			}
		}
		
		messages.value[msgIndex] = {
			...messages.value[msgIndex],
			content: content,
			rendered: rendered,
			isStreaming: isStreaming
		};
		
		// 每次更新消息都滚动到底部
		scrollToBottom();
		
		// 如果响应完成，检测并修复复制按钮
		if (!isStreaming) {
			nextTick(() => {
				detectCopyButtons();
			});
		}
	}
};

// 检测并修复复制按钮的辅助函数
const detectCopyButtons = () => {
	try {
		import('@/utils/markdown/simpleMarkdown.js').then(module => {
			if (module.ensureCopyButtons) {
				const messageContainer = document.querySelector('.message-container');
				if (messageContainer) {
					module.ensureCopyButtons(messageContainer);
					
					// 额外检测：确保所有复制按钮都有正确的样式
					setTimeout(() => {
						const copyButtons = document.querySelectorAll('.md-code-copy');
						copyButtons.forEach(button => {
							const computedStyle = window.getComputedStyle(button);
							if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
								button.style.display = 'flex';
								button.style.visibility = 'visible';
								button.style.opacity = '0.7';
							}
						});
						
						// 检测表格样式
						const tables = document.querySelectorAll('table');
						tables.forEach(table => {
							if (!table.closest('.md-table-wrapper')) {
								const wrapper = document.createElement('div');
								wrapper.className = 'md-table-wrapper';
								table.parentNode.insertBefore(wrapper, table);
								wrapper.appendChild(table);
							}
						});
					}, 200);
				}
			}
		}).catch(error => {
			console.error('❌ 导入复制按钮检测功能失败:', error);
		});
	} catch (error) {
		console.error('❌ 检测复制按钮时出错:', error);
	}
};

// 生成会话 ID
const generateConversationId = (uid) => {
	const safeUid = (uid !== undefined && uid !== null && uid !== '') ? uid : 'unknown';
	return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${safeUid}`;
};

// 更新会话
const updateConversation = () => {
	if (!currentConversation.value.id) {
		currentConversation.value.id = generateConversationId(userInfo.value.uid);
		
		// 生成会话标题（使用第一条用户消息的前20个字符）
		const firstUserMsg = messages.value.find(msg => msg.role === 'user');
		if (firstUserMsg) {
			currentConversation.value.title = firstUserMsg.content.slice(0, 20) + (firstUserMsg.content.length > 20 ? '...' : '');
		}
		
		conversations.value.unshift({ ...currentConversation.value });
	}
	
	// 更新会话信息
	const conv = conversations.value.find(c => c.id === currentConversation.value.id);
	if (conv) {
		conv.messages = [...messages.value];
		conv.updatedAt = Date.now();
		conv.lastMessage = messages.value[messages.value.length - 1]?.content?.slice(0, 50) || '';
	}
	
	// 保存到本地存储
	saveConversations();
};

// 保存会话到本地存储
const saveConversations = () => {
	try {
		uni.setStorageSync('ai_conversations', JSON.stringify(conversations.value));
	} catch (error) {
		console.error('保存会话失败:', error);
	}
};

// 加载会话
const loadConversations = () => {
	try {
		const saved = uni.getStorageSync('ai_conversations');
		if (saved) {
			conversations.value = JSON.parse(saved);
		}
	} catch (error) {
		console.error('加载会话失败:', error);
	}
};

// 新建会话
const newConversation = () => {
	currentConversation.value = {
		id: null,
		title: 'AI 助手',
		messages: [],
		createdAt: Date.now(),
		updatedAt: Date.now()
	};
	messages.value = [];
	showConversationList.value = false;
};

// 切换会话
const switchConversation = (conv) => {
	currentConversation.value = { ...conv };
	// 重新渲染所有消息的 Markdown，确保代码块功能正常
	const renderedMessages = conv.messages.map((msg) => {
		if (msg.role === 'assistant') {
			const rendered = renderMarkdownContent(msg.content);
			return {
				...msg,
				rendered: rendered
			};
		}
		return { ...msg };
	});
	messages.value = renderedMessages;
	showConversationList.value = false;
	scrollToBottom();
	
	// 确保切换会话后复制函数仍然可用，并检测复制按钮
	nextTick(() => {
		if (typeof window !== 'undefined') {
			import('@/utils/markdown/simpleMarkdown.js').then(module => {
				// 挂载复制函数
				window.copyCodeBlock = module.copyCodeBlock;
				
				// 检测并修复复制按钮
				if (module.ensureCopyButtons) {
					const messageContainer = document.querySelector('.message-container');
					if (messageContainer) {
						module.ensureCopyButtons(messageContainer);
						console.log('🔄 切换会话后检测复制按钮');
						
						// 额外检测：确保所有复制按钮都有正确的样式
						setTimeout(() => {
							const copyButtons = document.querySelectorAll('.md-code-copy');
							copyButtons.forEach(button => {
								// 检查按钮是否可见
								const computedStyle = window.getComputedStyle(button);
								if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
									console.log('🔧 发现隐藏的复制按钮，正在修复样式...');
									// 强制显示按钮
									button.style.display = 'flex';
									button.style.visibility = 'visible';
									button.style.opacity = '0.7';
								}
							});
							
							// 检测表格样式
							const tables = document.querySelectorAll('table');
							tables.forEach(table => {
								if (!table.closest('.md-table-wrapper')) {
									console.log('📊 切换会话后发现未包装的表格，正在修复样式...');
									// 创建包装器
									const wrapper = document.createElement('div');
									wrapper.className = 'md-table-wrapper';
									table.parentNode.insertBefore(wrapper, table);
									wrapper.appendChild(table);
								}
							});
						}, 300);
					}
				}
			}).catch(error => {
				console.error('❌ 切换会话后导入复制功能失败:', error);
			});
		}
	});
};

// 删除会话
const deleteConversation = (convId) => {
	uni.showModal({
		title: '确认删除',
		content: '确定要删除这个会话吗？',
		success: (res) => {
			if (res.confirm) {
				conversations.value = conversations.value.filter(c => c.id !== convId);
				saveConversations();
				
				if (currentConversation.value.id === convId) {
					newConversation();
				}
			}
		}
	});
};

// 通用复制函数 - 支持降级方案
const copyToClipboard = (text, successMsg = '已复制') => {
	// #ifdef H5
	// 优先使用 Clipboard API
	if (navigator.clipboard && window.isSecureContext) {
		navigator.clipboard.writeText(text).then(() => {
			uni.showToast({ title: successMsg, icon: 'success' });
		}).catch(() => {
			// 降级到传统方法
			fallbackCopy(text, successMsg);
		});
	} else {
		// 降级到传统方法
		fallbackCopy(text, successMsg);
	}
	// #endif
	
	// #ifndef H5
	uni.setClipboardData({
		data: text,
		success: () => {
			uni.showToast({ title: successMsg, icon: 'success' });
		}
	});
	// #endif
};

// 降级复制方法（适用于非 HTTPS 环境）
const fallbackCopy = (text, successMsg) => {
	const textArea = document.createElement('textarea');
	textArea.value = text;
	textArea.style.position = 'fixed';
	textArea.style.left = '-999999px';
	textArea.style.top = '-999999px';
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();
	
	try {
		document.execCommand('copy');
		uni.showToast({ title: successMsg, icon: 'success' });
	} catch (err) {
		console.error('复制失败:', err);
		uni.showToast({ title: '复制失败', icon: 'none' });
	}
	
	document.body.removeChild(textArea);
};

// 复制消息
const copyMessage = (content) => {
	copyToClipboard(content, '已复制');
};

// 重新生成回复
const regenerateResponse = async (messageIndex) => {
	// 找到对应的用户消息
	let userMessageIndex = messageIndex - 1;
	while (userMessageIndex >= 0 && messages.value[userMessageIndex].role !== 'user') {
		userMessageIndex--;
	}
	
	if (userMessageIndex >= 0) {
		const userMessage = messages.value[userMessageIndex].content;
		
		// 重新发送请求（保留原回复，新回复追加在后面）
		isTyping.value = true;
		isLoading.value = true;
		
		let aiMsg = null;
		try {
			aiMsg = {
				id: Date.now(),
				role: 'assistant',
				content: '',
				rendered: '',
				timestamp: Date.now(),
				isStreaming: true
			};
			messages.value.push(aiMsg);
			
			await callAIAPI(userMessage, aiMsg);
		} catch (error) {
			console.error('重新生成失败:', error);
			// 确保失败时消息状态正确，显示操作按钮（复制/重试）
			if (aiMsg) {
				const msgIndex = messages.value.findIndex(m => m.id === aiMsg.id);
				if (msgIndex !== -1) {
					messages.value[msgIndex] = {
						...messages.value[msgIndex],
						content: messages.value[msgIndex].content || `请求失败：${error.message || '网络错误'}`,
						isStreaming: false
					};
				}
			}
			uni.showToast({
				title: '重新生成失败，请重试',
				icon: 'none'
			});
		} finally {
			isTyping.value = false;
			isLoading.value = false;
		}
	}
};

// 技能面板相关
const showSkillsPanel = ref(false);
const skillsList = ref([]);
const skillsLoading = ref(false);
const activeSkillTooltip = ref(null);
const disabledSkills = ref([]); // 被禁用的技能名列表

// 切换单个技能启用/禁用
const toggleSkillEnabled = (skill) => {
	skill.enabled = !skill.enabled;
	if (skill.enabled) {
		disabledSkills.value = disabledSkills.value.filter(n => n !== skill.name);
	} else {
		if (!disabledSkills.value.includes(skill.name)) {
			disabledSkills.value.push(skill.name);
		}
	}
};

// 切换技能描述气泡
const toggleSkillTooltip = (skillName) => {
	activeSkillTooltip.value = activeSkillTooltip.value === skillName ? null : skillName;
};

// 切换技能面板
const toggleSkillsPanel = async (event) => {
	event.stopPropagation();
	showSkillsPanel.value = !showSkillsPanel.value;
	if (showSkillsPanel.value && skillsList.value.length === 0) {
		await loadSkillsList();
	}
	if (!showSkillsPanel.value) {
		activeSkillTooltip.value = null;
	}
};

// 加载技能列表
const loadSkillsList = async () => {
	skillsLoading.value = true;
	try {
		const response = await fetch(API_URL.skills, {
			method: 'GET',
			headers: {
				'Authorization': getTokenValue()
			}
		});
		const data = await response.json();
		if (data.success) {
			skillsList.value = (data.data || []).map(s => ({ ...s, enabled: true }));
			disabledSkills.value = [];
		}
	} catch (error) {
		console.error('加载技能列表失败:', error);
	} finally {
		skillsLoading.value = false;
	}
};

// 切换技能开关
const toggleSkills = () => {
	aiConfig.value.enableSkills = !aiConfig.value.enableSkills;
};

// 切换模型选择器
const toggleModelSelector = (event) => {
	event.stopPropagation();
	console.log('切换模型选择器', showModelSelector.value);
	showModelSelector.value = !showModelSelector.value;
};

// 关闭模型选择器
const closeModelSelector = () => {
	if (showModelSelector.value) {
		showModelSelector.value = false;
	}
	if (showSkillsPanel.value) {
		showSkillsPanel.value = false;
	}
};

// 选择模型
const selectModel = (model) => {
	if (model.disabled) return;
	aiConfig.value.model = model.id;
	// 自动选中第一个子模型
	if (model.subModels && model.subModels.length > 0) {
		aiConfig.value.subModel = model.subModels[0].id;
	} else {
		aiConfig.value.subModel = '';
	}
	showModelSelector.value = false;
	uni.showToast({
		title: `已切换到 ${model.name}`,
		icon: 'success'
	});
};

// 选择子模型
const selectSubModel = (model, sub) => {
	if (model.disabled) return;
	aiConfig.value.model = model.id;
	aiConfig.value.subModel = sub.id;
	showModelSelector.value = false;
	uni.showToast({
		title: `已切换到 ${sub.name}`,
		icon: 'success'
	});
};
const likeMessage = (messageId) => {
	const message = messages.value.find(msg => msg.id === messageId);
	if (message) {
		message.liked = !message.liked;
		uni.showToast({
			title: message.liked ? '已点赞' : '已取消点赞',
			icon: 'none'
		});
	}
};

// 深度思考
const deepThink = ref(false);

const toggleDeepThink = () => {
	deepThink.value = !deepThink.value;
	if (deepThink.value) {
		aiConfig.value.enableSkills = false;
	}
};

// 记忆
const memory = ref(false);
const toggleMemory = () => {
	memory.value = !memory.value;
	uni.showToast({
		title: memory.value ? '记忆已开启' : '记忆已关闭',
		icon: 'none'
	});
};

// 输入变化
const onInputChange = () => {
	// 可以在这里添加输入提示等功能
};

// 输入框回车发送（Shift+Enter 换行）
const handleInputKeydown = (e) => {
	if (e.key === 'Enter' && !e.shiftKey) {
		e.preventDefault();
		sendMessage();
	}
};

// 滚动到底部
const scrollToBottom = () => {
	nextTick(() => {
		// #ifdef H5
		const container = document.querySelector('.message-container');
		if (container) {
			container.scrollTop = container.scrollHeight;
		}
		// #endif
		// #ifndef H5
		scrollTop.value = scrollTop.value === 99999 ? 99998 : 99999;
		// #endif
	});
};

// 显示气泡提示
const showTooltip = (id) => {
	activeTooltip.value = id;
};

// 隐藏气泡提示
const hideTooltip = () => {
	activeTooltip.value = null;
};

// 返回home
const goBack = () => {
	// 先尝试返回上一页
	const pages = getCurrentPages();
	if (pages.length > 1) {
		// 如果页面栈中有上一页，直接返回
		uni.navigateBack({
			delta: 1
		});
	} else {
		// 如果没有上一页，跳转到home页面

		uni.switchTab({
			url: '/pages/home/home'
		});
	}
};

// 加载用户信息
const loadUserInfo = () => {
	const stored = uni.getStorageSync('userInfo');
	if (stored) {
		try {
			// 检查存储的数据类型，如果已经是对象则直接使用，否则解析JSON
			let data;
			if (typeof stored === 'string') {
				data = JSON.parse(stored);
			} else {
				data = stored;
			}
			
			if (data.expiry && new Date().getTime() < data.expiry) {
				userInfo.value.name = data.userName || '用户';
				userInfo.value.uid = data.uid;
			} else {
				// 过期了，清除存储
				uni.removeStorageSync('userInfo');
			}
		} catch (error) {
			console.error('加载用户信息失败:', error);
			// 如果解析失败，清除存储
			uni.removeStorageSync('userInfo');
		}
	}
};

// 页面加载
onMounted(() => {
	loadUserInfo();
	loadConversations();
	scrollToBottom();
	
	// 页面加载动画
	setTimeout(() => {
		pageLoaded.value = true;
	}, 100);
	
	// 确保全局复制函数可用 - 多重保障
	if (typeof window !== 'undefined') {
		// 立即导入并挂载复制函数
		import('@/utils/markdown/simpleMarkdown.js').then(module => {
			window.copyCodeBlock = module.copyCodeBlock;
			console.log('✅ 全局复制函数已挂载');
			
			// 页面加载完成后检测复制按钮
			setTimeout(() => {
				if (module.ensureCopyButtons) {
					const messageContainer = document.querySelector('.message-container');
					if (messageContainer) {
						module.ensureCopyButtons(messageContainer);
						console.log('🔄 页面加载后检测复制按钮');
						
						// 额外检测：确保所有复制按钮都有正确的样式
						setTimeout(() => {
							const copyButtons = document.querySelectorAll('.md-code-copy');
							copyButtons.forEach(button => {
								// 检查按钮是否可见
								const computedStyle = window.getComputedStyle(button);
								if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
									console.log('🔧 发现隐藏的复制按钮，正在修复样式...');
									// 强制显示按钮
									button.style.display = 'flex';
									button.style.visibility = 'visible';
									button.style.opacity = '0.7';
								}
							});
							
							// 检测表格样式
							const tables = document.querySelectorAll('table');
							tables.forEach(table => {
								if (!table.closest('.md-table-wrapper')) {
									console.log('📊 页面加载后发现未包装的表格，正在修复样式...');
									// 创建包装器
									const wrapper = document.createElement('div');
									wrapper.className = 'md-table-wrapper';
									table.parentNode.insertBefore(wrapper, table);
									wrapper.appendChild(table);
								}
							});
						}, 500);
					}
				}
			}, 500);
		}).catch(error => {
			console.error('❌ 导入复制函数失败:', error);
		});
		
		// 备用方案：如果导入失败，提供一个简单的复制函数
		if (!window.copyCodeBlock) {
			window.copyCodeBlock = function(codeId) {
				try {
					const codeElement = document.getElementById(codeId);
					if (!codeElement) {
						console.error('找不到代码元素:', codeId);
						return;
					}
					
					const codeText = codeElement.textContent || codeElement.innerText;
					
					// 使用通用复制函数
					if (typeof copyToClipboard === 'function') {
						copyToClipboard(codeText, '代码已复制');
					} else if (navigator.clipboard && window.isSecureContext) {
						navigator.clipboard.writeText(codeText).then(() => {
							uni.showToast({ title: '代码已复制', icon: 'success' });
						}).catch(() => {
							fallbackCopyCode(codeText);
						});
					} else {
						fallbackCopyCode(codeText);
					}
				} catch (error) {
					console.error('复制代码失败:', error);
					uni.showToast({ title: '复制失败', icon: 'none' });
				}
			};
			
			// 降级复制代码的辅助函数
			const fallbackCopyCode = (codeText) => {
				const textArea = document.createElement('textarea');
				textArea.value = codeText;
				textArea.style.position = 'fixed';
				textArea.style.left = '-999999px';
				document.body.appendChild(textArea);
				textArea.select();
				const successful = document.execCommand('copy');
				document.body.removeChild(textArea);
				if (successful) {
					uni.showToast({ title: '代码已复制', icon: 'success' });
				} else {
					uni.showToast({ title: '复制失败', icon: 'none' });
				}
			};
		}
		
		// 定期检查并确保函数可用（每5秒检查一次，最多检查6次）
		let checkCount = 0;
		const checkInterval = setInterval(() => {
			checkCount++;
			if (!window.copyCodeBlock || checkCount >= 6) {
				if (!window.copyCodeBlock) {
					import('@/utils/markdown/simpleMarkdown.js').then(module => {
						window.copyCodeBlock = module.copyCodeBlock;
						console.log('🔄 重新挂载全局复制函数');
						
						// 同时检测复制按钮
						if (module.ensureCopyButtons) {
							const messageContainer = document.querySelector('.message-container');
							if (messageContainer) {
								module.ensureCopyButtons(messageContainer);
								
								// 检测复制按钮样式
								setTimeout(() => {
									const copyButtons = document.querySelectorAll('.md-code-copy');
									copyButtons.forEach(button => {
										const computedStyle = window.getComputedStyle(button);
										if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden' || computedStyle.opacity === '0') {
											console.log('🔧 定期检查发现隐藏的复制按钮，正在修复样式...');
											button.style.display = 'flex';
											button.style.visibility = 'visible';
											button.style.opacity = '0.7';
										}
									});
									
									// 检测表格样式
									const tables = document.querySelectorAll('table');
									tables.forEach(table => {
										if (!table.closest('.md-table-wrapper')) {
											console.log('📊 定期检查发现未包装的表格，正在修复样式...');
											// 创建包装器
											const wrapper = document.createElement('div');
											wrapper.className = 'md-table-wrapper';
											table.parentNode.insertBefore(wrapper, table);
											wrapper.appendChild(table);
										}
									});
								}, 100);
							}
						}
					});
				}
				if (checkCount >= 6) {
					clearInterval(checkInterval);
				}
			} else {
				clearInterval(checkInterval);
			}
		}, 5000);
	}
	
	// 添加键盘快捷键监听
	document.addEventListener('keydown', handleKeyboardShortcuts);
});

// 添加键盘快捷键处理
const handleKeyboardShortcuts = (event) => {
	// Ctrl+C 复制选中的文本
	if (event.ctrlKey && event.key === 'c') {
		const selection = window.getSelection();
		if (selection && selection.toString().trim()) {
			// 如果有选中文本，让浏览器默认处理复制
			return;
		}
	}
	
	// Ctrl+A 全选当前消息（如果焦点在消息区域）
	if (event.ctrlKey && event.key === 'a') {
		const activeElement = document.activeElement;
		if (activeElement && activeElement.closest('.message-bubble')) {
			event.preventDefault();
			const messageContent = activeElement.closest('.message-bubble');
			selectMessageContent(messageContent);
		}
	}
	
	// Escape 关闭右键菜单
	if (event.key === 'Escape') {
		closeContextMenu();
	}
	
	// Ctrl+Shift+C 复制最后一条AI消息
	if (event.ctrlKey && event.shiftKey && event.key === 'C') {
		event.preventDefault();
		const lastAiMessage = messages.value.slice().reverse().find(msg => msg.role === 'assistant');
		if (lastAiMessage) {
			copyMessage(lastAiMessage.content);
		}
	}
};

// 选中消息内容
const selectMessageContent = (messageElement) => {
	if (messageElement) {
		const range = document.createRange();
		range.selectNodeContents(messageElement);
		const selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	}
};

// 页面卸载时清理事件监听
onUnmounted(() => {
	document.removeEventListener('keydown', handleKeyboardShortcuts);
});
</script>

<style lang="scss" scoped>
.ai-chat-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: #1a1a1a;
	opacity: 0;
	transform: translateY(20px);
	transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	overflow: hidden;
	
	&.page-loaded {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 动画效果 */
@keyframes tooltipFadeIn {
	from {
		opacity: 0;
		transform: translateX(-50%) translateY(-5px);
	}
	to {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}
}

/* 顶部导航 */
.chat-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	background: #2d2d2d;
	border-bottom: 1px solid #3d3d3d;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	z-index: 1000;
	height: 60px;
	box-sizing: border-box;
	
	.header-left {
		display: flex;
		align-items: center;
		flex: 1;
		min-width: 0;
		
		.back-btn {
			width: 36px;
			height: 36px;
			border-radius: 18px;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 12px;
			background: rgba(255, 255, 255, 0.1);
			cursor: pointer;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			position: relative;
			overflow: hidden;
			flex-shrink: 0;
			
			&::before {
				content: '';
				position: absolute;
				top: 50%;
				left: 50%;
				width: 0;
				height: 0;
				background: rgba(255, 255, 255, 0.2);
				border-radius: 50%;
				transform: translate(-50%, -50%);
				transition: all 0.3s ease;
			}
			
			&:hover {
				background: rgba(255, 255, 255, 0.2);
				transform: translateX(-2px) scale(1.05);
				box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
				
				&::before {
					width: 100%;
					height: 100%;
				}
				
				.back-icon {
					transform: translateX(-1px);
				}
			}
			
			&:active {
				transform: translateX(-1px) scale(0.95);
				transition: all 0.1s ease;
			}
			
			.back-icon {
				font-size: 18px;
				color: #fff;
				transition: all 0.3s ease;
				z-index: 1;
				position: relative;
			}
		}
		
		.chat-info {
			flex: 1;
			min-width: 0;
			display: flex;
			flex-direction: column;
			justify-content: center;
			
			.chat-title {
				display: block;
				font-size: 16px;
				font-weight: 600;
				color: #fff;
				line-height: 1.2;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			
			.chat-subtitle {
				display: block;
				font-size: 12px;
				color: #aaa;
				line-height: 1.2;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}
	}
	
	.header-right {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
		
		.model-selector {
			position: relative;
			display: flex;
			align-items: center;
			gap: 6px;
			padding: 6px 12px;
			background: rgba(255, 255, 255, 0.1);
			border-radius: 18px;
			cursor: pointer;
			transition: all 0.3s ease;
			margin-right: 8px;
			
			&:hover {
				background: rgba(255, 255, 255, 0.2);
			}
			
			.model-name {
				font-size: 13px;
				color: #fff;
				font-weight: 500;
			}
			
			.dropdown-arrow {
				font-size: 10px;
				color: #fff;
				transition: transform 0.2s ease;
				
				&.open {
					transform: rotate(180deg);
				}
			}
			
			.model-dropdown {
				position: absolute;
				top: 100%;
				right: 0;
				margin-top: 4px;
				background: #2d2d2d;
				border-radius: 8px;
				border: 1px solid #3d3d3d;
				box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
				z-index: 10002;
				overflow-y: auto;
				min-width: 280px;
				max-width: 320px;
				max-height: 400px;
				
				.model-option {
					display: flex;
					align-items: flex-start;
					justify-content: space-between;
					padding: 14px 16px;
					cursor: pointer;
					transition: background 0.2s ease;
					
					&:hover:not(.disabled) {
						background: #3d3d3d;
					}
					
					&.active {
						background: rgba(102, 126, 234, 0.2);
					}
					
					&.disabled {
						opacity: 0.5;
						cursor: not-allowed;
					}
					
					.model-info {
						flex: 1;
						margin-right: 12px;
						
						.option-name {
							display: block;
							font-size: 14px;
							color: #fff;
							font-weight: 500;
							margin-bottom: 4px;
						}
						
						.option-desc {
							display: block;
							font-size: 12px;
							color: #aaa;
							line-height: 1.4;
						}
					}
					
					.model-status {
						flex-shrink: 0;
						
						.option-badge {
							font-size: 11px;
							padding: 4px 8px;
							border-radius: 12px;
							
							&.active {
								color: #667eea;
								font-weight: 600;
								font-size: 14px;
							}
							
							&.sub-hint {
								background: rgba(102, 126, 234, 0.15);
								color: #667eea;
							}
							
							&:not(.active):not(.sub-hint) {
								background: rgba(255, 255, 255, 0.1);
								color: #888;
							}
						}
					}
				}
				
				.sub-model-list {
					background: rgba(0, 0, 0, 0.2);
					border-top: 1px solid rgba(255, 255, 255, 0.05);
					border-bottom: 1px solid rgba(255, 255, 255, 0.05);
					
					.sub-model-option {
						display: flex;
						align-items: center;
						justify-content: space-between;
						padding: 10px 16px 10px 32px;
						cursor: pointer;
						transition: background 0.2s ease;
						border-bottom: 1px solid rgba(255, 255, 255, 0.04);
						
						&:last-child { border-bottom: none; }
						
						&:hover {
							background: rgba(102, 126, 234, 0.1);
						}
						
						&.active {
							background: rgba(102, 126, 234, 0.18);
						}
						
						.sub-model-info {
							flex: 1;
							
							.sub-option-name {
								display: block;
								font-size: 13px;
								color: #e0e0e0;
								font-weight: 500;
								margin-bottom: 2px;
							}
							
							.sub-option-desc {
								display: block;
								font-size: 11px;
								color: #888;
								line-height: 1.3;
							}
						}
						
						.sub-check {
							font-size: 13px;
							color: #667eea;
							font-weight: 600;
							margin-left: 8px;
							flex-shrink: 0;
						}
					}
				}
			}
		}
		
		.action-btn {
			position: relative;
			width: 36px;
			height: 36px;
			border-radius: 18px;
			display: flex;
			align-items: center;
			justify-content: center;
			background: rgba(255, 255, 255, 0.1);
			cursor: pointer;
			transition: all 0.3s ease;
			overflow: visible;
			
			&:hover {
				background: rgba(255, 255, 255, 0.2);
				transform: scale(1.05);
			}
			
			.icon-wrapper {
				display: flex;
				align-items: center;
				justify-content: center;
				
				.icon {
					width: 16px;
					height: 16px;
					position: relative;
					
					&.skills-icon {
						&::before {
							content: '';
							position: absolute;
							width: 12px;
							height: 12px;
							border: 2px solid #aaa;
							border-radius: 50%;
							top: 50%;
							left: 50%;
							transform: translate(-50%, -50%);
							transition: all 0.3s ease;
						}
						&::after {
							content: '';
							position: absolute;
							width: 6px;
							height: 6px;
							background: #aaa;
							border-radius: 50%;
							top: 50%;
							left: 50%;
							transform: translate(-50%, -50%);
							transition: all 0.3s ease;
						}
						
						&.active {
							&::before {
								border-color: #667eea;
								box-shadow: 0 0 8px rgba(102, 126, 234, 0.5);
							}
							&::after {
								background: #667eea;
								box-shadow: 0 0 6px rgba(102, 126, 234, 0.8);
							}
						}
					}
					
					&.history-icon {
						&::before {
							content: '';
							position: absolute;
							width: 14px;
							height: 14px;
							border: 2px solid #fff;
							border-radius: 3px;
							top: 50%;
							left: 50%;
							transform: translate(-50%, -50%);
						}
						&::after {
							content: '';
							position: absolute;
							width: 8px;
							height: 1px;
							background: #fff;
							top: 50%;
							left: 50%;
							transform: translate(-50%, -50%);
							box-shadow: 0 3px 0 #fff, 0 6px 0 #fff;
						}
					}
					
					&.new-icon {
						&::before {
							content: '';
							position: absolute;
							width: 2px;
							height: 12px;
							background: #fff;
							top: 50%;
							left: 50%;
							transform: translate(-50%, -50%);
						}
						&::after {
							content: '';
							position: absolute;
							width: 12px;
							height: 2px;
							background: #fff;
							top: 50%;
							left: 50%;
							transform: translate(-50%, -50%);
						}
					}
					
					&.help-icon {
						&::before {
							content: '';
							position: absolute;
							width: 12px;
							height: 12px;
							border: 2px solid #fff;
							border-radius: 50%;
							top: 50%;
							left: 50%;
							transform: translate(-50%, -50%);
						}
						&::after {
							content: '?';
							position: absolute;
							font-size: 10px;
							font-weight: bold;
							color: #fff;
							top: 50%;
							left: 50%;
							transform: translate(-50%, -50%);
							line-height: 1;
						}
					}

					&.memory-icon {
						&::before {
							content: '';
							position: absolute;
							width: 10px;
							height: 12px;
							border: 2px solid #aaa;
							border-radius: 2px 2px 4px 4px;
							top: 50%;
							left: 50%;
							transform: translate(-50%, -50%);
							transition: border-color 0.3s ease;
						}
						&::after {
							content: '';
							position: absolute;
							width: 6px;
							height: 2px;
							background: #aaa;
							top: calc(50% - 2px);
							left: 50%;
							transform: translateX(-50%);
							box-shadow: 0 3px 0 #aaa;
							transition: background 0.3s ease;
						}
						&.active {
							&::before { border-color: #a78bfa; box-shadow: 0 0 6px rgba(167,139,250,0.5); }
							&::after  { background: #a78bfa; box-shadow: 0 3px 0 #a78bfa; }
						}
					}
				}
			}
			
			.tooltip {
				position: absolute;
				top: 45px;
				left: 50%;
				transform: translateX(-50%);
				background: rgba(255, 255, 255, 0.95);
				color: #1a1a1a;
				padding: 8px 12px;
				border-radius: 8px;
				font-size: 12px;
				white-space: nowrap;
				z-index: 10000;
				box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
				animation: tooltipFadeIn 0.2s ease-out;
				pointer-events: none;
				
				&::before {
					content: '';
					position: absolute;
					top: -6px;
					left: 50%;
					transform: translateX(-50%);
					border-left: 6px solid transparent;
					border-right: 6px solid transparent;
					border-bottom: 6px solid rgba(255, 255, 255, 0.95);
				}
			}
		}
	}
}

/* 消息容器 */
.message-container {
	flex: 1;
	background: #1a1a1a;
	position: absolute;
	top: 60px;
	bottom: 260px;
	left: 0;
	right: 0;
	overflow-y: auto;
}

/* 欢迎区域 */
.welcome-section {
	padding: 40px 20px;
	text-align: center;
	animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
	
	.ai-avatar-large {
		width: 80px;
		height: 80px;
		border-radius: 24px;
		overflow: hidden;
		margin: 0 auto 20px;
		box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
		animation: avatarPulse 2s ease-in-out infinite;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		
		.icon-bg {
			position: absolute;
			inset: 0;
			border-radius: 24px;
			background: linear-gradient(135deg, #667eea, #764ba2);
			opacity: 1;
			transition: opacity 0.3s ease;
		}
		
		.avatar-emoji {
			position: relative;
			z-index: 1;
			font-size: 40px;
			line-height: 1;
		}
	}
	
	.welcome-title {
		display: block;
		font-size: 24px;
		font-weight: 600;
		color: #fff;
		margin-bottom: 8px;
	}
	
	.welcome-subtitle {
		display: block;
		font-size: 16px;
		color: #aaa;
		margin-bottom: 32px;
		line-height: 1.5;
	}
	
	.quick-prompts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 12px;
		max-width: 600px;
		margin: 0 auto;
		
		.prompt-item {
			display: flex;
			align-items: center;
			padding: 16px;
			background: #2d2d2d;
			border-radius: 12px;
			box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
			cursor: pointer;
			transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			border: 1px solid #3d3d3d;
			animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
			
			&:nth-child(1) { animation-delay: 0.1s; }
			&:nth-child(2) { animation-delay: 0.2s; }
			&:nth-child(3) { animation-delay: 0.3s; }
			&:nth-child(4) { animation-delay: 0.4s; }
			&:nth-child(5) { animation-delay: 0.5s; }
			&:nth-child(6) { animation-delay: 0.6s; }
			
			&:hover {
				transform: translateY(-4px) scale(1.02);
				box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
				background: #3d3d3d;
				border-color: rgba(102, 126, 234, 0.3);
			}
			
			&:active {
				transform: translateY(-2px) scale(0.98);
				transition: all 0.1s ease;
			}
			
			.prompt-icon {
				font-size: 20px;
				margin-right: 12px;
				transition: transform 0.3s ease;
			}
			
			.prompt-text {
				font-size: 14px;
				color: #fff;
				font-weight: 500;
			}
			
			&:hover .prompt-icon {
				transform: scale(1.2) rotate(5deg);
			}
		}
	}
}

/* 消息列表 */
.messages-list {
	padding: 20px;
	
	.message-item {
		margin-bottom: 24px;
		animation: messageSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		
		&.user-message {
			.user-message-wrapper {
				display: flex;
				justify-content: flex-end;
				align-items: flex-start;
				gap: 12px;
				
				.message-content {
					max-width: 70%;
					
					.user-bubble {
						background: #1e3a5f;
						color: white;
						border-radius: 20px 20px 4px 20px;
						padding: 12px 16px;
						box-shadow: 0 2px 12px rgba(30, 58, 95, 0.3);
						user-select: text; /* 允许文本选择 */
						cursor: text; /* 文本光标 */
						outline: none; /* 移除默认焦点轮廓 */
						transition: all 0.2s ease;
						
						&:focus {
							box-shadow: 0 2px 12px rgba(30, 58, 95, 0.3), 0 0 0 2px rgba(102, 126, 234, 0.3);
						}
						
						text {
							font-size: 15px;
							line-height: 1.4;
							user-select: text; /* 允许文本选择 */
						}
					}
					
					.message-actions {
						display: flex;
						align-items: center;
						gap: 8px;
						margin-top: 8px;
						justify-content: flex-end;
						
						.action-btn-small {
							position: relative;
							width: 28px;
							height: 28px;
							border-radius: 14px;
							display: flex;
							align-items: center;
							justify-content: center;
							background: rgba(255, 255, 255, 0.1);
							cursor: pointer;
							transition: all 0.2s ease;
							
							&:hover {
								background: rgba(255, 255, 255, 0.2);
								transform: scale(1.1);
							}
							
							.action-icon {
								width: 12px;
								height: 12px;
								position: relative;
								
								&.copy-icon {
									&::before {
										content: '';
										position: absolute;
										width: 8px;
										height: 10px;
										border: 1px solid #aaa;
										border-radius: 1px;
										top: 1px;
										left: 2px;
									}
									&::after {
										content: '';
										position: absolute;
										width: 8px;
										height: 10px;
										border: 1px solid #aaa;
										border-radius: 1px;
										background: #2d2d2d;
										top: -1px;
										left: 0px;
									}
								}
							}
							
							.tooltip {
								position: absolute;
								bottom: -40px;
								left: 50%;
								transform: translateX(-50%);
								background: rgba(255, 255, 255, 0.95);
								color: #1a1a1a;
								padding: 6px 10px;
								border-radius: 6px;
								font-size: 11px;
								white-space: nowrap;
								z-index: 10001;
								box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
								animation: tooltipFadeIn 0.2s ease-out;
								pointer-events: none;
								
								&::before {
									content: '';
									position: absolute;
									top: -4px;
									left: 50%;
									transform: translateX(-50%);
									border-left: 4px solid transparent;
									border-right: 4px solid transparent;
									border-bottom: 4px solid rgba(255, 255, 255, 0.95);
								}
							}
						}
					}
				}
				
				.user-avatar {
					width: 36px;
					height: 36px;
					border-radius: 18px;
					background: linear-gradient(135deg, #10a0e2, #0c0c0c);
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
					
					.avatar-text {
						font-size: 14px;
						font-weight: 600;
						color: white;
					}
				}
			}
		}
		
		&.ai-message {
			.ai-message-wrapper {
				display: flex;
				align-items: flex-start;
				gap: 12px;
				
				.ai-avatar {
					width: 36px;
					height: 36px;
					border-radius: 16px;
					overflow: hidden;
					flex-shrink: 0;
					position: relative;
					display: flex;
					align-items: center;
					justify-content: center;
					
					.icon-bg {
						position: absolute;
						inset: 0;
						border-radius: 16px;
						background: linear-gradient(135deg, #667eea, #764ba2);
						opacity: 1;
						transition: opacity 0.3s ease;
					}
					
					.avatar-emoji {
						position: relative;
						z-index: 1;
						font-size: 18px;
						line-height: 1;
					}
				}
				
				.message-content {
					flex: 1;
					max-width: 70%;
					
					/* 技能调用提示 - 简单单行 */
					.skill-call-tip {
						display: flex;
						align-items: center;
						gap: 8px;
						padding: 10px 16px;
						background: linear-gradient(90deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
						border-left: 3px solid #667eea;
						border-radius: 8px;
						margin: 8px 0;
						
						.skill-icon {
							font-size: 16px;
							animation: skillIconRotate 2s linear infinite;
						}
						
						.skill-text {
							font-size: 14px;
							color: #667eea;
							font-weight: 500;
						}
						
						.skill-loading {
							display: flex;
							align-items: center;
							gap: 4px;
							margin-left: auto;
							
							.loading-dot {
								width: 6px;
								height: 6px;
								border-radius: 50%;
								background: #667eea;
								animation: loadingDot 1.4s infinite ease-in-out;
								
								&:nth-child(1) { animation-delay: -0.32s; }
								&:nth-child(2) { animation-delay: -0.16s; }
								&:nth-child(3) { animation-delay: 0s; }
							}
						}
					}
					
					.ai-bubble {
						background: #2d2d2d;
						border-radius: 20px 20px 20px 4px;
						padding: 12px 16px;
						box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
						border: 1px solid #3d3d3d;
						color: #fff;
						user-select: text;
						cursor: text;
						outline: none;
						transition: all 0.2s ease;
						
						.ai-waiting-spinner {
							display: flex;
							align-items: center;
							justify-content: center;
							padding: 4px 8px;
							
							.spinner-ring {
								width: 20px;
								height: 20px;
								border: 2px solid rgba(102, 126, 234, 0.2);
								border-top-color: #667eea;
								border-radius: 50%;
								animation: spin 0.8s linear infinite;
							}
						}
						
						&:focus {
							box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(102, 126, 234, 0.3);
						}
						
						text {
							font-size: 15px;
							line-height: 1.6;
							color: #fff;
							user-select: text; /* 允许文本选择 */
						}
						
						/* 确保所有子元素都是白色且可选择 */
						p, span, div, view, text, h1, h2, h3, h4, h5, h6, li, strong, em, b, i, code, pre, td, th {
							user-select: text !important;
						}
						
						/* 基础文本元素 */
						p, span, div, h1, h2, h3, h4, h5, h6, li, strong, em, b, i {
							color: #fff !important;
						}
						
						/* 链接 */
						a {
							color: #6db3f2 !important;
							text-decoration: underline;
						}
						
						/* 行内代码 */
						code:not(.md-code) {
							background: rgba(255, 255, 255, 0.15) !important;
							color: #f8b500 !important;
							padding: 2px 6px !important;
							border-radius: 4px !important;
							font-family: Monaco, Menlo, Consolas, "Courier New", monospace !important;
							font-size: 13px !important;
						}
						
						/* 引用块 */
						blockquote {
							color: #aaa !important;
							border-left: 4px solid #667eea !important;
							padding-left: 12px !important;
							margin: 12px 0 !important;
							font-style: italic !important;
							background: rgba(255, 255, 255, 0.05) !important;
							padding: 12px !important;
							border-radius: 0 4px 4px 0 !important;
						}
						
						/* 删除线 */
						del, s {
							color: #aaa !important;
							text-decoration: line-through !important;
						}
						
						/* 列表 */
						ul, ol {
							margin: 12px 0 !important;
							padding-left: 20px !important;
						}
						
						li {
							margin: 4px 0 !important;
							line-height: 1.5 !important;
						}
						
						/* 代码块容器 */
						.md-code-block {
							background: #1e1e1e !important;
							border: 1px solid #3d3d3d !important;
							border-radius: 8px !important;
							margin: 16px 0 !important;
							overflow: hidden !important;
							box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
						}
						
						/* 代码块头部 */
						.md-code-header {
							display: flex !important;
							align-items: center !important;
							justify-content: space-between !important;
							background: rgba(255, 255, 255, 0.08) !important;
							border-bottom: 1px solid #3d3d3d !important;
							padding: 8px 12px !important;
							min-height: 36px !important;
						}
						
						/* 语言标签 */
						.md-code-lang {
							background: transparent !important;
							color: #aaa !important;
							padding: 0 !important;
							font-size: 12px !important;
							border: none !important;
							text-transform: uppercase !important;
							letter-spacing: 0.5px !important;
							font-weight: 500 !important;
							font-family: Monaco, Menlo, Consolas, "Courier New", monospace !important;
						}
						
						/* 复制按钮 */
						.md-code-copy {
							background: transparent !important;
							border: none !important;
							color: #aaa !important;
							cursor: pointer !important;
							padding: 6px 8px !important;
							border-radius: 4px !important;
							display: flex !important;
							align-items: center !important;
							justify-content: center !important;
							gap: 4px !important;
							transition: all 0.2s ease !important;
							opacity: 0.7 !important;
							font-size: 12px !important;
							min-width: 60px !important;
							white-space: nowrap !important;
						}
						
						.md-code-copy:hover {
							background: rgba(255, 255, 255, 0.1) !important;
							color: #fff !important;
							opacity: 1 !important;
							transform: scale(1.05) !important;
						}
						
						.md-code-copy:active {
							transform: scale(0.95) !important;
						}
						
						.md-code-copy svg {
							width: 14px !important;
							height: 14px !important;
							stroke: currentColor !important;
							flex-shrink: 0 !important;
						}
						
						/* 代码内容区域 */
						.md-code-pre {
							margin: 0 !important;
							padding: 16px !important;
							overflow-x: auto !important;
							background: #1e1e1e !important;
							scrollbar-width: thin !important;
							scrollbar-color: rgba(255, 255, 255, 0.3) transparent !important;
						}
						
						.md-code-pre::-webkit-scrollbar {
							height: 6px !important;
						}
						
						.md-code-pre::-webkit-scrollbar-track {
							background: transparent !important;
						}
						
						.md-code-pre::-webkit-scrollbar-thumb {
							background: rgba(255, 255, 255, 0.3) !important;
							border-radius: 3px !important;
						}
						
						.md-code-pre::-webkit-scrollbar-thumb:hover {
							background: rgba(255, 255, 255, 0.5) !important;
						}
						
						/* 代码文本 */
						.md-code {
							font-family: Monaco, Menlo, Consolas, "Courier New", monospace !important;
							font-size: 14px !important;
							line-height: 1.5 !important;
							color: #e6e6e6 !important;
							white-space: pre !important;
							display: block !important;
							background: transparent !important;
							margin: 0 !important;
							padding: 0 !important;
						}
						
						/* 表格样式 */
						.md-table-wrapper {
							overflow-x: auto !important;
							margin: 16px 0 !important;
							border-radius: 8px !important;
							border: 1px solid #3d3d3d !important;
							background: rgba(255, 255, 255, 0.02) !important;
						}
						
						.md-table {
							width: 100% !important;
							border-collapse: collapse !important;
							font-size: 14px !important;
							line-height: 1.5 !important;
							background: transparent !important;
						}
						
						.md-table-head {
							background: rgba(255, 255, 255, 0.1) !important;
						}
						
						.md-table-header {
							padding: 12px 16px !important;
							text-align: left !important;
							font-weight: 600 !important;
							color: #fff !important;
							border-bottom: 2px solid #3d3d3d !important;
							border-right: 1px solid #3d3d3d !important;
							background: rgba(255, 255, 255, 0.1) !important;
						}
						
						.md-table-header:last-child {
							border-right: none !important;
						}
						
						.md-table-row {
							transition: background-color 0.2s ease !important;
						}
						
						.md-table-row:hover {
							background: rgba(255, 255, 255, 0.05) !important;
						}
						
						.md-table-cell {
							padding: 10px 16px !important;
							color: #fff !important;
							border-bottom: 1px solid #3d3d3d !important;
							border-right: 1px solid #3d3d3d !important;
							vertical-align: top !important;
						}
						
						.md-table-cell:last-child {
							border-right: none !important;
						}
						
						.md-table-body .md-table-row:last-child .md-table-cell {
							border-bottom: none !important;
						}
						
						/* 标题样式 */
						h1, h2, h3, h4, h5, h6 {
							font-weight: 600 !important;
							margin: 16px 0 8px 0 !important;
							line-height: 1.2 !important;
						}
						
						h1 { font-size: 24px !important; }
						h2 { font-size: 20px !important; }
						h3 { font-size: 18px !important; }
						h4 { font-size: 16px !important; }
						h5 { font-size: 15px !important; }
						h6 { font-size: 14px !important; }
						
						/* 段落 */
						p {
							margin: 8px 0 !important;
							line-height: 1.6 !important;
						}
					}
					
					.message-actions {
						display: flex;
						align-items: center;
						gap: 8px;
						margin-top: 8px;
						
						&.user-actions {
							justify-content: flex-end;
						}
						
						.action-btn-small {
							position: relative;
							width: 28px;
							height: 28px;
							border-radius: 14px;
							display: flex;
							align-items: center;
							justify-content: center;
							background: rgba(255, 255, 255, 0.1);
							cursor: pointer;
							transition: all 0.2s ease;
							
							&:hover {
								background: rgba(255, 255, 255, 0.2);
								transform: scale(1.1);
							}
							
							.action-icon {
								width: 12px;
								height: 12px;
								position: relative;
								
								&.copy-icon {
									&::before {
										content: '';
										position: absolute;
										width: 8px;
										height: 10px;
										border: 1px solid #aaa;
										border-radius: 1px;
										top: 1px;
										left: 2px;
									}
									&::after {
										content: '';
										position: absolute;
										width: 8px;
										height: 10px;
										border: 1px solid #aaa;
										border-radius: 1px;
										background: #2d2d2d;
										top: -1px;
										left: 0px;
									}
								}
								
								&.refresh-icon {
									&::before {
										content: '';
										position: absolute;
										width: 10px;
										height: 10px;
										border: 2px solid #aaa;
										border-top-color: transparent;
										border-radius: 50%;
										top: 1px;
										left: 1px;
									}
									&::after {
										content: '';
										position: absolute;
										width: 0;
										height: 0;
										border-left: 3px solid transparent;
										border-right: 3px solid transparent;
										border-bottom: 4px solid #aaa;
										top: -1px;
										left: 7px;
									}
								}
								
								&.like-icon {
									&::before {
										content: '';
										position: absolute;
										width: 6px;
										height: 6px;
										background: #aaa;
										border-radius: 50% 50% 50% 0;
										transform: rotate(-45deg);
										top: 2px;
										left: 3px;
									}
									&::after {
										content: '';
										position: absolute;
										width: 4px;
										height: 8px;
										background: #aaa;
										border-radius: 0 4px 4px 0;
										top: 2px;
										left: 6px;
									}
									
									&.liked {
										&::before,
										&::after {
											background: #ff4757;
										}
									}
								}
							}
							
							.tooltip {
								position: absolute;
								bottom: -40px;
								left: 50%;
								transform: translateX(-50%);
								background: rgba(255, 255, 255, 0.95);
								color: #1a1a1a;
								padding: 6px 10px;
								border-radius: 6px;
								font-size: 11px;
								white-space: nowrap;
								z-index: 10001;
								box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
								animation: tooltipFadeIn 0.2s ease-out;
								pointer-events: none;
								
								&::before {
									content: '';
									position: absolute;
									top: -4px;
									left: 50%;
									transform: translateX(-50%);
									border-left: 4px solid transparent;
									border-right: 4px solid transparent;
									border-bottom: 4px solid rgba(255, 255, 255, 0.95);
								}
							}
						}
					}
				}
			}
		}
		
		.message-time {
			text-align: center;
			margin: 16px 0;
			
			text {
				font-size: 12px;
				color: #888;
				background: rgba(255, 255, 255, 0.1);
				padding: 4px 12px;
				border-radius: 12px;
			}
		}
	}
}

/* 正在输入指示器 */
.typing-indicator {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 20px;
	
	.ai-avatar {
		width: 36px;
		height: 36px;
		border-radius: 16px;
		overflow: hidden;
		flex-shrink: 0;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		
		.icon-bg {
			position: absolute;
			inset: 0;
			border-radius: 16px;
			background: linear-gradient(135deg, #667eea, #764ba2);
			opacity: 1;
			transition: opacity 0.3s ease;
		}
		
		.avatar-emoji {
			position: relative;
			z-index: 1;
			font-size: 18px;
			line-height: 1;
		}
	}
	
	.typing-dots {
		display: flex;
		align-items: center;
		gap: 4px;
		background: #2d2d2d;
		padding: 12px 16px;
		border-radius: 20px 20px 20px 4px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
		border: 1px solid #3d3d3d;
		
		.dot {
			width: 8px;
			height: 8px;
			border-radius: 4px;
			background: #888;
			animation: typing 1.4s infinite ease-in-out;
			
			&:nth-child(1) { animation-delay: -0.32s; }
			&:nth-child(2) { animation-delay: -0.16s; }
		}
	}
}

@keyframes typing {
	0%, 80%, 100% {
		transform: scale(0.8);
		opacity: 0.5;
	}
	40% {
		transform: scale(1);
		opacity: 1;
	}
}

/* 发送按钮动画 */
@keyframes sendPulse {
	0% {
		transform: scale(1);
		box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
	}
	50% {
		transform: scale(1.15);
		box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
	}
	100% {
		transform: scale(1);
		box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
	}
}

@keyframes sendRipple {
	0% {
		width: 0;
		height: 0;
		opacity: 1;
	}
	100% {
		width: 200%;
		height: 200%;
		opacity: 0;
	}
}

@keyframes sendIcon {
	0% {
		transform: translateX(0) scale(1);
	}
	30% {
		transform: translateX(3px) scale(1.2) rotate(10deg);
	}
	60% {
		transform: translateX(-1px) scale(0.9) rotate(-5deg);
	}
	100% {
		transform: translateX(0) scale(1) rotate(0deg);
	}
}

/* 返回按钮动画 */
@keyframes backButtonHover {
	0% {
		transform: translateX(0);
	}
	50% {
		transform: translateX(-3px);
	}
	100% {
		transform: translateX(-2px);
	}
}

/* 消息进入动画 */
@keyframes messageSlideIn {
	0% {
		opacity: 0;
		transform: translateY(20px) scale(0.95);
	}
	100% {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

/* 页面加载动画 */
@keyframes fadeInUp {
	0% {
		opacity: 0;
		transform: translateY(30px);
	}
	100% {
		opacity: 1;
		transform: translateY(0);
	}
}

/* 头像脉冲动画 */
@keyframes avatarPulse {
	0%, 100% {
		box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
		transform: scale(1);
	}
	50% {
		box-shadow: 0 12px 40px rgba(102, 126, 234, 0.5);
		transform: scale(1.05);
	}
}

/* 输入区域 */
.input-container {
	padding: 16px;
	background: #2d2d2d;
	border-top: 1px solid #3d3d3d;
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 100;
	animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
	
	.input-wrapper {
		background: #1a1a1a;
		border-radius: 24px;
		padding: 12px 16px;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
		border: 1px solid #3d3d3d;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		
		&:focus-within {
			border-color: rgba(102, 126, 234, 0.5);
			box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(102, 126, 234, 0.2);
			transform: translateY(-2px);
		}
		
		.input-toolbar {
			display: flex;
			align-items: center;
			gap: 8px;
			margin-bottom: 8px;
			
			.deep-think-btn {
				display: flex;
				align-items: center;
				gap: 5px;
				padding: 4px 10px;
				border-radius: 16px;
				border: 1px solid rgba(255, 255, 255, 0.15);
				background: rgba(255, 255, 255, 0.06);
				cursor: pointer;
				transition: all 0.2s ease;
				
				.deep-think-icon { font-size: 13px; }
				.deep-think-label {
					font-size: 12px;
					color: rgba(255, 255, 255, 0.5);
					white-space: nowrap;
				}
				
				&:hover {
					background: rgba(102, 126, 234, 0.12);
					border-color: rgba(102, 126, 234, 0.3);
					.deep-think-label { color: #a78bfa; }
				}
				
				&.active {
					background: rgba(102, 126, 234, 0.18);
					border-color: rgba(102, 126, 234, 0.5);
					box-shadow: 0 0 8px rgba(102, 126, 234, 0.2);
					.deep-think-label { color: #a78bfa; font-weight: 500; }
				}
			}
		}
		
		.message-input {
			width: 100%;
			min-height: 20px;
			max-height: 120px;
			font-size: 15px;
			line-height: 1.4;
			color: #fff;
			background: transparent;
			border: none;
			outline: none;
			resize: none;
			overflow-y: auto;
			scrollbar-width: thin;
			scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
			
			/* 自定义滚动条样式 */
			&::-webkit-scrollbar {
				width: 6px;
			}
			
			&::-webkit-scrollbar-track {
				background: transparent;
			}
			
			&::-webkit-scrollbar-thumb {
				background: rgba(255, 255, 255, 0.3);
				border-radius: 3px;
				
				&:hover {
					background: rgba(255, 255, 255, 0.5);
				}
			}
		}
		
		.input-actions {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-top: 8px;
			
			.char-count {
				font-size: 12px;
				color: #888;
			}
			
			.send-btn {
				width: 36px;
				height: 36px;
				border-radius: 18px;
				background: linear-gradient(135deg, #667eea, #764ba2);
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				opacity: 0.5;
				position: relative;
				overflow: hidden;
				
				&::before {
					content: '';
					position: absolute;
					top: 50%;
					left: 50%;
					width: 0;
					height: 0;
					background: rgba(255, 255, 255, 0.2);
					border-radius: 50%;
					transform: translate(-50%, -50%);
					transition: all 0.4s ease;
				}
				
				&::after {
					content: '';
					position: absolute;
					top: 50%;
					left: 50%;
					width: 0;
					height: 0;
					background: rgba(255, 255, 255, 0.4);
					border-radius: 50%;
					transform: translate(-50%, -50%);
					transition: all 0.6s ease;
					opacity: 0;
				}
				
				&.active {
					opacity: 1;
					box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
					
					&:hover {
						transform: scale(1.1) rotate(5deg);
						box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
						background: linear-gradient(135deg, #7c8cff, #8a5cb8);
						
						&::before {
							width: 120%;
							height: 120%;
						}
						
						.send-icon {
							transform: translateX(2px) scale(1.1);
						}
					}
					
					&:active {
						transform: scale(0.9) rotate(-2deg);
						transition: all 0.1s ease;
						
						.send-icon {
							transform: translateX(1px) scale(0.9);
						}
					}
				}
				
				&.sending {
					animation: sendPulse 0.6s ease-out;
					
					&::after {
						width: 200%;
						height: 200%;
						opacity: 1;
						animation: sendRipple 0.6s ease-out;
					}
					
					.send-icon {
						animation: sendIcon 0.6s ease-out;
					}
				}
				
				&:not(.active) {
					&:hover {
						opacity: 0.7;
						transform: scale(1.02);
					}
				}
				
				.send-icon {
					font-size: 16px;
					color: white;
					transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
					z-index: 1;
					position: relative;
				}
			}
		}
	}
}

/* 会话列表弹窗 */
.conversation-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.7);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	backdrop-filter: blur(5px);
	
	.modal-content {
		width: 90%;
		max-width: 500px;
		max-height: 80vh;
		background: #2d2d2d;
		border-radius: 16px;
		overflow: hidden;
		border: 1px solid #3d3d3d;
		display: flex;
		flex-direction: column;
		
		.modal-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 20px;
			border-bottom: 1px solid #3d3d3d;
			
			.modal-title {
				font-size: 18px;
				font-weight: 600;
				color: #fff;
			}
			
			.close-btn {
				width: 28px;
				height: 28px;
				border-radius: 14px;
				display: flex;
				align-items: center;
				justify-content: center;
				background: rgba(255, 255, 255, 0.1);
				font-size: 16px;
				color: #fff;
				cursor: pointer;
			}
		}
		
		.conversation-list {
			flex: 1;
			overflow-y: auto;
			min-height: 0;
			
			.conversation-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 16px 20px;
				border-bottom: 1px solid #3d3d3d;
				cursor: pointer;
				transition: background 0.2s ease;
				
				&:hover {
					background: #3d3d3d;
				}
				
				&.active {
					background: rgba(102, 126, 234, 0.2);
				}
				
				.conv-info {
					flex: 1;
					
					.conv-title {
						display: block;
						font-size: 15px;
						font-weight: 500;
						color: #fff;
						margin-bottom: 4px;
					}
					
					.conv-preview {
						display: block;
						font-size: 13px;
						color: #aaa;
						line-height: 1.3;
					}
				}
				
				.conv-meta {
					display: flex;
					align-items: center;
					gap: 8px;
					
					.conv-time {
						font-size: 12px;
						color: #888;
					}
					
					.delete-btn {
						position: relative;
						width: 24px;
						height: 24px;
						border-radius: 12px;
						display: flex;
						align-items: center;
						justify-content: center;
						background: rgba(255, 71, 87, 0.2);
						cursor: pointer;
						transition: all 0.2s ease;
						
						&:hover {
							background: rgba(255, 71, 87, 0.3);
							transform: scale(1.1);
						}
						
						.delete-icon {
							width: 12px;
							height: 12px;
							position: relative;
							
							&::before {
								content: '';
								position: absolute;
								width: 8px;
								height: 10px;
								border: 1px solid #ff4757;
								border-top: none;
								border-radius: 0 0 2px 2px;
								top: 3px;
								left: 2px;
							}
							&::after {
								content: '';
								position: absolute;
								width: 10px;
								height: 2px;
								background: #ff4757;
								border-radius: 1px;
								top: 1px;
								left: 1px;
								box-shadow: 0 1px 0 #ff4757;
							}
						}
						
						.tooltip {
							position: absolute;
							bottom: -40px;
							left: 50%;
							transform: translateX(-50%);
							background: rgba(255, 255, 255, 0.95);
							color: #1a1a1a;
							padding: 6px 10px;
							border-radius: 6px;
							font-size: 11px;
							white-space: nowrap;
							z-index: 10001;
							box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
							animation: tooltipFadeIn 0.2s ease-out;
							pointer-events: none;
							
							&::before {
								content: '';
								position: absolute;
								top: -4px;
								left: 50%;
								transform: translateX(-50%);
								border-left: 4px solid transparent;
								border-right: 4px solid transparent;
								border-bottom: 4px solid rgba(255, 255, 255, 0.95);
							}
						}
					}
				}
			}
		}
		
		.modal-footer {
			padding: 16px 20px;
			border-top: 1px solid #3d3d3d;
			flex-shrink: 0;
			
			.new-chat-btn {
				width: 100%;
				height: 44px;
				border-radius: 22px;
				background: linear-gradient(135deg, #667eea, #764ba2);
				display: flex;
				align-items: center;
				justify-content: center;
				color: white;
				font-size: 15px;
				font-weight: 500;
				cursor: pointer;
			}
		}
	}
}

/* 快捷键帮助弹窗 */
.shortcut-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.7);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	backdrop-filter: blur(5px);
	
	.modal-content {
		width: 90%;
		max-width: 500px;
		background: #2d2d2d;
		border-radius: 16px;
		overflow: hidden;
		border: 1px solid #3d3d3d;
		
		.modal-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 20px;
			border-bottom: 1px solid #3d3d3d;
			
			.modal-title {
				font-size: 18px;
				font-weight: 600;
				color: #fff;
			}
			
			.close-btn {
				width: 28px;
				height: 28px;
				border-radius: 14px;
				display: flex;
				align-items: center;
				justify-content: center;
				background: rgba(255, 255, 255, 0.1);
				font-size: 16px;
				color: #fff;
				cursor: pointer;
			}
		}
		
		.shortcut-list {
			padding: 20px;
			
			.shortcut-item {
				display: flex;
				align-items: center;
				gap: 16px;
				padding: 12px 0;
				border-bottom: 1px solid rgba(255, 255, 255, 0.1);
				
				&:last-child {
					border-bottom: none;
				}
				
				.shortcut-key {
					font-family: var(--md-code-font-family);
					font-size: 10px;
					color: #f8b500;
					background: rgba(255, 255, 255, 0.1);
					padding: 6px 12px;
					border-radius: 4px;
					min-width: 140px;
					text-align: center;
					flex-shrink: 0;
				}
				
				.shortcut-desc {
					font-size: 14px;
					color: #aaa;
					flex: 1;
					text-align: left;
				}
			}
		}
	}
}

/* 右键菜单 */
.context-menu {
	position: fixed;
	background: #2d2d2d;
	border: 1px solid #3d3d3d;
	border-radius: 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	z-index: 10000;
	overflow: hidden;
	min-width: 160px;
	
	.context-menu-item {
		display: flex;
		align-items: center;
		padding: 12px 16px;
		cursor: pointer;
		transition: background 0.2s ease;
		
		&:hover {
			background: #3d3d3d;
		}
		
		.menu-icon {
			width: 16px;
			height: 16px;
			margin-right: 12px;
			position: relative;
			
			&.copy-icon {
				&::before {
					content: '';
					position: absolute;
					width: 10px;
					height: 12px;
					border: 1px solid #aaa;
					border-radius: 1px;
					top: 2px;
					left: 3px;
				}
				&::after {
					content: '';
					position: absolute;
					width: 10px;
					height: 12px;
					border: 1px solid #aaa;
					border-radius: 1px;
					background: #2d2d2d;
					top: 0px;
					left: 1px;
				}
			}
		}
		
		.menu-text {
			font-size: 14px;
			color: #fff;
		}
	}
}

/* 响应式设计 */
@media (max-width: 768px) {
	.chat-header {
		padding: 8px 12px;
		
		.header-left {
			gap: 8px;
			
			.back-btn {
				width: 32px;
				height: 32px;
				margin-right: 8px;
				
				.back-icon {
					font-size: 16px;
				}
			}
			
			.chat-info {
				.chat-title {
					font-size: 14px;
				}
				
				.chat-subtitle {
					font-size: 11px;
				}
			}
		}
		
		.header-right {
			gap: 6px;
			
			.model-selector {
				padding: 5px 10px;
				margin-right: 4px;
				
				.model-name {
					font-size: 12px;
				}
				
				.dropdown-arrow {
					font-size: 9px;
				}
				
				.model-dropdown {
					min-width: 240px;
					max-width: calc(100vw - 40px);
					max-height: 60vh;
					left: 0;
					right: auto;
					overflow-y: auto;
					
					.model-option {
						padding: 10px 12px;
						
						.model-info {
							.option-name {
								font-size: 13px;
							}
							
							.option-desc {
								font-size: 11px;
								line-height: 1.3;
							}
						}
						
						.model-status {
							.option-badge {
								font-size: 10px;
								padding: 3px 6px;
								
								&.active {
									font-size: 12px;
								}
							}
						}
					}
					
					.sub-model-option {
						padding: 8px 12px 8px 24px;
						
						.sub-option-name { font-size: 12px; }
						.sub-option-desc { font-size: 10px; }
					}
				}
			}
			
			.action-btn {
				width: 32px;
				height: 32px;
				
				.icon-wrapper .icon {
					width: 14px;
					height: 14px;
				}
				
				.tooltip {
					font-size: 11px;
					padding: 6px 8px;
				}
			}
		}
	}
	
	.welcome-section {
		padding: 30px 16px;
		
		.quick-prompts {
			grid-template-columns: 1fr;
		}
	}
	
	.messages-list {
		padding: 16px;
		
		.message-item {
			&.user-message .user-message-wrapper .message-content,
			&.ai-message .ai-message-wrapper .message-content {
				max-width: 85%;
			}
		}
	}
}

/* 技能面板 */
.skills-panel {
	position: absolute;
	top: 60px;
	right: 16px;
	width: 360px;
	max-height: 480px;
	background: #2d2d2d;
	border: 1px solid #3d3d3d;
	border-radius: 12px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
	z-index: 1001;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	
	.skills-panel-header {
		display: flex;
		align-items: center;
		padding: 14px 16px;
		border-bottom: 1px solid #3d3d3d;
		gap: 10px;
		flex-shrink: 0;
		
		.skills-panel-title {
			font-size: 15px;
			font-weight: 600;
			color: #fff;
			flex-shrink: 0;
		}
		
		.skills-total-toggle {
			display: flex;
			align-items: center;
			gap: 8px;
			flex: 1;
			
			.skills-count {
				font-size: 12px;
				color: #888;
			}
			
			.toggle-switch {
				width: 36px;
				height: 20px;
				border-radius: 10px;
				background: #555;
				position: relative;
				cursor: pointer;
				transition: background 0.3s ease;
				flex-shrink: 0;
				
				&.on {
					background: #667eea;
				}
				
				.toggle-thumb {
					position: absolute;
					width: 16px;
					height: 16px;
					border-radius: 50%;
					background: #fff;
					top: 2px;
					left: 2px;
					transition: left 0.3s ease;
					box-shadow: 0 1px 4px rgba(0,0,0,0.3);
				}
				
				&.on .toggle-thumb {
					left: 18px;
				}
			}
			
			.toggle-label {
				font-size: 12px;
				color: #aaa;
			}
		}
		
		.skills-close-btn {
			width: 24px;
			height: 24px;
			border-radius: 12px;
			display: flex;
			align-items: center;
			justify-content: center;
			background: rgba(255, 255, 255, 0.1);
			color: #aaa;
			font-size: 16px;
			cursor: pointer;
			flex-shrink: 0;
			
			&:hover {
				background: rgba(255, 255, 255, 0.2);
				color: #fff;
			}
		}
	}
	
	.skills-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 30px;
		
		.loading-dot {
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: #667eea;
			animation: loadingDot 1.4s infinite ease-in-out;
			
			&:nth-child(1) { animation-delay: -0.32s; }
			&:nth-child(2) { animation-delay: -0.16s; }
			&:nth-child(3) { animation-delay: 0s; }
		}
	}
	
	.skills-list {
		flex: 1;
		overflow-y: auto;
		max-height: 380px;
		
		.skill-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 12px 16px;
			border-bottom: 1px solid rgba(255, 255, 255, 0.06);
			transition: background 0.2s ease;
			position: relative;
			cursor: pointer;
			
			&:last-child {
				border-bottom: none;
			}
			
			&:hover {
				background: rgba(255, 255, 255, 0.05);
			}
			
			.skill-item-left {
				display: flex;
				align-items: flex-start;
				gap: 10px;
				flex: 1;
				min-width: 0;
				
				.skill-icon-wrap {
					width: 32px;
					height: 32px;
					border-radius: 8px;
					background: rgba(102, 126, 234, 0.15);
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
					
					.skill-emoji {
						font-size: 16px;
					}
				}
				
				.skill-info {
					flex: 1;
					min-width: 0;
					
					.skill-name {
						display: block;
						font-size: 14px;
						font-weight: 500;
						color: #fff;
						margin-bottom: 2px;
					}
					
					.skill-desc {
						display: block;
						font-size: 12px;
						color: #888;
						line-height: 1.4;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
						margin-bottom: 4px;
					}
					
					.skill-meta {
						display: flex;
						gap: 6px;
						
						.skill-version {
							font-size: 11px;
							color: #667eea;
							background: rgba(102, 126, 234, 0.15);
							padding: 1px 6px;
							border-radius: 4px;
						}
						
						.skill-category {
							font-size: 11px;
							color: #888;
							background: rgba(255, 255, 255, 0.08);
							padding: 1px 6px;
							border-radius: 4px;
						}
					}
				}
			}
			
			.skill-status {
				font-size: 11px;
				padding: 3px 8px;
				border-radius: 10px;
				background: rgba(255, 255, 255, 0.08);
				color: #888;
				flex-shrink: 0;
				margin-left: 8px;
				
				&.enabled {
					background: rgba(76, 175, 80, 0.15);
					color: #4CAF50;
				}
			}
			
			.skill-actions {
				flex-shrink: 0;
				margin-left: 8px;
				
				.skill-toggle-btn {
					font-size: 11px;
					padding: 4px 10px;
					border-radius: 10px;
					cursor: pointer;
					transition: all 0.2s ease;
					font-weight: 500;
					
					&.btn-disable {
						background: rgba(255, 71, 87, 0.12);
						border: 1px solid rgba(255, 71, 87, 0.3);
						color: #ff6b7a;
						
						&:hover {
							background: rgba(255, 71, 87, 0.22);
						}
					}
					
					&.btn-enable {
						background: rgba(76, 175, 80, 0.12);
						border: 1px solid rgba(76, 175, 80, 0.3);
						color: #4CAF50;
						
						&:hover {
							background: rgba(76, 175, 80, 0.22);
						}
					}
				}
			}
			
			.skill-tooltip {
				position: absolute;
				left: 12px;
				right: 12px;
				bottom: calc(100% + 6px);
				background: #1a1a1a;
				border: 1px solid rgba(102, 126, 234, 0.4);
				border-radius: 10px;
				padding: 12px 14px;
				z-index: 10;
				box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
				
				&.tooltip-down {
					bottom: auto;
					top: calc(100% + 6px);
					
					.skill-tooltip-arrow {
						bottom: auto;
						top: -7px;
						transform: rotate(225deg);
					}
				}
				
				.skill-tooltip-arrow {
					position: absolute;
					bottom: -7px;
					left: 24px;
					width: 12px;
					height: 12px;
					background: #1a1a1a;
					border-right: 1px solid rgba(102, 126, 234, 0.4);
					border-bottom: 1px solid rgba(102, 126, 234, 0.4);
					transform: rotate(45deg);
				}
				
				.skill-tooltip-name {
					display: block;
					font-size: 13px;
					font-weight: 600;
					color: #667eea;
					margin-bottom: 6px;
				}
				
				.skill-tooltip-desc {
					display: block;
					font-size: 13px;
					color: #ddd;
					line-height: 1.5;
					margin-bottom: 8px;
					white-space: normal;
					word-break: break-word;
				}
				
				.skill-tooltip-tags {
					display: flex;
					flex-wrap: wrap;
					gap: 4px;
					margin-bottom: 8px;
					
					.skill-tag {
						font-size: 11px;
						padding: 2px 7px;
						border-radius: 8px;
						background: rgba(102, 126, 234, 0.2);
						color: #667eea;
					}
				}
				
				.skill-tooltip-meta {
					display: flex;
					gap: 12px;
					
					text {
						font-size: 11px;
						color: #888;
					}
				}
			}
		}
		
		.skills-empty {
			text-align: center;
			padding: 30px;
			color: #888;
			font-size: 14px;
		}
	}
}

@media (max-width: 768px) {
	.skills-panel {
		right: 8px;
		width: calc(100vw - 16px);
		max-width: 360px;
	}
}

/* 技能调用动画 */
@keyframes spin {
	to { transform: rotate(360deg); }
}

@keyframes skillIconRotate {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

@keyframes loadingDot {
	0%, 80%, 100% {
		transform: scale(0.8);
		opacity: 0.5;
	}
	40% {
		transform: scale(1.2);
		opacity: 1;
	}
}
</style> 

<style>
/* Enhanced Markdown Styles - Global styles for v-html content */
/* #ifdef H5 */
:root {
  --md-text-color: #fff;
  --md-background-color: #1a1a1a;
  --md-code-background: #1e1e1e;
  --md-accent-color: #667eea;
  --md-border-color: #3d3d3d;
  --md-link-color: #6db3f2;
  --md-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --md-code-font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
  --md-spacing-small: 8px;
  --md-spacing-medium: 16px;
  --md-spacing-large: 24px;
}

/* 文本选择样式 */
::selection {
  background: rgba(102, 126, 234, 0.3);
  color: #fff;
}

::-moz-selection {
  background: rgba(102, 126, 234, 0.3);
  color: #fff;
}
/* #endif */

/* 确保所有markdown内容都可以被选择 */
.md-header,
.md-paragraph,
.md-code-block,
.md-code,
.md-inline-code,
.md-list,
.md-list-item,
.md-blockquote,
.md-bold,
.md-italic,
.md-strikethrough,
.md-link,
.md-table,
.md-table-cell {
  user-select: text !important;
}

/* Markdown Headers */
.md-header {
  color: var(--md-text-color) !important;
  font-family: var(--md-font-family) !important;
  font-weight: 600 !important;
  line-height: 1.2 !important;
  margin: var(--md-spacing-medium) 0 var(--md-spacing-small) 0 !important;
}

.md-h1 { font-size: 24px !important; margin-top: var(--md-spacing-large) !important; }
.md-h2 { font-size: 20px !important; margin-top: var(--md-spacing-large) !important; }
.md-h3 { font-size: 18px !important; margin-top: var(--md-spacing-medium) !important; }
.md-h4 { font-size: 16px !important; margin-top: var(--md-spacing-medium) !important; }
.md-h5 { font-size: 15px !important; margin-top: var(--md-spacing-small) !important; }
.md-h6 { font-size: 14px !important; margin-top: var(--md-spacing-small) !important; }

/* Markdown Paragraphs */
.md-paragraph {
  color: var(--md-text-color) !important;
  font-family: var(--md-font-family) !important;
  line-height: 1.6 !important;
  margin: var(--md-spacing-small) 0 !important;
}

/* Code Blocks */
.md-code-block {
  background: var(--md-code-background) !important;
  border-radius: 8px !important;
  margin: var(--md-spacing-medium) 0 !important;
  overflow: hidden !important;
  border: 1px solid var(--md-border-color) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
  position: relative !important;
}

.md-code-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  background: rgba(255, 255, 255, 0.08) !important;
  border-bottom: 1px solid var(--md-border-color) !important;
  padding: 8px 12px !important;
  min-height: 36px !important;
}

.md-code-lang {
  font-size: 12px !important;
  color: #aaa !important;
  font-weight: 500 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  font-family: var(--md-code-font-family) !important;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}

.md-code-copy {
  background: transparent !important;
  border: none !important;
  color: #aaa !important;
  cursor: pointer !important;
  padding: 6px 8px !important;
  border-radius: 4px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 4px !important;
  transition: all 0.2s ease !important;
  opacity: 0.7 !important;
  font-size: 12px !important;
  min-width: 60px !important;
  white-space: nowrap !important;
}

.md-code-copy:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
  opacity: 1 !important;
  transform: scale(1.05) !important;
}

.md-code-copy:active {
  transform: scale(0.95) !important;
}

.md-code-copy svg {
  width: 14px !important;
  height: 14px !important;
  stroke: currentColor !important;
  flex-shrink: 0 !important;
}

.md-code-pre {
  margin: 0 !important;
  padding: 16px !important;
  overflow-x: auto !important;
  background: var(--md-code-background) !important;
  
  /* 自定义滚动条 */
  scrollbar-width: thin !important;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent !important;
}

.md-code-pre::-webkit-scrollbar {
  height: 6px !important;
}

.md-code-pre::-webkit-scrollbar-track {
  background: transparent !important;
}

.md-code-pre::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3) !important;
  border-radius: 3px !important;
}

.md-code-pre::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5) !important;
}

.md-code {
  font-family: var(--md-code-font-family) !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  color: #e6e6e6 !important;
  white-space: pre !important;
  display: block !important;
  background: transparent !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Highlight.js 深色主题样式 */
.hljs {
  background: transparent !important;
  color: #e6e6e6 !important;
}

/* 关键字 */
.hljs-keyword,
.hljs-selector-tag,
.hljs-literal,
.hljs-section,
.hljs-link {
  color: #c792ea !important;
}

/* 字符串 */
.hljs-string {
  color: #c3e88d !important;
}

/* 数字 */
.hljs-number {
  color: #f78c6c !important;
}

/* 注释 */
.hljs-comment,
.hljs-quote {
  color: #546e7a !important;
  font-style: italic !important;
}

/* 函数名 */
.hljs-function .hljs-title,
.hljs-title.function_ {
  color: #82aaff !important;
}

/* 变量 */
.hljs-variable,
.hljs-template-variable {
  color: #eeffff !important;
}

/* 类型 */
.hljs-type,
.hljs-class .hljs-title {
  color: #ffcb6b !important;
}

/* 属性 */
.hljs-property,
.hljs-attribute {
  color: #c792ea !important;
}

/* 标签 */
.hljs-tag {
  color: #f07178 !important;
}

/* 标签名 */
.hljs-name {
  color: #f07178 !important;
}

/* 操作符 */
.hljs-operator,
.hljs-punctuation {
  color: #89ddff !important;
}

/* 内置函数 */
.hljs-built_in,
.hljs-builtin-name {
  color: #ffcb6b !important;
}

/* 正则表达式 */
.hljs-regexp {
  color: #c3e88d !important;
}

/* 符号 */
.hljs-symbol {
  color: #c792ea !important;
}

/* 元数据 */
.hljs-meta {
  color: #ffcb6b !important;
}

/* 删除 */
.hljs-deletion {
  background: rgba(255, 0, 0, 0.2) !important;
}

/* 添加 */
.hljs-addition {
  background: rgba(0, 255, 0, 0.2) !important;
}

/* 强调 */
.hljs-emphasis {
  font-style: italic !important;
}

/* 加粗 */
.hljs-strong {
  font-weight: bold !important;
}

/* Inline Code */
.md-inline-code {
  background: rgba(255, 255, 255, 0.15) !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
  font-family: var(--md-code-font-family) !important;
  font-size: 13px !important;
  color: #f8b500 !important;
}

/* Lists */
.md-list {
  margin: var(--md-spacing-small) 0 !important;
  padding-left: 20px !important;
  color: var(--md-text-color) !important;
}

.md-list-item {
  margin: 4px 0 !important;
  padding-left: 8px !important;
  line-height: 1.5 !important;
  color: var(--md-text-color) !important;
}

.md-ordered-list .md-list-item {
  list-style-type: decimal !important;
}

.md-unordered-list .md-list-item {
  list-style-type: disc !important;
}

/* Blockquotes */
.md-blockquote {
  border-left: 4px solid var(--md-accent-color) !important;
  padding-left: 12px !important;
  margin: var(--md-spacing-small) 0 !important;
  color: #aaa !important;
  font-style: italic !important;
  background: rgba(255, 255, 255, 0.05) !important;
  padding: var(--md-spacing-small) var(--md-spacing-small) var(--md-spacing-small) 12px !important;
  border-radius: 0 4px 4px 0 !important;
}

/* Emphasis */
.md-bold {
  font-weight: 600 !important;
  color: var(--md-text-color) !important;
}

.md-italic {
  font-style: italic !important;
  color: var(--md-text-color) !important;
}

.md-strikethrough {
  text-decoration: line-through !important;
  opacity: 0.7 !important;
  color: #aaa !important;
}

/* Links */
.md-link {
  color: var(--md-link-color) !important;
  text-decoration: underline !important;
  transition: opacity 0.2s ease !important;
}

.md-link:hover {
  opacity: 0.8 !important;
}

/* Tables */
.md-table-wrapper {
  overflow-x: auto !important;
  margin: var(--md-spacing-medium) 0 !important;
  border-radius: 8px !important;
  border: 1px solid var(--md-border-color) !important;
  background: rgba(255, 255, 255, 0.02) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

.md-table {
  width: 100% !important;
  border-collapse: collapse !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  background: transparent !important;
}

.md-table-head {
  background: rgba(255, 255, 255, 0.1) !important;
}

.md-table-header {
  padding: 12px 16px !important;
  text-align: left !important;
  font-weight: 600 !important;
  color: var(--md-text-color) !important;
  border-bottom: 2px solid var(--md-border-color) !important;
  border-right: 1px solid var(--md-border-color) !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

.md-table-header:last-child {
  border-right: none !important;
}

.md-table-row {
  transition: background-color 0.2s ease !important;
}

.md-table-row:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

.md-table-cell {
  padding: 10px 16px !important;
  color: var(--md-text-color) !important;
  border-bottom: 1px solid var(--md-border-color) !important;
  border-right: 1px solid var(--md-border-color) !important;
  vertical-align: top !important;
}

.md-table-cell:last-child {
  border-right: none !important;
}

.md-table-body .md-table-row:last-child .md-table-cell {
  border-bottom: none !important;
}

/* 确保表格在消息气泡中正确显示 */
.ai-bubble .md-table-wrapper {
  margin: 12px 0 !important;
}

.ai-bubble .md-table-header,
.ai-bubble .md-table-cell {
  color: #fff !important;
}

/* 确保代码块在消息气泡中正确显示 */
.ai-bubble .md-code-block {
  margin: 12px 0 !important;
}

.ai-bubble .md-code {
  color: #e6e6e6 !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .md-h1 { font-size: 20px !important; }
  .md-h2 { font-size: 18px !important; }
  .md-h3 { font-size: 16px !important; }
  .md-h4 { font-size: 15px !important; }
  .md-h5 { font-size: 14px !important; }
  .md-h6 { font-size: 13px !important; }
  
  .md-code-pre {
    padding: 12px !important;
  }
  
  .md-code {
    font-size: 13px !important;
  }
  
  .md-table-wrapper {
    font-size: 12px !important;
  }
  
  .md-table-header,
  .md-table-cell {
    padding: 8px 12px !important;
  }
}
</style>  