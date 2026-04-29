<template>
	<view class="home-container">
		<view class="chat-interface">
			<!-- 好友列表 -->
			<view class="friend-list" v-if="activeMenu === 5">
				<view class="friend-list-header">
					<view class="header-left">
						<view class="back-to-home" @click="backToHome">
							<view class="back-icon"></view>
							<text>返回</text>
						</view>
						<text class="header-title">好友列表</text>
					</view>
					<view class="friend-actions">
						<view class="search-box">
							<input type="text" v-model="friendSearchKey" placeholder="搜索好友" />
							<view class="search-icon"></view>
						</view>
						<view class="search-friend-btn" @click="openSearchFriendUI">
							<view class="search-friend-icon"></view>
							<text>搜索添加好友</text>
						</view>
					</view>
				</view>
				
				<view class="friend-list-content">
					<!-- 好友申请按钮 -->
					<view class="friend-apply-btn" @click="showFriendApplyList">
						<view class="apply-icon"></view>
						<text class="apply-text">好友申请</text>
						<text class="apply-badge" v-if="unreadApplyCount > 0">{{unreadApplyCount}}</text>
					</view>
					
					<!-- 空列表提示 -->
					<view class="empty-tip" v-if="filteredFriendList.length === 0">
						<image class="empty-icon" src="/static/images/empty-friends.png" mode="aspectFit"></image>
						<text class="empty-text">暂无好友</text>
						<text class="add-friend-btn" @click="openSearchFriendUI">添加好友</text>
					</view>
					
					<!-- 好友列表 -->
					<view class="friend-items" v-else>
						<view class="friend-item" v-for="friend in filteredFriendList" :key="friend.uid" @click="startChat(friend)">
							<view class="friend-avatar" :style="generateAvatarStyle(friend.name)">
								{{getAvatarText(friend.name)}}
								<!-- 未读消息红点 -->
								<view class="unread-badge" v-if="getUnreadCount(friend.uid) > 0">
									<text v-if="getUnreadCount(friend.uid) <= 99">{{getUnreadCount(friend.uid)}}</text>
									<text v-else>99+</text>
								</view>
							</view>
							<view class="friend-info">
								<view class="friend-name-row">
									<text class="friend-name">{{friend.name}}</text>
									<text class="friend-status" :class="{'online': friend.online}">
										<view class="status-dot"></view>
										{{friend.online ? '在线' : '离线'}}
									</text>
								</view>
								<text class="last-active-time">{{formatLastActiveTime(friend.lastActiveTime)}}</text>
							</view>
							<view class="friend-action">
								<view class="chat-icon"></view>
							</view>
						</view>
					</view>
					
					<!-- 分页 -->
					<view class="pagination" v-if="totalPages > 1">
						<text class="page-btn" :class="{'disabled': currentPage === 1}" @click="changePage(currentPage - 1)">上一页</text>
						<text class="page-info">{{currentPage}} / {{totalPages}}</text>
						<text class="page-btn" :class="{'disabled': currentPage === totalPages}" @click="changePage(currentPage + 1)">下一页</text>
					</view>
				</view>
			</view>
			
			<!-- 聊天窗口 -->
			<view v-else-if="activeMenu === 7" class="chat-window">
				<view class="chat-header">
					<view class="back-btn" @click="backToFriendList">
						<view class="back-icon"></view>
					</view>
					<text class="chat-title">{{currentChatFriend.name}}</text>
				</view>
				
				<view class="chat-content">
					<view class="message-list">
						<view class="message-item" v-for="(message, index) in singleChatMessages" :key="message.id" :class="{'message-mine': message.isMe}">
							<view class="message-time" v-if="shouldShowTime(index, singleChatMessages)">
								<text>{{formatTime(message.time)}}</text>
							</view>
							<view class="message-sender">
								<view class="sender-avatar" :style="generateAvatarStyle(message.name)">
									{{getAvatarText(message.name)}}
								</view>
								<view class="message-content">
									<text class="sender-name">{{message.name}}</text>
									<view class="message-bubble">
										<text>{{message.content}}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				
				<view class="message-input-area">
					<input type="text" class="message-input" v-model="singleChatInput" placeholder="输入消息..." @keyup.enter="sendSingleChatMessage" />
					<view class="send-button" @click="sendSingleChatMessage">发送</view>
				</view>
			</view>
		</view>
		
		<!-- 搜索好友弹窗 -->
		<view class="search-friend-modal" v-if="showSearchFriendUI">
			<view class="modal-content">
				<view class="modal-header">
					<text>搜索添加好友</text>
					<text class="close-btn" @click="closeSearchFriendUI">×</text>
				</view>
				<view class="modal-body">
					<view class="search-input-box">
						<input type="text" v-model="searchFriendKey" placeholder="请输入用户名" @keyup.enter="searchFriendsByName" />
						<view class="search-btn" @click="searchFriendsByName" :class="{'loading': searchLoading}">
							{{searchLoading ? '搜索中...' : '搜索'}}
						</view>
					</view>
					
					<view class="search-results" v-if="hasSearched">
						<view class="search-result-item" v-for="user in searchFriendResults" :key="user.uid">
							<view class="user-avatar" :style="generateAvatarStyle(user.name)">
								{{getAvatarText(user.name)}}
							</view>
							<view class="user-info">
								<text class="user-name">{{user.name}}</text>
								<text class="user-id">ID: {{user.uid}}</text>
							</view>
							<view class="add-friend-btn" @click="prepareAddFriend(user)">添加</view>
						</view>
					</view>
					
					<view class="no-result" v-if="hasSearched && searchFriendResults.length === 0">
						<text>未找到相关用户</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 添加好友弹窗 -->
		<view class="add-friend-modal" v-if="showAddFriendModal">
			<view class="modal-content">
				<view class="modal-header">
					<text>添加好友</text>
					<text class="close-btn" @click="showAddFriendModal = false">×</text>
				</view>
				<view class="modal-body">
					<text class="input-label">验证消息</text>
					<input 
						type="text" 
						v-model="addFriendForm.msg" 
						placeholder="请输入验证消息" 
						maxlength="50"
					/>
					<view class="add-btn" @click="sendFriendRequest">发送申请</view>
				</view>
			</view>
		</view>
		
		<!-- 好友申请列表弹窗 -->
		<view class="friend-apply-modal" v-if="showFriendApplyModal">
			<view class="modal-content">
				<view class="modal-header">
					<text>好友申请</text>
					<text class="close-btn" @click="showFriendApplyModal = false">×</text>
				</view>
				<view class="modal-body">
					<view class="empty-tip" v-if="friendApplyList.length === 0">
						<text>暂无好友申请</text>
					</view>
					
					<view class="apply-list" v-else>
						<view class="apply-item" v-for="apply in friendApplyList" :key="apply.applyId">
							<view class="user-avatar" :style="generateAvatarStyle(apply.name || `用户${apply.uid}`)">
								{{getAvatarText(apply.name || `用户${apply.uid}`)}}
							</view>
							<view class="apply-info">
								<text class="user-name">{{apply.name || `用户${apply.uid}`}}</text>
								<text class="apply-msg" v-if="apply.msg">验证消息：{{apply.msg}}</text>
								<text class="apply-status" :class="{'pending': apply.status === 1}">
									{{apply.status === 1 ? '待处理' : '已处理'}}
								</text>
							</view>
							<view class="apply-actions" v-if="apply.status === 1">
								<view class="agree-btn" @click="agreeFriendApply(apply.uid)">同意</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onBeforeUnmount, watch } from 'vue';
import API_URL from '@/utils/api';
import { getTokenValue } from '@/utils/auth';
import wsService from '@/services/websocket';

// 用户信息
const userInfo = ref({
	name: '',
	phone: '',
	uid: null
});

// 用户头像
const userAvatar = ref('');

// 当前活跃菜单
const activeMenu = ref(5);

// 好友列表相关数据
const friendList = ref([]);
const filteredFriendList = ref([]);
const friendSearchKey = ref('');
const showAddFriendModal = ref(false);
const addFriendForm = ref({
	uid: null,
	msg: ''
});
const currentChatFriend = ref({});

// 未读消息计数（按好友 UID 存储）
const unreadMessageCount = ref(new Map());

// 分页相关数据
const currentPage = ref(1);
const pageSize = 10;
const totalPages = ref(1);
const totalItems = ref(0);
const isLoading = ref(false);
const isLastPage = ref(false);

// 搜索好友相关数据
const showSearchFriendUI = ref(false);
const searchFriendKey = ref('');
const searchFriendResults = ref([]);
const hasSearched = ref(false);
const searchLoading = ref(false);

// 好友申请相关数据
const unreadApplyCount = ref(0);
const showFriendApplyModal = ref(false);
const friendApplyList = ref([]);

// 单聊相关数据
const singleChatMessages = ref([]);
const singleChatInput = ref('');

// 后台消息加载相关
const messageLoadTimer = ref(null);
const currentRoomUid = ref(null);

// 生成头像背景
const generateAvatarStyle = (name) => {
	// 为不同角色设置固定的颜色
	const colorMap = {
		'AI助手': '#6a11cb',
		'绘图助手': '#FF416C',
		'语音助手': '#11998e',
		'MCP助手': '#8E2DE2',
		'客服小助手': '#FF4B2B'
	};
	
	// 如果是用户，使用默认颜色
	const color = colorMap[name] || '#2575fc';
	
	return {
		background: `linear-gradient(45deg, ${color}, ${color}dd)`,
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
	if (!name) return '?';
	return name.charAt(0).toUpperCase();
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

// 格式化为服务端要求的时间格式：YYYY-MM-DD HH:mm:ss
const formatDateTimeForServer = (date) => {
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, '0');
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
};

// 发送单聊消息
const sendSingleChatMessage = () => {
	if (!singleChatInput.value.trim()) return;
	
	// 检查 WebSocket 连接状态
	if (!wsService.isConnected()) {
		uni.showToast({
			title: 'WebSocket未连接，请稍后重试',
			icon: 'none'
		});
		return;
	}
	
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
	
	// 通过 WebSocket 发送消息
	if (wsService.isConnected()) {
		// 构造按约定格式的单聊消息
		const now = new Date();
		const payload = {
			msg_uid: Date.now(),
			room_friend_uid: currentChatFriend.value?.uid || 0,
			room_group_uid: 0,
			msg: userMessage,
			time: formatDateTimeForServer(now),
			type: 0, // 0 单聊(room_friend)，1 群聊(room_group)
			from_uid: userInfo.value?.uid || 0
		};

		// 发送消息到 WebSocket
		wsService.sendMessage(payload);
		console.log('已通过 WebSocket 按数组格式发送消息:', payload);
	}
};

// 获取指定好友的未读消息数量
const getUnreadCount = (friendUid) => {
	// 优先从本地 Map 获取，如果没有则从 WebSocket 服务获取
	const localCount = unreadMessageCount.value.get(friendUid);
	if (localCount !== undefined) {
		return localCount;
	}
	return wsService.getUnreadCount(friendUid);
};

// 刷新所有好友的未读消息计数
const refreshUnreadCounts = () => {
	console.log('🔄 刷新所有好友的未读消息计数');
	const newMap = new Map();
	
	// 遍历所有好友，获取未读消息数
	friendList.value.forEach(friend => {
		const unreadCount = wsService.getUnreadCount(friend.uid);
		if (unreadCount > 0) {
			newMap.set(friend.uid, unreadCount);
			console.log(`好友 ${friend.name} (${friend.uid}) 有 ${unreadCount} 条未读消息`);
		}
	});
	
	unreadMessageCount.value = newMap;
	console.log('✅ 未读消息计数刷新完成');
};

// 开始聊天
const startChat = (friend) => {
	// 停止之前的消息加载循环
	stopMessageLoading();
	
	currentChatFriend.value = {
		uid: friend.uid,
		name: friend.name,
		online: friend.online,
		lastActiveTime: friend.lastActiveTime
	};
	activeMenu.value = 7; // 切换到聊天窗口
	
	// 设置当前房间UID
	currentRoomUid.value = friend.uid;
	
	// 加载与该好友的聊天记录
	// 从WebSocket服务获取该房间的历史消息
	console.log(`开始加载好友 ${friend.name} (UID: ${friend.uid}) 的聊天记录`);
	
	const roomMessages = wsService.getMessagesByRoom(friend.uid);
	console.log(`房间 ${friend.uid} 的消息数量:`, roomMessages.length);
	
	if (roomMessages.length > 0) {
		// 转换消息格式以适配UI显示
		singleChatMessages.value = roomMessages.map(msg => ({
			id: msg.msg_uid,
			content: msg.msg,
			time: new Date(msg.time),
			isMe: msg.from_uid === userInfo.value?.uid,
			name: msg.from_uid === userInfo.value?.uid ? userInfo.value.name : friend.name
		}));
		
		console.log(`✅ 成功加载了 ${roomMessages.length} 条历史消息`);
		console.log('消息示例:', roomMessages.slice(-3)); // 显示最后3条消息
	} else {
		// 如果没有历史消息，显示欢迎消息
		singleChatMessages.value = [
			{
				id: 1,
				content: `你好，我是${friend.name}`,
				time: new Date(Date.now() - 3600000),
				isMe: false,
				name: friend.name
			}
		];
		console.log('📝 没有历史消息，显示欢迎消息');
	}
	
	// 标记该房间的消息为已读
	wsService.markRoomAsRead(friend.uid);
	
	// 清除该好友的未读消息计数
	const newMap = new Map(unreadMessageCount.value);
	newMap.delete(friend.uid);
	unreadMessageCount.value = newMap;
	
	console.log(`✅ 已清除好友 ${friend.name} (${friend.uid}) 的未读消息计数`);
	
	// 启动后台循环加载消息（注释掉，改用 WebSocket 实时推送）
	// startMessageLoading(friend.uid);
};

// 启动后台循环加载消息
const startMessageLoading = (roomUid) => {
	console.log(`🔄 启动房间 ${roomUid} 的消息加载循环`);
	
	// 清除之前的定时器
	if (messageLoadTimer.value) {
		clearInterval(messageLoadTimer.value);
	}
	
	// 每5秒检查一次新消息（降低频率）
	messageLoadTimer.value = setInterval(() => {
		if (currentRoomUid.value === roomUid && activeMenu.value === 7) {
			loadRoomMessages(roomUid);
		} else {
			// 如果不在当前房间或不在聊天界面，停止加载
			console.log('停止消息加载：不在当前房间或聊天界面');
			stopMessageLoading();
		}
	}, 5000);
	
	console.log('✅ 消息加载循环已启动，每3秒检查一次');
};

// 停止后台消息加载
const stopMessageLoading = () => {
	if (messageLoadTimer.value) {
		clearInterval(messageLoadTimer.value);
		messageLoadTimer.value = null;
		console.log('🛑 消息加载循环已停止');
	}
};

// 加载房间消息
const loadRoomMessages = (roomUid) => {
	try {
		console.log(`📥 加载房间 ${roomUid} 的消息...`);
		
		// 从WebSocket服务获取该房间的最新消息
		const roomMessages = wsService.getMessagesByRoom(roomUid);
		
		if (roomMessages.length > 0) {
			// 转换消息格式
			const formattedMessages = roomMessages.map(msg => ({
				id: msg.msg_uid,
				content: msg.msg,
				time: new Date(msg.time),
				isMe: msg.from_uid === userInfo.value?.uid,
				name: msg.from_uid === userInfo.value?.uid ? userInfo.value.name : currentChatFriend.value.name
			}));
			
			// 检查是否有新消息
			const currentMessageIds = singleChatMessages.value.map(msg => msg.id);
			const newMessages = formattedMessages.filter(msg => !currentMessageIds.includes(msg.id));
			
			if (newMessages.length > 0) {
				console.log(`✅ 发现 ${newMessages.length} 条新消息:`, newMessages);
				
				// 添加新消息到聊天界面
				singleChatMessages.value.push(...newMessages);
				
				// 自动滚动到底部
				setTimeout(() => {
					const messageList = document.querySelector('.message-list');
					if (messageList) {
						messageList.scrollTop = messageList.scrollHeight;
					}
				}, 100);
				
				// 标记消息为已读
				wsService.markRoomAsRead(roomUid);
			} else {
				console.log('📝 没有新消息');
			}
		} else {
			console.log('📝 房间中没有消息');
		}
	} catch (error) {
		console.error('加载房间消息时出错:', error);
	}
};

// 处理房间消息更新
const handleRoomMessageUpdate = (message) => {
	console.log('🔄 房间消息更新:', message);
	console.log('当前聊天好友:', currentChatFriend.value);
	console.log('当前用户信息:', userInfo.value);
	
	// 检查是否是当前聊天房间的消息
	// const isCurrentRoom = message.room_friend_uid === currentChatFriend.value?.uid;
	const isSingleChat = message.room_group_uid === 0;
	const isNotFromMe = message.from_uid !== userInfo.value?.uid;
	
	console.log('消息过滤条件:', {
		isSingleChat,
		isNotFromMe,
		messageRoomUid: message.room_friend_uid,
		currentFriendUid: currentChatFriend.value?.uid,
		messageFromUid: message.from_uid,
		myUid: userInfo.value?.uid
	});
	
	if (isSingleChat && isNotFromMe) {
		console.log('✅ 新消息属于当前聊天房间，准备更新界面');
		
		// 转换消息格式并添加到聊天记录
		const chatMessage = {
			id: message.msg_uid,
			content: message.msg,
			time: new Date(message.time),
			isMe: false,
			name: currentChatFriend.value.name
		};
		
		// 检查消息是否已存在（避免重复显示）
		const existingMessage = singleChatMessages.value.find(msg => msg.id === message.msg_uid);
		if (!existingMessage) {
			singleChatMessages.value.push(chatMessage);
			
			// 自动滚动到底部
			setTimeout(() => {
				const messageList = document.querySelector('.message-list');
				if (messageList) {
					messageList.scrollTop = messageList.scrollHeight;
				}
			}, 100);
			
			console.log('✅ 新消息已添加到聊天界面:', chatMessage);
			console.log('当前聊天消息总数:', singleChatMessages.value.length);
		} else {
			console.log('⚠️ 消息已存在，跳过重复添加');
		}
	} else {
		console.log('❌ 消息不符合显示条件，跳过处理');
	}
};

// 返回好友列表
const backToFriendList = () => {
	// 停止消息加载循环
	stopMessageLoading();
	
	// 清除当前房间UID
	currentRoomUid.value = null;
	
	// 清除当前聊天好友
	currentChatFriend.value = {};
	
	activeMenu.value = 5;
	
	// 刷新未读消息计数
	refreshUnreadCounts();
	
	loadFriendList();
};

// 打开搜索好友界面
const openSearchFriendUI = () => {
	showSearchFriendUI.value = true;
};

// 搜索好友
const searchFriendsByName = () => {
	if (!searchFriendKey.value.trim()) {
		uni.showToast({
			title: '请输入搜索关键词',
			icon: 'none'
		});
		return;
	}
	
	searchLoading.value = true;
	hasSearched.value = true;
	
	uni.request({
		url: API_URL.getUserInfoByName,
		method: 'GET',
		header: {
			'Authorization': getTokenValue()
		},
		data: {
			name: searchFriendKey.value.trim()
		},
		success: (res) => {
			if (res.data.code === 200) {
				searchFriendResults.value = res.data.data || [];
				if (searchFriendResults.value.length === 0) {
					uni.showToast({
						title: '未找到相关用户',
						icon: 'none'
					});
				}
			} else {
				uni.showToast({
					title: res.data.message || '搜索失败',
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
			searchLoading.value = false;
		}
	});
};

// 准备添加好友
const prepareAddFriend = (user) => {
	addFriendForm.value.uid = user.uid;
	addFriendForm.value.msg = '';
	showAddFriendModal.value = true;
	showSearchFriendUI.value = false;
};

// 发送好友申请
const sendFriendRequest = () => {
	if (!addFriendForm.value.uid) {
		uni.showToast({
			title: '无效的用户ID',
			icon: 'none'
		});
		return;
	}
	
	if (!addFriendForm.value.msg.trim()) {
		uni.showToast({
			title: '请输入验证消息',
			icon: 'none'
		});
		return;
	}
	
	uni.showLoading({
		title: '发送中...'
	});
	
	uni.request({
		url: API_URL.addFriend,
		method: 'POST',
		header: {
			'Authorization': getTokenValue()
		},
		data: {
			uid: addFriendForm.value.uid,
			msg: addFriendForm.value.msg.trim()
		},
		
		success: (res) => {
			// uni.hideLoading(); // 先关闭 loading
			console.log('API 返回:', res.data); // 调试日志
			if (res.data.code === 200) {
				uni.showToast({
					title:  '发送成功' ,
					icon: 'success'
				});
				showAddFriendModal.value = false;
				addFriendForm.value = {
					uid: null,
					msg: ''
				};
			} else {
				console.log('API 返回:', res.data); // 调试日志
				uni.showToast({
					title: String(res.data.data) || '发送失败',
					icon: 'none',
					duration: 2000 // 确保显示2秒
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

// 关闭搜索好友界面
const closeSearchFriendUI = () => {
	showSearchFriendUI.value = false;
	searchFriendKey.value = '';
	searchFriendResults.value = [];
	hasSearched.value = false;
};

// 显示好友申请列表
const showFriendApplyList = () => {
	showFriendApplyModal.value = true;
	getFriendApplyList();
};

// 获取好友申请列表
const getFriendApplyList = () => {
	uni.request({
		url: API_URL.getFriendApplyList,
		method: 'GET',
		header: {
			'Authorization': getTokenValue()
		},
		data: {
			timestamp: Date.now(),
			pageNum: currentPage.value,
			index: (currentPage.value - 1) * pageSize,
			pageSize: pageSize
		},
		success: (res) => {
			if (res.data.code === 200) {
				const responseData = res.data.data;
				friendApplyList.value = responseData.data || [];
				isLastPage.value = responseData.isLast;
			} else {
				uni.showToast({
					title: res.data.message || '获取申请列表失败',
					icon: 'none'
				});
			}
		},
		fail: () => {
			uni.showToast({
				title: '网络错误，请稍后再试',
				icon: 'none'
			});
		}
	});
};

// 获取未读好友申请数量
const getUnreadApplyCount = () => {
	uni.request({
		url: API_URL.getUnreadApplyCount,
		method: 'GET',
		header: {
			'Authorization': getTokenValue()
		},
		success: (res) => {
			if (res.data.code === 200) {
				unreadApplyCount.value = res.data.data || 0;
			}
		}
	});
};

// 同意好友申请
const agreeFriendApply = (uid) => {
	uni.showLoading({
		title: '处理中...'
	});
	
	uni.request({
		url: API_URL.agreeFriendApply,
		method: 'POST',
		header: {
			'Authorization': getTokenValue()
		},
		data: {
			uid: uid
		},
		success: (res) => {
			if (res.data.code === 200) {
				uni.showToast({
					title: '已同意好友申请',
					icon: 'success'
				});
				// 重新加载好友列表和申请列表
				loadFriendList();
				getFriendApplyList();
				getUnreadApplyCount();
			} else {
				uni.showToast({
					title: res.data.message || '操作失败',
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

// 加载好友列表
const loadFriendList = () => {
	isLoading.value = true;
	
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
				const responseData = res.data.data;
				// 更新好友列表数据
				const newFriends = responseData.data.map(friend => ({
					uid: friend.uid,
					name: friend.name,
					online: friend.activeStatus === 1, // 1表示在线，2表示离线
					lastActiveTime: friend.lastOptTime,
					lastMessage: friend.lastMessage || ''
				}));
				
				if (currentPage.value === 1) {
					friendList.value = newFriends;
				} else {
					friendList.value = [...friendList.value, ...newFriends];
				}
				
				isLastPage.value = responseData.isLast;
				totalPages.value = isLastPage.value ? currentPage.value : currentPage.value + 1;
				
				// 更新过滤后的列表
				updateFilteredList();
			} else {
				uni.showToast({
					title: res.data.message || '加载失败',
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
			isLoading.value = false;
		}
	});
};

// 更新过滤后的好友列表
const updateFilteredList = () => {
	if (!friendSearchKey.value) {
		filteredFriendList.value = friendList.value;
		return;
	}
	
	const keyword = friendSearchKey.value.toLowerCase();
	filteredFriendList.value = friendList.value.filter(friend => 
		friend.name.toLowerCase().includes(keyword) ||
		friend.uid.toString().includes(keyword)
	);
};

// 切换页码
const changePage = (page) => {
	if (page < 1 || page > totalPages.value || isLoading.value || isLastPage.value) return;
	
	currentPage.value = page;
	loadFriendList();
};

// 格式化最后活跃时间
const formatLastActiveTime = (timestamp) => {
	const now = new Date();
	const lastActive = new Date(timestamp);
	const diff = now - lastActive;
	
	// 小于1分钟
	if (diff < 60 * 1000) {
		return '刚刚';
	}
	// 小于1小时
	if (diff < 60 * 60 * 1000) {
		return `${Math.floor(diff / (60 * 1000))}分钟前`;
	}
	// 小于24小时
	if (diff < 24 * 60 * 60 * 1000) {
		return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
	}
	// 小于7天
	if (diff < 7 * 24 * 60 * 60 * 1000) {
		return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
	}
	// 其他情况显示具体日期
	return lastActive.toLocaleDateString('zh-CN');
};

// 监听搜索关键词变化
watch(friendSearchKey, () => {
	updateFilteredList();
});

// 添加返回首页方法
const backToHome = () => {
	uni.reLaunch({
        url: '/pages/home/home'
      });
};

// 页面加载
onMounted(async () => {
	const storedUserInfo = uni.getStorageSync('userInfo');
	if (storedUserInfo) {
		// 处理不同格式的用户信息
		if (typeof storedUserInfo === 'string') {
			try {
				const parsedInfo = JSON.parse(storedUserInfo);
				userInfo.value = {
					name: parsedInfo.value || parsedInfo.name || '',
					phone: parsedInfo.phone || '',
					uid: parsedInfo.uid || null
				};
			} catch (e) {
				console.error('解析用户信息失败:', e);
			}
		} else {
			userInfo.value = {
				name: storedUserInfo.name || storedUserInfo.userName || '',
				phone: storedUserInfo.phone || '',
				uid: storedUserInfo.uid || null
			};
		}
		
		userAvatar.value = storedUserInfo.avatar || '/static/images/default-avatar.png';
		
		console.log('用户信息已加载:', userInfo.value);
	}
	
	// 加载好友列表
	loadFriendList();
	
	// 获取好友申请未读数量
	getUnreadApplyCount();
	
	// 确保 WebSocket 连接（只连接一次）
	const token = getTokenValue();
	if (token && !wsService.isConnected()) {
		console.log('初始化 WebSocket 连接');
		wsService.connect(token);
	} else if (wsService.isConnected()) {
		console.log('WebSocket 已连接，跳过重复连接');
	}
	
	// 添加 WebSocket 消息监听器
	wsService.addMessageListener(handleWebSocketMessage);
	
	// 初始化未读消息计数（延迟执行，等待好友列表加载）
	setTimeout(() => {
		refreshUnreadCounts();
	}, 1000);
});

// 页面卸载
onBeforeUnmount(() => {
	// 移除 WebSocket 消息监听器
	wsService.removeMessageListener(handleWebSocketMessage);
	
	// 停止消息加载循环
	stopMessageLoading();
});

// 处理 WebSocket 消息
const handleWebSocketMessage = (message) => {
	console.log('🔔 收到WebSocket消息:', message);
	
	// 检查消息类型
	const isSingleChat = message.room_group_uid === 0;
	const isNotFromMe = message.from_uid !== userInfo.value?.uid;
	
	// 检查是否在对应好友的聊天窗口
	const isInChatWindow = activeMenu.value === 7; // 7 表示聊天窗口
	const isCurrentFriendChat = currentChatFriend.value?.uid === message.from_uid;
	const isViewingThisChat = isInChatWindow && isCurrentFriendChat;
	
	console.log('消息过滤条件:', {
		isSingleChat,
		isNotFromMe,
		isInChatWindow,
		isCurrentFriendChat,
		isViewingThisChat,
		activeMenu: activeMenu.value,
		currentFriendUid: currentChatFriend.value?.uid,
		messageFromUid: message.from_uid,
		myUid: userInfo.value?.uid
	});
	
	if (isSingleChat && isNotFromMe) {
		// 情况1: 用户正在查看该好友的聊天窗口
		if (isViewingThisChat) {
			console.log('✅ 用户正在查看该好友聊天窗口，直接显示消息并标记已读');
			
			// 转换消息格式并添加到聊天记录
			const chatMessage = {
				id: message.msg_uid,
				content: message.msg,
				time: new Date(message.time),
				isMe: false,
				name: currentChatFriend.value.name
			};
			
			// 检查消息是否已存在（避免重复显示）
			const existingMessage = singleChatMessages.value.find(msg => msg.id === message.msg_uid);
			if (!existingMessage) {
				singleChatMessages.value.push(chatMessage);
				
				// 自动滚动到底部
				setTimeout(() => {
					const messageList = document.querySelector('.message-list');
					if (messageList) {
						messageList.scrollTop = messageList.scrollHeight;
					}
				}, 100);
				
				console.log('✅ 新消息已添加到聊天界面:', chatMessage);
				
				// 立即标记为已读
				wsService.markRoomAsRead(message.from_uid);
			}
		} 
		// 情况2: 用户不在该好友的聊天窗口（在好友列表或其他好友聊天窗口）
		else {
			console.log('📬 用户不在该好友聊天窗口，增加未读计数并显示红点');
			
			// 获取当前未读数量（从 WebSocket 服务获取）
			const unreadCount = wsService.getUnreadCount(message.from_uid);
			console.log(`好友 ${message.from_uid} 的未读消息数: ${unreadCount}`);
			
			// 触发界面更新（通过修改 Map 引用）
			const newMap = new Map(unreadMessageCount.value);
			newMap.set(message.from_uid, unreadCount);
			unreadMessageCount.value = newMap;
		}
	} else {
		console.log('❌ 消息不符合显示条件，跳过处理');
	}
};
</script>

<style lang="scss" scoped>
.home-container {
	display: flex;
	height: 100vh;
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
	
	.chat-interface {
		flex: 1;
		display: flex;
		flex-direction: column;
		height: 100%;
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(20px);
		position: relative;
		z-index: 1;
		
		/* 好友列表样式 */
		.friend-list {
			height: 100%;
			display: flex;
			flex-direction: column;
			background: rgba(0, 0, 0, 0.9);
			backdrop-filter: blur(20px);
			border-radius: 16px;
			border: 1px solid rgba(255, 255, 255, 0.1);
			box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
			overflow: hidden;
			
			.friend-list-header {
				padding: 15px;
				background: rgba(0, 0, 0, 0.9);
				backdrop-filter: blur(20px);
				border-bottom: 1px solid rgba(255, 255, 255, 0.1);
				position: sticky;
				top: 0;
				z-index: 10;
				
				.header-left {
					display: flex;
					align-items: center;
					margin-bottom: 15px;
					
					.back-to-home {
						display: flex;
						align-items: center;
						padding: 8px 15px;
						background: rgba(255, 255, 255, 0.1);
						backdrop-filter: blur(10px);
						border-radius: 20px;
						margin-right: 15px;
						cursor: pointer;
						transition: all 0.3s ease;
						border: 1px solid rgba(255, 255, 255, 0.2);
						
						.back-icon {
							width: 12px;
							height: 12px;
							border-left: 2px solid #ffffff;
							border-bottom: 2px solid #ffffff;
							transform: rotate(45deg);
							margin-right: 5px;
						}
						
						text {
							color: #ffffff;
							font-size: 14px;
						}
						
						&:hover {
							background: rgba(255, 255, 255, 0.15);
							transform: translateY(-1px);
							box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
						}
						
						&:active {
							transform: translateY(0);
						}
					}
					
					.header-title {
						font-size: 18px;
						font-weight: 600;
						color: #ffffff;
					}
				}
				
				.friend-actions {
					display: flex;
					align-items: center;
					gap: 10px;
					
					.search-box {
						flex: 1;
						position: relative;
						
						input {
							width: 80%;
							height: 36px;
							border: 1px solid rgba(255, 255, 255, 0.2);
							border-radius: 18px;
							padding: 0 40px 0 15px;
							font-size: 14px;
							background: rgba(255, 255, 255, 0.1);
							backdrop-filter: blur(10px);
							color: #ffffff;
							transition: all 0.3s ease;
							
							&:focus {
								outline: none;
								border-color: #667eea;
								background: rgba(255, 255, 255, 0.15);
								box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
							}
							
							&::placeholder {
								color: rgba(255, 255, 255, 0.5);
							}
						}
						
						.search-icon {
							position: absolute;
							right: 15px;
							top: 50%;
							transform: translateY(-50%);
							width: 16px;
							height: 16px;
							background-color: rgba(255, 255, 255, 0.6);
							mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E") no-repeat center;
							-webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E") no-repeat center;
						}
					}
					
					.search-friend-btn {
						display: flex;
						align-items: center;
						padding: 8px 15px;
						background: linear-gradient(45deg, #667eea, #764ba2);
						border-radius: 18px;
						cursor: pointer;
						transition: all 0.3s ease;
						white-space: nowrap;
						box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
						margin-left: -8px;
						
						&:hover {
							transform: translateY(-1px);
							box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
						}
						
						&:active {
							transform: translateY(0);
						}
						
						.search-friend-icon {
							width: 16px;
							height: 16px;
							background-color: #fff;
							mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E") no-repeat center;
							-webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E") no-repeat center;
							margin-right: 6px;
						}
						
						text {
							color: #fff;
							font-size: 14px;
							font-weight: 500;
						}
					}
				}
			}
			
			.friend-list-content {
				flex: 1;
				overflow-y: auto;
				padding: 15px;
				background: rgba(0, 0, 0, 0.8);
				backdrop-filter: blur(10px);
				
				.friend-apply-btn {
					display: inline-flex;
					align-items: center;
					padding: 10px 14px;
					background: rgba(255, 255, 255, 0.1);
					backdrop-filter: blur(10px);
					border-radius: 12px;
					margin-bottom: 15px;
					cursor: pointer;
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
					transition: all 0.3s ease;
					border: 1px solid rgba(255, 255, 255, 0.1);
					max-width: fit-content;
					
					&:hover {
						transform: translateY(-1px);
						box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
						background: rgba(255, 255, 255, 0.15);
					}
					
					&:active {
						transform: translateY(0);
					}
					
					.apply-icon {
						width: 24px;
						height: 24px;
						background: linear-gradient(45deg, #667eea, #764ba2);
						border-radius: 50%;
						margin-right: 10px;
						position: relative;
						box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
						
						&::before {
							content: '';
							position: absolute;
							width: 12px;
							height: 2px;
							background-color: #fff;
							top: 50%;
							left: 50%;
							transform: translate(-50%, -50%);
						}
						
						&::after {
							content: '';
							position: absolute;
							width: 2px;
							height: 12px;
							background-color: #fff;
							top: 50%;
							left: 50%;
							transform: translate(-50%, -50%);
						}
					}
					
					.apply-text {
						font-size: 14px;
						color: #ffffff;
						font-weight: 500;
					}
					
					.apply-badge {
						margin-left: auto;
						background: linear-gradient(45deg, #ff416c, #ff4b2b);
						color: #fff;
						font-size: 12px;
						padding: 2px 8px;
						border-radius: 10px;
						min-width: 20px;
						text-align: center;
						box-shadow: 0 2px 4px rgba(255, 75, 43, 0.3);
					}
				}
				
				.empty-tip {
					text-align: center;
					padding: 40px 0;
					
					.empty-icon {
						width: 120px;
						height: 120px;
						margin-bottom: 20px;
						opacity: 0.6;
						filter: brightness(0.8);
					}
					
					.empty-text {
						display: block;
						font-size: 16px;
						color: rgba(255, 255, 255, 0.6);
						margin-bottom: 20px;
					}
					
					.add-friend-btn {
						display: inline-block;
						padding: 10px 25px;
						background: linear-gradient(45deg, #667eea, #764ba2);
						color: #fff;
						border-radius: 25px;
						font-size: 14px;
						cursor: pointer;
						box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
						transition: all 0.3s ease;
						
						&:hover {
							transform: translateY(-1px);
							box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
						}
						
						&:active {
							transform: translateY(0);
						}
					}
				}
				
				.friend-items {
					.friend-item {
						display: flex;
						align-items: center;
						padding: 15px;
						border-radius: 12px;
						margin: 8px 0;
						background: rgba(255, 255, 255, 0.1);
						backdrop-filter: blur(10px);
						box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
						transition: all 0.3s ease;
						cursor: pointer;
						border: 1px solid rgba(255, 255, 255, 0.1);
						
						&:hover {
							transform: translateY(-1px);
							box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
							background: rgba(255, 255, 255, 0.15);
						}
						
						&:active {
							transform: translateY(0);
						}
						
						.friend-avatar {
							width: 50px;
							height: 50px;
							border-radius: 50%;
							margin-right: 15px;
							flex-shrink: 0;
							box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
							display: flex;
							align-items: center;
							justify-content: center;
							font-size: 18px;
							color: #fff;
							position: relative;
							
							.unread-badge {
								position: absolute;
								top: -5px;
								right: -5px;
								min-width: 18px;
								height: 18px;
								background: linear-gradient(45deg, #ff416c, #ff4b2b);
								border-radius: 9px;
								display: flex;
								align-items: center;
								justify-content: center;
								padding: 0 5px;
								box-shadow: 0 2px 8px rgba(255, 75, 43, 0.5);
								border: 2px solid rgba(0, 0, 0, 0.9);
								
								text {
									font-size: 11px;
									color: #fff;
									font-weight: bold;
									line-height: 1;
								}
							}
						}
						
						.friend-info {
							flex: 1;
							min-width: 0;
							
							.friend-name-row {
								display: flex;
								align-items: center;
								margin-bottom: 5px;
								
								.friend-name {
									font-size: 16px;
									font-weight: 500;
									color: #ffffff;
									margin-right: 10px;
								}
								
								.friend-status {
									display: flex;
									align-items: center;
									font-size: 12px;
									color: rgba(255, 255, 255, 0.6);
									
									.status-dot {
										width: 6px;
										height: 6px;
										border-radius: 50%;
										background: rgba(255, 255, 255, 0.6);
										margin-right: 4px;
									}
									
									&.online {
										color: #4CAF50;
										
										.status-dot {
											background: #4CAF50;
											box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
										}
									}
								}
							}
							
							.last-active-time {
								font-size: 12px;
								color: rgba(255, 255, 255, 0.5);
								margin-top: 4px;
							}
						}
						
						.friend-action {
							margin-left: 15px;
							
							.chat-icon {
								width: 24px;
								height: 24px;
								background: linear-gradient(45deg, #667eea, #764ba2);
								border-radius: 50%;
								position: relative;
								box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
								
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
									content: '';
									position: absolute;
									width: 6px;
									height: 6px;
									background: #fff;
									border-radius: 50%;
									top: 50%;
									left: 50%;
									transform: translate(-50%, -50%);
								}
							}
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
						background: rgba(255, 255, 255, 0.1);
						backdrop-filter: blur(10px);
						color: #ffffff;
						border-radius: 8px;
						cursor: pointer;
						margin: 0 10px;
						box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
						transition: all 0.3s ease;
						border: 1px solid rgba(255, 255, 255, 0.1);
						
						&.disabled {
							opacity: 0.5;
							cursor: not-allowed;
							box-shadow: none;
						}
						
						&:not(.disabled):hover {
							transform: translateY(-1px);
							box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
							background: rgba(255, 255, 255, 0.15);
						}
						
						&:not(.disabled):active {
							transform: translateY(0);
						}
					}
					
					.page-info {
						font-size: 14px;
						color: rgba(255, 255, 255, 0.6);
					}
				}
			}
		}
		
		/* 聊天窗口样式 */
		.chat-window {
			height: 100%;
			display: flex;
			flex-direction: column;
			background: rgba(0, 0, 0, 0.8);
			backdrop-filter: blur(20px);
			border-radius: 16px;
			border: 1px solid rgba(255, 255, 255, 0.1);
			box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
			overflow: hidden;
			
			.chat-header {
				height: 60px;
				background: rgba(0, 0, 0, 0.9);
				backdrop-filter: blur(20px);
				display: flex;
				align-items: center;
				padding: 0 15px;
				border-bottom: 1px solid rgba(255, 255, 255, 0.1);
				flex-shrink: 0;
				
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
			
			.chat-content {
				flex: 1;
				overflow: hidden;
				position: relative;
				
				.message-list {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					padding: 20px;
					overflow-y: auto;
					
					.message-item {
						margin-bottom: 20px;
						
						.message-time {
							text-align: center;
							margin-bottom: 10px;
							
							text {
								font-size: 12px;
								color: rgba(255, 255, 255, 0.5);
								background-color: rgba(255, 255, 255, 0.1);
								backdrop-filter: blur(10px);
								padding: 2px 8px;
								border-radius: 10px;
							}
						}
						
						.message-sender {
							display: flex;
							align-items: flex-start;
							
							.sender-avatar {
								width: 40px;
								height: 40px;
								border-radius: 50%;
								flex-shrink: 0;
								box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
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
									background: rgba(255, 255, 255, 0.1);
									backdrop-filter: blur(10px);
									box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
									position: relative;
									word-break: break-word;
									border: 1px solid rgba(255, 255, 255, 0.1);
									
									text {
										color: #ffffff;
										font-size: 14px;
										line-height: 1.4;
									}
								}
							}
						}
						
						&.message-mine {
							.message-sender {
								flex-direction: row-reverse;
								
								.message-content {
									.sender-name {
										text-align: right;
									}
									
									.message-bubble {
										background: linear-gradient(45deg, #667eea, #764ba2);
										border-radius: 18px 4px 18px 18px;
										box-shadow: 0 2px 5px rgba(102, 126, 234, 0.3);
										border: 1px solid rgba(102, 126, 234, 0.3);
										
										text {
											color: #fff;
										}
									}
								}
							}
						}
					}
				}
			}
			
			.message-input-area {
				background: rgba(0, 0, 0, 0.9);
				backdrop-filter: blur(20px);
				padding: 15px;
				border-top: 1px solid rgba(255, 255, 255, 0.1);
				display: flex;
				align-items: center;
				gap: 10px;
				flex-shrink: 0;
				
				.message-input {
					flex: 1;
					height: 40px;
					border: 1px solid rgba(255, 255, 255, 0.2);
					border-radius: 20px;
					padding: 0 15px;
					font-size: 14px;
					color: #ffffff;
					background: rgba(255, 255, 255, 0.1);
					backdrop-filter: blur(10px);
					
					&:focus {
						outline: none;
						border-color: #667eea;
						box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
					}
					
					&::placeholder {
						color: rgba(255, 255, 255, 0.5);
					}
				}
				
				.send-button {
					height: 40px;
					padding: 0 20px;
					background: linear-gradient(45deg, #667eea, #764ba2);
					border-radius: 20px;
					color: #fff;
					font-size: 14px;
					display: flex;
					align-items: center;
					justify-content: center;
					cursor: pointer;
					white-space: nowrap;
					transition: all 0.3s ease;
					box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
					
					&:hover {
						opacity: 0.9;
						transform: translateY(-1px);
						box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
					}
					
					&:active {
						transform: translateY(0);
					}
				}
			}
		}
	}
}

/* 搜索好友弹窗 */
.search-friend-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.7);
	backdrop-filter: blur(5px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	
	.modal-content {
		width: 90%;
		max-width: 400px;
		background: rgba(0, 0, 0, 0.95);
		backdrop-filter: blur(20px);
		border-radius: 16px;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
		
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
			
			.search-input-box {
				display: flex;
				margin-bottom: 20px;
				
				input {
					flex: 1;
					height: 40px;
					border: 1px solid rgba(255, 255, 255, 0.2);
					border-radius: 4px 0 0 4px;
					padding: 0 15px;
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
					background: linear-gradient(45deg, #667eea, #764ba2);
					border-radius: 0 4px 4px 0;
					color: #fff;
					font-size: 14px;
					display: flex;
					align-items: center;
					justify-content: center;
					cursor: pointer;
					transition: all 0.3s ease;
					
					&:hover {
						opacity: 0.9;
						transform: translateY(-1px);
						box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
					}
				}
			}
			
			.search-results {
				margin-top: 20px;
				max-height: 400px;
				overflow-y: auto;
				
				.search-result-item {
					display: flex;
					align-items: center;
					padding: 12px;
					border-radius: 8px;
					margin-bottom: 10px;
					background: rgba(255, 255, 255, 0.05);
					transition: all 0.3s ease;
					border: 1px solid rgba(255, 255, 255, 0.1);
					
					&:hover {
						transform: translateY(-1px);
						box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
						background: rgba(255, 255, 255, 0.1);
					}
					
					.user-avatar {
						width: 40px;
						height: 40px;
						border-radius: 50%;
						margin-right: 12px;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 16px;
						color: #fff;
						box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
					}
					
					.user-info {
						flex: 1;
						
						.user-name {
							font-size: 14px;
							color: #ffffff;
							margin-bottom: 4px;
							font-weight: 500;
						}
						
						.user-id {
							font-size: 12px;
							color: rgba(255, 255, 255, 0.6);
						}
					}
					
					.add-friend-btn {
						padding: 6px 12px;
						background: linear-gradient(45deg, #667eea, #764ba2);
						color: #fff;
						border-radius: 4px;
						font-size: 12px;
						cursor: pointer;
						transition: all 0.3s ease;
						
						&:hover {
							opacity: 0.9;
							transform: translateY(-1px);
							box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
						}
						
						&:active {
							transform: translateY(0);
						}
					}
				}
			}
			
			.no-result {
				text-align: center;
				padding: 30px 0;
				color: rgba(255, 255, 255, 0.6);
				font-size: 14px;
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
	background-color: rgba(0, 0, 0, 0.7);
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
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
		
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
				margin-bottom: 8px;
				font-weight: 500;
			}
			
			input {
				width: 100%;
				height: 40px;
				border: 1px solid rgba(255, 255, 255, 0.2);
				border-radius: 4px;
				padding: 0 12px;
				margin-bottom: 20px;
				font-size: 14px;
				background: rgba(255, 255, 255, 0.1);
				color: #ffffff;
				transition: all 0.3s ease;
				
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
				transition: all 0.3s ease;
				
				&:hover {
					opacity: 0.9;
					transform: translateY(-1px);
					box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
				}
				
				&:active {
					transform: translateY(0);
				}
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
	background-color: rgba(0, 0, 0, 0.7);
	backdrop-filter: blur(5px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	
	.modal-content {
		width: 90%;
		max-width: 400px;
		background: rgba(0, 0, 0, 0.95);
		backdrop-filter: blur(20px);
		border-radius: 16px;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
		
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
					border-radius: 8px;
					margin-bottom: 10px;
					background: rgba(255, 255, 255, 0.05);
					border: 1px solid rgba(255, 255, 255, 0.1);
					
					&:hover {
						background: rgba(255, 255, 255, 0.1);
					}
					
					.user-avatar {
						width: 40px;
						height: 40px;
						border-radius: 50%;
						margin-right: 12px;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 16px;
						color: #fff;
						box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
					}
					
					.apply-info {
						flex: 1;
						
						.user-name {
							font-size: 14px;
							color: #ffffff;
							margin-bottom: 4px;
							font-weight: 500;
						}
						
						.apply-msg {
							font-size: 12px;
							color: rgba(255, 255, 255, 0.6);
							margin-bottom: 4px;
							display: block;
						}
						
						.apply-status {
							font-size: 12px;
							color: rgba(255, 255, 255, 0.5);
							
							&.pending {
								color: #ff9800;
							}
						}
					}
					
					.apply-actions {
						.agree-btn {
							padding: 6px 12px;
							background: linear-gradient(45deg, #667eea, #764ba2);
							color: #fff;
							border-radius: 4px;
							font-size: 12px;
							cursor: pointer;
							transition: all 0.3s ease;
							
							&:hover {
								opacity: 0.9;
								transform: translateY(-1px);
								box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
							}
							
							&:active {
								transform: translateY(0);
							}
						}
					}
				}
			}
		}
	}
}

@media (max-width: 768px) {
	.home-container {
		.chat-interface {
			.friend-list {
				border-radius: 0;
				border: none;
				
				.friend-list-header {
					padding: 10px 12px;
					
					.header-left {
						margin-bottom: 10px;
						
						.back-to-home {
							padding: 6px 10px;
							margin-right: 10px;
							
							.back-icon {
								width: 10px;
								height: 10px;
							}
							
							text {
								font-size: 13px;
							}
						}
						
						.header-title {
							font-size: 15px;
						}
					}
					
					.friend-actions {
						gap: 8px;
						
						.search-box input {
							height: 32px;
							font-size: 13px;
							padding: 0 32px 0 12px;
						}
						
						.search-friend-btn {
							padding: 6px 10px;
							
							.search-friend-icon {
								width: 14px;
								height: 14px;
								margin-right: 4px;
							}
							
							text {
								font-size: 12px;
							}
						}
					}
				}
				
				.friend-list-content {
					padding: 10px;
					
					.friend-apply-btn {
						padding: 10px 12px;
						margin-bottom: 10px;
						
						.apply-icon {
							width: 20px;
							height: 20px;
							margin-right: 8px;
						}
						
						.apply-text {
							font-size: 13px;
						}
					}
					
					.friend-items {
						.friend-item {
							padding: 10px 12px;
							margin: 6px 0;
							
							.friend-avatar {
								width: 40px;
								height: 40px;
								font-size: 15px;
								margin-right: 10px;
								
								.unread-badge {
									min-width: 16px;
									height: 16px;
									border-radius: 8px;
									top: -4px;
									right: -4px;
									padding: 0 4px;
									
									text {
										font-size: 10px;
									}
								}
							}
							
							.friend-info {
								.friend-name-row {
									.friend-name {
										font-size: 14px;
										margin-right: 6px;
									}
									
									.friend-status {
										font-size: 11px;
									}
								}
								
								.last-active-time {
									font-size: 11px;
								}
							}
							
							.friend-action {
								margin-left: 8px;
								
								.chat-icon {
									width: 20px;
									height: 20px;
								}
							}
						}
					}
				}
			}
			
			.chat-window {
				border-radius: 0;
				border: none;
				
				.chat-header {
					height: 52px;
					padding: 0 12px;
					
					.chat-title {
						font-size: 15px;
					}
				}
				
				.chat-content {
					.message-list {
						padding: 12px;
						
						.message-item {
							margin-bottom: 14px;
							
							.message-sender {
								.sender-avatar {
									width: 34px;
									height: 34px;
								}
								
								.message-content {
									margin: 0 8px;
									max-width: 80%;
									
									.message-bubble {
										padding: 8px 12px;
										
										text {
											font-size: 13px;
										}
									}
								}
							}
						}
					}
				}
				
				.message-input-area {
					padding: 10px 12px;
					gap: 8px;
					
					.message-input {
						height: 36px;
						font-size: 13px;
					}
					
					.send-button {
						height: 36px;
						padding: 0 14px;
						font-size: 13px;
					}
				}
			}
		}
	}
	
	.search-friend-modal,
	.add-friend-modal,
	.friend-apply-modal {
		.modal-content {
			width: 92%;
			
			.modal-header {
				padding: 12px;
				
				text {
					font-size: 15px;
				}
			}
			
			.modal-body {
				padding: 14px;
				
				.search-input-box {
					input {
						height: 36px;
						font-size: 13px;
					}
					
					.search-btn {
						width: 64px;
						height: 36px;
						font-size: 13px;
					}
				}
				
				.search-results {
					.search-result-item {
						padding: 10px;
						
						.user-avatar {
							width: 36px;
							height: 36px;
							font-size: 14px;
							margin-right: 10px;
						}
						
						.user-info {
							.user-name {
								font-size: 13px;
							}
							
							.user-id {
								font-size: 11px;
							}
						}
					}
				}
				
				.apply-list {
					.apply-item {
						padding: 10px;
						
						.user-avatar {
							width: 36px;
							height: 36px;
							font-size: 14px;
							margin-right: 10px;
						}
						
						.apply-info {
							.user-name {
								font-size: 13px;
							}
							
							.apply-msg {
								font-size: 11px;
							}
						}
					}
				}
			}
		}
	}
}

@keyframes backgroundShift {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.8; }
}
</style>