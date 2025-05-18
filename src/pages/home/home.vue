<template>
	<view class="home-container">
		<!-- 侧边栏 -->
		<view class="sidebar">
			<view class="sidebar-header">
				<text class="logo-text">chat语聊体验</text>
			</view>
			<view class="sidebar-menu">
				<view class="menu-item" :class="{ active: activeMenu === 0 }" @click="switchMenu(0)">
					<view class="menu-icon chat-icon"></view>
					<text class="menu-text">AI聊天</text>
				</view>
				<view class="menu-item" :class="{ active: activeMenu === 1 }" @click="switchMenu(1)">
					<view class="menu-icon image-icon"></view>
					<text class="menu-text">AI绘图</text>
				</view>
				<view class="menu-item" :class="{ active: activeMenu === 2 }" @click="switchMenu(2)">
					<view class="menu-icon voice-icon"></view>
					<text class="menu-text">AI语音</text>
				</view>
				<view class="menu-item" :class="{ active: activeMenu === 3 }" @click="switchMenu(3)">
					<view class="menu-icon mcp-icon"></view>
					<text class="menu-text">MCP</text>
				</view>
				<view class="menu-item chat-menu-item" :class="{ active: activeMenu === 4 }" @click="switchMenu(4)">
					<view class="menu-icon chat-friends-icon"></view>
					<text class="menu-text">聊天</text>
				</view>
			</view>
		</view>
		
		<!-- 主内容区 -->
		<view class="main-content">
			<view class="header">
				<text class="page-title">{{ currentMenuTitle }}</text>
				<view class="user-info" @click="showUserMenu = !showUserMenu">
					<view class="avatar"></view>
					<text class="username">{{ userInfo.name || '用户' }}</text>
					<view class="dropdown-icon"></view>
					
					<!-- 用户菜单 -->
					<view class="user-dropdown" v-if="showUserMenu">
						<view class="dropdown-item" @click="handleLogout">
							<text>退出登录</text>
						</view>
					</view>
				</view>
			</view>
			
			<view class="content-area">
				<view class="welcome-card">
					<text class="welcome-title">欢迎使用AI体验中心</text>
					<text class="welcome-subtitle">从左侧菜单选择功能开始体验</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import API_URL from '@/utils/api';

// 用户信息
const userInfo = ref({
	name: '',
	phone: ''
});

// 当前活跃菜单
const activeMenu = ref(0);

// 当前菜单标题
const currentMenuTitle = ref('AI聊天');

// 用户菜单显示状态
const showUserMenu = ref(false);

// 切换菜单
const switchMenu = (index) => {
	activeMenu.value = index;
	
	// 设置不同的标题
	switch (index) {
		case 0:
			uni.setNavigationBarTitle({ title: 'AI聊天' });
			currentMenuTitle.value = 'AI聊天';
			break;
		case 1:
			uni.setNavigationBarTitle({ title: 'AI绘图' });
			currentMenuTitle.value = 'AI绘图';
			break;
		case 2:
			uni.setNavigationBarTitle({ title: 'AI语音' });
			currentMenuTitle.value = 'AI语音';
			break;
	    case 3:
			uni.setNavigationBarTitle({ title: 'MCP' });
			currentMenuTitle.value = 'MCP';
			break;
		case 4:
			uni.setNavigationBarTitle({ title: '聊天' });
			currentMenuTitle.value = '聊天';
			break;	
	}
};

// 获取用户信息
onMounted(() => {
	const storedUserInfo = uni.getStorageSync('userInfo');
	if (storedUserInfo) {
		userInfo.value = storedUserInfo;
	}
	
	// 设置初始菜单标题
	switchMenu(activeMenu.value);
});

// 处理退出登录
const handleLogout = () => {
	// 显示确认对话框
	uni.showModal({
		title: '提示',
		content: '确定要退出登录吗？',
		success: (res) => {
			if (res.confirm) {
				// 清除本地存储的用户信息和token
				uni.removeStorageSync('token');
				uni.removeStorageSync('userInfo');
				
				// 返回登录页
				uni.reLaunch({
					url: '/pages/login/login'
				});
			}
		}
	});
};
</script>

<style lang="scss">
.home-container {
	display: flex;
	height: 100vh;
	overflow: hidden;
	background-color: #f6f6f6;
}

/* 侧边栏样式 */
.sidebar {
	width: 220px;
	background-color: #1a1a2e;
	height: 100%;
	color: #ffffff;
	box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
	display: flex;
	flex-direction: column;
	
	.sidebar-header {
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		
		.logo-text {
			font-size: 20px;
			font-weight: bold;
			background: linear-gradient(45deg, #6a11cb, #2575fc);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			text-shadow: 0 0 10px rgba(106, 17, 203, 0.2);
		}
	}
	
	.sidebar-menu {
		flex: 1;
		padding: 20px 0;
		
		.menu-item {
			height: 50px;
			display: flex;
			align-items: center;
			padding: 0 20px;
			margin-bottom: 5px;
			cursor: pointer;
			transition: all 0.3s ease;
			border-left: 3px solid transparent;
			
			&.active {
				background-color: rgba(106, 17, 203, 0.1);
				border-left-color: #6a11cb;
			}
			
			&:hover {
				background-color: rgba(255, 255, 255, 0.05);
			}
			
			.menu-icon {
				width: 20px;
				height: 20px;
				margin-right: 10px;
				border-radius: 4px;
				background: linear-gradient(45deg, #6a11cb, #2575fc);
				opacity: 0.7;
				position: relative;
				
				// 聊天图标
				&.chat-icon::before {
					content: '';
					position: absolute;
					width: 8px;
					height: 8px;
					border: 2px solid #fff;
					border-radius: 50%;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
				}
				
				// 图像图标
				&.image-icon::before {
					content: '';
					position: absolute;
					width: 10px;
					height: 10px;
					border: 2px solid #fff;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
				}
				
				// 语音图标
				&.voice-icon::before,
				&.voice-icon::after {
					content: '';
					position: absolute;
					background: #fff;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
				}
				
				&.voice-icon::before {
					width: 2px;
					height: 10px;
				}
				
				&.voice-icon::after {
					width: 10px;
					height: 2px;
				}
				
				// MCP图标
				&.mcp-icon::before {
					content: '';
					position: absolute;
					width: 10px;
					height: 10px;
					border: 2px solid #fff;
					border-radius: 2px;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
				}
				
				&.mcp-icon::after {
					content: '';
					position: absolute;
					width: 6px;
					height: 2px;
					background: #fff;
					top: 60%;
					left: 50%;
					transform: translateX(-50%);
					box-shadow: 0 -4px 0 #fff, 0 -8px 0 #fff;
				}
				
				// 好友聊天图标
				&.chat-friends-icon::before {
					content: '';
					position: absolute;
					width: 10px;
					height: 8px;
					border: 2px solid #FF416C;
					border-radius: 5px 5px 0 5px;
					top: 40%;
					left: 40%;
					transform: translate(-50%, -50%);
				}
				
				&.chat-friends-icon::after {
					content: '';
					position: absolute;
					width: 6px;
					height: 5px;
					border: 2px solid #FF416C;
					border-radius: 3px 3px 3px 0;
					bottom: 30%;
					right: 30%;
					transform: translate(50%, 50%);
				}
			}
			
			.menu-text {
				font-size: 14px;
				color: rgba(255, 255, 255, 0.9);
			}
			
			&.active .menu-text {
				color: #ffffff;
			}
			
			// 聊天菜单项特殊样式
			&.chat-menu-item {
				background: linear-gradient(45deg, #FF416C, #FF4B2B);
				margin: 10px 15px;
				border-radius: 8px;
				position: relative;
				border-left: none;
				box-shadow: 0 4px 15px rgba(255, 75, 43, 0.3);
				transition: all 0.3s ease;
				
				&:hover {
					transform: translateY(-2px);
					box-shadow: 0 6px 20px rgba(255, 75, 43, 0.4);
					background: linear-gradient(45deg, #FF5483, #FF6B4B);
				}
				
				&.active {
					background: linear-gradient(45deg, #FF5483, #FF6B4B);
					border-left: none;
				}
				
				.menu-icon {
					background: rgba(255, 255, 255, 0.9);
					
					&::before, &::after {
						border-color: #FF416C;
					}
				}
				
				.menu-text {
					color: #ffffff;
					font-weight: 500;
				}
			}
		}
	}
}

/* 主内容区样式 */
.main-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	
	.header {
		height: 60px;
		background-color: #ffffff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
		position: relative;
		z-index: 10;
		
		.page-title {
			font-size: 16px;
			font-weight: bold;
			color: #333;
		}
		
		.user-info {
			display: flex;
			align-items: center;
			cursor: pointer;
			position: relative;
			padding: 5px 10px;
			border-radius: 4px;
			
			&:hover {
				background-color: #f6f6f6;
			}
			
			.avatar {
				width: 30px;
				height: 30px;
				border-radius: 50%;
				background: linear-gradient(45deg, #6a11cb, #2575fc);
				margin-right: 10px;
			}
			
			.username {
				font-size: 14px;
				color: #333;
				margin-right: 5px;
			}
			
			.dropdown-icon {
				width: 0;
				height: 0;
				border-left: 5px solid transparent;
				border-right: 5px solid transparent;
				border-top: 5px solid #666;
			}
			
			.user-dropdown {
				position: absolute;
				top: 100%;
				right: 0;
				width: 120px;
				background-color: #ffffff;
				border-radius: 4px;
				box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
				padding: 5px 0;
				margin-top: 5px;
				
				.dropdown-item {
					padding: 10px 15px;
					font-size: 14px;
					color: #333;
					
					&:hover {
						background-color: #f6f6f6;
					}
				}
			}
		}
	}
	
	.content-area {
		flex: 1;
		padding: 20px;
		overflow-y: auto;
		
		.welcome-card {
			background-color: #ffffff;
			border-radius: 8px;
			box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
			padding: 30px;
			text-align: center;
			
			.welcome-title {
				font-size: 24px;
				color: #333;
				font-weight: bold;
				margin-bottom: 10px;
			}
			
			.welcome-subtitle {
				font-size: 14px;
				color: #666;
			}
		}
	}
}
</style> 