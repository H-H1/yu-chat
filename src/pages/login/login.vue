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
			
			<!-- 登录按钮 -->
			<button class="login-button" @click="handleLogin" :disabled="loading">
				<text v-if="!loading">登录</text>
				<text v-else>{{ loginStatus }}</text>
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
import { ref, reactive } from 'vue';
import API_URL from '@/utils/api';

// 表单数据
const formData = reactive({
	username: '',
	password: ''
});

// 输入框焦点状态
const isFocused = reactive({
	username: false,
	password: false
});

// 密码可见状态
const passwordVisible = ref(false);

// 登录状态
const loading = ref(false);
const loginStatus = ref('验证中...');

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
const handleLogin = () => {
	if (!formData.username || !formData.password) {
		uni.showToast({
			title: '请输入用户名或手机号和密码',
			icon: 'none'
		});
		return;
	}
	
	loading.value = true;
	loginStatus.value = '验证中...';
	
	// 调用登录接口
	uni.request({
		url: API_URL.login,
		method: 'POST',
		data: {
			userName: formData.username,
			password: formData.password
		},
		success: (res) => {
			if (res.data.code === 200) {
				loginStatus.value = '验证成功';
				
				// 直接使用后端返回的token，不做任何修改
				if (res.data.data) {
					// 对用户名进行脱敏处理
					const maskedUserName = maskUserName(res.data.data.userName || formData.username);
					
					// 保存token和用户信息
					uni.setStorageSync('token', res.data.data.token || '');
					uni.setStorageSync('userInfo', {
						userName: maskedUserName,
						name: res.data.data.name || maskedUserName
					});
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
				uni.showToast({
					title: res.data.message || '登录失败',
					icon: 'none'
				});
			}
		},
		fail: () => {
			loading.value = false;
			uni.showToast({
				title: '网络错误，请稍后重试',
				icon: 'none'
			});
		}
	});
};

// 处理忘记密码
const handleForgotPassword = () => {
	uni.showToast({
		title: '忘记密码功能开发中',
		icon: 'none'
	});
};

// 用户名脱敏处理
const maskUserName = (userName) => {
	// 确保用户名是有效的
	if (!userName || userName.length < 7) return userName;
	
	// 截取前3位和后4位，中间用****替代
	return userName.substring(0, 3) + '****' + userName.substring(userName.length - 4);
};

// 跳转到注册页
const handleToRegister = () => {
	uni.navigateTo({
		url: '/pages/register/register'
	});
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

// 登录logo
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
		width: 100%;
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
</style> 