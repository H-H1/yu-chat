<template>
	<view class="login-container">
		<!-- 背景线条动画 -->
		<view class="background-lines">
			<view class="line" v-for="(_, index) in 4" :key="index" :style="{ animationDelay: index * 2 + 's' }"></view>
		</view>
		
		<!-- 登录表单 -->
		<view class="login-form">
			<!-- 登录logo -->
			<view class="login-logo">
				<view class="logo-inner"></view>
			</view>
			
			<text class="login-title">登录</text>
			
			<!-- 输入框 -->
			<view class="input-group" :class="{ focused: isFocused.username }">
				<input 
					type="text" 
					placeholder="用户名或手机号" 
					placeholder-class="placeholder"
					v-model="formData.username"
					@focus="handleFocus('username')"
					@blur="handleBlur('username')"
				/>
			</view>
			
			<view class="input-group" :class="{ focused: isFocused.password }">
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
			
			<!-- 验证码输入框 -->
			<view class="input-group captcha-group" :class="{ focused: isFocused.captcha }">
				<input 
					type="text" 
					placeholder="图形验证码" 
					placeholder-class="placeholder"
					v-model="formData.captcha"
					@focus="handleFocus('captcha')"
					@blur="handleBlur('captcha')"
				/>
				<view class="captcha-wrapper" @click="refreshCaptcha">
					<image 
						class="captcha-image" 
						:src="captchaImage" 
						mode="aspectFit"
					></image>
					<view class="captcha-refresh">
					</view>
				</view>
			</view>
			<SliderCaptcha @success="onSliderSuccess" />
			
			<view class="form-error" v-if="errorMessage">
				<text>{{ errorMessage }}</text>
			</view>
			
			<!-- 登录按钮 -->
			<button class="login-button" @click="handleLogin" :disabled="loading">
				<text v-if="!loading">登录</text>
				<text v-else>{{ loginStatus }}</text>
			</button>
			
			<!-- 游客登录按钮 -->
			<button class="tourist-login-button" @click="handleTouristLogin" :disabled="loading">
				<text>游客登录</text>
			</button>
			
			<!-- 底部链接区域 -->
			<view class="bottom-links">
				<view class="forgot-password">
					<text @click="handleForgotPassword">忘记密码？</text>
				</view>
				<view class="register-link">
					<text @click="handleToRegister">注册账号</text>
				</view>
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

// 错误提示
const errorMessage = ref('');
const setErrorMessage = (message, showToast = true) => {
	errorMessage.value = message;
	if (showToast && message) {
		uni.showToast({
			title: message,
			icon: 'none'
		});
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
		// 旧格式（纯字符串）或无效格式，不处理，停留在登录页
		return;
	}

	// 需要同时存在 value 和 expiry 才认为是新格式
	if (!tokenData || typeof tokenData.value === 'undefined' || typeof tokenData.expiry === 'undefined') {
		return;
	}

	const now = Date.now();
	if (now < tokenData.expiry) {
		// token 未过期，直接跳转到首页
		uni.switchTab({
			url: '/pages/home/home'
		});
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

// 页面加载时获取验证码并检查是否已登录
onMounted(() => {
	checkExistingToken();
	refreshCaptcha();
});

// 切换密码可见性
const togglePasswordVisibility = () => {
	passwordVisible.value = !passwordVisible.value;
};

// 处理输入框焦点
const handleFocus = (field) => {
	isFocused[field] = true;
};

const handleBlur = (field) => {
	isFocused[field] = false;
};

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
	
	loading.value = true;
	loginStatus.value = '验证中...';
	
	try {
		// 对密码进行SHA-256哈希加密
		const hashedPassword = await hashPassword(formData.password);
		
				// 调用登录接口
		uni.request({
			url: API_URL.login,
			method: 'POST',
			data: {
				userName: formData.username,
				password: hashedPassword,
				captcha: formData.captcha,
				captchaId: captchaId.value
			},
			success: (res) => {
				if (res.data.code === 200) {
					clearErrorMessage();
					loginStatus.value = '验证成功';
					
					// 直接使用后端返回的token，不做任何修改
					if (res.data.data) {
						const token = res.data.data.token || '';
						const tokenData = {
							value: token,
							expiry: new Date().getTime() + expiresIn // 当前时间 + 7天
						};
						uni.setStorageSync('token', JSON.stringify(tokenData));
						console.log('登录成功，获取到token:', token);
						console.log('登录接口返回的 data:', res.data.data);
						
						// 保存用户信息 - 只存用户输入的用户名
						uni.setStorageSync('userInfo', {
							name: formData.username,
							uid: res.data.data.uid || '',
							expiry: new Date().getTime() + expiresIn
						});
						
						// 登录成功后建立WebSocket连接
						if (token) {
							console.log('开始建立WebSocket连接...');
							wsService.connect(token); // 此方法内部会处理token的保存和过期时间设置
							
							// 添加临时连接状态监听器
							const connectionListener = (connected) => {
								if (connected) {
									console.log('WebSocket连接成功！');
								} else {
									console.log('WebSocket连接失败或已断开');
								}
							};
							wsService.addConnectionListener(connectionListener);
							
							// 30秒后移除监听器
							setTimeout(() => {
								wsService.removeConnectionListener(connectionListener);
							}, 30000);
						} else {
							console.error('登录成功但token为空，无法建立WebSocket连接');
						}
					}
					
					setTimeout(() => {
						loading.value = false;
						// 登录成功后跳转到AI体验首页
						uni.switchTab({
							url: '/pages/home/home'
						});
					}, 1000);
				} else {
					loading.value = false;
					// 登录失败时刷新验证码
					refreshCaptcha();
					formData.captcha = '';
					setErrorMessage(res.data.message || '登录失败');
				}
			},
			fail: () => {
				loading.value = false;
				// 请求失败时刷新验证码
				refreshCaptcha();
				formData.captcha = '';
				setErrorMessage('网络错误，请稍后重试');
			}
		});
	} catch (error) {
		loading.value = false;
		console.error('密码加密失败:', error);
		setErrorMessage('密码加密失败，请重试');
	}
};

// 处理忘记密码
const handleForgotPassword = () => {
	setErrorMessage('忘记密码功能开发中');
};

// 游客登录
const handleTouristLogin = () => {
	clearErrorMessage();
	loading.value = true;
	loginStatus.value = '游客登录中...';
	
	// 设置游客token
	const tokenData = {
		value: 'tourist',
		expiry: new Date().getTime() + expiresIn // 当前时间 + 7天
	};
	uni.setStorageSync('token', JSON.stringify(tokenData));
	
	// 设置游客用户信息
	uni.setStorageSync('userInfo', {
		name: '游客',
		uid: 99,
		expiry: new Date().getTime() + expiresIn
	});
	
	console.log('游客登录成功');

	console.log('开始建立WebSocket连接...');
	wsService.connect(tokenData.value); // 此方法内部会处理token的保存和过期时间设置
	
	// 添加临时连接状态监听器
	const connectionListener = (connected) => {
		if (connected) {
			console.log('WebSocket连接成功！');
		} else {
			console.log('WebSocket连接失败或已断开');
		}
	};
	wsService.addConnectionListener(connectionListener);
	
	// 30秒后移除监听器
	setTimeout(() => {
		wsService.removeConnectionListener(connectionListener);
	}, 30000);
	
	setTimeout(() => {
		loading.value = false;
		// 游客登录成功后跳转到AI体验首页
		uni.switchTab({
			url: '/pages/home/home'
		});
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
	
	// 背景图案
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
		background-size: 30px 30px;
		opacity: 0.5;
	}
}

// 背景动态线条
.background-lines {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
	pointer-events: none;
	
	.line {
		position: absolute;
		height: 1px;
		width: 200%;
		background: linear-gradient(90deg, 
			transparent 0%, 
			rgba(255, 255, 255, 0.05) 50%, 
			transparent 100%);
		animation: moveLine 10s infinite linear;
		left: -50%;
	}
	
	.line:nth-child(1) { top: 20%; animation-duration: 10s; }
	.line:nth-child(2) { top: 40%; animation-duration: 12s; }
	.line:nth-child(3) { top: 60%; animation-duration: 8s; }
	.line:nth-child(4) { top: 80%; animation-duration: 14s; }
}

@keyframes moveLine {
	0% { transform: translateY(-100%) rotate(5deg); }
	100% { transform: translateY(1000%) rotate(5deg); }
}

// 登录表单
.login-form {

	position: relative;
	width: 85%;
	padding: 40px 30px;
	background: rgba(10, 10, 20, 0.8);
	backdrop-filter: blur(15px);
	border-radius: 15px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
	z-index: 5;
	display: flex;
	flex-direction: column;
	align-items: center;
	
	// 表单发光边框效果
	&::before {
		content: '';
		position: absolute;
		top: -1px;
		left: -1px;
		right: -1px;
		bottom: -1px;
		background: linear-gradient(45deg, #6a11cb, #2575fc, #6a11cb);
		border-radius: 16px;
		z-index: -1;
		opacity: 0.5;
		filter: blur(8px);
	}
}

// 登录logozhuc
.login-logo {
	width: 80px;
	height: 80px;
	margin-bottom: 30px;
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	
	&::before {
		content: '';
		position: absolute;
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #6a11cb, #2575fc);
		border-radius: 24px;
		transform: rotate(45deg);
		box-shadow: 0 0 30px rgba(106, 17, 203, 0.6);
	}
	
	.logo-inner {
		position: relative;
		width: 40px;
		height: 40px;
		background: #fff;
		border-radius: 12px;
		transform: rotate(45deg);
	}
}

// 登录标题
.login-title {
	color: #fff;
	font-size: 24px;
	margin-bottom: 30px;
	font-weight: normal;
	position: relative;
	letter-spacing: 2px;
	
	&::after {
		content: '';
		position: absolute;
		bottom: -10px;
		left: 50%;
		transform: translateX(-50%);
		width: 40px;
		height: 2px;
		background: linear-gradient(90deg, #6a11cb, #2575fc);
	}
}

// 输入框组
.input-group {
	position: relative;
	width: 100%;
	margin-bottom: 25px;
	
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 8px;
		background: linear-gradient(90deg, #6a11cb, #2575fc);
		z-index: -1;
		opacity: 0;
		transition: opacity 0.3s ease;
	}
	
	&.focused::before {
		opacity: 1;
	}
	
	input {
		width: 95%;
		height: 50px;
		background-color: rgba(16, 16, 35, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #fff;
		padding: 0 45px 0 15px; /* 增加右侧padding，为眼睛图标留出空间 */
		border-radius: 8px;
		font-size: 16px;
	}
	
	.placeholder {
		color: rgba(255, 255, 255, 0.4);
	}
}

// 密码可见切换按钮
.password-toggle {
	position: absolute;
	top: 50%;
	right: 15px;
	transform: translateY(-50%);
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 2;
	cursor: pointer;
	
	.eye-icon {
		width: 20px;
		height: 12px;
		border: 1px solid rgba(255, 255, 255, 0.5);
		border-radius: 10px;
		position: relative;
		display: flex;
		justify-content: center;
		
		&::before {
			content: '';
			position: absolute;
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: rgba(255, 255, 255, 0.5);
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
		
		&::after {
			content: '';
			position: absolute;
			width: 20px;
			height: 2px;
			background: rgba(255, 255, 255, 0.8);
			transform: rotate(45deg);
			top: 5px;
			transition: all 0.3s ease;
		}
		
		&.eye-open::after {
			opacity: 0;
		}
	}
	
	&:active {
		opacity: 0.8;
	}
}

.form-error {
	width: 100%;
	padding: 10px 12px;
	margin-top: 10px;
	margin-bottom: 5px;
	background: rgba(255, 99, 71, 0.15);
	border: 1px solid rgba(255, 99, 71, 0.35);
	border-radius: 8px;
	color: #ffb3b3;
	font-size: 13px;
	line-height: 1.4;
	text-align: left;
}

// 登录按钮
.login-button {
	width: 100%;
	height: 50px;
	line-height: 50px;
	background: linear-gradient(45deg, #6a11cb, #2575fc);
	color: white;
	border: none;
	border-radius: 8px;
	font-size: 16px;
	margin-top: 20px;
	position: relative;
	overflow: hidden;
	letter-spacing: 2px;
	box-shadow: 0 5px 15px rgba(37, 117, 252, 0.4);
	
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, 
			transparent, 
			rgba(255, 255, 255, 0.2), 
			transparent);
		animation: shine 2s infinite;
	}
	
	&:active {
		opacity: 0.9;
		transform: translateY(2px);
	}
	
	// 禁用状态
	&[disabled] {
		opacity: 0.8;
	}
}

// 游客登录按钮
.tourist-login-button {
	width: 100%;
	height: 45px;
	line-height: 45px;
	background: linear-gradient(45deg, #FF6B6B, #FF8E53);
	color: white;
	border: none;
	border-radius: 8px;
	font-size: 15px;
	margin-top: 15px;
	position: relative;
	overflow: hidden;
	letter-spacing: 1px;
	box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
	
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, 
			transparent, 
			rgba(255, 255, 255, 0.2), 
			transparent);
		animation: shine 2.5s infinite;
	}
	
	&:active {
		opacity: 0.9;
		transform: translateY(2px);
	}
	
	// 禁用状态
	&[disabled] {
		opacity: 0.8;
	}
}

@keyframes shine {
	0% { left: -100%; }
	100% { left: 100%; }
}

// 底部链接区域
.bottom-links {
	width: 100%;
	margin-top: 20px;
	display: flex;
	justify-content: space-between;
}

// 忘记密码
.forgot-password {
	text-align: left;
	
	text {
		color: rgba(255, 255, 255, 0.6);
		font-size: 14px;
		position: relative;
		padding-bottom: 2px;
		
		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			width: 0;
			height: 1px;
			background: linear-gradient(90deg, #6a11cb, #2575fc);
			transition: width 0.3s ease;
		}
		
		// 模拟hover效果
		&:active::after {
			width: 100%;
		}
	}
}

// 注册链接
.register-link {
	text-align: right;
	
	text {
		color: rgba(255, 255, 255, 0.8);
		font-size: 14px;
		position: relative;
		padding-bottom: 2px;
		
		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			width: 0;
			height: 1px;
			background: linear-gradient(90deg, #6a11cb, #2575fc);
			transition: width 0.3s ease;
		}
		
		// 模拟hover效果
		&:active::after {
			width: 100%;
		}
	}
}

// 验证码输入框组
.captcha-group {
	display: flex;
	align-items: center;
	
	input {
		flex: 1;
		padding-right: 120px; // 为验证码图片留出空间
	}
	
	.captcha-wrapper {
		position: absolute;
		right: 10px;
		top: 50%;
		transform: translateY(-50%);
		width: 100px;
		height: 40px;
		border-radius: 4px;
		cursor: pointer;
		overflow: hidden;
		background: #fff;
		
		.captcha-image {
			width: 100%;
			height: 100%;
			object-fit: contain;
		}
		
		.captcha-refresh {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			background: rgba(0, 0, 0, 0.5);
			text-align: center;
			padding: 2px 0;
			
			text {
				color: #fff;
				font-size: 12px;
			}
		}
		
		&:active {
			opacity: 0.8;
		}
	}
}
</style> 