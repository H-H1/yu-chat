<template>
	<view class="login-container">
		<!-- 背景线条动画 -->
		<view class="background-lines">
			<view class="line" v-for="(_, index) in 4" :key="index" :style="{ animationDelay: index * 2 + 's' }"></view>
		</view>

		<!-- 登录表单 -->
		<view class="login-form">
			<!-- 登录 Logo -->
			<view class="login-logo">
				<view class="logo-inner"></view>
			</view>

			<text class="login-title">登录</text>

			<!-- 用户名 -->
			<view class="input-group" :class="{ focused: isFocused.username }">
				<view class="input-icon user-icon"></view>
				<input
					type="text"
					placeholder="用户名或手机号"
					placeholder-class="placeholder"
					v-model="formData.username"
					@focus="handleFocus('username')"
					@blur="handleBlur('username')"
				/>
			</view>

			<!-- 密码 -->
			<view class="input-group" :class="{ focused: isFocused.password }">
				<view class="input-icon lock-icon"></view>
				<input
					:type="passwordVisible ? 'text' : 'password'"
					placeholder="密码"
					placeholder-class="placeholder"
					v-model="formData.password"
					@focus="handleFocus('password')"
					@blur="handleBlur('password')"
				/>
				<view class="password-toggle" @click="togglePasswordVisibility">
					<view class="eye-icon" :class="{ 'eye-open': passwordVisible }"></view>
				</view>
			</view>

			<!-- 图形验证码 -->
			<view class="input-group captcha-group" :class="{ focused: isFocused.captcha }">
				<view class="input-icon shield-icon"></view>
				<input
					type="text"
					placeholder="图形验证码"
					placeholder-class="placeholder"
					v-model="formData.captcha"
					@focus="handleFocus('captcha')"
					@blur="handleBlur('captcha')"
				/>
				<view class="captcha-wrapper" @click="refreshCaptcha">
					<image class="captcha-image" :src="captchaImage" mode="aspectFit"></image>
					<view class="captcha-refresh-tip"><text>点击刷新</text></view>
				</view>
			</view>

			<!-- 滑块验证 -->
			<SliderCaptcha @success="onSliderSuccess" />

			<!-- Turnstile 人机验证 (H5) -->
			<!-- #ifdef H5 -->
			<view class="turnstile-container">
				<view id="turnstile-widget"></view>
			</view>
			<!-- #endif -->

			<!-- 错误提示 -->
			<view class="form-error" v-if="errorMessage">
				<view class="error-icon">!</view>
				<text>{{ errorMessage }}</text>
			</view>

			<!-- 登录按钮 -->
			<button class="login-button" @click="handleLogin" :disabled="loading">
				<text v-if="!loading">登 录</text>
				<text v-else>{{ loginStatus }}</text>
			</button>

			<!-- 游客登录按钮 -->
			<button class="tourist-login-button" @click="handleTouristLogin" :disabled="loading">
				<text>游客体验</text>
			</button>

			<!-- 底部链接 -->
			<view class="bottom-links">
				<text class="link-text" @click="handleForgotPassword">忘记密码？</text>
				<view class="divider-dot"></view>
				<text class="link-text highlight" @click="handleToRegister">注册账号</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import API_URL from '@/utils/api';
import wsService from '@/services/websocket';
import { expiresIn } from '@/utils/auth';
import { hashPassword } from '@/utils/crypto';
import SliderCaptcha from './SliderCaptcha.vue';

// 表单数据
const formData = reactive({
	username: '',
	password: '',
	captcha: ''
});

// 输入框焦点状态
const isFocused = reactive({
	username: false,
	password: false,
	captcha: false
});

// 密码可见状态
const passwordVisible = ref(false);

// 登录状态
const loading = ref(false);
const loginStatus = ref('验证中...');

// 验证码数据
const captchaImage = ref('');
const captchaId = ref('');

// 滑块验证状态
const sliderPassed = ref(false);
const onSliderSuccess = () => {
	sliderPassed.value = true;
};

// Turnstile 人机验证状态
const turnstileToken = ref('');
const turnstileWidgetId = ref(null);

// 初始化 Turnstile 小部件
const initTurnstile = () => {
	// #ifdef H5
	if (typeof window !== 'undefined' && window.turnstile) {
		if (turnstileWidgetId.value !== null) {
			window.turnstile.remove(turnstileWidgetId.value);
		}
		const container = document.getElementById('turnstile-widget');
		if (container) {
			turnstileWidgetId.value = window.turnstile.render('#turnstile-widget', {
				sitekey: '0x4AAAAAADXMHSi0WATAN9zu',
				theme: 'dark',
				callback: (token) => {
					turnstileToken.value = token;
				},
				'expired-callback': () => {
					turnstileToken.value = '';
				},
				'error-callback': () => {
					turnstileToken.value = '';
				}
			});
		}
	}
	// #endif
};

// 重置 Turnstile
const resetTurnstile = () => {
	turnstileToken.value = '';
	// #ifdef H5
	if (typeof window !== 'undefined' && window.turnstile && turnstileWidgetId.value !== null) {
		window.turnstile.reset(turnstileWidgetId.value);
	}
	// #endif
};

// 错误提示
const errorMessage = ref('');
const setErrorMessage = (message, showToast = true) => {
	errorMessage.value = message;
	if (showToast && message) {
		uni.showToast({ title: message, icon: 'none' });
	}
};
const clearErrorMessage = () => {
	errorMessage.value = '';
};

// 检查本地已保存的 token，如果未过期则直接跳转首页
const checkExistingToken = () => {
	const tokenStr = uni.getStorageSync('token');
	if (!tokenStr) return;

	let tokenData = null;
	try {
		tokenData = JSON.parse(tokenStr);
	} catch (e) {
		return;
	}

	if (!tokenData || typeof tokenData.value === 'undefined' || typeof tokenData.expiry === 'undefined') {
		return;
	}

	if (Date.now() < tokenData.expiry) {
		uni.switchTab({ url: '/pages/home/home' });
	}
};

// 获取验证码
const refreshCaptcha = () => {
	uni.request({
		url: API_URL.captcha,
		method: 'GET',
		success: (res) => {
			if (res.data.code === 200 && res.data.data) {
				captchaImage.value = res.data.data.image;
				captchaId.value = res.data.data.captchaId;
			} else {
				setErrorMessage('获取验证码失败');
			}
		},
		fail: () => {
			setErrorMessage('网络错误，请稍后重试');
		}
	});
};

onMounted(() => {
	checkExistingToken();
	refreshCaptcha();

	// 加载 Turnstile 脚本 (H5)
	// #ifdef H5
	if (typeof window !== 'undefined' && !document.getElementById('turnstile-script')) {
		const script = document.createElement('script');
		script.id = 'turnstile-script';
		script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
		script.async = true;
		script.defer = true;
		script.onload = () => {
			initTurnstile();
		};
		document.head.appendChild(script);
	} else if (window.turnstile) {
		initTurnstile();
	}
	// #endif
});

// 切换密码可见性
const togglePasswordVisibility = () => {
	passwordVisible.value = !passwordVisible.value;
};

// 处理输入框焦点
const handleFocus = (field) => { isFocused[field] = true; };
const handleBlur = (field) => { isFocused[field] = false; };

// 处理登录
const handleLogin = async () => {
	clearErrorMessage();
	if (!formData.username || !formData.password) {
		setErrorMessage('请输入用户名或手机号和密码');
		return;
	}
	if (!formData.captcha) {
		setErrorMessage('请输入图形验证码');
		return;
	}
	if (!sliderPassed.value) {
		setErrorMessage('请先完成滑动验证');
		return;
	}
	// #ifdef H5
	if (!turnstileToken.value) {
		setErrorMessage('请先完成人机验证');
		return;
	}
	// #endif

	loading.value = true;
	loginStatus.value = '验证中...';

	try {
		const hashedPassword = await hashPassword(formData.password);

		uni.request({
			url: API_URL.login,
			method: 'POST',
			data: {
				userName: formData.username,
				password: hashedPassword,
				captcha: formData.captcha,
				captchaId: captchaId.value,
				turnstileToken: turnstileToken.value
			},
			success: (res) => {
				if (res.data.code === 200) {
					clearErrorMessage();
					loginStatus.value = '验证成功';

					if (res.data.data) {
						const token = res.data.data.token || '';
						const tokenData = {
							value: token,
							expiry: new Date().getTime() + expiresIn
						};
						uni.setStorageSync('token', JSON.stringify(tokenData));
						console.log('登录成功，获取到token:', token);
						console.log('登录接口返回的 data:', res.data.data);

						uni.setStorageSync('userInfo', {
							name: formData.username,
							uid: res.data.data.uid || '',
							expiry: new Date().getTime() + expiresIn
						});

						if (token) {
							console.log('开始建立WebSocket连接...');
							wsService.connect(token);

							const connectionListener = (connected) => {
								console.log(connected ? 'WebSocket连接成功！' : 'WebSocket连接失败或已断开');
							};
							wsService.addConnectionListener(connectionListener);
							setTimeout(() => wsService.removeConnectionListener(connectionListener), 30000);
						} else {
							console.error('登录成功但token为空，无法建立WebSocket连接');
						}
					}

					setTimeout(() => {
						loading.value = false;
						uni.switchTab({ url: '/pages/home/home' });
					}, 1000);
				} else {
					loading.value = false;
					refreshCaptcha();
					resetTurnstile();
					formData.captcha = '';
					setErrorMessage(res.data.message || '登录失败');
				}
			},
			fail: () => {
				loading.value = false;
				refreshCaptcha();
				resetTurnstile();
				formData.captcha = '';
				setErrorMessage('网络错误，请稍后重试');
			}
		});
	} catch (error) {
		loading.value = false;
		resetTurnstile();
		console.error('密码加密失败:', error);
		setErrorMessage('密码加密失败，请重试');
	}
};

// 忘记密码
const handleForgotPassword = () => {
	setErrorMessage('忘记密码功能开发中');
};

// 游客登录
const handleTouristLogin = () => {
	clearErrorMessage();
	loading.value = true;
	loginStatus.value = '游客登录中...';

	const tokenData = {
		value: 'tourist',
		expiry: new Date().getTime() + expiresIn
	};
	uni.setStorageSync('token', JSON.stringify(tokenData));
	uni.setStorageSync('userInfo', {
		name: '游客',
		uid: 99,
		expiry: new Date().getTime() + expiresIn
	});

	console.log('游客登录成功');
	console.log('开始建立WebSocket连接...');
	wsService.connect(tokenData.value);

	const connectionListener = (connected) => {
		console.log(connected ? 'WebSocket连接成功！' : 'WebSocket连接失败或已断开');
	};
	wsService.addConnectionListener(connectionListener);
	setTimeout(() => wsService.removeConnectionListener(connectionListener), 30000);

	setTimeout(() => {
		loading.value = false;
		uni.switchTab({ url: '/pages/home/home' });
	}, 1000);
};

// 跳转到注册页
const handleToRegister = () => {
	uni.navigateTo({ url: '/pages/register/register' });
};
</script>

<style lang="scss">
.login-container {
	position: relative;
	width: 100%;
	height: 100vh;
	background: linear-gradient(135deg, #0a0a14, #141428);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0; left: 0; right: 0; bottom: 0;
		background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
		background-size: 30px 30px;
		opacity: 0.5;
	}
}

// 背景动态线条
.background-lines {
	position: absolute;
	top: 0; left: 0;
	width: 100%; height: 100%;
	overflow: hidden;
	pointer-events: none;

	.line {
		position: absolute;
		height: 1px;
		width: 200%;
		background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%);
		animation: moveLine 10s infinite linear;
		left: -50%;
	}

	.line:nth-child(1) { top: 20%; animation-duration: 10s; }
	.line:nth-child(2) { top: 40%; animation-duration: 12s; }
	.line:nth-child(3) { top: 60%; animation-duration: 8s; }
	.line:nth-child(4) { top: 80%; animation-duration: 14s; }
}

@keyframes moveLine {
	0%   { transform: translateY(-100%) rotate(5deg); }
	100% { transform: translateY(1000%) rotate(5deg); }
}

// 登录表单卡片
.login-form {
	position: relative;
	width: 85%;
	padding: 44px 30px 36px;
	background:
		linear-gradient(
			160deg,
			rgba(0, 0, 0, 0.95) 0%,
			rgba(20, 20, 35, 0.92) 30%,
			rgba(102, 126, 234, 0.06) 50%,
			rgba(25, 25, 40, 0.93) 70%,
			rgba(5, 5, 10, 0.97) 100%
		);
	backdrop-filter: blur(20px);
	border-radius: 24px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(102, 126, 234, 0.08);
	z-index: 5;
	display: flex;
	flex-direction: column;
	align-items: center;
	overflow: hidden;

	// 顶部微光扫线
	&::before {
		content: '';
		position: absolute;
		top: 0; left: 0; right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.6), rgba(118, 75, 162, 0.4), transparent);
	}

	// 左下角漫射光晕
	&::after {
		content: '';
		position: absolute;
		bottom: -40px; left: -40px;
		width: 180px; height: 180px;
		background: radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%);
		pointer-events: none;
	}
}

// Logo
.login-logo {
	width: 72px;
	height: 72px;
	margin-bottom: 24px;
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;

	&::before {
		content: '';
		position: absolute;
		width: 100%; height: 100%;
		background: linear-gradient(135deg, #667eea, #764ba2);
		border-radius: 22px;
		transform: rotate(45deg);
		box-shadow: 0 0 35px rgba(102, 126, 234, 0.7);
	}

	.logo-inner {
		position: relative;
		width: 36px; height: 36px;
		background: #fff;
		border-radius: 10px;
		transform: rotate(45deg);
	}
}

// 标题
.login-title {
	color: #fff;
	font-size: 22px;
	margin-bottom: 32px;
	font-weight: 500;
	position: relative;
	letter-spacing: 4px;

	&::after {
		content: '';
		position: absolute;
		bottom: -10px;
		left: 50%;
		transform: translateX(-50%);
		width: 36px; height: 2px;
		background: linear-gradient(90deg, #667eea, #764ba2);
		border-radius: 2px;
	}
}

// 输入框组
.input-group {
	position: relative;
	width: 100%;
	margin-bottom: 20px;

	// 聚焦时的发光边框
	&::before {
		content: '';
		position: absolute;
		top: 0; left: 0; right: 0; bottom: 0;
		border-radius: 10px;
		background: linear-gradient(90deg, #667eea, #764ba2);
		z-index: -1;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	&.focused::before {
		opacity: 1;
	}

	input {
		width: 100%;
		height: 50px;
		background-color: rgba(16, 16, 35, 0.6);
		border: 1px solid rgba(255, 255, 255, 0.08);
		color: #fff;
		padding: 0 46px 0 44px;
		border-radius: 10px;
		font-size: 15px;
		box-sizing: border-box;
		transition: border-color 0.3s ease;
	}

	&.focused input {
		border-color: transparent;
	}

	.placeholder {
		color: rgba(255, 255, 255, 0.3);
	}
}

// 输入框左侧图标（纯 CSS 绘制）
.input-icon {
	position: absolute;
	left: 14px;
	top: 50%;
	transform: translateY(-50%);
	width: 18px; height: 18px;
	z-index: 2;
	opacity: 0.45;
}

.user-icon {
	border-radius: 50%;
	border: 2px solid #fff;
	&::after {
		content: '';
		position: absolute;
		bottom: -6px;
		left: 50%;
		transform: translateX(-50%);
		width: 26px; height: 10px;
		border: 2px solid #fff;
		border-radius: 10px 10px 0 0;
		border-bottom: none;
	}
}

.lock-icon {
	border: 2px solid #fff;
	border-radius: 3px;
	margin-top: 4px;
	&::before {
		content: '';
		position: absolute;
		top: -8px;
		left: 50%;
		transform: translateX(-50%);
		width: 10px; height: 8px;
		border: 2px solid #fff;
		border-bottom: none;
		border-radius: 5px 5px 0 0;
	}
	&::after {
		content: '';
		position: absolute;
		top: 50%; left: 50%;
		transform: translate(-50%, -50%);
		width: 4px; height: 4px;
		background: #fff;
		border-radius: 50%;
	}
}

.shield-icon {
	border: 2px solid #fff;
	border-radius: 3px 3px 6px 6px;
	clip-path: polygon(0 0, 100% 0, 100% 65%, 50% 100%, 0 65%);
	&::after {
		content: '✓';
		position: absolute;
		top: 50%; left: 50%;
		transform: translate(-50%, -50%);
		font-size: 10px;
		color: #fff;
		line-height: 1;
	}
}

// 密码可见切换
.password-toggle {
	position: absolute;
	top: 50%; right: 14px;
	transform: translateY(-50%);
	width: 24px; height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2;
	cursor: pointer;

	.eye-icon {
		width: 20px; height: 12px;
		border: 1.5px solid rgba(255, 255, 255, 0.45);
		border-radius: 10px;
		position: relative;
		display: flex;
		justify-content: center;

		&::before {
			content: '';
			position: absolute;
			width: 7px; height: 7px;
			border-radius: 50%;
			background: rgba(255, 255, 255, 0.45);
			top: 50%; left: 50%;
			transform: translate(-50%, -50%);
		}

		&::after {
			content: '';
			position: absolute;
			width: 20px; height: 1.5px;
			background: rgba(255, 255, 255, 0.7);
			transform: rotate(45deg);
			top: 5px;
			transition: opacity 0.2s ease;
		}

		&.eye-open::after { opacity: 0; }
	}

	&:active { opacity: 0.7; }
}

// 验证码输入框组
.captcha-group {
	input {
		padding-right: 118px;
	}

	.captcha-wrapper {
		position: absolute;
		right: 2px;
		top: 50%;
		transform: translateY(-50%);
		width: 106px; height: 44px;
		border-radius: 0 8px 8px 0;
		cursor: pointer;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.95);

		.captcha-image {
			width: 100%; height: 100%;
			object-fit: contain;
		}

		.captcha-refresh-tip {
			position: absolute;
			bottom: 0; left: 0; right: 0;
			background: rgba(0, 0, 0, 0.45);
			text-align: center;
			padding: 2px 0;
			opacity: 0;
			transition: opacity 0.2s ease;

			text {
				color: #fff;
				font-size: 11px;
			}
		}

		&:active {
			opacity: 0.85;
			.captcha-refresh-tip { opacity: 1; }
		}
	}
}

// Turnstile 人机验证容器
.turnstile-container {
	width: 100%;
	margin-bottom: 18px;
	display: flex;
	justify-content: center;

	#turnstile-widget {
		min-height: 65px;
	}
}

// 错误提示
.form-error {
	width: 100%;
	padding: 10px 14px;
	margin-top: 4px;
	margin-bottom: 2px;
	background: rgba(255, 80, 60, 0.12);
	border: 1px solid rgba(255, 80, 60, 0.3);
	border-radius: 8px;
	color: #ffb3b3;
	font-size: 13px;
	line-height: 1.5;
	display: flex;
	align-items: flex-start;
	gap: 8px;
	box-sizing: border-box;

	.error-icon {
		flex-shrink: 0;
		width: 16px; height: 16px;
		border-radius: 50%;
		background: rgba(255, 80, 60, 0.5);
		color: #fff;
		font-size: 11px;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 1px;
	}
}

// 登录按钮
.login-button {
	width: 100%;
	height: 50px;
	line-height: 50px;
	background: linear-gradient(45deg, #667eea, #764ba2);
	color: #fff;
	border: none;
	border-radius: 10px;
	font-size: 16px;
	margin-top: 20px;
	position: relative;
	overflow: hidden;
	letter-spacing: 4px;
	box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	transition: transform 0.15s ease, box-shadow 0.15s ease;

	&::before {
		content: '';
		position: absolute;
		top: 0; left: -100%;
		width: 100%; height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
		animation: shine 2.5s infinite;
	}

	&:active {
		transform: translateY(2px);
		box-shadow: 0 3px 10px rgba(102, 126, 234, 0.3);
	}

	&[disabled] { opacity: 0.75; }
}

// 游客体验按钮
.tourist-login-button {
	width: 100%;
	height: 44px;
	line-height: 44px;
	background: linear-gradient(45deg, #764ba2, #667eea);
	color: rgba(255, 255, 255, 0.9);
	border: none;
	border-radius: 10px;
	font-size: 14px;
	margin-top: 12px;
	position: relative;
	overflow: hidden;
	letter-spacing: 2px;
	box-shadow: 0 4px 14px rgba(118, 75, 162, 0.35);
	transition: box-shadow 0.2s ease;

	&::before {
		content: '';
		position: absolute;
		top: 0; left: -100%;
		width: 100%; height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
		animation: shine 3s infinite;
	}

	&:active {
		opacity: 0.9;
		transform: translateY(1px);
		box-shadow: 0 2px 8px rgba(118, 75, 162, 0.25);
	}

	&[disabled] { opacity: 0.6; }
}

@keyframes shine {
	0%   { left: -100%; }
	100% { left: 100%; }
}

// 底部链接
.bottom-links {
	width: 100%;
	margin-top: 22px;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12px;
}

.divider-dot {
	width: 3px; height: 3px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.25);
}

.link-text {
	color: rgba(255, 255, 255, 0.5);
	font-size: 13px;
	position: relative;
	padding-bottom: 1px;

	&::after {
		content: '';
		position: absolute;
		bottom: 0; left: 0;
		width: 0; height: 1px;
		background: linear-gradient(90deg, #667eea, #764ba2);
		transition: width 0.3s ease;
	}

	&:active::after { width: 100%; }

	&.highlight {
		color: rgba(255, 255, 255, 0.8);
		background: linear-gradient(90deg, #a5b4fc, #818cf8);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
}
</style>
