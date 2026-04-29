<template>
	<view class="friend-container">
		<!-- 好友列表 -->
		<view class="friend-list">
			<view class="friend-list-header">
				<text>我的好友</text>
				<view class="friend-actions">
					<view class="search-box">
						<input type="text" v-model="searchKey" placeholder="搜索好友..." />
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
							<view class="friend-status" :class="{'online': friend.activeStatus === 2}">
								{{ friend.activeStatus === 2 ? '在线' : '离线' }}
							</view>
						</view>
						<view class="last-message" v-if="friend.lastMessage">
							{{ friend.lastMessage }}
						</view>
					</view>
				</view>
				
				<!-- 分页控件 -->
				<view class="pagination" v-if="totalPages > 1">
					<view class="page-btn" :class="{ disabled: currentPage === 1 }" @click="changePage(currentPage - 1)">
						上一页
					</view>
					<view class="page-info">
						{{ currentPage }} / {{ totalPages }}
					</view>
					<view class="page-btn" :class="{ disabled: currentPage === totalPages }" @click="changePage(currentPage + 1)">
						下一页
					</view>
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
					<input type="number" v-model.number="addFriendForm.uid" placeholder="请输入好友ID" />
					<text class="input-label">验证消息</text>
					<input type="text" v-model="addFriendForm.msg" placeholder="验证消息" />
					<view class="add-btn" @click="addNewFriend">添加</view>
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
						<view v-for="(apply, index) in friendApplyList" :key="index" class="apply-item">
							<view class="user-avatar" :style="generateAvatarStyle(apply.uid)">
								<text>{{ getAvatarText(apply.uid) }}</text>
							</view>
							<view class="apply-info">
								<view class="user-name">用户 {{ apply.uid }}</view>
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
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import API_URL from '@/utils/api';
import { getTokenValue } from '@/utils/auth';

// 好友列表数据
const friendList = ref([]);
const filteredFriendList = ref([]);
const searchKey = ref('');
const showAddFriendModal = ref(false);
const addFriendForm = reactive({
	uid: null,
	msg: ''
});

// 分页相关
const currentPage = ref(1);
const pageSize = 10;
const totalPages = ref(1);
const totalItems = ref(0);

// 好友申请相关
const unreadApplyCount = ref(0);
const showFriendApplyModal = ref(false);
const friendApplyList = ref([]);

// 生成头像样式
const generateAvatarStyle = (name) => {
	const colors = ['#6a11cb', '#2575fc', '#ff4b2b', '#4CAF50', '#FFC107'];
	const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
	return {
		background: colors[colorIndex]
	};
};

// 获取头像文字
const getAvatarText = (name) => {
	if (!name) return '?';
	return name.charAt(0).toUpperCase();
};

// 加载好友列表
const loadFriendList = async () => {
	try {
		const res = await uni.request({
			url: API_URL.getFriendList,
			method: 'GET',
			header: {
				'Authorization': getTokenValue()
			},
			data: {
				page: currentPage.value,
				pageSize,
				timestamp: Date.now()
			}
		});
		
		if (res.data.code === 200) {
			friendList.value = res.data.data.data || [];
			totalItems.value = res.data.data.total || 0;
			totalPages.value = Math.ceil(totalItems.value / pageSize);
			filteredFriendList.value = [...friendList.value];
		} else {
			uni.showToast({
				title: res.data.message || '获取好友列表失败',
				icon: 'none'
			});
		}
	} catch (error) {
		uni.showToast({
			title: '网络错误，请稍后再试',
			icon: 'none'
		});
	}
};

// 切换页面
const changePage = (page) => {
	if (page < 1 || page > totalPages.value) return;
	currentPage.value = page;
	loadFriendList();
};

// 搜索好友
const searchFriends = () => {
	if (!searchKey.value) {
		filteredFriendList.value = [...friendList.value];
		return;
	}
	
	filteredFriendList.value = friendList.value.filter(friend => 
		friend.name.toLowerCase().includes(searchKey.value.toLowerCase())
	);
};

// 添加新好友
const addNewFriend = async () => {
	if (!addFriendForm.uid || !addFriendForm.msg.trim()) {
		uni.showToast({
			title: '请填写完整信息',
			icon: 'none'
		});
		return;
	}
	
	try {
		const res = await uni.request({
			url: API_URL.addFriend,
			method: 'POST',
			header: {
				'Authorization': getTokenValue()
			},
			data: {
				uid: addFriendForm.uid,
				msg: addFriendForm.msg
			}
		});
		
		if (res.data.code === 200) {
			uni.showToast({
				title: '好友申请已发送',
				icon: 'success'
			});
			showAddFriendModal.value = false;
			addFriendForm.uid = null;
			addFriendForm.msg = '';
		} else {
			uni.showToast({
				title: res.data.message || '添加好友失败',
				icon: 'none'
			});
		}
	} catch (error) {
		uni.showToast({
			title: '网络错误，请稍后再试',
			icon: 'none'
		});
	}
};

// 显示好友申请列表
const showFriendApplyList = async () => {
	try {
		const res = await uni.request({
			url: API_URL.getApplyList,
			method: 'GET',
			header: {
				'Authorization': getTokenValue()
			}
		});
		
		if (res.data.code === 200) {
			friendApplyList.value = res.data.data || [];
			showFriendApplyModal.value = true;
			unreadApplyCount.value = 0;
		} else {
			uni.showToast({
				title: res.data.message || '获取好友申请列表失败',
				icon: 'none'
			});
		}
	} catch (error) {
		uni.showToast({
			title: '网络错误，请稍后再试',
			icon: 'none'
		});
	}
};

// 同意好友申请
const agreeFriendApply = async (uid) => {
	try {
		const res = await uni.request({
			url: API_URL.agreeFriend,
			method: 'POST',
			header: {
				'Authorization': getTokenValue()
			},
			data: { uid }
		});
		
		if (res.data.code === 200) {
			uni.showToast({
				title: '已同意好友申请',
				icon: 'success'
			});
			friendApplyList.value = friendApplyList.value.filter(item => item.uid !== uid);
			loadFriendList();
		} else {
			uni.showToast({
				title: res.data.message || '操作失败',
				icon: 'none'
			});
		}
	} catch (error) {
		uni.showToast({
			title: '网络错误，请稍后再试',
			icon: 'none'
		});
	}
};

// 开始聊天
const startChat = (friend) => {
	uni.navigateTo({
		url: `/pages/chat/chat?uid=${friend.uid}&name=${friend.name}`
	});
};

// 获取未读申请数量
const getUnreadApplyCount = async () => {
	try {
		const res = await uni.request({
			url: API_URL.unreadApplyNum,
			method: 'GET',
			header: {
				'Authorization': getTokenValue()
			}
		});
		
		if (res.data.code === 200) {
			unreadApplyCount.value = res.data.data || 0;
		}
	} catch (error) {
		console.error('获取未读申请数量失败:', error);
	}
};

// 监听搜索关键词变化
watch(searchKey, () => {
	searchFriends();
});

// 页面加载
onMounted(() => {
	loadFriendList();
	getUnreadApplyCount();
});
</script>

<style lang="scss">
.friend-container {
	height: 100vh;
	background-color: #f6f6f6;
	display: flex;
	flex-direction: column;
}

.friend-list {
	flex: 1;
	display: flex;
	flex-direction: column;
	background-color: #fff;
	
	.friend-list-header {
		padding: 15px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid #f0f0f0;
		
		text {
			font-size: 16px;
			font-weight: bold;
			color: #333;
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
					border: 1px solid #e0e0e0;
					padding: 0 12px;
					font-size: 14px;
					
					&:focus {
						outline: none;
						border-color: #6a11cb;
					}
				}
			}
		}
	}
	
	.friend-list-content {
		flex: 1;
		overflow-y: auto;
		padding: 10px;
		
		.friend-apply-btn {
			width: 100%;
			height: 40px;
			display: flex;
			align-items: center;
			padding: 0 15px;
			background-color: #f9f9f9;
			border-radius: 8px;
			margin-bottom: 10px;
			cursor: pointer;
			
			&:hover {
				background-color: #f0f0f0;
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
					border: 2px solid #666;
					border-radius: 50%;
					top: 0;
					left: 0;
				}
				
				&::after {
					content: '+';
					position: absolute;
					font-size: 14px;
					color: #666;
					bottom: -4px;
					right: -4px;
					font-weight: bold;
				}
			}
			
			.apply-text {
				flex: 1;
				font-size: 14px;
				color: #333;
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
			color: #999;
			
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
					background-color: #f6f6f6;
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
				}
				
				.friend-info {
					flex: 1;
					
					.friend-name {
						font-size: 15px;
						color: #333;
						margin-bottom: 4px;
					}
					
					.friend-status {
						font-size: 12px;
						color: #999;
						
						&.online {
							color: #4CAF50;
						}
					}
				}
				
				.last-message {
					font-size: 13px;
					color: #999;
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
				color: #666;
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
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	
	.modal-content {
		width: 300px;
		background-color: #fff;
		border-radius: 8px;
		overflow: hidden;
		
		.modal-header {
			padding: 15px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid #f0f0f0;
			
			text {
				font-size: 16px;
				font-weight: bold;
				color: #333;
			}
			
			.close-btn {
				width: 24px;
				height: 24px;
				line-height: 24px;
				text-align: center;
				border-radius: 50%;
				font-size: 18px;
				color: #999;
				cursor: pointer;
				
				&:hover {
					background-color: #f6f6f6;
					color: #666;
				}
			}
		}
		
		.modal-body {
			padding: 20px;
			
			.input-label {
				display: block;
				font-size: 14px;
				color: #333;
				margin-bottom: 5px;
				font-weight: 500;
			}
			
			input {
				width: 100%;
				height: 40px;
				border: 1px solid #e0e0e0;
				border-radius: 4px;
				padding: 0 12px;
				margin-bottom: 15px;
				font-size: 14px;
				
				&:focus {
					outline: none;
					border-color: #6a11cb;
				}
			}
			
			.add-btn {
				height: 40px;
				line-height: 40px;
				background: linear-gradient(45deg, #6a11cb, #2575fc);
				border-radius: 4px;
				color: #fff;
				font-size: 14px;
				text-align: center;
				cursor: pointer;
				
				&:hover {
					opacity: 0.9;
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
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	
	.modal-content {
		width: 90%;
		max-width: 500px;
		max-height: 80vh;
		background-color: #fff;
		border-radius: 8px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		
		.modal-header {
			padding: 15px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid #f0f0f0;
			
			text {
				font-size: 16px;
				font-weight: bold;
				color: #333;
			}
			
			.close-btn {
				width: 24px;
				height: 24px;
				line-height: 24px;
				text-align: center;
				border-radius: 50%;
				font-size: 18px;
				color: #999;
				cursor: pointer;
				
				&:hover {
					background-color: #f6f6f6;
					color: #666;
				}
			}
		}
		
		.modal-body {
			flex: 1;
			overflow-y: auto;
			padding: 15px;
			
			.empty-tip {
				text-align: center;
				padding: 30px 0;
				color: #999;
			}
			
			.apply-list {
				.apply-item {
					display: flex;
					align-items: center;
					padding: 12px;
					border-bottom: 1px solid #f0f0f0;
					
					&:last-child {
						border-bottom: none;
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
					}
					
					.apply-info {
						flex: 1;
						
						.user-name {
							font-size: 16px;
							color: #333;
							margin-bottom: 5px;
						}
						
						.apply-msg {
							font-size: 13px;
							color: #666;
						}
					}
					
					.apply-actions {
						.agree-btn {
							padding: 6px 15px;
							background: linear-gradient(45deg, #6a11cb, #2575fc);
							border-radius: 20px;
							color: #fff;
							font-size: 14px;
							cursor: pointer;
							
							&:hover {
								opacity: 0.9;
							}
						}
					}
				}
			}
		}
	}
}
</style> 