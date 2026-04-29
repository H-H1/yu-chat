<template>
	<view class="ai-image-container" :class="{ 'page-loaded': pageLoaded }">
		<!-- 顶部导航栏 -->
		<view class="image-header">
			<view class="header-left">
				<view class="back-btn" @click="goBack">
					<text class="back-icon">←</text>
				</view>
				<view class="page-info">
					<text class="page-title">AI 绘图</text>
					<text class="page-subtitle">创意无限，艺术生成</text>
				</view>
				
				<!-- 会话选择器 -->
				<view class="session-selector" @click="toggleSessionSelector">
					<text class="session-name">{{ currentSession?.name || '记录' }}</text>
					<view class="dropdown-arrow" :class="{ 'open': showSessionSelector }">▼</view>
					
					<!-- 会话选择下拉列表 -->
					<view class="session-dropdown" v-if="showSessionSelector" @click.stop>
						<view class="session-header">
							<text class="dropdown-title">选择记录</text>
							<view class="new-session-btn" @click="createNewSession">
								<text>+ 新建</text>
							</view>
						</view>
						<view class="session-list">
							<view v-for="session in sessions" :key="session.id" 
								class="session-option" 
								:class="{ 'active': session.id === currentSessionId }">
								<view class="session-info" @click="selectSession(session.id)">
									<text class="session-option-name">{{ session.name }}</text>
									<text class="session-count">{{ session.images.length }} 张图片</text>
								</view>
								<view class="delete-session-btn" @click.stop="deleteSession(session.id)" v-if="sessions.length > 1">
									<text>×</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="header-right">
				<view class="model-selector" @click="toggleModelSelector">
					<text class="model-name">{{ currentModel.name }}</text>
					<view class="dropdown-arrow" :class="{ 'open': showModelSelector }">▼</view>
					
					<!-- 模型选择下拉列表 -->
					<view class="model-dropdown" v-if="showModelSelector" @click.stop>
						<view v-for="model in availableModels" :key="model.id" 
							class="model-option disabled" 
							:class="{ 'active': model.id === currentModel.id }">
							<view class="model-info">
								<text class="option-name">{{ model.name }}</text>
								<text class="option-desc">{{ model.description }}</text>
							</view>
							<view class="model-status">
								<view v-if="model.id === currentModel.id" class="option-badge active">✓</view>
								<text v-else class="disabled-text">暂不可用</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 主内容区域 -->
		<view class="main-content">
			<!-- 对话展示区域 -->
			<view class="chat-container">
				<!-- 欢迎区域 -->
				<view class="welcome-section" v-if="currentSessionImages.length === 0">
					<view class="welcome-icon">
						<text class="icon-emoji">🎨</text>
					</view>
					<text class="welcome-title">AI 绘图工作室</text>
					<text class="welcome-subtitle">描述您的创意，让AI为您创作独特的艺术作品</text>
				</view>

				<!-- 对话消息列表 -->
				<view class="message-list" v-if="currentSessionImages.length > 0">
					<view v-for="(image, index) in currentSessionImages" :key="image.id" class="message-group">
						<!-- 用户提示词消息 -->
						<view class="message-item user-message">
							<view class="message-content">
								<view class="message-bubble user-bubble">
									<text class="message-text">{{ image.prompt }}</text>
								</view>
							</view>
						</view>
						
						<!-- AI生成的图片消息 -->
						<view class="message-item ai-message">
							<view class="message-content">
								<view class="image-card" @click="previewImage(image)">
									<!-- #ifdef H5 -->
									<img :src="image.url" class="generated-image" />
									<!-- #endif -->
									<!-- #ifndef H5 -->
									<image :src="image.url" mode="aspectFit" class="generated-image"></image>
									<!-- #endif -->
									<view class="image-overlay">
										<view class="image-actions">
											<view class="action-btn" @click.stop="downloadImage(image)">
												<text class="action-icon">⬇</text>
											</view>
											<view class="action-btn" @click.stop="shareImage(image)">
												<text class="action-icon">📤</text>
											</view>
										</view>
									</view>
									<view class="image-meta">
										<text class="image-size">{{ image.size }}</text>
										<text class="image-time">{{ formatTime(image.createdAt) }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部输入区域 -->
		<view class="input-section">
			<view class="input-container">
				<view class="prompt-input-wrapper">
					<textarea 
						class="prompt-input" 
						v-model="promptText" 
						placeholder="描述您想要生成的图片，例如：一只可爱的小猫坐在彩虹上..."
						:maxlength="500"
						@input="onPromptInput"
					></textarea>
					<view class="input-footer">
						<view class="footer-left">
							<view class="size-selector" @click="toggleSizeSelector">
								<text class="size-label">尺寸: {{ selectedSize }}</text>
								<view class="dropdown-arrow" :class="{ 'open': showSizeSelector }">▼</view>
								
								<!-- 尺寸选择下拉列表 -->
								<view class="size-dropdown" v-if="showSizeSelector" @click.stop>
									<view v-for="size in availableSizes" :key="size.value" 
										class="size-option" 
										:class="{ 'active': size.value === selectedSize }"
										@click="selectSize(size.value)">
										<view class="size-info">
											<text class="size-value">{{ size.label }}</text>
											<text class="size-desc">{{ size.desc }}</text>
										</view>
										<view v-if="size.value === selectedSize" class="size-check">✓</view>
									</view>
								</view>
							</view>
							<view class="char-count">{{ promptText.length }}/500</view>
						</view>
						<view class="generate-btn" 
							:class="{ 'active': canGenerate, 'loading': isGenerating }"
							@click="generateImage">
							<text class="btn-text">{{ isGenerating ? '生成中...' : '生成' }}</text>
							<view class="btn-icon" v-if="!isGenerating">🎨</view>
							<view class="loading-spinner" v-if="isGenerating"></view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 图片预览弹窗 -->
		<view class="image-preview-modal" v-if="showPreview" @click="closePreview">
			<view class="preview-content" @click.stop>
				<view class="preview-header">
					<text class="preview-title">图片预览</text>
					<view class="close-btn" @click="closePreview">
						<text>×</text>
					</view>
				</view>
				<view class="preview-image-container">
					<!-- #ifdef H5 -->
					<img :src="previewImageData.url" class="preview-image" />
					<!-- #endif -->
					<!-- #ifndef H5 -->
					<image :src="previewImageData.url" mode="aspectFit" class="preview-image"></image>
					<!-- #endif -->
				</view>
				<view class="preview-info">
					<text class="preview-prompt">{{ previewImageData.prompt }}</text>
					<view class="preview-actions">
						<view class="preview-action-btn" @click="downloadImage(previewImageData)">
							<text>下载</text>
						</view>
						<view class="preview-action-btn" @click="shareImage(previewImageData)">
							<text>复制链接</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import API_URL from '@/utils/api';
import { getTokenValue } from '@/utils/auth';

// 降级复制函数 - 用于非 HTTPS 环境
const fallbackCopyText = (text) => {
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
		uni.showToast({ title: '链接已复制', icon: 'success' });
	} catch (err) {
		console.error('复制失败:', err);
		uni.showToast({ title: '复制失败', icon: 'none' });
	}
	
	document.body.removeChild(textArea);
};

// 用户信息
const userInfo = ref({
	name: '用户',
	uid: null
});

// 页面状态
const pageLoaded = ref(false);

// 会话相关
const sessions = ref([]);
const currentSessionId = ref(null);
const showSessionSelector = ref(false);

// 模型相关
const showModelSelector = ref(false);
const currentModel = ref({
	id: 'seedream-4.0',
	name: 'Seedream-4.0',
	description: 'AI图像生成模型'
});

const availableModels = ref([
	{
		id: 'seedream-4.0',
		name: 'Seedream-4.0',
		description: 'AI图像生成模型'
	},
	{
		id: 'seedance-2.0',
		name: 'Doubao-Seedance-2.0',
		description: '新一代AI视频生成模型'
	},
	{
		id: 'seedance-1.5-pro',
		name: 'Seedance-1.5-pro',
		description: 'AI视频生成模型'
	}
]);

// 生成的图片列表
const generatedImages = ref([]);

// 获取当前会话
const currentSession = computed(() => {
	return sessions.value.find(s => s.id === currentSessionId.value);
});

// 获取当前会话的图片
const currentSessionImages = computed(() => {
	if (!currentSessionId.value) return [];
	const session = sessions.value.find(s => s.id === currentSessionId.value);
	return session ? session.images : [];
});

// 从本地存储加载图片历史
const loadImagesFromStorage = () => {
	try {
		const storedSessions = uni.getStorageSync('ai_image_sessions');
		if (storedSessions) {
			sessions.value = typeof storedSessions === 'string' 
				? JSON.parse(storedSessions) 
				: storedSessions;
			
			// 如果有会话，加载最后使用的会话
			if (sessions.value.length > 0) {
				const lastSessionId = uni.getStorageSync('ai_image_last_session');
				if (lastSessionId && sessions.value.find(s => s.id === lastSessionId)) {
					currentSessionId.value = lastSessionId;
				} else {
					currentSessionId.value = sessions.value[0].id;
				}
			} else {
				// 创建默认会话
				createNewSession();
			}
		} else {
			// 创建默认会话
			createNewSession();
		}
	} catch (error) {
		console.error('加载图片历史失败:', error);
		createNewSession();
	}
};

// 保存图片到本地存储
const saveImagesToStorage = () => {
	try {
		uni.setStorageSync('ai_image_sessions', sessions.value);
		uni.setStorageSync('ai_image_last_session', currentSessionId.value);
	} catch (error) {
		console.error('保存图片历史失败:', error);
	}
};

// 创建新会话
const createNewSession = () => {
	const newSession = {
		id: Date.now(),
		name: `新记录`,
		createdAt: Date.now(),
		images: []
	};
	sessions.value.unshift(newSession);
	currentSessionId.value = newSession.id;
	saveImagesToStorage();
	showSessionSelector.value = false;
	
	uni.showToast({
		title: '新记录已创建',
		icon: 'success'
	});
};

// 切换会话选择器
const toggleSessionSelector = () => {
	showSessionSelector.value = !showSessionSelector.value;
};

// 选择会话
const selectSession = (sessionId) => {
	currentSessionId.value = sessionId;
	showSessionSelector.value = false;
	uni.setStorageSync('ai_image_last_session', sessionId);
	
	uni.showToast({
		title: '已切换记录',
		icon: 'success'
	});
};

// 删除会话
const deleteSession = (sessionId) => {
	if (sessions.value.length <= 1) {
		uni.showToast({
			title: '至少保留一个记录',
			icon: 'none'
		});
		return;
	}
	
	const index = sessions.value.findIndex(s => s.id === sessionId);
	if (index !== -1) {
		sessions.value.splice(index, 1);
		
		// 如果删除的是当前会话，切换到第一个会话
		if (currentSessionId.value === sessionId) {
			currentSessionId.value = sessions.value[0].id;
		}
		
		saveImagesToStorage();
		
		uni.showToast({
			title: '记录已删除',
			icon: 'success'
		});
	}
};

// 输入相关
const promptText = ref('');
const isGenerating = ref(false);

// 图片尺寸选项
const selectedSize = ref('1024x1024');
const availableSizes = ref([
	{ value: '512x512', label: '512×512', desc: '小尺寸' },
	{ value: '1024x1024', label: '1024×1024', desc: '标准' },
	{ value: '1024x1536', label: '1024×1536', desc: '竖向' },
	{ value: '1536x1024', label: '1536×1024', desc: '横向' },
	{ value: '1024x1792', label: '1024×1792', desc: '长屏' },
	{ value: '1792x1024', label: '1792×1024', desc: '宽屏' },
	{ value: '2048x2048', label: '2048×2048', desc: '超大' }
]);
const showSizeSelector = ref(false);

// 预览相关
const showPreview = ref(false);
const previewImageData = ref({});

// 计算属性
const canGenerate = computed(() => {
	return promptText.value.trim().length > 0 && !isGenerating.value;
});

// 返回上一页
const goBack = () => {
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

// 切换模型选择器
const toggleModelSelector = () => {
	showModelSelector.value = !showModelSelector.value;
};

// 选择模型
const selectModel = (model) => {
	currentModel.value = model;
	showModelSelector.value = false;
	
	uni.showToast({
		title: `已切换到 ${model.name}`,
		icon: 'success'
	});
};

// 输入变化处理
const onPromptInput = () => {
	// 可以在这里添加实时预览或其他逻辑
};

// 生成图片
const generateImage = async () => {
	if (!canGenerate.value) return;
	
	const prompt = promptText.value.trim();
	promptText.value = '';
	
	isGenerating.value = true;
	
	try {
		// 调用真实的AI图像生成API
		const response = await uni.request({
			url: API_URL.generateImage,
			method: 'POST',
			header: {
				'Content-Type': 'application/json',
				'Authorization': getTokenValue()
			},
			data: {
				prompt: prompt,
				model: currentModel.value.id,
				size: selectedSize.value,
				guidance_scale: 3,
				watermark: true
			}
		});
		
		if (response.data && response.data.code === 200) {
			// 添加生成的图片到当前会话
			const newImage = {
				id: Date.now(),
				url: response.data.data.url || response.data.data.image_url,
				prompt: prompt,
				model: currentModel.value.name,
				createdAt: Date.now(),
				size: selectedSize.value
			};
			
			// 找到当前会话并添加图片
			const session = sessions.value.find(s => s.id === currentSessionId.value);
			if (session) {
				session.images.unshift(newImage);
				
				// 如果是新会话的第一张图片，用提示词作为会话名称
				if (session.images.length === 1) {
					session.name = prompt.length > 20 ? prompt.substring(0, 20) + '...' : prompt;
				}
			}
			
			// 保存到本地存储
			saveImagesToStorage();
			
			uni.showToast({
				title: '图片生成完成',
				icon: 'success'
			});
		} else {
			throw new Error(response.data?.message || '生成失败');
		}
		
	} catch (error) {
		console.error('图片生成失败:', error);
		uni.showToast({
			title: error.message || '生成失败，请重试',
			icon: 'none'
		});
	} finally {
		isGenerating.value = false;
	}
};

// 切换尺寸选择器
const toggleSizeSelector = () => {
	showSizeSelector.value = !showSizeSelector.value;
	if (showSizeSelector.value) {
		nextTick(() => {
			const el = document.querySelector('.size-dropdown');
			if (el) el.scrollTop = el.scrollHeight;
		});
	}
};

// 选择尺寸
const selectSize = (size) => {
	selectedSize.value = size;
	showSizeSelector.value = false;
	
	uni.showToast({
		title: `已选择 ${size}`,
		icon: 'success',
		duration: 1500
	});
};

// 预览图片
const previewImage = (image) => {
	previewImageData.value = image;
	showPreview.value = true;
};

// 关闭预览
const closePreview = () => {
	showPreview.value = false;
	previewImageData.value = {};
};

// 下载图片
const downloadImage = (image) => {
	// #ifdef H5
	const link = document.createElement('a');
	link.href = image.url;
	link.download = `ai-image-${image.id}.jpg`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	
	uni.showToast({
		title: '开始下载',
		icon: 'success'
	});
	// #endif
	
	// #ifndef H5
	uni.downloadFile({
		url: image.url,
		success: (res) => {
			uni.saveImageToPhotosAlbum({
				filePath: res.tempFilePath,
				success: () => {
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					});
				},
				fail: () => {
					uni.showToast({
						title: '保存失败',
						icon: 'none'
					});
				}
			});
		},
		fail: () => {
			uni.showToast({
				title: '下载失败',
				icon: 'none'
			});
		}
	});
	// #endif
};

// 分享图片 - 复制图片链接到剪贴板
const shareImage = (image) => {
	// #ifdef H5
	// 复制链接到剪贴板 - 支持降级方案
	if (navigator.clipboard && window.isSecureContext) {
		navigator.clipboard.writeText(image.url).then(() => {
			uni.showToast({
				title: '图片链接已复制',
				icon: 'success'
			});
		}).catch(() => {
			fallbackCopyText(image.url);
		});
	} else {
		fallbackCopyText(image.url);
	}
	// #endif
	
	// #ifndef H5
	uni.setClipboardData({
		data: image.url,
		success: () => {
			uni.showToast({
				title: '图片链接已复制',
				icon: 'success'
			});
		},
		fail: () => {
			uni.showToast({
				title: '复制失败',
				icon: 'none'
			});
		}
	});
	// #endif
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

// 页面加载
onMounted(() => {
	// 获取用户信息
	const storedUserInfo = uni.getStorageSync('userInfo');
	if (storedUserInfo) {
		try {
			if (typeof storedUserInfo === 'string') {
				userInfo.value = JSON.parse(storedUserInfo);
			} else {
				userInfo.value = storedUserInfo;
			}
		} catch (error) {
			console.error('解析用户信息失败:', error);
		}
	}
	
	// 加载图片历史
	loadImagesFromStorage();
	
	// 页面加载动画
	nextTick(() => {
		pageLoaded.value = true;
	});
});
</script>

<style lang="scss" scoped>
.ai-image-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #0f0f0f 100%);
	color: #ffffff;
	display: flex;
	flex-direction: column;
	position: relative;
	overflow: hidden;
	
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: 
			radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.05) 0%, transparent 50%);
		animation: backgroundShift 20s ease-in-out infinite;
		pointer-events: none;
	}
}

@keyframes backgroundShift {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.8; }
}

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(30px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes slideInLeft {
	from {
		opacity: 0;
		transform: translateX(-30px);
	}
	to {
		opacity: 1;
		transform: translateX(0);
	}
}

@keyframes pulse {
	0%, 100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.05);
	}
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

/* 顶部导航栏 */
.image-header {
	height: 70px;
	background: rgba(0, 0, 0, 0.9);
	backdrop-filter: blur(20px);
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 20px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	position: relative;
	z-index: 100;

	
	.header-left {
		display: flex;
		align-items: center;
		
		.back-btn {
			width: 40px;
			height: 40px;
			border-radius: 12px;
			background: rgba(255, 255, 255, 0.1);
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			transition: all 0.3s ease;
			margin-right: 16px;
			
			&:hover {
				background: rgba(255, 255, 255, 0.2);
				transform: translateX(-2px);
			}
			
			.back-icon {
				font-size: 20px;
				color: #ffffff;
			}
		}
		
		.page-info {
			.page-title {
				font-size: 18px;
				font-weight: 700;
				color: #ffffff;
				margin-bottom: 2px;
				display: block;
			}
			
			.page-subtitle {
				font-size: 12px;
				color: rgba(255, 255, 255, 0.6);
				display: block;
			}
		}
		
		.session-selector {
			position: relative;
			display: flex;
			align-items: center;
			padding: 8px 16px;
			background: rgba(255, 255, 255, 0.1);
			border-radius: 12px;
			cursor: pointer;
			transition: all 0.3s ease;
			margin-left: 16px;
			
			&:hover {
				background: rgba(255, 255, 255, 0.15);
			}
			
			.session-name {
				font-size: 14px;
				color: #ffffff;
				margin-right: 8px;
				font-weight: 500;
				max-width: 150px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			
			.dropdown-arrow {
				font-size: 10px;
				color: rgba(255, 255, 255, 0.7);
				transition: transform 0.3s ease;
				
				&.open {
					transform: rotate(180deg);
				}
			}
			
			.session-dropdown {
				position: absolute;
				top: 100%;
				left: 0;
				margin-top: 8px;
				background: rgba(0, 0, 0, 0.95);
				backdrop-filter: blur(20px);
				border-radius: 12px;
				border: 1px solid rgba(255, 255, 255, 0.1);
				box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
				min-width: 280px;
				max-height: 400px;
				overflow: hidden;
				z-index: 1000;
				animation: fadeInUp 0.3s ease;
				
				.session-header {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 12px 16px;
					border-bottom: 1px solid rgba(255, 255, 255, 0.1);
					
					.dropdown-title {
						font-size: 14px;
						color: rgba(255, 255, 255, 0.8);
						font-weight: 500;
					}
					
					.new-session-btn {
						padding: 6px 12px;
						background: linear-gradient(135deg, #667eea, #764ba2);
						border-radius: 8px;
						cursor: pointer;
						transition: all 0.3s ease;
						
						&:hover {
							transform: translateY(-1px);
							box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
						}
						
						text {
							font-size: 13px;
							color: #ffffff;
							font-weight: 500;
						}
					}
				}
				
				.session-list {
					max-height: 300px;
					overflow-y: auto;
					
					.session-option {
						display: flex;
						align-items: center;
						justify-content: space-between;
						padding: 12px 16px;
						cursor: pointer;
						transition: all 0.3s ease;
						border-bottom: 1px solid rgba(255, 255, 255, 0.05);
						
						&:last-child {
							border-bottom: none;
						}
						
						&:hover {
							background: rgba(255, 255, 255, 0.1);
						}
						
						&.active {
							background: rgba(102, 126, 234, 0.2);
						}
						
						.session-info {
							flex: 1;
							
							.session-option-name {
								font-size: 14px;
								color: #ffffff;
								font-weight: 500;
								display: block;
								margin-bottom: 4px;
							}
							
							.session-count {
								font-size: 12px;
								color: rgba(255, 255, 255, 0.5);
								display: block;
							}
						}
						
						.delete-session-btn {
							width: 28px;
							height: 28px;
							border-radius: 6px;
							background: rgba(255, 59, 48, 0.2);
							display: flex;
							align-items: center;
							justify-content: center;
							cursor: pointer;
							transition: all 0.3s ease;
							margin-left: 8px;
							
							&:hover {
								background: rgba(255, 59, 48, 0.3);
							}
							
							text {
								font-size: 20px;
								color: #ff3b30;
							}
						}
					}
				}
			}
		}
	}

	
	.header-right {
		position: relative;
		
		.model-selector {
			display: flex;
			align-items: center;
			padding: 8px 16px;
			background: rgba(255, 255, 255, 0.1);
			border-radius: 12px;
			cursor: pointer;
			transition: all 0.3s ease;
			position: relative;
			
			&:hover {
				background: rgba(255, 255, 255, 0.15);
			}
			
			.model-name {
				font-size: 14px;
				color: #ffffff;
				margin-right: 8px;
				font-weight: 500;
			}
			
			.dropdown-arrow {
				font-size: 10px;
				color: rgba(255, 255, 255, 0.7);
				transition: transform 0.3s ease;
				
				&.open {
					transform: rotate(180deg);
				}
			}
			
			.model-dropdown {
				position: absolute;
				top: 100%;
				right: 0;
				margin-top: 8px;
				background: rgba(0, 0, 0, 0.95);
				backdrop-filter: blur(20px);
				border-radius: 12px;
				border: 1px solid rgba(255, 255, 255, 0.1);
				box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
				min-width: 280px;
				z-index: 1000;
				animation: fadeInUp 0.3s ease;
				
				.model-option {
					display: flex;
					align-items: center;
					justify-content: space-between;
					padding: 12px 16px;
					transition: all 0.3s ease;
					border-bottom: 1px solid rgba(255, 255, 255, 0.05);
					
					&:last-child {
						border-bottom: none;
					}
					
					&.disabled {
						opacity: 0.5;
						cursor: not-allowed;
					}
					
					&.active {
						background: rgba(102, 126, 234, 0.2);
					}
					
					.model-info {
						flex: 1;
						
						.option-name {
							font-size: 14px;
							color: #ffffff;
							font-weight: 500;
							display: block;
							margin-bottom: 2px;
						}
						
						.option-desc {
							font-size: 12px;
							color: rgba(255, 255, 255, 0.6);
							display: block;
						}
					}
					
					.model-status {
						.option-badge {
							padding: 4px 8px;
							border-radius: 8px;
							font-size: 12px;
							font-weight: 500;
							
							&.active {
								background: rgba(76, 175, 80, 0.2);
								color: #4CAF50;
							}
						}
						
						.disabled-text {
							font-size: 11px;
							color: rgba(255, 255, 255, 0.3);
						}
					}
				}
			}
		}
	}
}

/* 主内容区域 */
.main-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	position: relative;
	z-index: 1;
	overflow: hidden;
	
	.chat-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		padding: 20px;
		
		.welcome-section {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			min-height: 400px;
			text-align: center;
			
			.welcome-icon {
				width: 80px;
				height: 80px;
				border-radius: 20px;
				background: linear-gradient(135deg, #667eea, #764ba2);
				display: flex;
				align-items: center;
				justify-content: center;
				margin-bottom: 24px;
				box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
				
				.icon-emoji {
					font-size: 36px;
				}
			}
			
			.welcome-title {
				font-size: 28px;
				font-weight: 700;
				color: #ffffff;
				margin-bottom: 12px;
			}
			
			.welcome-subtitle {
				font-size: 16px;
				color: rgba(255, 255, 255, 0.6);
				max-width: 400px;
			}
		}
		
		.message-list {
			display: flex;
			flex-direction: column;
			gap: 24px;
			
			.message-group {
				display: flex;
				flex-direction: column;
				gap: 12px;
				
				.message-item {
					display: flex;
					animation: fadeInUp 0.4s ease;
					
					&.user-message {
						justify-content: flex-end;
						
						.message-content {
							max-width: 70%;
							
							.message-bubble {
								background: linear-gradient(135deg, #667eea, #764ba2);
								padding: 12px 16px;
								border-radius: 16px 16px 4px 16px;
								box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
								
								.message-text {
									font-size: 15px;
									color: #ffffff;
									line-height: 1.6;
									word-break: break-word;
								}
							}
						}
					}
					
					&.ai-message {
						justify-content: flex-start;
						
						.message-content {
							max-width: 80%;
							
							.image-card {
								background: rgba(255, 255, 255, 0.05);
								border-radius: 16px;
								overflow: hidden;
								cursor: pointer;
								transition: all 0.3s ease;
								position: relative;
								
								&:hover {
									transform: translateY(-2px);
									box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
									
									.image-overlay {
										opacity: 1;
									}
								}
								
								.generated-image {
									width: 100%;
									max-width: 512px;
									height: auto;
									display: block;
								}
								
								.image-overlay {
									position: absolute;
									top: 0;
									left: 0;
									right: 0;
									bottom: 0;
									background: rgba(0, 0, 0, 0.6);
									display: flex;
									align-items: center;
									justify-content: center;
									opacity: 0;
									transition: opacity 0.3s ease;
									pointer-events: none;
									
									.image-actions {
										display: flex;
										gap: 12px;
										pointer-events: auto;
										
										.action-btn {
											width: 44px;
											height: 44px;
											border-radius: 50%;
											background: rgba(255, 255, 255, 0.2);
											backdrop-filter: blur(10px);
											display: flex;
											align-items: center;
											justify-content: center;
											cursor: pointer;
											transition: all 0.3s ease;
											
											&:hover {
												background: rgba(255, 255, 255, 0.3);
												transform: scale(1.1);
											}
											
											.action-icon {
												font-size: 20px;
											}
										}
									}
								}
								
								.image-meta {
									padding: 10px 12px;
									background: rgba(0, 0, 0, 0.5);
									display: flex;
									justify-content: space-between;
									align-items: center;
									
									.image-size {
										font-size: 12px;
										color: rgba(255, 255, 255, 0.7);
									}
									
									.image-time {
										font-size: 12px;
										color: rgba(255, 255, 255, 0.5);
									}
								}
							}
						}
					}
				}
			}
		}
	}
}

/* 底部输入区域 */
.input-section {
	position: relative;
	z-index: 10;
	background: rgba(0, 0, 0, 0.9);
	backdrop-filter: blur(20px);
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	padding: 16px 20px;
	
	.input-container {
		max-width: 900px;
		margin: 0 auto;
		
		.prompt-input-wrapper {
			background: rgba(255, 255, 255, 0.05);
			border-radius: 16px;
			border: 1px solid rgba(255, 255, 255, 0.1);
			overflow: hidden;
			max-width: 100%;
			box-sizing: border-box;
			transition: all 0.3s ease;
			
			&:focus-within {
				border-color: rgba(102, 126, 234, 0.5);
				box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
			}
			
			.prompt-input {
				width: 100%;
				min-height: 80px;
				max-height: 200px;
				padding: 16px;
				background: transparent;
				border: none;
				outline: none;
				color: #ffffff;
				font-size: 15px;
				line-height: 1.6;
				resize: none;
				font-family: inherit;
				
				&::placeholder {
					color: rgba(255, 255, 255, 0.4);
				}
			}
			
			.input-footer {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 12px 16px;
				border-top: 1px solid rgba(255, 255, 255, 0.05);
				
				.footer-left {
					display: flex;
					align-items: center;
					gap: 16px;
					
					.size-selector {
						position: relative;
						display: flex;
						align-items: center;
						padding: 6px 12px;
						background: rgba(255, 255, 255, 0.1);
						border-radius: 8px;
						cursor: pointer;
						transition: all 0.3s ease;
						
						&:hover {
							background: rgba(255, 255, 255, 0.15);
						}
						
						.size-label {
							font-size: 13px;
							color: #ffffff;
							margin-right: 6px;
						}
						
						.dropdown-arrow {
							font-size: 10px;
							color: rgba(255, 255, 255, 0.7);
							transition: transform 0.3s ease;
							
							&.open {
								transform: rotate(180deg);
							}
						}
						
						.size-dropdown {
							position: absolute;
							bottom: 100%;
							left: 0;
							margin-bottom: 8px;
							background: rgba(0, 0, 0, 0.95);
							backdrop-filter: blur(20px);
							border-radius: 12px;
							border: 1px solid rgba(255, 255, 255, 0.1);
							box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
							min-width: 200px;
							max-height: 300px;
							overflow-y: auto;
							z-index: 1000;
							animation: fadeInUp 0.3s ease;
							
							.size-option {
								display: flex;
								align-items: center;
								justify-content: space-between;
								padding: 10px 14px;
								cursor: pointer;
								transition: all 0.3s ease;
								border-bottom: 1px solid rgba(255, 255, 255, 0.05);
								
								&:last-child {
									border-bottom: none;
								}
								
								&:hover {
									background: rgba(255, 255, 255, 0.1);
								}
								
								&.active {
									background: rgba(102, 126, 234, 0.2);
								}
								
								.size-info {
									flex: 1;
									
									.size-value {
										font-size: 13px;
										color: #ffffff;
										font-weight: 500;
										display: block;
										margin-bottom: 2px;
									}
									
									.size-desc {
										font-size: 11px;
										color: rgba(255, 255, 255, 0.5);
										display: block;
									}
								}
								
								.size-check {
									font-size: 14px;
									color: #4CAF50;
									margin-left: 8px;
								}
							}
						}
					}
					
					.char-count {
						font-size: 13px;
						color: rgba(255, 255, 255, 0.5);
					}
				}
				
				.generate-btn {
					display: flex;
					align-items: center;
					gap: 8px;
					padding: 10px 24px;
					background: linear-gradient(135deg, #667eea, #764ba2);
					border-radius: 12px;
					cursor: pointer;
					transition: all 0.3s ease;
					
					&:hover:not(.loading) {
						transform: translateY(-2px);
						box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
					}
					
					&.active:not(.loading) {
						opacity: 1;
					}
					
					&:not(.active):not(.loading) {
						opacity: 0.5;
						cursor: not-allowed;
					}
					
					&.loading {
						opacity: 0.7;
						cursor: wait;
					}
					
					.btn-text {
						font-size: 14px;
						color: #ffffff;
						font-weight: 500;
					}
					
					.btn-icon {
						font-size: 16px;
					}
					
					.loading-spinner {
						width: 16px;
						height: 16px;
						border: 2px solid rgba(255, 255, 255, 0.3);
						border-top-color: #ffffff;
						border-radius: 50%;
						animation: spin 0.8s linear infinite;
					}
				}
			}
		}
	}
}

/* 图片预览弹窗 */
.image-preview-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.9);
	backdrop-filter: blur(10px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
	animation: fadeInUp 0.3s ease;
	
	.preview-content {
		background: rgba(20, 20, 20, 0.95);
		border-radius: 20px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		max-width: 90%;
		max-height: 90%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		
		.preview-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 16px 20px;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			
			.preview-title {
				font-size: 18px;
				font-weight: 600;
				color: #ffffff;
			}
			
			.close-btn {
				width: 32px;
				height: 32px;
				border-radius: 8px;
				background: rgba(255, 255, 255, 0.1);
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;
				transition: all 0.3s ease;
				
				&:hover {
					background: rgba(255, 255, 255, 0.2);
				}
				
				text {
					font-size: 24px;
					color: #ffffff;
				}
			}
		}
		
		.preview-image-container {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 20px;
			overflow: auto;
			
			.preview-image {
				max-width: 100%;
				max-height: 100%;
				border-radius: 12px;
			}
		}
		
		.preview-info {
			padding: 16px 20px;
			border-top: 1px solid rgba(255, 255, 255, 0.1);
			
			.preview-prompt {
				font-size: 14px;
				color: rgba(255, 255, 255, 0.8);
				margin-bottom: 12px;
				display: block;
			}
			
			.preview-actions {
				display: flex;
				gap: 12px;
				
				.preview-action-btn {
					flex: 1;
					padding: 10px;
					background: rgba(255, 255, 255, 0.1);
					border-radius: 10px;
					text-align: center;
					cursor: pointer;
					transition: all 0.3s ease;
					
					&:hover {
						background: rgba(255, 255, 255, 0.2);
					}
					
					text {
						font-size: 14px;
						color: #ffffff;
						font-weight: 500;
					}
				}
			}
		}
	}
}

/* 响应式设计 */
@media (max-width: 768px) {
	.image-header {
		height: 60px;
		padding: 0 12px;
		
		.header-left {
			flex: 1;
			min-width: 0;
			
			.back-btn {
				width: 32px;
				height: 32px;
				margin-right: 8px;
				
				.back-icon {
					font-size: 16px;
				}
			}
			
			.page-info {
				display: none;
			}
			
			.session-selector {
				padding: 6px 10px;
				margin-left: 0;
				flex: 1;
				min-width: 0;
				
				.session-name {
					font-size: 13px;
					max-width: none;
					flex: 1;
					min-width: 0;
				}
				
				.dropdown-arrow {
					font-size: 9px;
					margin-left: 6px;
					flex-shrink: 0;
				}
				
				.session-dropdown {
					min-width: 240px;
					max-width: calc(100vw - 40px);
					left: 0;
					right: auto;
					
					.session-header {
						padding: 10px 12px;
						
						.dropdown-title {
							font-size: 13px;
						}
						
						.new-session-btn {
							padding: 5px 10px;
							
							text {
								font-size: 12px;
							}
						}
					}
					
					.session-list {
						.session-option {
							padding: 10px 12px;
							
							.session-info {
								.session-option-name {
									font-size: 13px;
								}
								
								.session-count {
									font-size: 11px;
								}
							}
							
							.delete-session-btn {
								width: 24px;
								height: 24px;
								
								text {
									font-size: 18px;
								}
							}
						}
					}
				}
			}
		}
		
		.header-right {
			flex-shrink: 0;
			
			.model-selector {
				padding: 6px 10px;
				
				.model-name {
					font-size: 11px;
				}
				
				.dropdown-arrow {
					font-size: 8px;
					margin-left: 4px;
				}
				
				.model-dropdown {
					min-width: 220px;
					max-width: calc(100vw - 40px);
					left: auto;
					right: 0;
					
					.model-option {
						padding: 10px 12px;
						
						.model-info {
							.option-name {
								font-size: 12px;
							}
							
							.option-desc {
								font-size: 10px;
							}
						}
						
						.model-status {
							.option-badge {
								font-size: 10px;
							}
							
							.disabled-text {
								font-size: 9px;
							}
						}
					}
				}
			}
		}
	}
	
	.main-content {
		.chat-container {
			padding: 16px;
			
			.welcome-section {
				min-height: 300px;
				
				.welcome-icon {
					width: 60px;
					height: 60px;
					
					.icon-emoji {
						font-size: 28px;
					}
				}
				
				.welcome-title {
					font-size: 20px;
				}
				
				.welcome-subtitle {
					font-size: 14px;
				}
			}
			
			.message-list {
				gap: 16px;
				
				.message-group {
					gap: 8px;
					
					.message-item {
						&.user-message {
							.message-content {
								max-width: 85%;
								
								.message-bubble {
									padding: 10px 14px;
									border-radius: 14px 14px 4px 14px;
									
									.message-text {
										font-size: 14px;
									}
								}
							}
						}
						
						&.ai-message {
							.message-content {
								max-width: 90%;
								
								.image-card {
									.generated-image {
										max-width: 100%;
									}
									
									.image-meta {
										padding: 8px 10px;
										
										.image-size {
											font-size: 11px;
										}
										
										.image-time {
											font-size: 11px;
										}
									}
									
									.image-overlay {
										.image-actions {
											gap: 10px;
											
											.action-btn {
												width: 40px;
												height: 40px;
												
												.action-icon {
													font-size: 18px;
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
	
	.input-section {
		padding: 12px 16px;
		
		.input-container {
			.prompt-input-wrapper {
				.prompt-input {
					min-height: 60px;
					padding: 12px;
					font-size: 14px;
				}
				
				.input-footer {
					flex-direction: column;
					align-items: stretch;
					gap: 12px;
					padding: 10px 12px;
					
					.footer-left {
						justify-content: space-between;
						
						.size-selector {
							padding: 5px 10px;
							max-width: 140px;
							
							.size-label {
								font-size: 12px;
								overflow: hidden;
								text-overflow: ellipsis;
								white-space: nowrap;
								max-width: 90px;
							}
							
							.dropdown-arrow {
								font-size: 9px;
								flex-shrink: 0;
							}
							
							.size-dropdown {
								min-width: 140px;
								max-width: calc(100vw - 32px);
								max-height: 200px;
								overflow-y: auto;
								-webkit-overflow-scrolling: touch;
								left: 0;
								right: auto;
								bottom: 100%;
								top: auto;
								margin-bottom: 6px;
								margin-top: 0;
								
								.size-option {
									padding: 5px 10px;
									
									.size-info {
										.size-value {
											font-size: 11px;
										}
										
										.size-desc {
											font-size: 9px;
										}
									}
									
									.size-check {
										font-size: 11px;
									}
								}
							}
						}
						
						.char-count {
							font-size: 12px;
						}
					}
					
					.generate-btn {
						width: auto;
						align-self: flex-end;
						justify-content: center;
						padding: 8px 16px;
						
						.btn-text {
							font-size: 13px;
						}
						
						.btn-icon {
							font-size: 15px;
						}
					}
				}
			}
		}
	}
	
	.image-preview-modal {
		.preview-content {
			max-width: 95%;
			max-height: 95%;
			
			.preview-header {
				padding: 12px 16px;
				
				.preview-title {
					font-size: 16px;
				}
				
				.close-btn {
					width: 28px;
					height: 28px;
					
					text {
						font-size: 20px;
					}
				}
			}
			
			.preview-image-container {
				padding: 16px;
			}
			
			.preview-info {
				padding: 12px 16px;
				
				.preview-prompt {
					font-size: 13px;
					margin-bottom: 10px;
				}
				
				.preview-actions {
					gap: 10px;
					
					.preview-action-btn {
						padding: 8px;
						
						text {
							font-size: 13px;
						}
					}
				}
			}
		}
	}
}

/* 页面加载动画 */
.page-loaded {
	.image-header {
		animation: slideInLeft 0.6s ease;
	}
	
	.main-content {
		animation: fadeInUp 0.8s ease;
	}
	
	.input-section {
		animation: fadeInUp 1s ease;
	}
}

/* 修复 uni-textarea 内部元素溢出 */
:deep(.uni-textarea-wrapper) {
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
	overflow: hidden;
}

:deep(.uni-textarea-placeholder) {
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
	white-space: pre-wrap;
	word-break: break-word;
	overflow: hidden;
}

:deep(.uni-textarea-compute) {
	position: absolute;
	visibility: hidden;
	width: 100%;
	max-width: 100%;
	overflow: hidden;
}

:deep(.uni-textarea-textarea) {
	width: 100% !important;
	max-width: 100%;
	box-sizing: border-box;
}
</style>

<style>
/* 修复 uni-textarea 内部元素溢出（全局，不加 scoped） */
.prompt-input-wrapper .uni-textarea-wrapper {
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
	overflow: hidden;
}

.prompt-input-wrapper .uni-textarea-placeholder {
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
	white-space: pre-wrap;
	word-break: break-word;
	overflow: hidden;
}

.input-placeholder {
	white-space: normal !important;
	word-break: break-all !important;
	overflow: hidden !important;
	width: 100% !important;
	max-width: 100% !important;
	box-sizing: border-box !important;
	padding-right: 16px !important;
}

.prompt-input-wrapper .uni-textarea-compute {
	position: absolute !important;
	visibility: hidden !important;
	pointer-events: none !important;
	width: 100% !important;
	overflow: hidden !important;
}

.prompt-input-wrapper .uni-textarea-textarea {
	width: 100% !important;
	max-width: 100% !important;
	box-sizing: border-box !important;
}
</style>
