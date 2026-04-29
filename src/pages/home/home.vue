<template>
	<view class="home-container">
		<!-- 侧边栏 -->
		<view class="sidebar" :class="{ 'sidebar-hidden': isSidebarHidden }">
			<view class="sidebar-header">
				<view class="logo-container">
					<view class="logo-icon">
						<view class="logo-gradient"></view>
						<text class="logo-symbol">✨</text>
					</view>
					<view class="logo-text-container">
						<text class="logo-text">ChatAI</text>
						<text class="logo-subtitle">智能体验平台</text>
					</view>
				</view>
			</view>
			<view class="sidebar-menu">
				<view class="menu-item" @click="switchMenu(0)">
					<view class="menu-icon chat-icon"></view>
					<text class="menu-text">AI 智能助手</text>
				</view>
				<view class="menu-item" :class="{ active: activeMenu === 1 }" @click="switchMenu(1)">
					<view class="menu-icon image-icon"></view>
					<text class="menu-text">AI绘图</text>
				</view>
			<view class="menu-item" :class="{ active: activeMenu === 3 }" @click="switchMenu(3)">
				<view class="menu-icon mcp-icon"></view>
				<text class="menu-text">MCP</text>
			</view>
			<view class="menu-item" @click="navigateToTools">
				<view class="menu-icon tools-icon"></view>
				<text class="menu-text">AI工具集合</text>
			</view>
			<view class="menu-item" @click="navigateToNews">
				<view class="menu-icon news-icon"></view>
				<text class="menu-text">全球新闻</text>
			</view>
			<view class="menu-item" @click="navigateToRoadmap">
				<view class="menu-icon roadmap-icon"></view>
				<text class="menu-text">Agent学习</text>
			</view>
			<view class="menu-item" @click="navigateToWeixin">
				<view class="menu-icon weixin-icon"></view>
				<text class="menu-text">微信（IM） Bot</text>
			</view>
			<!-- <view class="menu-item" :class="{ active: activeMenu === 5 }" @click="loadFriendList"> -->
			<view class="menu-item" :class="{ active: activeMenu === 5 }" @click="navigateToChatOne">
				<view class="menu-icon single-chat-icon"></view>
				<text class="menu-text">单聊/好友管理</text>
			</view>
				<view class="menu-item chat-menu-item" :class="{ active: activeMenu === 4 }" @click="navigateToChat">
					<view class="menu-icon chat-friends-icon"></view>
					<text class="menu-text">客服小助手</text>
				</view>
				<view class="menu-item" :class="{ active: activeMenu === 7 }" @click="friendListfunc"></view>
			</view>
		</view>
		
		<!-- 主内容区 -->
		<view class="main-content">
			<view class="header">
				<!-- 移动端菜单按钮 -->
				<view class="mobile-menu-button" @click="toggleSidebar">
					<view class="menu-bars"></view>
				</view>
				
				<text class="page-title">{{ currentMenuTitle }}</text>
				<view class="user-info" @click="navigateToProfile">
					<view class="avatar" @click.stop="navigateToProfile">
						<text>{{getAvatarText(userInfo.name) }}</text>
					</view>
				<text class="username">{{ userInfo.name || '用户' }}</text>
				<view class="dropdown-icon"></view>
				</view>
			</view>
			
			<!-- 侧边栏遮罩层 -->
			<view class="sidebar-overlay" v-show="!isSidebarHidden && isMobileView" @click="hideSidebar"></view>
			
			<view class="content-area">
				<view class="welcome-section" v-if="activeMenu !== 3">
					<view class="welcome-card">
						<view class="welcome-header">
							<view class="welcome-icon">
								<view class="icon-glow"></view>
								<text class="welcome-emoji">🚀</text>
							</view>
							<h1 class="welcome-title">欢迎来到 ChatAI 智能世界</h1>
							<p class="welcome-subtitle">体验前沿AI技术，开启智能对话新纪元</p>
						</view>
						
						<view class="feature-grid">
							<view class="feature-card" @click="switchMenu(0)">
								<view class="feature-icon ai-icon">
									<view class="icon-bg"></view>
									<text class="feature-emoji">💻</text>
								</view>
								<text class="feature-title">AI 智能助手</text>
								<text class="feature-desc">智能对话，解答疑问</text>
							</view>
							
							<view class="feature-card" @click="switchMenu(1)">
								<view class="feature-icon image-icon">
									<view class="icon-bg"></view>
									<text class="feature-emoji">🎨</text>
								</view>
								<text class="feature-title">AI 绘图</text>
								<text class="feature-desc">创意无限，艺术生成</text>
							</view>
							
							<view class="feature-card" @click="switchMenu(3)">
								<view class="feature-icon mcp-icon">
									<view class="icon-bg"></view>
									<text class="feature-emoji">⚡</text>
								</view>
								<text class="feature-title">MCP 协议</text>
								<text class="feature-desc">模型上下文协议</text>
							</view>

							<view class="feature-card" @click="navigateToTools">
								<view class="feature-icon tools-icon">
									<view class="icon-bg"></view>
									<text class="feature-emoji">🛠️</text>
								</view>
								<text class="feature-title">AI 工具集合</text>
								<text class="feature-desc">多种AI工具，一站使用</text>
							</view>

							<view class="feature-card" @click="navigateToNews">
								<view class="feature-icon news-icon">
									<view class="icon-bg"></view>
									<text class="feature-emoji">📰</text>
								</view>
								<text class="feature-title">全球新闻</text>
								<text class="feature-desc">实时资讯，掌握动态</text>
							</view>

							<view class="feature-card" @click="navigateToRoadmap">
								<view class="feature-icon roadmap-icon">
									<view class="icon-bg"></view>
									<text class="feature-emoji">🗺️</text>
								</view>
								<text class="feature-title">Agent学习</text>
								<text class="feature-desc">LLM-Agent 开发指南</text>
							</view>

							<view class="feature-card" @click="navigateToWeixin">
								<view class="feature-icon weixin-icon">
									<view class="icon-bg"></view>
									<text class="feature-emoji">💬</text>
								</view>
								<text class="feature-title">微信（IM） Bot</text>
								<text class="feature-desc">iLink 官方 Bot API</text>
							</view>

							<view class="feature-card" @click="navigateToChatOne">
								<view class="feature-icon chat-icon">
									<view class="icon-bg"></view>
									<text class="feature-emoji">💬</text>
								</view>
								<text class="feature-title">单聊/好友</text>
								<text class="feature-desc">好友管理，私信聊天</text>
							</view>

							<view class="feature-card" @click="navigateToChat">
								<view class="feature-icon service-icon">
									<view class="icon-bg"></view>
									<text class="feature-emoji">🎧</text>
								</view>
								<text class="feature-title">客服小助手</text>
								<text class="feature-desc">在线客服，随时解答</text>
							</view>
						</view>
					</view>
				</view>
				

				<!-- AI绘图界面 -->
				<view class="chat-interface" v-if="activeMenu === 1">
					<!-- 消息列表区域 -->
					<view class="message-list">
						<view v-for="(message, index) in aiImageMessages" :key="index" 
							:class="['message-item', message.isMe ? 'message-mine' : 'message-other']">
							<!-- 时间戳 - 每组消息的第一条显示 -->
							<view class="message-time" v-if="shouldShowTime(index, aiImageMessages)">
								<text>{{ formatTime(message.time) }}</text>
							</view>
							
							<!-- 发送者信息 -->
							<view class="message-sender">
								<view class="sender-avatar" :style="message.isMe ? generateAvatarStyle(userInfo.name) : generateAvatarStyle(message.name)">
									<text>{{ message.isMe ? getAvatarText(userInfo.name) : getAvatarText(message.name) }}</text>
								</view>
								<view class="message-content">
									<view class="sender-name">{{ message.isMe ? userInfo.name : message.name }}</view>
									<view class="message-bubble">
										<!-- 如果是图片消息 -->
										<image v-if="message.type === 'image'" :src="message.content" mode="widthFix" class="message-image"></image>
										<!-- 如果是文本消息 -->
										<view v-else>
											<!-- #ifdef H5 -->
											<view v-html="formatMarkdown(message.content)"></view>
											<!-- #endif -->
											<!-- #ifndef H5 -->
											<text>{{ message.content }}</text>
											<!-- #endif -->
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 消息输入区域 -->
					<view class="message-input-area">
						<input class="message-input" v-model="aiImageInput" placeholder="描述您想要的图片..." @keypress.enter="sendAiImageMessage" />
						<view class="send-button" @click="sendAiImageMessage"><text>生成</text></view>
					</view>
				</view>
				
				<!-- MCP界面 -->
				<view class="mcp-interface" v-if="activeMenu === 3">
					<!-- Hero 头部 -->
					<view class="mcp-hero">
						<view class="mcp-hero-icon">⚡</view>
						<view class="mcp-hero-title">Smithery.ai</view>
						<view class="mcp-hero-subtitle">Model Context Protocol · MCP 托管平台</view>
						<view class="mcp-hero-link" @click="openWebsite">
							<text>访问官网</text>
							<text class="mcp-hero-link-arrow">→</text>
						</view>
					</view>

					<!-- 核心功能 -->
					<view class="mcp-block">
						<view class="mcp-block-title">
							<text class="mcp-block-dot"></text>
							<text>核心功能</text>
						</view>
						<view class="mcp-feature-list">
							<view class="mcp-feature-item">
								<view class="mcp-tag">免费</view>
								<text class="mcp-feature-text">支持免费的 Claude 4 Sonnet 和 GPT-4.1</text>
							</view>
							<view class="mcp-feature-item">
								<view class="mcp-tag">托管</view>
								<text class="mcp-feature-text">MCP 服务器托管与分发，支持本地/云端部署</text>
							</view>
							<view class="mcp-feature-item">
								<view class="mcp-tag">标准</view>
								<text class="mcp-feature-text">基于 JSON-RPC 规范，通过 mcp.json 配置文件定义工具元数据</text>
							</view>
						</view>
					</view>

					<!-- MCP 列表 -->
					<view class="mcp-block">
						<view class="mcp-block-title">
							<text class="mcp-block-dot"></text>
							<text>精选 MCP</text>
						</view>
						<view class="mcp-grid">
							<view class="mcp-card" v-for="(mcp, index) in mcpList" :key="index">
								<view class="mcp-card-top">
									<text class="mcp-card-name">{{ mcp.name }}</text>
									<view class="mcp-card-badges">
										<view class="mcp-cat-badge">{{ mcp.category }}</view>
										<view class="mcp-rec-badge" v-if="mcp.recommended">推荐</view>
									</view>
								</view>
								<text class="mcp-card-desc">{{ mcp.description }}</text>
							</view>
						</view>
					</view>

					<!-- 平台优势 -->
					<view class="mcp-block">
						<view class="mcp-block-title">
							<text class="mcp-block-dot"></text>
							<text>平台优势</text>
						</view>
						<view class="mcp-advantage-list">
							<view class="mcp-advantage-item">
								<view class="mcp-adv-num">1</view>
								<view class="mcp-adv-body">
									<text class="mcp-adv-title">丰富的工具库</text>
									<text class="mcp-adv-desc">4,000+ 预构建 MCP 服务器，覆盖文件管理/Web搜索/数据分析等</text>
								</view>
							</view>
							<view class="mcp-advantage-item">
								<view class="mcp-adv-num">2</view>
								<view class="mcp-adv-body">
									<text class="mcp-adv-title">灵活的部署</text>
									<text class="mcp-adv-desc">支持本地运行 & 云托管，Docker 容器化支持</text>
								</view>
							</view>
							<view class="mcp-advantage-item">
								<view class="mcp-adv-num">3</view>
								<view class="mcp-adv-body">
									<text class="mcp-adv-title">开源生态</text>
									<text class="mcp-adv-desc">社区贡献工具，GitHub 协作开发</text>
								</view>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 聊天界面 -->
				<view class="chat-interface" v-if="activeMenu === 4">
					<!-- 消息列表区域 -->
					<view class="message-list">
						<view v-for="(message, index) in chatMessages" :key="index" 
							:class="['message-item', message.isMe ? 'message-mine' : 'message-other']">
							<!-- 时间戳 - 每组消息的第一条显示 -->
							<view class="message-time" v-if="shouldShowTime(index, chatMessages)">
								<text>{{ formatTime(message.time) }}</text>
							</view>
							
							<!-- 发送者信息 -->
							<view class="message-sender">
								<view class="sender-avatar" :style="message.isMe ? generateAvatarStyle(userInfo.name) : generateAvatarStyle(message.name)">
									<text>{{ message.isMe ? getAvatarText(userInfo.name) : getAvatarText(message.name) }}</text>
								</view>
								<view class="message-content">
									<view class="sender-name">{{ message.isMe ? userInfo.name : message.name }}</view>
									<view class="message-bubble">
										<!-- #ifdef H5 -->
										<view v-html="formatMarkdown(message.content)"></view>
										<!-- #endif -->
										<!-- #ifndef H5 -->
										<text>{{ message.content }}</text>
										<!-- #endif -->
									</view>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 消息输入区域 -->
					<view class="message-input-area">
						<input class="message-input" v-model="chatInput" placeholder="请输入消息..." @keypress.enter="sendChatMessage" />
						<view class="send-button" @click="sendChatMessage"><text>发送</text></view>
					</view>
				</view>
				
				<!-- 单聊界面 -->
				<view class="chat-interface" v-if="activeMenu === 5">
					<!-- 好友列表 -->
					<view class="friend-list">
						<view class="friend-list-header">
							<text>我的好友</text>
							<view class="friend-actions">
								<view class="search-box">
									<input type="text" v-model="friendSearchKey" placeholder="搜索好友..." @click="openSearchFriendUI" />
									<view class="search-icon"></view>
								</view>
							</view>
						</view>
						
						<view class="friend-list-content">
							<view class="friend-apply-btn" @click="showFriendApplyList">
								<view class="apply-icon"></view>
								<view class="apply-text">好友申请</view>
								<view class="apply-badge" v-if="unreadApplyCount > 0">{{ unreadApplyCount }}</view>
							</view>
							
							<view v-if="friendList.length === 0" class="empty-tip">
								<text>暂无好友</text>
								<view class="add-friend-btn" @click="showAddFriendModal = true">添加好友</view>
							</view>
							<view v-else class="friend-items">
								<view v-for="(friend, index) in filteredFriendList" :key="index" class="friend-item" @click="startChat(friend)">
									<view class="friend-avatar" :style="generateAvatarStyle(friend.name)">
										<text>{{ getAvatarText(friend.name) }}</text>
									</view>
									<view class="friend-info">
										<view class="friend-name">{{ friend.name }}</view>
										<view class="friend-status" :class="{'online': friend.online}">
											{{ friend.online ? '在线' : '离线' }}
										</view>
									</view>
									<view class="last-message" v-if="friend.lastMessage">
										{{ friend.lastMessage }}
									</view>
								</view>
							</view>
							
							<!-- 分页控件 -->
							<view class="pagination" v-if="totalPages > 1">
								<view class="page-btn" :class="{ disabled: currentPage === 1 || isLoading }" @click="changePage(currentPage - 1)">
									上一页
								</view>
								<view class="page-info">
									{{ currentPage }} / {{ totalPages }}
								</view>
								<view class="page-btn" :class="{ disabled: currentPage === totalPages || isLoading }" @click="changePage(currentPage + 1)">
									下一页
								</view>
							</view>
						</view>
						
						<!-- 添加好友弹窗 -->
						<view class="add-friend-modal" v-if="showAddFriendModal">
							<view class="modal-content">
								<view class="modal-header">
									<text>添加好友</text>
									<view class="close-btn" @click="showAddFriendModal = false">×</view>
								</view>
								<view class="modal-body">
									<text class="input-label">好友ID</text>
									<input type="number" v-model.number="addNewFriendFormData.uid" placeholder="请输入好友ID" />
									<text class="input-label">验证消息</text>
									<input type="text" v-model="addNewFriendFormData.msg" placeholder="验证消息" />
									<view class="add-btn" @click="addNewFriend">添加</view>
								</view>
							</view>
						</view>
						<view class="add-friend-modal" v-if="showAddFriendModal2">
							<view class="modal-content">
								<view class="modal-header">
									<text>添加好友</text>
									<view class="close-btn" @click="showAddFriendModal2 = false">×</view>
								</view>
								<view class="modal-body">
									<text class="input-label">好友ID</text>
									<input type="number" v-model.number="addNewFriendFormData2.uid" placeholder="请输入好友ID" />
									<text class="input-label">验证消息</text>
									<input type="text" v-model="addNewFriendFormData2.msg" placeholder="验证消息" />
									<view class="add-btn" @click="addNewFriend">添加</view>
								</view>
							</view>
						</view>
						<!-- 搜索好友界面 -->
						<view class="search-friend-modal" v-if="showSearchFriendUI">
							<view class="modal-content">
								<view class="modal-header">
									<text>搜索好友</text>
									<view class="close-btn" @click="closeSearchFriendUI">×</view>
								</view>
								<view class="modal-body">
									<view class="search-input-box">
										<input type="text" v-model="searchFriendKey" placeholder="请输入好友昵称" />
										<view class="search-btn" @click="searchFriendsByName">搜索</view>
									</view>
									
									<view class="search-results" v-if="searchFriendResults.length > 0">
										<view v-for="(user, index) in searchFriendResults" :key="index" class="search-result-item">
											<view class="user-avatar" :style="generateAvatarStyle(user.name || '用户')">
												<text>{{ getAvatarText(user.name || '用户') }}</text>
											</view>
											<view class="user-info">
												<view class="user-name">{{ user.name || '用户' + user.uid }}</view>
												<view class="user-id">ID: {{ user.uid }}</view>
											</view>
											<view class="add-friend-btn" @click="prepareAddFriend(user)">添加</view>
										    <view class="no-result" v-if="Result500!=''">{{Result500}}</view>
										</view>
									</view>
									
									<view class="no-result" v-else-if="hasSearched">
										<text>未找到匹配的用户</text>
									</view>
								</view>
							</view>
						</view>
						
						<!-- 好友申请列表弹窗 -->
						<view class="friend-apply-modal" v-if="showFriendApplyModal">
							<view class="modal-content">
								<view class="modal-header">
									<text>好友申请</text>
									<view class="close-btn" @click="showFriendApplyModal = false">×</view>
								</view>
								<view class="modal-body">
									<view v-if="friendApplyList.length === 0" class="empty-tip">
										<text>暂无好友申请</text>
									</view>
									<view v-else class="apply-list">
										<view v-for="(apply, index) in friendApplyList.data" :key="applyId" class="apply-item">
											<view class="user-avatar" :style="generateAvatarStyle(apply.uid || '用户')">
												<text>{{ getAvatarText(apply.uid || '用户') }}</text>
											</view>
											<view class="apply-info">
												<view class="user-name">{{ apply.uid || '用户' + apply.uid }}</view>
												<view class="apply-msg">{{ apply.msg || '请求添加您为好友' }}</view>
											</view>
											<view class="apply-actions">
												<view class="agree-btn" @click="agreeFriendApply(apply.uid)">同意</view>
											</view>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 聊天窗口 -->
				<view class="chat-interface" v-if="activeMenu === 7">
					<!-- 聊天头部 -->
					<view class="chat-header">
						<view class="back-btn" @click="backToFriendList">
							<view class="back-icon"></view>
						</view>
						<text class="chat-title">{{ currentChatFriend.name }}</text>
					</view>
					
					<!-- 消息列表区域 -->
					<view class="message-list">
						<view v-for="(message, index) in singleChatMessages" :key="index" 
							:class="['message-item', message.isMe ? 'message-mine' : 'message-other']">
							<!-- 时间戳 - 每组消息的第一条显示 -->
							<view class="message-time" v-if="shouldShowTime(index, singleChatMessages)">
								<text>{{ formatTime(message.time) }}</text>
							</view>
							
							<!-- 发送者信息 -->
							<view class="message-sender">
								<view class="sender-avatar" :style="message.isMe ? generateAvatarStyle(userInfo.name) : generateAvatarStyle(message.name)">
									<text>{{ message.isMe ? getAvatarText(userInfo.name) : getAvatarText(message.name) }}</text>
								</view>
								<view class="message-content">
									<view class="sender-name">{{ message.isMe ? userInfo.name : message.name }}</view>
									<view class="message-bubble">
										<!-- #ifdef H5 -->
										<view v-html="formatMarkdown(message.content)"></view>
										<!-- #endif -->
										<!-- #ifndef H5 -->
										<text>{{ message.content }}</text>
										<!-- #endif -->
									</view>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 消息输入区域 -->
					<view class="message-input-area">
						<input class="message-input" v-model="singleChatInput" placeholder="请输入消息..." @keypress.enter="sendSingleChatMessage" />
						<view class="send-button" @click="sendSingleChatMessage"><text>发送</text></view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onBeforeUnmount } from 'vue';
import API_URL from '@/utils/api';
import { getTokenValue } from '@/utils/auth';

const friendListfunc = () => {
	uni.navigateTo({
		url: '/pages/friend/friend'
	});
};
// 用户信息
const userInfo = ref({
	name: '',
	userName: '',
	phone: '',
	uid: ''
});

// 用户头像
const userAvatar = ref('');

// 当前活跃菜单（-1 表示首页欢迎状态，不激活任何菜单项）
const activeMenu = ref(-1);

// 当前菜单标题
const currentMenuTitle = ref('AI聊天');

// 用户菜单显示状态
const showUserMenu = ref(false);

// 是否移动端视图
const isMobileView = ref(false);

// 侧边栏是否隐藏
const isSidebarHidden = ref(false);

// 好友列表相关数据
const friendList = ref([]);
const filteredFriendList = ref([]);
const friendSearchKey = ref('');
const showAddFriendModal = ref(false);
const addNewFriendFormData = ref({
	uid: null,
	msg: null
});
const addNewFriendFormData2 = ref({
	uid: null,
	msg: null
});
const showAddFriendModal2 = ref(false);
const currentChatFriend = ref({});

// 分页相关数据
const currentPage = ref(1);
const pageSize = 10;
const totalPages = ref(1);
const totalItems = ref(0);
const isLoading = ref(false);

// 搜索好友相关数据
const showSearchFriendUI = ref(false);
const searchFriendKey = ref('');
const searchFriendResults = ref([]);
const hasSearched = ref(false);
const Result500 = ref('');

// 好友申请相关数据
const unreadApplyCount = ref(0);
const showFriendApplyModal = ref(false);
const friendApplyList = ref([]);

// 检测屏幕尺寸
const checkScreenSize = () => {
	// #ifdef H5
	const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	isMobileView.value = screenWidth < 768;
	// #endif
	// #ifndef H5
	const sysInfo = uni.getSystemInfoSync();
	isMobileView.value = sysInfo.windowWidth < 768;
	// #endif

	if (isMobileView.value) {
		isSidebarHidden.value = true;
	} else {
		isSidebarHidden.value = false;
	}
};

// 切换侧边栏显示
const toggleSidebar = () => {
	isSidebarHidden.value = !isSidebarHidden.value;
};

// 隐藏侧边栏
const hideSidebar = () => {
	if (isMobileView.value) {
		isSidebarHidden.value = true;
	}
};

// 监听滑动手势
let touchStartX = 0;
let touchEndX = 0;

const handleTouchStart = (e) => {
	touchStartX = e.touches[0].clientX;
};

const handleTouchMove = (e) => {
	touchEndX = e.touches[0].clientX;
};

const handleTouchEnd = () => {
	// 向右滑动 (从左边缘向右)
	if (touchEndX - touchStartX > 70 && touchStartX < 30) {
		isSidebarHidden.value = false;
	}
	
	// 向左滑动
	if (touchStartX - touchEndX > 70) {
		hideSidebar();
	}
	
	// 重置
	touchStartX = 0;
	touchEndX = 0;
};



// AI绘图相关数据
const aiImageMessages = ref([
	{
		id: 1,
		content: '欢迎使用AI绘图功能，请描述您想要生成的图片',
		time: new Date(Date.now() - 3600000),
		isMe: false,
		name: '绘图助手',
		avatar: '/static/images/image-avatar.png'
	}
]);
const aiImageInput = ref('');

// MCP相关数据
const mcpList = ref([
	{
		name: 'Context7',
		category: '文档',
		description: '为开发者提供最新的、特定版本的文档和代码示例，以消除过时的信息和虚构的API。',
		recommended: true
	},
	{
		name: 'Bright Data',
		category: '数据',
		description: '允许用户轻松搜索、爬取、导航和提取网站信息，适用于从任何公开来源发现和检索结构化见解。',
		recommended: true
	},
	{
		name: 'Supabase MCP Server',
		category: '数据库',
		description: '连接你的Supabase项目到AI助手，如Cursor和Claude，以管理表格、获取配置和查询数据。',
		recommended: false
	},
	{
		name: 'Decodo MCP Server',
		category: '爬虫',
		description: '动态抓取和解析网页内容，包括地理限制的网站。',
		recommended: false
	},
	{
		name: 'Exa Search',
		category: '搜索',
		description: '结合嵌入和传统搜索技术进行快速智能的网络搜索和爬取，优化大型语言模型（LLMs）的结果。',
		recommended: true
	},
	{
		name: 'Naver Search',
		category: '搜索',
		description: '基于Naver搜索API，支持多种内容类型的搜索，并通过DataLab API分析搜索和购物趋势。',
		recommended: false
	},
	{
		name: 'Jimeng AI Image Generation Server',
		category: '图像',
		description: '集成先进的AI驱动的图像生成功能，可以从文本提示生成高质量的图像或混合使用本地或在线引用的图像。',
		recommended: true
	}
]);

// 聊天相关数据
const chatMessages = ref([
	{
		id: 1,
		content: '你好，欢迎使用聊天功能！',
		time: new Date(Date.now() - 3600000),
		isMe: false,
		name: '客服小助手',
		avatar: '/static/images/chat-avatar.png'
	}
]);
const chatInput = ref('');

// 单聊相关数据
const singleChatMessages = ref([
	{
		id: 1,
		content: '你好，欢迎使用单聊功能',
		time: new Date(Date.now() - 3600000),
		isMe: false,
		name: '张三',
		avatar: '/static/images/user-avatar1.png'
	}
]);
const singleChatInput = ref('');

// 生成头像背景
const generateAvatarStyle = (name) => {
	// 为不同角色设置固定的颜色
	const colorMap = {
		'AI助手': '#6a11cb',
		'绘图助手': '#FF416C',
		'MCP助手': '#8E2DE2',
		'客服小助手': '#FF4B2B'
	};
	
	// 如果是预设角色，使用固定颜色
	if (colorMap[name]) {
		return {
			background: `linear-gradient(45deg, ${colorMap[name]}, ${colorMap[name]}dd)`,
			color: '#fff',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontSize: '16px',
			fontWeight: 'bold'
		};
	}
	
	// 为普通用户生成更美观的渐变色
	const colors = [
		['#667eea', '#764ba2'], // 紫色渐变
		['#f093fb', '#f5576c'], // 粉红渐变
		['#4facfe', '#00f2fe'], // 蓝色渐变
		['#43e97b', '#38f9d7'], // 绿色渐变
		['#fa709a', '#fee140'], // 橙粉渐变
		['#30cfd0', '#330867'], // 青紫渐变
		['#a8edea', '#fed6e3'], // 浅色渐变
		['#ff9a9e', '#fecfef']  // 粉色渐变
	];
	
	// 根据名称生成一个稳定的索引（如果没有名称，使用默认值）
	const displayName = name || '用户';
	const hash = displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
	const colorPair = colors[hash % colors.length];
	
	return {
		background: `linear-gradient(135deg, ${colorPair[0]}, ${colorPair[1]})`,
		color: '#fff',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: '16px',
		fontWeight: 'bold'
	};
};

// 获取头像文字
const getAvatarText = (name) => {
	if (!name || name === '用户') return '我';
	// 确保返回单个字符，如果是中文取第一个字符，如果是英文取第一个字母
	const firstChar = name.charAt(0);
	// 如果是中文字符，直接返回
	if (/[\u4e00-\u9fa5]/.test(firstChar)) {
		return firstChar;
	}
	// 如果是英文字母，返回大写
	return firstChar.toUpperCase();
};

// 判断是否显示时间
const shouldShowTime = (index, messages) => {
	if (index === 0) return true;
	
	const currentMsg = messages[index];
	const prevMsg = messages[index - 1];
	
	// 如果两条消息间隔超过5分钟，或者是不同人的消息，显示时间
	return (currentMsg.time - prevMsg.time > 5 * 60 * 1000) || 
		   (currentMsg.isMe !== prevMsg.isMe);
};

// 格式化时间显示
const formatTime = (date) => {
	const now = new Date();
	const messageDate = new Date(date);
	
	// 同一天，显示时间
	if (now.toDateString() === messageDate.toDateString()) {
		return messageDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
	}
	
	// 一周内，显示星期几和时间
	const dayDiff = (now - messageDate) / (1000 * 60 * 60 * 24);
	if (dayDiff < 7) {
		const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
		return weekdays[messageDate.getDay()] + ' ' + 
				messageDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
	}
	
	// 更早，显示完整日期和时间
	return messageDate.toLocaleDateString('zh-CN') + ' ' + 
			messageDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

// 简易 Markdown 渲染，兼容富文本与代码块
const escapeHtml = (str = '') => str
	.replace(/&/g, '&amp;')
	.replace(/</g, '&lt;')
	.replace(/>/g, '&gt;')
	.replace(/"/g, '&quot;')
	.replace(/'/g, '&#39;');

const formatMarkdown = (text = '') => {
	if (!text) return '';
	
	// 用于保护已处理内容的占位符
	const protectedBlocks = [];
	let html = text;
	
	// 1. 先处理代码块（需要保护内容不被其他规则处理）
	html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
		const escapedCode = escapeHtml(code.trim());
		const langLabel = lang ? `<span style="color:#666;font-size:12px;">${lang}</span><br/>` : '';
		const placeholder = `___CODEBLOCK_${protectedBlocks.length}___`;
		protectedBlocks.push(`<div style="background:#f6f8fa;border-radius:6px;padding:12px;margin:8px 0;overflow-x:auto;border:1px solid #e1e4e8;">${langLabel}<code style="font-family:Consolas,Monaco,monospace;font-size:13px;line-height:1.5;color:#24292e;white-space:pre;display:block;">${escapedCode}</code></div>`);
		return placeholder;
	});
	
	// 2. 处理行内代码
	html = html.replace(/`([^`\n]+)`/g, (match, code) => {
		const placeholder = `___INLINECODE_${protectedBlocks.length}___`;
		protectedBlocks.push(`<code style="background:rgba(175,184,193,0.2);padding:2px 6px;border-radius:3px;font-family:Consolas,Monaco,monospace;font-size:13px;color:#e83e8c;">${escapeHtml(code)}</code>`);
		return placeholder;
	});
	
	// 3. 处理图片（在链接之前）
	html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:6px;margin:8px 0;" />');
	
	// 4. 处理链接
	html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#0366d6;text-decoration:underline;">$1</a>');
	
	// 5. 处理标题（必须在行首）
	html = html.replace(/^######\s+(.+)$/gm, '<h6 style="margin:12px 0 8px 0;font-weight:bold;font-size:13px;line-height:1.3;">$1</h6>');
	html = html.replace(/^#####\s+(.+)$/gm, '<h5 style="margin:12px 0 8px 0;font-weight:bold;font-size:14px;line-height:1.3;">$1</h5>');
	html = html.replace(/^####\s+(.+)$/gm, '<h4 style="margin:12px 0 8px 0;font-weight:bold;font-size:15px;line-height:1.3;">$1</h4>');
	html = html.replace(/^###\s+(.+)$/gm, '<h3 style="margin:12px 0 8px 0;font-weight:bold;font-size:16px;line-height:1.3;">$1</h3>');
	html = html.replace(/^##\s+(.+)$/gm, '<h2 style="margin:12px 0 8px 0;font-weight:bold;font-size:18px;line-height:1.3;">$1</h2>');
	html = html.replace(/^#\s+(.+)$/gm, '<h1 style="margin:12px 0 8px 0;font-weight:bold;font-size:20px;line-height:1.3;">$1</h1>');
	
	// 6. 处理粗体（在斜体之前，避免 ** 被当作两个 *）
	html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:bold;">$1</strong>');
	html = html.replace(/__(.+?)__/g, '<strong style="font-weight:bold;">$1</strong>');
	
	// 7. 处理斜体
	html = html.replace(/\*([^\*]+?)\*/g, '<em style="font-style:italic;">$1</em>');
	html = html.replace(/_([^_]+?)_/g, '<em style="font-style:italic;">$1</em>');
	
	// 8. 处理删除线
	html = html.replace(/~~(.+?)~~/g, '<del style="text-decoration:line-through;opacity:0.7;">$1</del>');
	
	// 9. 处理引用块
	html = html.replace(/^>\s+(.+)$/gm, '<blockquote style="border-left:4px solid #dfe2e5;padding-left:12px;margin:8px 0;color:#6a737d;font-style:italic;">$1</blockquote>');
	
	// 10. 处理水平分割线（在列表之前）
	html = html.replace(/^[\-\*]{3,}$/gm, '<hr style="border:none;border-top:2px solid #e1e4e8;margin:16px 0;" />');
	
	// 11. 处理有序列表
	html = html.replace(/^\d+\.\s+(.+)$/gm, '<li style="margin:4px 0;line-height:1.6;margin-left:20px;">$1</li>');
	
	// 12. 处理无序列表
	html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li style="margin:4px 0;line-height:1.6;list-style-type:disc;margin-left:20px;">$1</li>');
	
	// 13. 包裹列表项为 ul/ol
	html = html.replace(/(<li style="[^"]*list-style-type:disc[^"]*">.*?<\/li>(\n|<br\/>)?)+/g, (match) => {
		return `<ul style="margin:8px 0;padding-left:24px;">${match}</ul>`;
	});
	html = html.replace(/(<li style="[^"]*margin-left:20px[^"]*">.*?<\/li>(\n|<br\/>)?)+/g, (match) => {
		if (!match.includes('list-style-type:disc')) {
			return `<ol style="margin:8px 0;padding-left:24px;list-style-type:decimal;">${match}</ol>`;
		}
		return match;
	});
	
	// 14. 处理表格
	html = html.split('\n').map(line => {
		if (line.includes('|') && line.trim().startsWith('|') && line.trim().endsWith('|')) {
			const cells = line.split('|').filter(cell => cell.trim()).map(cell => cell.trim());
			if (cells.length > 0) {
				const cellsHtml = cells.map(cell => `<td style="border:1px solid #dfe2e5;padding:6px 12px;font-size:13px;">${cell}</td>`).join('');
				return `<tr>${cellsHtml}</tr>`;
			}
		}
		return line;
	}).join('\n');
	
	html = html.replace(/(<tr>.*?<\/tr>\n?)+/g, (match) => {
		return `<table style="border-collapse:collapse;width:100%;margin:8px 0;"><tbody>${match}</tbody></table>`;
	});
	
	// 15. 处理换行（段落）
	html = html.replace(/\n\n+/g, '<div style="height:8px;"></div>');
	html = html.replace(/\n/g, '<br/>');
	
	// 16. 恢复被保护的代码块
	protectedBlocks.forEach((block, index) => {
		html = html.replace(`___CODEBLOCK_${index}___`, block);
		html = html.replace(`___INLINECODE_${index}___`, block);
	});
	
	return html;
};



// AI绘图发送消息
const sendAiImageMessage = () => {
	if (!aiImageInput.value.trim()) return;
	
	// 添加用户描述
	aiImageMessages.value.push({
		id: Date.now(),
		content: aiImageInput.value,
		time: new Date(),
		isMe: true,
		name: userInfo.value.name,
		avatar: userAvatar.value
	});
	
	// 清空输入框
	const imagePrompt = aiImageInput.value;
	aiImageInput.value = '';
	
	// 模拟生成图片
	setTimeout(() => {
		// 这里应该是调用实际的API生成图片，现在使用示例图片
		aiImageMessages.value.push({
			id: Date.now() + 1,
			content: 'https://picsum.photos/500/300', // 示例图片URL
			type: 'image',
			time: new Date(),
			isMe: false,
			name: '绘图助手',
			avatar: '/static/images/image-avatar.png'
		});
	}, 2000);
};

// 打开Smithery.ai官网
const openWebsite = () => {
	// #ifdef H5
	window.open('https://smithery.ai', '_blank');
	// #endif
	
	// #ifdef MP-WEIXIN
	uni.showToast({
		title: '请在浏览器中打开: https://smithery.ai',
		icon: 'none',
		duration: 3000
	});
	// #endif
	
	// #ifdef APP-PLUS
	plus.runtime.openURL('https://smithery.ai');
	// #endif
};

// 发送普通聊天消息
const sendChatMessage = () => {
	if (!chatInput.value.trim()) return;
	
	// 添加新消息
	chatMessages.value.push({
		id: Date.now(),
		content: chatInput.value,
		time: new Date(),
		isMe: true,
		name: userInfo.value.name,
		avatar: userAvatar.value
	});
	
	// 清空输入框
	const userMessage = chatInput.value;
	chatInput.value = '';
	
	// 模拟回复
	setTimeout(() => {
		chatMessages.value.push({
			id: Date.now() + 1,
			content: '收到您的消息，客服将尽快回复',
			time: new Date(),
			isMe: false,
			name: '客服小助手',
			avatar: '/static/images/chat-avatar.png'
		});
	}, 1000);
};

// 发送单聊消息
const sendSingleChatMessage = () => {
	if (!singleChatInput.value.trim()) return;
	
	// 添加新消息
	singleChatMessages.value.push({
		id: Date.now(),
		content: singleChatInput.value,
		time: new Date(),
		isMe: true,
		name: userInfo.value.name,
		avatar: userAvatar.value
	});
	
	// 清空输入框
	const userMessage = singleChatInput.value;
	singleChatInput.value = '';
	
	// 模拟回复
	setTimeout(() => {
		singleChatMessages.value.push({
			id: Date.now() + 1,
			content: `收到你的消息："${userMessage}"，稍后回复`,
			time: new Date(),
			isMe: false,
			name: '张三',
			avatar: '/static/images/user-avatar1.png'
		});
	}, 1000);
};

// 切换菜单
// 设置菜单标题（不触发跳转）
const setMenuTitle = (index) => {
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
	    case 3:
			uni.setNavigationBarTitle({ title: 'MCP' });
			currentMenuTitle.value = 'MCP';
			break;
		case 4:
			uni.setNavigationBarTitle({ title: '聊天' });
			currentMenuTitle.value = '聊天';
			break;
		case 5:
			uni.setNavigationBarTitle({ title: '好友列表' });
			currentMenuTitle.value = '好友列表';
			break;
		case 7:
			uni.setNavigationBarTitle({ title: '单聊' });
			currentMenuTitle.value = '单聊';
			break;
		default:
			uni.setNavigationBarTitle({ title: 'ChatAI 智能体验' });
			currentMenuTitle.value = 'ChatAI 智能体验';
			break;
	}
};

// 切换菜单
const switchMenu = (index) => {
	// 如果是 AI 聊天，跳转到独立页面
	if (index === 0) {
		uni.navigateTo({
			url: '/pages/aiChat/aiChat'
		});
		return;
	}
	
	// 如果是 AI 绘图，跳转到独立页面
	if (index === 1) {
		uni.navigateTo({
			url: '/pages/aiImage/aiImage'
		});
		return;
	}
	
	activeMenu.value = index;
	setMenuTitle(index);
};

// 导航到聊天页面
const navigateToChat = () => {
	uni.navigateTo({
		url: '/pages/chat/chat'
	});
};

const navigateToChatOne = () => {
	uni.navigateTo({
		url: '/pages/chatOne/chatOne'
	});
};

// 导航到AI工具集合页面
const navigateToTools = () => {
	uni.navigateTo({
		url: '/pages/tools/tools'
	});
};

// 导航到全球新闻页面
const navigateToNews = () => {
	uni.navigateTo({
		url: '/pages/news/news'
	});
};

// 导航到 Agent 学习路线页面
const navigateToRoadmap = () => {
	uni.navigateTo({
		url: '/pages/roadmap/roadmap'
	});
};

// 导航到微信 Bot 页面
const navigateToWeixin = () => {
	uni.navigateTo({
		url: '/pages/weixin/weixin'
	});
};

// 导航到个人中心
const navigateToProfile = () => {
	uni.switchTab({
		url: '/pages/profile/profile'
	});
};


// 获取token的value值
// const getTokenValue = () => {
//     // 1. 从存储获取 token 数据
// 	const tokenStr = uni.getStorageSync('token');
// 	if (!tokenStr) return null;
// 	if (tokenStr.includes('"value"') && tokenStr.includes('"expiry"')) {
//         const tokenData = JSON.parse(tokenStr);
//         const now = new Date();
        
//         // 检查是否过期
//         if (now.getTime() > tokenData.expiry) {
//           console.log('Token已过期');
//           uni.removeStorageSync('token');
//           return null;
//         }
        
//         return tokenData.value;
//       } else {
//         // 旧格式token，直接返回
//         return tokenStr;
//       }

//     // 5. 其他情况（无效格式），返回 null
//     console.warn('token 格式无效:', tokenObj);
//     return null;
// };
// 加载好友列表

const timestamp = Date.now()
const loadFriendList = () => {
	activeMenu.value = 5;
	currentMenuTitle.value = '好友列表';
	uni.setNavigationBarTitle({ title: '好友列表' });
	
	// 显示加载中
	uni.showLoading({
		title: '加载中...'
	});
	
	isLoading.value = true;
	
	// 调用API获取好友列表
	uni.request({
		url: API_URL.getFriendList,
		method: 'GET',
		header: {
			'Authorization': getTokenValue()
		},
		data: {
			page: currentPage.value,
			pageSize,
			timestamp: Date.now()
		},
		success: (res) => {
			if (res.data.code === 200) {
				const { data, isLast } = res.data.data;
				friendList.value = data.map(friend => ({
					...friend,
					online: friend.activeStatus === 2,
					lastMessage: friend.lastMessage || null
				}));
				filteredFriendList.value = [...friendList.value];
				
				// 更新分页信息
				totalItems.value = friendList.value.length;
				totalPages.value = isLast ? currentPage.value : currentPage.value + 1;
				
				// 获取好友申请未读数量
				getUnreadApplyCount();
			} else {
				uni.showToast({
					title: res.data.msg || '获取好友列表失败',
					icon: 'none'
				});
			}
		},
		fail: () => {
			uni.showToast({
				title: '网络错误，请稍后再试',
				icon: 'none'
			});
		},
		complete: () => {
			uni.hideLoading();
			isLoading.value = false;
		}
	});
};

// 切换页面
const changePage = (page) => {
	if (page < 1 || page > totalPages.value || isLoading.value) return;
	currentPage.value = page;
	loadFriendList();
};

// // 获取好友申请未读数量
// const getUnreadApplyCount = () => {
// 	uni.request({
// 		url: API_URL.getUnreadApplyCount,
// 		method: 'GET',
// 		header: {
// 			'Authorization': getTokenValue()
// 		},
// 		success: (res) => {
// 			if (res.data.code === 200) {
// 				unreadApplyCount.value = res.data.data || 0;
// 			} else {
// 				console.error('获取好友申请未读数量失败:', res.data.message);
// 			}
// 		},
// 		fail: () => {
// 			console.error('获取好友申请未读数量失败');
// 		}
// 	});
// };

// 显示好友申请列表
const showFriendApplyList = () => {
	// 显示加载中
	uni.showLoading({
		title: '加载中...'
	});
	
	// 获取好友申请列表
	uni.request({
		url: API_URL.getApplyList,
		method: 'GET',
		header: {
			'Authorization': getTokenValue()
		},
		success: (res) => {
			if (res.data.code === 200) {
				friendApplyList.value = res.data.data || [];
				showFriendApplyModal.value = true;
				
				// 重置未读数量
				unreadApplyCount.value = 0;
			} else {
				uni.showToast({
					title: res.data.msg || '获取好友申请列表失败',
					icon: 'none'
				});
			}
		},
		fail: () => {
			uni.showToast({
				title: '网络错误，请稍后再试',
				icon: 'none'
			});
		},
		complete: () => {
			uni.hideLoading();
		}
	});
};

// // 同意好友申请
// const agreeFriendApply = (applyId) => {
// 	uni.request({
// 		url: API_URL.agreeFriend,
// 		method: 'POST',
// 		header: {
// 			'Authorization': getTokenValue()
// 		},
// 		data: {
// 			uid: applyId
// 		},
// 		success: (res) => {
// 			if (res.data.code === 200) {
// 				uni.showToast({
// 					title: '已同意好友申请',
// 					icon: 'success'
// 				});
				
// 				// 从列表中移除该申请
// 				friendApplyList.value = friendApplyList.value.filter(item => item.id !== applyId);
				
// 				// 重新加载好友列表
// 				loadFriendList();
// 			} else {
// 				uni.showToast({
// 					title: res.data.message || '操作失败',
// 					icon: 'none'
// 				});
// 			}
// 		},
// 		fail: () => {
// 			uni.showToast({
// 				title: '网络错误，请稍后再试',
// 				icon: 'none'
// 			});
// 		}
// 	});
// };

// 搜索好友
const searchFriends = () => {
	if (!friendSearchKey.value) {
		filteredFriendList.value = [...friendList.value];
		return;
	}
	
	filteredFriendList.value = friendList.value.filter(friend => 
		friend.name.toLowerCase().includes(friendSearchKey.value.toLowerCase())
	);
};

// 添加新好友
const addNewFriend = () => {
    if (typeof addNewFriendFormData.value.uid !== 'number' || isNaN(addNewFriendFormData.value.uid)) {
        uni.showToast({
            title: '好友ID必须是数字',
            icon: 'none'
        });
        return;
    }
	if (!addNewFriendFormData.value.msg.trim()) {
    uni.showToast({
        title: '请输入好友验证消息', // 提示更具体
        icon: 'none'
    });
    return;
}
	
	uni.showLoading({
		title: '添加中...'
	});
	
	// 调用API添加好友
	uni.request({
		url: API_URL.addFriend,
		method: 'POST',
		header: {
			'Authorization': getTokenValue()
		},
		data: {
			uid: addNewFriendFormData.value.uid,
			msg: addNewFriendFormData.value.msg
		},
		success: (res) => {
			if (res.data.code === 200) {
				uni.showToast({
					title: '好友申请已发送',
					icon: 'success'
				});
				showAddFriendModal.value = false;
				addNewFriendFormData.value = {
					uid: null,
					msg: null
				};
				showAddFriendModal2.value = false;
				addNewFriendFormData2.value = {
					uid: null,
					msg: null
				};
			} else if(res.data.code === 500){
				showAddFriendModal.value = false;
				addNewFriendFormData.value = {
					uid: null,
					msg: null
				};
				uni.showToast({
					title: res.data.message || '已经添加过该好友',
					icon: 'none'
				});
			}else {
				uni.showToast({
					title: res.data.msg || '添加好友失败',
					icon: 'none'
				});
			}
		},
		fail: () => {
			uni.showToast({
				title: '网络错误，请稍后再试',
				icon: 'none'
			});
		},
		complete: () => {
			uni.hideLoading();
		}
	});
};

// 开始聊天
const startChat = (friend) => {
	currentChatFriend.value = friend;
	activeMenu.value = 7; // 切换到聊天窗口
	currentMenuTitle.value = friend.name;
	uni.setNavigationBarTitle({ title: friend.name });
	
	// 加载与该好友的聊天记录
	// 这里应该调用API获取聊天记录，现在使用模拟数据
	singleChatMessages.value = [
		{
			id: 1,
			content: `你好，我是${friend.name}`,
			time: new Date(Date.now() - 3600000),
			isMe: false,
			name: friend.name
		}
	];
};

// 返回好友列表
const backToFriendList = () => {
	loadFriendList();
};

// 页面加载
onMounted(() => {
	getTokenValue();
	const storedUserInfo = uni.getStorageSync('userInfo');
	if (storedUserInfo) {
		userInfo.value = storedUserInfo;
		// 设置默认头像或从用户数据中获取
		userAvatar.value = storedUserInfo.avatar || '/static/images/default-avatar.png';
	}
	
	// 设置初始菜单标题（不触发跳转）
	setMenuTitle(activeMenu.value);
	
	// 初始检测屏幕尺寸
	checkScreenSize();
	
	// 监听窗口大小变化
	// #ifdef H5
	window.addEventListener('resize', checkScreenSize);
	// #endif
	
	// 添加触摸事件监听
	// #ifdef H5
	document.addEventListener('touchstart', handleTouchStart);
	document.addEventListener('touchmove', handleTouchMove);
	document.addEventListener('touchend', handleTouchEnd);
	// #endif
	
	// 获取好友申请未读数量
	// getUnreadApplyCount();
});

// 组件卸载前移除事件监听
onBeforeUnmount(() => {
	// #ifdef H5
	window.removeEventListener('resize', checkScreenSize);
	document.removeEventListener('touchstart', handleTouchStart);
	document.removeEventListener('touchmove', handleTouchMove);
	document.removeEventListener('touchend', handleTouchEnd);
	// #endif
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

// 显示搜索好友界面
const openSearchFriendUI = () => {
	showSearchFriendUI.value = true;
	searchFriendKey.value = friendSearchKey.value;
	searchFriendResults.value = [];
	hasSearched.value = false;
};

// 关闭搜索好友界面
const closeSearchFriendUI = () => {
	showSearchFriendUI.value = false;
};

// 根据昵称搜索好友
const searchFriendsByName = () => {
	if (!searchFriendKey.value.trim()) {
		uni.showToast({
			title: '请输入搜索关键词',
			icon: 'none'
		});
		return;
	}
	
	// 显示加载中
	uni.showLoading({
		title: '搜索中...'
	});
	
	// 调用API搜索好友
	uni.request({
		url: API_URL.getUserInfoByName,
		method: 'GET',
		header: {
			'Authorization': getTokenValue()
		},
		data: {
			name: searchFriendKey.value
		},
		success: (res) => {
			hasSearched.value = true;
			if (res.data.code === 200 && res.data.data) {
				// 处理返回的用户列表
				searchFriendResults.value = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
			} else {
				searchFriendResults.value = [];
				uni.showToast({
					title: res.data.msg || '未找到用户',
					icon: 'none'
				});
			}
		},
		fail: () => {
			hasSearched.value = true;
			searchFriendResults.value = [];
			uni.showToast({
				title: '网络错误，请稍后再试',
				icon: 'none'
			});
			
			// 模拟数据（实际应用中应删除）
			setTimeout(() => {
				searchFriendResults.value = [
					{
						uid: 100,
						name: '张三'
					},
					{
						uid: 101,
						name: '李四'
					}
				];
			}, 500);
		},
		complete: () => {
			uni.hideLoading();
		}
	});
};

// 准备添加好友（从搜索结果中）
const prepareAddFriend = (user) => {
	addNewFriendFormData.value = {
		uid: user.uid,
		msg: `你好，我是${userInfo.value.name}，想添加你为好友`
	};
	showSearchFriendUI.value = false;
	showAddFriendModal.value = true;
};

// 同意好友申请
const agreeFriendApply = (uid) => {
	uni.showLoading({
		title: '处理中...'
	});
	
	// 模拟API调用
	setTimeout(() => {
		uni.hideLoading();
		uni.showToast({
			title: '已同意好友申请',
			icon: 'success'
		});
		
		// 从申请列表中移除
		if (friendApplyList.value.data) {
			friendApplyList.value.data = friendApplyList.value.data.filter(apply => apply.uid !== uid);
		}
		
		// 减少未读数量
		if (unreadApplyCount.value > 0) {
			unreadApplyCount.value--;
		}
		
		// 重新加载好友列表
		loadFriendList();
	}, 1000);
};

// 页面挂载时的初始化
onMounted(async () => {
	// 获取用户信息
	const storedUserInfo = uni.getStorageSync('userInfo');
	if (storedUserInfo) {
		const data = typeof storedUserInfo === 'string' ? JSON.parse(storedUserInfo) : storedUserInfo;
		if (data && data.name) {
			userInfo.value.name = data.name;
			userInfo.value.uid = data.uid || '';
		}
	}
	if (!userInfo.value.name) {
		userInfo.value.name = '用户';
	}
	
	// 检测屏幕尺寸
	checkScreenSize();
	
	// 监听窗口大小变化
	// #ifdef H5
	window.addEventListener('resize', checkScreenSize);
	// #endif
	
	// 添加触摸事件监听
	// #ifdef H5
	document.addEventListener('touchstart', handleTouchStart, { passive: true });
	document.addEventListener('touchmove', handleTouchMove, { passive: true });
	document.addEventListener('touchend', handleTouchEnd, { passive: true });
	// #endif
});

// 页面卸载时清理事件监听
onBeforeUnmount(() => {
	// #ifdef H5
	window.removeEventListener('resize', checkScreenSize);
	document.removeEventListener('touchstart', handleTouchStart);
	document.removeEventListener('touchmove', handleTouchMove);
	document.removeEventListener('touchend', handleTouchEnd);
	// #endif
});
</script>

<style lang="scss">
.home-container {
	display: flex;
	height: 100vh;
	overflow: hidden;
	background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #0f0f0f 100%);
	color: #ffffff;
	position: relative;
	
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

/* 侧边栏样式 */
.sidebar {
	width: 280px;
	background: rgba(0, 0, 0, 0.9);
	backdrop-filter: blur(20px);
	height: 100%;
	color: #ffffff;
	box-shadow: 4px 0 40px rgba(0, 0, 0, 0.3);
	display: flex;
	flex-direction: column;
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	position: relative;
	z-index: 100;
	border-right: 1px solid rgba(255, 255, 255, 0.1);
	overflow: hidden;
	
	&.sidebar-hidden {
		transform: translateX(-100%);
	}
	
	.sidebar-header {
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(20px);
		position: relative;
		
		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			opacity: 0.1;
			z-index: -1;
		}
		
		.logo-container {
			display: flex;
			align-items: center;
			gap: 12px;
			
			.logo-icon {
				width: 48px;
				height: 48px;
				border-radius: 16px;
				background: linear-gradient(135deg, #667eea, #764ba2);
				display: flex;
				align-items: center;
				justify-content: center;
				position: relative;
				box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
				
				.logo-gradient {
					position: absolute;
					inset: 2px;
					border-radius: 14px;
					background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05));
				}
				
				.logo-symbol {
					font-size: 24px;
					z-index: 1;
				}
			}
			
			.logo-text-container {
				display: flex;
				flex-direction: column;
				
				.logo-text {
					font-size: 22px;
					font-weight: 700;
					background: linear-gradient(135deg, #667eea, #764ba2);
					background-clip: text;
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					line-height: 1.2;
					letter-spacing: -0.5px;
				}
				
				.logo-subtitle {
					font-size: 12px;
					color: rgba(255, 255, 255, 0.6);
					font-weight: 500;
					opacity: 0.8;
				}
			}
		}
	}
	
	.sidebar-menu {
		flex: 1;
		padding: 20px 0;
		
		.menu-item {
			height: 56px;
			display: flex;
			align-items: center;
			padding: 0 24px;
			margin: 4px 16px;
			cursor: pointer;
			transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
			border-radius: 16px;
			position: relative;
			overflow: hidden;
			
			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
				opacity: 0;
				transition: opacity 0.3s ease;
			}
			
			&.active {
				background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
				backdrop-filter: blur(20px);
				box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
				transform: translateX(4px);
				
				&::before {
					opacity: 1;
				}
				
				&::after {
					content: '';
					position: absolute;
					left: 0;
					top: 50%;
					transform: translateY(-50%);
					width: 4px;
					height: 24px;
					background: linear-gradient(135deg, #667eea, #764ba2);
					border-radius: 0 2px 2px 0;
				}
			}
			
			&:hover:not(.active) {
				background: rgba(255, 255, 255, 0.05);
				backdrop-filter: blur(10px);
				transform: translateX(2px);
				
				&::before {
					opacity: 0.5;
				}
			}
			
			.menu-icon {
				width: 32px;
				height: 32px;
				margin-right: 16px;
				border-radius: 10px;
				background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
				backdrop-filter: blur(10px);
				border: 1px solid rgba(102, 126, 234, 0.3);
				display: flex;
				align-items: center;
				justify-content: center;
				position: relative;
				transition: all 0.3s ease;
				
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
				
				// MCP图标
				&.mcp-icon::before {
					content: '';
					position: absolute;
					width: 12px;
					height: 8px;
					border: 2px solid #fff;
					border-radius: 2px;
					top: 40%;
					left: 50%;
					transform: translate(-50%, -50%);
				}
				
				&.mcp-icon::after {
					content: '';
					position: absolute;
					width: 8px;
					height: 6px;
					border: 2px solid #fff;
					border-radius: 1px;
					top: 60%;
					left: 50%;
					transform: translate(-50%, -50%);
					box-shadow: 0 0 0 1px rgba(255,255,255,0.3);
				}
				
				// AI工具集合图标
				&.tools-icon::before {
					content: '';
					position: absolute;
					width: 10px;
					height: 10px;
					border: 2px solid #fff;
					border-radius: 2px;
					top: 30%;
					left: 30%;
					transform: rotate(45deg);
				}
				
				&.tools-icon::after {
					content: '';
					position: absolute;
					width: 6px;
					height: 6px;
					border: 2px solid #fff;
					border-radius: 1px;
					top: 60%;
					right: 30%;
					transform: rotate(45deg);
				}
				
				// 全球新闻图标
				&.news-icon::before {
					content: '';
					position: absolute;
					width: 14px;
					height: 10px;
					border: 2px solid #fff;
					border-radius: 2px;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
				}
				
				&.news-icon::after {
					content: '';
					position: absolute;
					width: 8px;
					height: 2px;
					background: #fff;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					box-shadow: 0 -3px 0 #fff, 0 3px 0 #fff;
				}
				
				// 学习路线图标
				&.roadmap-icon::before {
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
				
				&.roadmap-icon::after {
					content: '';
					position: absolute;
					width: 6px;
					height: 2px;
					background: #fff;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					box-shadow: 0 -3px 0 #fff;
				}

				// 微信 Bot 图标
				&.weixin-icon::before {
					content: '';
					position: absolute;
					width: 14px;
					height: 11px;
					border: 2px solid #fff;
					border-radius: 6px;
					top: 50%;
					left: 50%;
					transform: translate(-60%, -60%);
				}

				&.weixin-icon::after {
					content: '';
					position: absolute;
					width: 10px;
					height: 8px;
					border: 2px solid rgba(255,255,255,0.7);
					border-radius: 4px;
					top: 50%;
					left: 50%;
					transform: translate(-30%, -30%);
				}
				
				// 单聊图标
				&.single-chat-icon::before {
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
				font-size: 15px;
				color: rgba(255, 255, 255, 0.8);
				font-weight: 500;
				letter-spacing: 0.2px;
				z-index: 1;
			}
			
			&.active .menu-text {
				color: #ffffff;
				font-weight: 600;
			}
			
			&.active .menu-icon {
				background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
				border-color: rgba(102, 126, 234, 0.5);
				box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
			}
			
			// 聊天菜单项特殊样式
			&.chat-menu-item {
				background: linear-gradient(45deg, #FF416C, #FF4B2B);
				margin: 10px 8px;
				border-radius: 12px;
				position: relative;
				border-left: none;
				box-shadow: 0 4px 15px rgba(255, 75, 43, 0.3);
				transition: all 0.3s ease;
				backdrop-filter: blur(10px);
				
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

/* 侧边栏遮罩层 */
.sidebar-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 99;
}

/* 移动端菜单按钮 */
.mobile-menu-button {
	display: none;
	width: 32px;
	height: 32px;
	border-radius: 4px;
	margin-right: 10px;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	
	.menu-bars {
		width: 20px;
		height: 2px;
		background-color: #ffffff;
		position: relative;
		
		&::before,
		&::after {
			content: '';
			position: absolute;
			width: 20px;
			height: 2px;
			background-color: #ffffff;
			left: 0;
		}
		
		&::before {
			top: -6px;
		}
		
		&::after {
			bottom: -6px;
		}
	}
	
	&:active {
		background-color: rgba(255, 255, 255, 0.1);
	}
}

/* 主内容区样式 */
.main-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	
	.header {
		height: 72px;
		background: rgba(0, 0, 0, 0.9);
		backdrop-filter: blur(20px);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 32px;
		box-shadow: 0 4px 32px rgba(0, 0, 0, 0.3);
		position: relative;
		z-index: 10;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		
		&::before {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 1px;
			background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
		}
		
		.page-title {
			font-size: 20px;
			font-weight: 600;
			color: #ffffff;
			letter-spacing: -0.3px;
		}
		
		.user-info {
			display: flex;
			align-items: center;
			cursor: pointer;
			position: relative;
			padding: 8px 16px;
			border-radius: 16px;
			z-index: 100;
			background: rgba(255, 255, 255, 0.1);
			backdrop-filter: blur(10px);
			border: 1px solid rgba(255, 255, 255, 0.2);
			transition: all 0.3s ease;
			
			&:hover {
				background: rgba(255, 255, 255, 0.15);
				box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
				transform: translateY(-1px);
			}
			
			.avatar {
				width: 40px;
				height: 40px;
				border-radius: 12px;
				background: linear-gradient(135deg, #667eea, #764ba2);
				margin-right: 12px;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 16px;
				font-weight: 600;
				color: #fff;
				cursor: pointer;
				position: relative;
				z-index: 101;
				box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
			}
			
			.username {
				font-size: 15px;
				color: #ffffff;
				margin-right: 8px;
				font-weight: 500;
			}
			
			.dropdown-icon {
				width: 0;
				height: 0;
				border-left: 4px solid transparent;
				border-right: 4px solid transparent;
				border-top: 4px solid rgba(255, 255, 255, 0.6);
				opacity: 0.6;
			}
		}
	}
	
	.content-area {
		flex: 1;
		padding: 20px;
		overflow-y: auto;
		overflow-x: hidden;
		display: flex;
		flex-direction: column;
		-webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
		
		.welcome-section {
			margin-bottom: 24px;
		}
		
		.welcome-card {
			background: rgba(0, 0, 0, 0.8);
			backdrop-filter: blur(20px);
			border-radius: 24px;
			box-shadow: 0 8px 40px rgba(0, 0, 0, 0.3);
			padding: 40px;
			border: 1px solid rgba(255, 255, 255, 0.1);
			position: relative;
			overflow: hidden;
			
			&::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				height: 1px;
				background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
			}
			
			.welcome-header {
				text-align: center;
				margin-bottom: 40px;
				
				.welcome-icon {
					width: 80px;
					height: 80px;
					margin: 0 auto 24px;
					border-radius: 24px;
					background: linear-gradient(135deg, #667eea, #764ba2);
					display: flex;
					align-items: center;
					justify-content: center;
					position: relative;
					box-shadow: 0 12px 48px rgba(102, 126, 234, 0.3);
					
					.icon-glow {
						position: absolute;
						inset: -2px;
						border-radius: 26px;
						background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
						filter: blur(8px);
						z-index: -1;
					}
					
					.welcome-emoji {
						font-size: 36px;
						z-index: 1;
					}
				}
				
				.welcome-title {
					font-size: 32px;
					color: #ffffff;
					font-weight: 700;
					margin-bottom: 12px;
					letter-spacing: -0.5px;
					line-height: 1.2;
				}
				
				.welcome-subtitle {
					font-size: 16px;
					color: rgba(255, 255, 255, 0.7);
					font-weight: 400;
					line-height: 1.5;
					opacity: 0.9;
				}
			}
			
			.feature-grid {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
				gap: 20px;
				
				.feature-card {
					background: rgba(255, 255, 255, 0.05);
					backdrop-filter: blur(10px);
					border-radius: 20px;
					padding: 24px;
					text-align: center;
					border: 1px solid rgba(255, 255, 255, 0.1);
					cursor: pointer;
					transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
					position: relative;
					overflow: hidden;
					
					&::before {
						content: '';
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
						opacity: 0;
						transition: opacity 0.3s ease;
					}
					
					&:hover {
						transform: translateY(-8px);
						box-shadow: 0 16px 64px rgba(0, 0, 0, 0.4);
						background: rgba(255, 255, 255, 0.08);
						
						&::before {
							opacity: 1;
						}
						
						.feature-icon {
							transform: scale(1.1);
							
							.icon-bg {
								opacity: 1;
							}
						}
					}
					
					.feature-icon {
						width: 56px;
						height: 56px;
						margin: 0 auto 16px;
						border-radius: 16px;
						background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
						display: flex;
						align-items: center;
						justify-content: center;
						position: relative;
						transition: all 0.3s ease;
						
						.icon-bg {
							position: absolute;
							inset: 0;
							border-radius: 16px;
							background: linear-gradient(135deg, #667eea, #764ba2);
							opacity: 0;
							transition: opacity 0.3s ease;
						}
						
						.feature-emoji {
							font-size: 24px;
							z-index: 1;
						}
					}
					
					.feature-title {
						display: block;
						font-size: 16px;
						font-weight: 600;
						color: #ffffff;
						margin-bottom: 8px;
						letter-spacing: 0.2px;
					}
					
					.feature-desc {
						font-size: 13px;
						color: rgba(255, 255, 255, 0.6);
						line-height: 1.4;
						opacity: 0.8;
					}
				}
			}
		}
		
		/* 聊天界面样式 */
		.chat-interface {
			display: flex;
			flex-direction: column;
			height: 100%;
			background: rgba(0, 0, 0, 0.8);
			backdrop-filter: blur(10px);
			border-radius: 16px;
			overflow: hidden;
			box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
			border: 1px solid rgba(255, 255, 255, 0.1);
			
			/* 消息列表区域 */
			.message-list {
				flex: 1;
				padding: 20px;
				overflow-y: auto;
				overflow-x: hidden;
				max-height: calc(100vh - 220px); /* 确保有足够空间显示输入区域 */
				-webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
				
				.message-item {
					margin-bottom: 15px;
					
					/* 消息时间戳 */
					.message-time {
						text-align: center;
						margin: 10px 0;
						
						text {
							display: inline-block;
							padding: 2px 8px;
							background-color: rgba(255, 255, 255, 0.1);
							border-radius: 10px;
							font-size: 12px;
							color: rgba(255, 255, 255, 0.6);
						}
					}
					
					/* 发送者信息与消息内容 */
					.message-sender {
						display: flex;
						margin-top: 8px;
						
						.sender-avatar {
							width: 40px;
							height: 40px;
							border-radius: 50%;
							background-size: cover;
							background-position: center;
							flex-shrink: 0;
							box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
							display: flex;
							align-items: center;
							justify-content: center;
							font-size: 16px;
							font-weight: bold;
							color: #fff;
							overflow: hidden;
						}
						
						.message-content {
							margin: 0 12px;
							max-width: 70%;
							
							.sender-name {
								font-size: 12px;
								color: rgba(255, 255, 255, 0.6);
								margin-bottom: 4px;
							}
							
							.message-bubble {
								padding: 10px 15px;
								border-radius: 4px 18px 18px 18px;
								background-color: rgba(255, 255, 255, 0.1);
								box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
								position: relative;
								word-break: break-word;
								max-width: 100%;
								
								text {
									color: #ffffff;
									font-size: 14px;
									line-height: 1.6;
								}
								
								/* 图片消息样式 */
								.message-image {
									max-width: 240px;
									max-height: 240px;
									border-radius: 8px;
									display: block;
								}
								
								/* 语音消息样式 */
								.voice-message {
									display: flex;
									align-items: center;
									min-width: 80px;
									
									.voice-icon {
										width: 16px;
										height: 16px;
										background-color: #fff;
										border-radius: 50%;
										margin-right: 8px;
										position: relative;
										
										&::before,
										&::after {
											content: '';
											position: absolute;
											background-color: #333;
											border-radius: 3px;
										}
										
										&::before {
											width: 6px;
											height: 6px;
											top: 5px;
											left: 5px;
										}
										
										&::after {
											width: 3px;
											height: 10px;
											top: 3px;
											right: 2px;
											transform: rotate(-30deg);
										}
									}
								}
							}
						}
					}
					
					/* 自己发送的消息样式 */
					&.message-mine {
						.message-sender {
							flex-direction: row-reverse;
							
							.message-content {
								.sender-name {
									text-align: right;
								}
								
								.message-bubble {
									background: linear-gradient(45deg, #6a11cb, #2575fc);
									border-radius: 18px 4px 18px 18px;
									box-shadow: 0 2px 5px rgba(106, 17, 203, 0.3);
									
									text {
										color: #fff;
									}
									
									.voice-message {
										.voice-icon {
											background-color: #fff;
											
											&::before,
											&::after {
												background-color: #333;
											}
										}
										
										text {
											color: #fff;
										}
									}
								}
							}
						}
					}
					
					/* 其他人发送的消息样式 */
					&.message-other {
						.message-sender {
							.message-bubble {
								background-color: rgba(255, 255, 255, 0.1);
							}
						}
					}
				}
			}
			
			/* 消息输入区域 */
			.message-input-area {
				display: flex;
				align-items: center;
				padding: 16px;
				border-top: 1px solid rgba(255, 255, 255, 0.1);
				background: rgba(0, 0, 0, 0.9);
				backdrop-filter: blur(10px);
				position: relative;
				z-index: 10;
				flex-shrink: 0;
				min-height: 70px;
				
				.message-input {
					flex: 1;
					height: 44px;
					border: 1px solid rgba(255, 255, 255, 0.2);
					border-radius: 22px;
					padding: 0 16px;
					font-size: 15px;
					color: #ffffff;
					background: rgba(255, 255, 255, 0.1);
					box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
					
					&:focus {
						outline: none;
						border-color: #667eea;
						box-shadow: 0 2px 12px rgba(102, 126, 234, 0.3);
					}
					
					&::placeholder {
						color: rgba(255, 255, 255, 0.5);
					}
				}
				
				.voice-record-button {
					width: 40px;
					height: 40px;
					margin-left: 10px;
					border-radius: 50%;
					background-color: rgba(255, 255, 255, 0.1);
					display: flex;
					align-items: center;
					justify-content: center;
					cursor: pointer;
					
					.voice-icon-record {
						width: 20px;
						height: 20px;
						border-radius: 50%;
						background-color: #ff4b2b;
						position: relative;
						
						&::before {
							content: '';
							position: absolute;
							width: 8px;
							height: 8px;
							background-color: #fff;
							border-radius: 50%;
							top: 50%;
							left: 50%;
							transform: translate(-50%, -50%);
						}
					}
					
					&:active {
						background-color: rgba(255, 255, 255, 0.2);
					}
				}
				
				.send-button {
					margin-left: 12px;
					padding: 0 20px;
					height: 44px;
					min-width: 80px;
					border-radius: 22px;
					background: linear-gradient(135deg, #667eea, #764ba2);
					color: #fff;
					font-size: 15px;
					line-height: 44px;
					text-align: center;
					box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
					cursor: pointer;
					transition: all 0.3s ease;
					flex-shrink: 0;
					display: flex;
					align-items: center;
					justify-content: center;
					width: auto;
					overflow: visible;
					font-weight: 500;
					
					text {
						white-space: nowrap;
						color: #fff;
					}
					
					&:hover {
						transform: translateY(-2px);
						box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
					}
					
					&:active {
						transform: translateY(0px);
						box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
					}
				}
			}
		}
	}
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
	.sidebar {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 75%;
		max-width: 240px;
		z-index: 1000;
		
		.sidebar-header {
			height: 60px;
			
			.logo-icon {
				width: 36px;
				height: 36px;
				border-radius: 10px;
				
				.logo-symbol {
					font-size: 18px;
				}
			}
			
			.logo-text-container {
				.logo-text {
					font-size: 17px;
				}
				
				.logo-subtitle {
					font-size: 10px;
				}
			}
		}
		
		.sidebar-menu {
			padding: 10px 0;
			
			.menu-item {
				height: 44px;
				padding: 0 16px;
				margin: 2px 10px;
				border-radius: 12px;
				
				.menu-icon {
					width: 26px;
					height: 26px;
					margin-right: 10px;
					border-radius: 8px;
				}
				
				.menu-text {
					font-size: 13px;
				}
				
				&.chat-menu-item {
					margin: 6px 8px;
				}
			}
		}
	}
	
	.mobile-menu-button {
		display: flex;
	}
	
	.main-content {
		width: 100%;
		min-width: 0;
	}
	
	.header {
		padding: 0 12px;
		height: 56px;
		overflow: hidden;
		box-sizing: border-box;
		
		.page-title {
			font-size: 15px;
			flex: 1;
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			text-align: center;
		}
		
		.user-info {
			padding: 6px 10px;
			flex-shrink: 0;
			
			.avatar {
				width: 30px;
				height: 30px;
				font-size: 13px;
				margin-right: 0;
			}
			
			.username {
				display: none;
			}
			
			.dropdown-icon {
				display: none;
			}
		}
	}
	
	.content-area {
		padding: 12px;
		
		.welcome-card {
			padding: 20px 16px;
			border-radius: 16px;
			
			.welcome-header {
				margin-bottom: 20px;
				
				.welcome-icon {
					width: 56px;
					height: 56px;
					border-radius: 16px;
					margin-bottom: 16px;
					
					.welcome-emoji {
						font-size: 24px;
					}
				}
				
				.welcome-title {
					font-size: 20px;
				}
				
				.welcome-subtitle {
					font-size: 13px;
				}
			}
			
			.feature-grid {
				grid-template-columns: repeat(3, 1fr);
				gap: 10px;
				
				.feature-card {
					padding: 14px 8px;
					border-radius: 14px;
					
					.feature-icon {
						width: 40px;
						height: 40px;
						border-radius: 12px;
						margin-bottom: 10px;
						
						.feature-emoji {
							font-size: 18px;
						}
					}
					
					.feature-title {
						font-size: 13px;
						margin-bottom: 4px;
					}
					
					.feature-desc {
						font-size: 11px;
					}
				}
			}
		}
	}
}

/* 好友列表样式 */
.friend-list {
	display: flex;
	flex-direction: column;
	height: 100%;
	background: rgba(0, 0, 0, 0.8);
	backdrop-filter: blur(10px);
	border-radius: 16px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	overflow: hidden;
	
	.friend-list-header {
		padding: 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(0, 0, 0, 0.9);
		backdrop-filter: blur(10px);
		
		text {
			font-size: 16px;
			font-weight: bold;
			color: #ffffff;
		}
		
		.friend-actions {
			display: flex;
			align-items: center;
			
			.search-box {
				position: relative;
				width: 200px;
				
				input {
					width: 100%;
					height: 32px;
					border-radius: 16px;
					border: 1px solid rgba(255, 255, 255, 0.2);
					padding: 0 30px 0 12px;
					font-size: 14px;
					background: rgba(255, 255, 255, 0.1);
					color: #ffffff;
					
					&:focus {
						outline: none;
						border-color: #6a11cb;
					}
					
					&::placeholder {
						color: rgba(255, 255, 255, 0.5);
					}
				}
				
				.search-icon {
					position: absolute;
					right: 10px;
					top: 50%;
					transform: translateY(-50%);
					width: 14px;
					height: 14px;
					border: 2px solid rgba(255, 255, 255, 0.6);
					border-radius: 50%;
					
					&::after {
						content: '';
						position: absolute;
						width: 2px;
						height: 8px;
						background: rgba(255, 255, 255, 0.6);
						bottom: -6px;
						right: -2px;
						transform: rotate(-45deg);
					}
				}
			}
		}
	}
	
	.friend-list-content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 10px;
		position: relative;
		-webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
		
		.friend-apply-btn {
			width: 100%;
			height: 40px;
			display: flex;
			align-items: center;
			padding: 0 15px;
			background-color: rgba(255, 255, 255, 0.1);
			border-radius: 8px;
			margin-bottom: 10px;
			cursor: pointer;
			position: relative;
			
			&:hover {
				background-color: rgba(255, 255, 255, 0.15);
			}
			
			.apply-icon {
				width: 20px;
				height: 20px;
				margin-right: 10px;
				position: relative;
				
				&::before {
					content: '';
					position: absolute;
					width: 16px;
					height: 16px;
					border: 2px solid rgba(255, 255, 255, 0.6);
					border-radius: 50%;
					top: 0;
					left: 0;
				}
				
				&::after {
					content: '+';
					position: absolute;
					font-size: 14px;
					color: rgba(255, 255, 255, 0.6);
					bottom: -4px;
					right: -4px;
					font-weight: bold;
				}
			}
			
			.apply-text {
				flex: 1;
				font-size: 14px;
				color: #ffffff;
			}
			
			.apply-badge {
				min-width: 20px;
				height: 20px;
				background-color: #ff4b2b;
				border-radius: 10px;
				color: #fff;
				font-size: 12px;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0 6px;
			}
		}
		
		.empty-tip {
			text-align: center;
			padding: 40px 0;
			color: rgba(255, 255, 255, 0.6);
			
			.add-friend-btn {
				margin: 15px auto 0;
				width: 120px;
				height: 36px;
				line-height: 36px;
				background: linear-gradient(45deg, #6a11cb, #2575fc);
				border-radius: 18px;
				color: #fff;
				font-size: 14px;
				cursor: pointer;
				
				&:hover {
					opacity: 0.9;
				}
			}
		}
		
		.friend-items {
			.friend-item {
				display: flex;
				align-items: center;
				padding: 12px;
				border-radius: 8px;
				cursor: pointer;
				transition: all 0.2s ease;
				
				&:hover {
					background-color: rgba(255, 255, 255, 0.1);
				}
				
				.friend-avatar {
					width: 45px;
					height: 45px;
					border-radius: 50%;
					margin-right: 12px;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 18px;
					color: #fff;
					flex-shrink: 0;
					overflow: hidden;
				}
				
				.friend-info {
					flex: 1;
					
					.friend-name {
						font-size: 15px;
						color: #ffffff;
						margin-bottom: 4px;
					}
					
					.friend-status {
						font-size: 12px;
						color: rgba(255, 255, 255, 0.6);
						
						&.online {
							color: #4CAF50;
						}
					}
				}
				
				.last-message {
					font-size: 13px;
					color: rgba(255, 255, 255, 0.6);
					max-width: 150px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
			}
		}
		
		.pagination {
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 20px 0;
			
			.page-btn {
				padding: 8px 16px;
				background: linear-gradient(45deg, #6a11cb, #2575fc);
				color: #fff;
				border-radius: 4px;
				cursor: pointer;
				margin: 0 10px;
				
				&.disabled {
					opacity: 0.5;
					cursor: not-allowed;
				}
				
				&:not(.disabled):hover {
					opacity: 0.9;
				}
			}
			
			.page-info {
				font-size: 14px;
				color: rgba(255, 255, 255, 0.6);
			}
		}
	}
}

/* 添加好友弹窗 */
.add-friend-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(5px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	
	.modal-content {
		width: 300px;
		background: rgba(0, 0, 0, 0.95);
		backdrop-filter: blur(20px);
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.1);
		
		.modal-header {
			padding: 15px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			background: rgba(0, 0, 0, 0.8);
			
			text {
				font-size: 16px;
				font-weight: bold;
				color: #ffffff;
			}
			
			.close-btn {
				width: 24px;
				height: 24px;
				line-height: 24px;
				text-align: center;
				border-radius: 50%;
				font-size: 18px;
				color: rgba(255, 255, 255, 0.6);
				cursor: pointer;
				
				&:hover {
					background-color: rgba(255, 255, 255, 0.1);
					color: #ffffff;
				}
			}
		}
		
		.modal-body {
			padding: 20px;
			
			.input-label {
				display: block;
				font-size: 14px;
				color: #ffffff;
				margin-bottom: 5px;
				font-weight: 500;
			}
			
			input {
				width: 100%;
				height: 40px;
				border: 1px solid rgba(255, 255, 255, 0.2);
				border-radius: 4px;
				padding: 0 12px;
				margin-bottom: 15px;
				font-size: 14px;
				background: rgba(255, 255, 255, 0.1);
				color: #ffffff;
				
				&:focus {
					outline: none;
					border-color: #667eea;
					box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
				}
				
				&::placeholder {
					color: rgba(255, 255, 255, 0.5);
				}
			}
			
			.add-btn {
				height: 40px;
				line-height: 40px;
				background: linear-gradient(45deg, #667eea, #764ba2);
				border-radius: 4px;
				color: #fff;
				font-size: 14px;
				text-align: center;
				cursor: pointer;
				
				&:hover {
					opacity: 0.9;
					transform: translateY(-1px);
					box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
				}
			}
		}
	}
}

/* 聊天头部 */
.chat-header {
	height: 60px;
	background: rgba(0, 0, 0, 0.95);
	backdrop-filter: blur(20px);
	display: flex;
	align-items: center;
	padding: 0 15px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
	
	.back-btn {
		width: 32px;
		height: 32px;
		border-radius: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		margin-right: 10px;
		
		&:hover {
			background-color: rgba(255, 255, 255, 0.1);
		}
		
		.back-icon {
			width: 12px;
			height: 12px;
			border-left: 2px solid #ffffff;
			border-bottom: 2px solid #ffffff;
			transform: rotate(45deg);
		}
	}
	
	.chat-title {
		font-size: 16px;
		font-weight: bold;
		color: #ffffff;
	}
}

/* 搜索好友界面 */
.search-friend-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(5px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	
	.modal-content {
		width: 90%;
		max-width: 500px;
		max-height: 80vh;
		background: rgba(0, 0, 0, 0.95);
		backdrop-filter: blur(20px);
		border-radius: 16px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.1);
		
		.modal-header {
			padding: 15px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			background: rgba(0, 0, 0, 0.8);
			
			text {
				font-size: 16px;
				font-weight: bold;
				color: #ffffff;
			}
			
			.close-btn {
				width: 24px;
				height: 24px;
				line-height: 24px;
				text-align: center;
				border-radius: 50%;
				font-size: 18px;
				color: rgba(255, 255, 255, 0.6);
				cursor: pointer;
				
				&:hover {
					background-color: rgba(255, 255, 255, 0.1);
					color: #ffffff;
				}
			}
		}
		
		.modal-body {
			padding: 20px;
			flex: 1;
			overflow-y: auto;
			
			.search-input-box {
				display: flex;
				margin-bottom: 20px;
				
				input {
					flex: 1;
					height: 40px;
					border: 1px solid rgba(255, 255, 255, 0.2);
					border-radius: 4px 0 0 4px;
					padding: 0 12px;
					font-size: 14px;
					background: rgba(255, 255, 255, 0.1);
					color: #ffffff;
					
					&:focus {
						outline: none;
						border-color: #667eea;
						box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
					}
					
					&::placeholder {
						color: rgba(255, 255, 255, 0.5);
					}
				}
				
				.search-btn {
					width: 80px;
					height: 40px;
					line-height: 40px;
					background: linear-gradient(45deg, #667eea, #764ba2);
					border-radius: 0 4px 4px 0;
					color: #fff;
					font-size: 14px;
					text-align: center;
					cursor: pointer;
					
					&:hover {
						opacity: 0.9;
						transform: translateY(-1px);
						box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
					}
				}
			}
			
			.search-results {
				.search-result-item {
					display: flex;
					align-items: center;
					padding: 12px;
					border-bottom: 1px solid rgba(255, 255, 255, 0.1);
					border-radius: 8px;
					margin-bottom: 8px;
					background: rgba(255, 255, 255, 0.05);
					
					&:last-child {
						border-bottom: none;
						margin-bottom: 0;
					}
					
					&:hover {
						background: rgba(255, 255, 255, 0.1);
					}
					
					.user-avatar {
						width: 50px;
						height: 50px;
						border-radius: 50%;
						margin-right: 15px;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 20px;
						color: #fff;
						flex-shrink: 0;
						overflow: hidden;
					}
					
					.user-info {
						flex: 1;
						
						.user-name {
							font-size: 16px;
							color: #ffffff;
							margin-bottom: 5px;
						}
						
						.user-id {
							font-size: 13px;
							color: rgba(255, 255, 255, 0.6);
						}
					}
					
					.add-friend-btn {
						padding: 6px 15px;
						background: linear-gradient(45deg, #667eea, #764ba2);
						border-radius: 20px;
						color: #fff;
						font-size: 14px;
						cursor: pointer;
						
						&:hover {
							opacity: 0.9;
							transform: translateY(-1px);
							box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
						}
					}
				}
			}
			
			.no-result {
				text-align: center;
				padding: 30px 0;
				color: rgba(255, 255, 255, 0.6);
			}
		}
	}
}

/* 好友申请列表弹窗 */
.friend-apply-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(5px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	
	.modal-content {
		width: 90%;
		max-width: 500px;
		max-height: 80vh;
		background: rgba(0, 0, 0, 0.95);
		backdrop-filter: blur(20px);
		border-radius: 16px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.1);
		
		.modal-header {
			padding: 15px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			background: rgba(0, 0, 0, 0.8);
			
			text {
				font-size: 16px;
				font-weight: bold;
				color: #ffffff;
			}
			
			.close-btn {
				width: 24px;
				height: 24px;
				line-height: 24px;
				text-align: center;
				border-radius: 50%;
				font-size: 18px;
				color: rgba(255, 255, 255, 0.6);
				cursor: pointer;
				
				&:hover {
					background-color: rgba(255, 255, 255, 0.1);
					color: #ffffff;
				}
			}
		}
		
		.modal-body {
			padding: 20px;
			flex: 1;
			overflow-y: auto;
			
			.empty-tip {
				text-align: center;
				padding: 30px 0;
				color: rgba(255, 255, 255, 0.6);
			}
			
			.apply-list {
				.apply-item {
					display: flex;
					align-items: center;
					padding: 12px;
					border-bottom: 1px solid rgba(255, 255, 255, 0.1);
					border-radius: 8px;
					margin-bottom: 8px;
					background: rgba(255, 255, 255, 0.05);
					
					&:last-child {
						border-bottom: none;
						margin-bottom: 0;
					}
					
					&:hover {
						background: rgba(255, 255, 255, 0.1);
					}
					
					.user-avatar {
						width: 50px;
						height: 50px;
						border-radius: 50%;
						margin-right: 15px;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 20px;
						color: #fff;
						flex-shrink: 0;
						overflow: hidden;
					}
					
					.apply-info {
						flex: 1;
						
						.user-name {
							font-size: 16px;
							color: #ffffff;
							margin-bottom: 5px;
						}
						
						.apply-msg {
							font-size: 13px;
							color: rgba(255, 255, 255, 0.6);
						}
					}
					
					.apply-actions {
						.agree-btn {
							padding: 6px 15px;
							background: linear-gradient(45deg, #667eea, #764ba2);
							border-radius: 20px;
							color: #fff;
							font-size: 14px;
							cursor: pointer;
							
							&:hover {
								opacity: 0.9;
								transform: translateY(-1px);
								box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
							}
						}
					}
				}
			}
		}
	}
}

/* MCP界面样式 */
.mcp-interface {
	height: 100%;
	background: rgba(0, 0, 0, 0.8);
	backdrop-filter: blur(20px);
	border-radius: 16px;
	border: 1px solid rgba(255, 255, 255, 0.1);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	overflow-y: auto;
	overflow-x: hidden;
	padding: 24px;
	-webkit-overflow-scrolling: touch;
}

/* Hero 头部 */
.mcp-hero {
	text-align: center;
	padding: 40px 20px 32px;
	margin-bottom: 24px;
	background: rgba(255, 255, 255, 0.03);
	border-radius: 20px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0; left: 0; right: 0; bottom: 0;
		background: radial-gradient(ellipse at 50% 0%, rgba(102, 126, 234, 0.15) 0%, transparent 70%);
		pointer-events: none;
	}

	.mcp-hero-icon {
		font-size: 48px;
		margin-bottom: 16px;
		display: block;
	}

	.mcp-hero-title {
		font-size: 28px;
		font-weight: 700;
		background: linear-gradient(135deg, #667eea, #764ba2);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		margin-bottom: 8px;
		letter-spacing: -0.5px;
	}

	.mcp-hero-subtitle {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.5);
		margin-bottom: 24px;
	}

	.mcp-hero-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 10px 24px;
		background: rgba(102, 126, 234, 0.15);
		border: 1px solid rgba(102, 126, 234, 0.3);
		border-radius: 24px;
		color: #a78bfa;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.3s ease;

		&:hover {
			background: rgba(102, 126, 234, 0.25);
			border-color: rgba(102, 126, 234, 0.5);
			transform: translateY(-2px);
			box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
		}

		.mcp-hero-link-arrow {
			font-size: 16px;
		}
	}
}

/* 通用块 */
.mcp-block {
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 16px;
	padding: 20px;
	margin-bottom: 16px;

	.mcp-block-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 15px;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 16px;

		.mcp-block-dot {
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: linear-gradient(135deg, #667eea, #764ba2);
			flex-shrink: 0;
			box-shadow: 0 0 8px rgba(102, 126, 234, 0.5);
		}
	}
}

/* 功能列表 */
.mcp-feature-list {
	display: flex;
	flex-direction: column;
	gap: 10px;

	.mcp-feature-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 14px;
		background: rgba(255, 255, 255, 0.04);
		border-radius: 10px;
		border-left: 3px solid rgba(102, 126, 234, 0.5);

		.mcp-tag {
			padding: 3px 10px;
			background: rgba(102, 126, 234, 0.2);
			border: 1px solid rgba(102, 126, 234, 0.3);
			color: #a78bfa;
			border-radius: 20px;
			font-size: 11px;
			font-weight: 600;
			white-space: nowrap;
		}

		.mcp-feature-text {
			font-size: 13px;
			color: rgba(255, 255, 255, 0.75);
			line-height: 1.5;
		}
	}
}

/* MCP 卡片网格 */
.mcp-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
	gap: 12px;

	.mcp-card {
		background: rgba(255, 255, 255, 0.04);
		border-radius: 12px;
		padding: 16px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

		&:hover {
			transform: translateY(-3px);
			background: rgba(255, 255, 255, 0.07);
			border-color: rgba(102, 126, 234, 0.3);
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		}

		.mcp-card-top {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			margin-bottom: 8px;

			.mcp-card-name {
				font-size: 15px;
				font-weight: 600;
				color: #ffffff;
				flex: 1;
				margin-right: 8px;
			}

			.mcp-card-badges {
				display: flex;
				flex-direction: column;
				gap: 4px;
				align-items: flex-end;

				.mcp-cat-badge {
					padding: 2px 8px;
					background: rgba(102, 126, 234, 0.2);
					border: 1px solid rgba(102, 126, 234, 0.3);
					color: #a78bfa;
					border-radius: 8px;
					font-size: 11px;
				}

				.mcp-rec-badge {
					padding: 2px 6px;
					background: rgba(255, 193, 7, 0.15);
					border: 1px solid rgba(255, 193, 7, 0.3);
					color: #fbbf24;
					border-radius: 6px;
					font-size: 10px;
					font-weight: 600;
				}
			}
		}

		.mcp-card-desc {
			font-size: 12px;
			color: rgba(255, 255, 255, 0.55);
			line-height: 1.5;
		}
	}
}

/* 优势列表 */
.mcp-advantage-list {
	display: flex;
	flex-direction: column;
	gap: 12px;

	.mcp-advantage-item {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		padding: 14px;
		background: rgba(255, 255, 255, 0.04);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.06);

		.mcp-adv-num {
			width: 28px;
			height: 28px;
			background: rgba(102, 126, 234, 0.2);
			border: 1px solid rgba(102, 126, 234, 0.3);
			color: #a78bfa;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 13px;
			font-weight: 700;
			flex-shrink: 0;
		}

		.mcp-adv-body {
			flex: 1;

			.mcp-adv-title {
				display: block;
				font-size: 14px;
				font-weight: 600;
				color: #ffffff;
				margin-bottom: 4px;
			}

			.mcp-adv-desc {
				font-size: 13px;
				color: rgba(255, 255, 255, 0.55);
				line-height: 1.5;
			}
		}
	}
}

@keyframes pulse {
	0% { opacity: 1; transform: scale(1); }
	50% { opacity: 0.8; transform: scale(1.05); }
	100% { opacity: 1; transform: scale(1); }
}

/* 分页控件样式 */
.pagination {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 20px 0;
	
	.page-btn {
		padding: 8px 16px;
		background: linear-gradient(45deg, #667eea, #764ba2);
		color: #fff;
		border-radius: 4px;
		cursor: pointer;
		margin: 0 10px;
		
		&.disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
		
		&:not(.disabled):hover {
			opacity: 0.9;
		}
	}
	
	.page-info {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.6);
	}
}

/* 响应式设计 */
@media (max-width: 768px) {
	.mcp-interface {
		padding: 12px;
	}

	.mcp-hero {
		padding: 28px 16px 24px;

		.mcp-hero-icon { font-size: 36px; }
		.mcp-hero-title { font-size: 22px; }
		.mcp-hero-subtitle { font-size: 12px; }
	}

	.mcp-grid {
		grid-template-columns: 1fr;
	}
}
</style> 