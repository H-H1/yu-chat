<template>
	<view class="register-container">
		<!-- 背景线条动画 -->
		<view class="background-lines">
			<view class="line" v-for="(_, index) in 4" :key="index" :style="{ animationDelay: index * 2 + 's' }"></view>
		</view>
		
		<!-- 注册表单 -->
		<view class="register-form">
			<!-- 返回按钮 -->
			<view class="back-button" @click="handleBack">
				<view class="back-icon"></view>
			</view>

			<!-- 游客登录提示 banner -->
			<view class="tourist-tip" v-if="showTouristTip">
				<text class="tourist-tip-icon">💡</text>
				<view class="tourist-tip-body">
					<text class="tourist-tip-title">短信注册暂未完善</text>
					<text class="tourist-tip-desc">建议直接使用「游客登录」体验全部功能，如需正式账号可联系我们获取内测资格。</text>
				</view>
				<text class="tourist-tip-close" @click="showTouristTip = false">×</text>
			</view>
			
			<!-- 登录logo -->
			<view class="register-logo">
				<view class="logo-inner"></view>
			</view>
			
			<text class="register-title">注册</text>
			
			<!-- 输入框 -->
			<view class="input-group" :class="{ focused: isFocused.phone, error: phoneError }">
				<input 
					type="text" 
					placeholder="手机号" 
					placeholder-class="placeholder"
					v-model="formData.phone"
					@focus="handleFocus('phone')"
					@blur="validatePhone"
				/>
				<view class="input-tip" v-if="phoneError">{{ phoneError }}</view>
			</view>
			
			<view class="input-group" :class="{ focused: isFocused.username, error: usernameError }">
				<input 
					type="text" 
					placeholder="用户名" 
					placeholder-class="placeholder"
					v-model="formData.username"
					@focus="handleFocus('username')"
					@blur="validateUsername"
				/>
				<view class="input-tip" v-if="usernameError">{{ usernameError }}</view>
			</view>
			
			<view class="input-group verification-group" :class="{ focused: isFocused.smsCode, error: smsCodeError }">
				<input 
					type="text" 
					placeholder="短信验证码" 
					placeholder-class="placeholder"
					v-model="formData.smsCode"
					@focus="handleFocus('smsCode')"
					@blur="handleBlur('smsCode')"
				/>
				<view class="sms-button" @click="handleGetSmsCode" :class="{ disabled: smsButtonDisabled }">
					<text>{{ smsButtonText }}</text>
				</view>
				<view class="input-tip" v-if="smsCodeError">{{ smsCodeError }}</view>
			</view>
			
			<!-- 图形验证码输入框 -->
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
						<text>点击刷新</text>
					</view>
				</view>
			</view>
			
			<view class="input-group" :class="{ focused: isFocused.password, error: passwordError }">
				<input 
					:type="passwordVisible.password ? 'text' : 'password'" 
					placeholder="设置密码" 
					placeholder-class="placeholder"
					v-model="formData.password"
					@focus="handleFocus('password')"
					@blur="validatePassword"
				/>
				<view class="password-toggle" @click="togglePasswordVisibility('password')">
					<view class="eye-icon" :class="{ 'eye-open': passwordVisible.password }"></view>
				</view>
				<view class="input-tip" v-if="passwordError">{{ passwordError }}</view>
			</view>
			
			<view class="input-group" :class="{ focused: isFocused.confirmPassword, error: confirmPasswordError }">
				<input 
					:type="passwordVisible.confirmPassword ? 'text' : 'password'" 
					placeholder="确认密码" 
					placeholder-class="placeholder"
					v-model="formData.confirmPassword"
					@focus="handleFocus('confirmPassword')"
					@blur="validateConfirmPassword"
				/>
				<view class="password-toggle" @click="togglePasswordVisibility('confirmPassword')">
					<view class="eye-icon" :class="{ 'eye-open': passwordVisible.confirmPassword }"></view>
				</view>
				<view class="input-tip" v-if="confirmPasswordError">{{ confirmPasswordError }}</view>
			</view>
			
			<!-- 注册按钮 -->
			<button class="register-button" @click="handleRegister" :disabled="loading">
				<text v-if="!loading">立即注册</text>
				<text v-else>{{ registerStatus }}</text>
			</button>
			
			<view class="form-error" v-if="serverError">
				<text>{{ serverError }}</text>
			</view>
			
			<!-- 已有账号 -->
			<view class="login-link">
				<text @click="handleToLogin">已有账号？去登录</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, onUnmounted, onMounted } from 'vue';
import API_URL from '@/utils/api';
import { hashPassword } from '@/utils/crypto';

// 游客提示
const showTouristTip = ref(false);
let tipTimer = null;

// 表单数据
const formData = reactive({
	phone: '',
	username: '',
	smsCode: '',
	password: '',
	confirmPassword: '',
	captcha: ''
});

// 输入框焦点状态
const isFocused = reactive({
	phone: false,
	username: false,
	smsCode: false,
	password: false,
	confirmPassword: false,
	captcha: false
});

// 错误提示信息
const phoneError = ref('');
const usernameError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');
const smsCodeError = ref('');

// 密码可见状态
const passwordVisible = reactive({
	password: false,
	confirmPassword: false
});

// 验证码倒计时
const countDown = ref(0);
const timer = ref(null);

// 短信验证码按钮状态
const smsButtonDisabled = ref(false);
const smsButtonText = ref('获取验证码');

// 服务端错误信息
const serverError = ref('');
const setServerError = (message, showToast = true) => {
	serverError.value = message;
	if (showToast && message) {
		uni.showToast({
			title: message,
			icon: 'none'
		});
	}
};
const clearServerError = () => {
	serverError.value = '';
};

// 验证码数据
const captchaImage = ref('');
const captchaId = ref('');

// 切换密码可见性
const togglePasswordVisibility = (field) => {
	passwordVisible[field] = !passwordVisible[field];
};

// 注册状态
const loading = ref(false);
const registerStatus = ref('处理中...');

// 处理输入框焦点
const handleFocus = (field) => {
	isFocused[field] = true;
};

const handleBlur = (field) => {
	isFocused[field] = false;
};

// 验证手机号
const validatePhone = () => {
	handleBlur('phone');
	
	if (!formData.phone) {
		phoneError.value = '请输入手机号';
		return false;
	}
	
	const phoneRegex = /^1[3-9]\d{9}$/;
	if (!phoneRegex.test(formData.phone)) {
		phoneError.value = '请输入正确的中国区手机号';
		return false;
	}
	
	phoneError.value = '';
	return true;
};

// 验证用户名
const validateUsername = () => {
	handleBlur('username');
	
	if (!formData.username) {
		usernameError.value = '请输入用户名';
		return false;
	}
	
	if (formData.username.length < 2 || formData.username.length > 20) {
		usernameError.value = '用户名长度应在2-20个字符之间';
		return false;
	}
	
	usernameError.value = '';
	return true;
};

// 验证验证码
const validateSmsCode = () => {
	handleBlur('smsCode');
	
	if (!formData.smsCode) {
		smsCodeError.value = '请输入验证码';
		return false;
	}
	
	const codeRegex = /^\d{4}$/;
	if (!codeRegex.test(formData.smsCode)) {
		smsCodeError.value = '验证码必须是4位数字';
		return false;
	}
	
	smsCodeError.value = '';
	return true;
};

// 验证密码
const validatePassword = () => {
	handleBlur('password');
	
	if (!formData.password) {
		passwordError.value = '请设置密码';
		return false;
	}
	
	const passwordRegex = /^(?=.*[a-zA-Z])[\w\W]{6,}$/;
	if (!passwordRegex.test(formData.password)) {
		passwordError.value = '密码至少6位且必须包含字母';
		return false;
	}
	
	passwordError.value = '';
	return true;
};

// 验证确认密码
const validateConfirmPassword = () => {
	handleBlur('confirmPassword');
	
	if (!formData.confirmPassword) {
		confirmPasswordError.value = '请确认密码';
		return false;
	}
	
	if (formData.password !== formData.confirmPassword) {
		confirmPasswordError.value = '两次密码不一致';
		return false;
	}
	
	confirmPasswordError.value = '';
	return true;
};

// 返回上一页
const handleBack = () => {
	uni.navigateTo({
		url: '/pages/login/login'
	});
};

// 跳转到登录页
const handleToLogin = () => {
	uni.navigateTo({
		url: '/pages/login/login'
	});
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
				uni.showToast({
					title: '获取验证码失败',
					icon: 'none'
				});
			}
		},
		fail: () => {
			uni.showToast({
				title: '网络错误，请稍后重试',
				icon: 'none'
			});
		}
	});
};

// 获取短信验证码
const handleGetSmsCode = () => {
	if (smsButtonDisabled.value) return;
	clearServerError();
	
	// 验证手机号
	if (!validatePhone()) {
		return;
	}
	
	// 验证图形验证码
	if (!formData.captcha) {
		setServerError('请输入图形验证码');
		return;
	}
	
	// 开始倒计时
	smsButtonDisabled.value = true;
	let countdown = 60;
	smsButtonText.value = `${countdown}秒后重试`;
	
	const timer = setInterval(() => {
		countdown--;
		smsButtonText.value = `${countdown}秒后重试`;
		
		if (countdown <= 0) {
			clearInterval(timer);
			smsButtonDisabled.value = false;
			smsButtonText.value = '获取验证码';
		}
	}, 1000);
	
	// 调用获取短信验证码接口
	uni.request({
		url: API_URL.getSmsCode,
		method: 'POST',
		data: {
			phone: formData.phone,
			captcha: formData.captcha,
			captchaId: captchaId.value
		},
		success: (res) => {
			if (res.data.code !== 200) {
				// 请求失败时刷新验证码
				refreshCaptcha();
				formData.captcha = '';
				setServerError(res.data.message || '获取验证码失败');
			}
		},
		fail: () => {
			// 请求失败时刷新验证码
			refreshCaptcha();
			formData.captcha = '';
			setServerError('网络错误，请稍后重试');
		}
	});
};

// 页面加载时获取验证码并显示游客提示
onMounted(() => {
	refreshCaptcha();
	showTouristTip.value = true;
	tipTimer = setTimeout(() => {
		showTouristTip.value = false;
	}, 30000);
});

// 组件卸载时清除定时器
onUnmounted(() => {
	if (timer.value) {
		clearInterval(timer.value);
	}
	if (tipTimer) {
		clearTimeout(tipTimer);
	}
});

// 处理注册
const handleRegister = async () => {
	clearServerError();
	// 表单验证
	const isPhoneValid = validatePhone();
	const isUsernameValid = validateUsername();
	const isSmsCodeValid = validateSmsCode();
	const isPasswordValid = validatePassword();
	const isConfirmPasswordValid = validateConfirmPassword();
	
	if (!isPhoneValid || !isUsernameValid || !isSmsCodeValid || !isPasswordValid || !isConfirmPasswordValid) {
		return;
	}
	
	if (!formData.captcha) {
		setServerError('请输入图形验证码');
		return;
	}
	
	loading.value = true;
	registerStatus.value = '注册中...';
	
	try {
		// 对密码进行SHA-256哈希加密
		const hashedPassword = await hashPassword(formData.password);
		
		// 调用注册接口
		uni.request({
			url: API_URL.register,
			method: 'POST',
			data: {
				phone: formData.phone,
				username: formData.username,
				code: formData.smsCode,
				password: hashedPassword,
				captcha: formData.captcha,
				captchaId: captchaId.value
			},
		success: (res) => {
			if (res.data.code === 200) {
				clearServerError();
				registerStatus.value = '注册成功';
				
				setTimeout(() => {
					loading.value = false;
					
					// 注册成功后跳转到登录页
					uni.navigateTo({
						url: '/pages/login/login'
					});
				}, 1000);
			} else {
				loading.value = false;
				// 注册失败时刷新验证码
				refreshCaptcha();
				formData.captcha = '';
				setServerError(res.data.message || '注册失败');
			}
		},
		fail: () => {
			loading.value = false;
			// 请求失败时刷新验证码
			refreshCaptcha();
			formData.captcha = '';
			setServerError('网络错误，请稍后重试');
		}
	});
	} catch (error) {
		loading.value = false;
		console.error('密码加密失败:', error);
		setServerError('密码加密失败，请重试');
	}
};
</script>

<style lang="scss">
.register-container {
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

// 注册表单
.register-form {
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

// 返回按钮
.back-button {
	position: absolute;
	top: 20px;
	left: 20px;
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.1);
	cursor: pointer;
	
	&:active {
		background: rgba(255, 255, 255, 0.15);
	}
	
	.back-icon {
		width: 10px;
		height: 10px;
		border-left: 2px solid #fff;
		border-bottom: 2px solid #fff;
		transform: rotate(45deg);
		margin-left: 4px;
	}
}

// 注册logo
.register-logo {
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

// 注册标题
.register-title {
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
	width: 80%;
	margin-bottom: 20px;
	
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
	
	&.error input {
		border-color: rgba(255, 99, 71, 0.5);
	}
	
	input {
		width: 100%;
		height: 50px;
		background-color: rgba(16, 16, 35, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: #fff;
		padding: 0 45px 0 15px;
		border-radius: 8px;
		font-size: 16px;
	}
	
	.placeholder {
		color: rgba(255, 255, 255, 0.4);
	}
	
	.input-tip {
		position: absolute;
		bottom: -18px;
		left: 5px;
		font-size: 12px;
		color: rgba(255, 99, 71, 0.9);
		z-index: 2;
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

// 注册按钮
.register-button {
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

.form-error {
	width: 100%;
	padding: 10px 12px;
	margin-top: 12px;
	background: rgba(255, 99, 71, 0.15);
	border: 1px solid rgba(255, 99, 71, 0.35);
	border-radius: 8px;
	color: #ffb3b3;
	font-size: 13px;
	line-height: 1.4;
	text-align: left;
}

@keyframes shine {
	0% { left: -100%; }
	100% { left: 100%; }
}

// 登录链接
.login-link {
	margin-top: 20px;
	text-align: center;
	
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

// 验证码输入框样式
.verification-group {
	display: flex;
	align-items: center;
	
	input {
		flex: 1;
		padding-right: 120px; // 留出按钮空间
	}
	
	.get-code-btn {
		position: absolute;
		right: 0;
		top: 0;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 15px;
		background: linear-gradient(90deg, #6a11cb, #2575fc);
		border-radius: 0 8px 8px 0;
		z-index: 2;
		
		text {
			color: #fff;
			font-size: 14px;
			white-space: nowrap;
		}
		
		&:active {
			opacity: 0.8;
		}
		
		&.disabled {
			background: rgba(106, 17, 203, 0.5);
			cursor: not-allowed;
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

.tourist-tip {
	width: 100%;
	display: flex;
	align-items: flex-start;
	gap: 10px;
	padding: 12px 14px;
	margin-bottom: 20px;
	background: rgba(255, 180, 0, 0.1);
	border: 1px solid rgba(255, 180, 0, 0.3);
	border-radius: 10px;
	box-sizing: border-box;
	animation: tipFadeIn 0.4s ease;

	.tourist-tip-icon {
		font-size: 18px;
		flex-shrink: 0;
		margin-top: 1px;
	}

	.tourist-tip-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 3px;

		.tourist-tip-title {
			font-size: 13px;
			font-weight: 600;
			color: #fbbf24;
		}

		.tourist-tip-desc {
			font-size: 12px;
			color: rgba(255, 255, 255, 0.55);
			line-height: 1.5;
		}
	}

	.tourist-tip-close {
		font-size: 18px;
		color: rgba(255, 255, 255, 0.35);
		cursor: pointer;
		flex-shrink: 0;
		line-height: 1;
		padding: 0 2px;

		&:active {
			color: rgba(255, 255, 255, 0.7);
		}
	}
}

@keyframes tipFadeIn {
	from { opacity: 0; transform: translateY(-8px); }
	to   { opacity: 1; transform: translateY(0); }
}
</style> 