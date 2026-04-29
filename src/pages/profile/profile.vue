<template>
	<view class="profile-container">
		<!-- 头部导航 -->
		<view class="header">
			<view class="back-btn" @click="goBack">
				<text>←</text>
			</view>
			<text class="header-title">个人中心</text>
			<view class="header-right">
				<view class="settings-btn" @click="openSettings">
					<text>⚙</text>
				</view>
			</view>
		</view>
		
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="user-info">
				<view class="user-avatar" :style="generateAvatarStyle(userInfo.name)">
					<text>{{ getAvatarText(userInfo.name) }}</text>
				</view>
				<view class="user-details">
					<text class="user-name">{{ userInfo.name || '用户' }}</text>
					<text class="user-phone">{{ userInfo.phone || '未绑定手机' }}</text>
				</view>
			</view>
			<view class="user-stats">
				<view class="stat-item">
					<text class="stat-value">{{ userInfo.vipLevel || 0 }}</text>
					<text class="stat-label">VIP等级</text>
				</view>
				<view class="stat-item">
					<text class="stat-value">{{ userInfo.days || 0 }}</text>
					<text class="stat-label">使用天数</text>
				</view>
			</view>
		</view>
		
		<!-- 功能菜单 -->
		<view class="menu-section">
			<view class="menu-group">
				<view class="menu-item" @click="navigateToPoints">
					<text class="menu-text">积分商城</text>
					<text class="menu-arrow">></text>
				</view>
				<view class="menu-item" @click="navigateToPurchase">
					<text class="menu-text">购买服务</text>
					<text class="menu-arrow">></text>
				</view>
				<view class="menu-item" @click="navigateToOrders">
					<text class="menu-text">购买记录</text>
					<text class="menu-arrow">></text>
				</view>
			</view>
			
			<view class="menu-group">
				<view class="menu-item" @click="navigateToSettings">
					<text class="menu-text">设置</text>
					<text class="menu-arrow">></text>
				</view>
				<view class="menu-item" @click="navigateToHelp">
					<text class="menu-text">帮助中心</text>
					<text class="menu-arrow">></text>
				</view>
				<view class="menu-item" @click="navigateToAbout">
					<text class="menu-text">关于我们</text>
					<text class="menu-arrow">></text>
				</view>
			</view>
		</view>
		
		<!-- 退出登录按钮 -->
		<view class="logout-section">
			<view class="logout-btn" @click="handleLogout">
				<text>退出登录</text>
			</view>
		</view>
		
		<!-- 积分商城弹窗 -->
		<view class="points-modal" v-if="showPointsModal">
			<view class="modal-content">
				<view class="modal-header">
					<text>积分商城</text>
					<view class="close-btn" @click="closePointsModal">×</view>
				</view>
				<view class="modal-body">
					<view class="points-balance">
						<text class="balance-label">当前积分</text>
						<text class="balance-value">{{ userInfo.points || 0 }}</text>
					</view>
					
					<view class="points-products">
						<view class="product-item" v-for="product in pointsProducts" :key="product.id">
							<view class="product-info">
								<text class="product-name">{{ product.name }}</text>
								<text class="product-desc">{{ product.description }}</text>
							</view>
							<view class="product-action">
								<text class="product-points">{{ product.points }}积分</text>
								<view class="exchange-btn" @click="exchangeProduct(product)">兑换</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 购买服务弹窗 -->
		<view class="purchase-modal" v-if="showPurchaseModal">
			<view class="modal-content">
				<view class="modal-header">
					<text>购买服务</text>
					<view class="close-btn" @click="closePurchaseModal">×</view>
				</view>
				<view class="modal-body">
					<view class="service-packages">
						<view class="package-item" v-for="servicePackage in servicePackages" :key="servicePackage.id" 
							  :class="{ 'selected': selectedPackage === servicePackage.id }" @click="selectPackage(servicePackage.id)">
							<view class="package-header">
								<text class="package-name">{{ servicePackage.name }}</text>
								<text class="package-price">¥{{ servicePackage.price }}</text>
							</view>
							<view class="package-features">
								<text v-for="feature in servicePackage.features" :key="feature" class="feature-item">{{ feature }}</text>
							</view>
							<view class="package-duration">{{ servicePackage.duration }}</view>
						</view>
					</view>
					
					<view class="purchase-action">
						<view class="total-price">
							<text>总计：¥{{ selectedPackagePrice }}</text>
						</view>
						<view class="purchase-btn" @click="confirmPurchase">立即购买</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 购买记录弹窗 -->
		<view class="orders-modal" v-if="showOrdersModal">
			<view class="modal-content">
				<view class="modal-header">
					<text>购买记录</text>
					<view class="close-btn" @click="closeOrdersModal">×</view>
				</view>
				<view class="modal-body">
					<view class="orders-list">
						<view class="order-item" v-for="order in ordersList" :key="order.id">
							<view class="order-header">
								<text class="order-id">订单号：{{ order.orderId }}</text>
								<text class="order-status" :class="order.status">{{ getStatusText(order.status) }}</text>
							</view>
							<view class="order-content">
								<text class="order-name">{{ order.productName }}</text>
								<text class="order-price">¥{{ order.price }}</text>
							</view>
							<view class="order-footer">
								<text class="order-time">{{ formatTime(order.createTime) }}</text>
								<view class="order-action" v-if="order.status === 'pending'">
									<view class="cancel-btn" @click="cancelOrder(order.id)">取消订单</view>
								</view>
							</view>
						</view>
					</view>
					
					<view class="empty-orders" v-if="ordersList.length === 0">
						<text>暂无购买记录</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 确认兑换弹窗 -->
		<view class="confirm-modal" v-if="showConfirmModal">
			<view class="modal-content">
				<view class="modal-header">
					<text>确认兑换</text>
					<view class="close-btn" @click="closeConfirmModal">×</view>
				</view>
				<view class="modal-body">
					<view class="confirm-content">
						<text class="confirm-text">确定要使用{{ confirmData?.points }}积分兑换{{ confirmData?.name }}吗？</text>
					</view>
					<view class="confirm-actions">
						<view class="cancel-btn" @click="closeConfirmModal">取消</view>
						<view class="confirm-btn" @click="handleConfirmExchange">确认兑换</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 取消订单确认弹窗 -->
		<view class="cancel-order-modal" v-if="showCancelOrderModal">
			<view class="modal-content">
				<view class="modal-header">
					<text>确认取消</text>
					<view class="close-btn" @click="closeCancelOrderModal">×</view>
				</view>
				<view class="modal-body">
					<view class="confirm-content">
						<text class="confirm-text">确定要取消此订单吗？</text>
					</view>
					<view class="confirm-actions">
						<view class="cancel-btn" @click="closeCancelOrderModal">取消</view>
						<view class="confirm-btn" @click="handleConfirmCancelOrder">确认取消</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 支付方式选择弹窗 -->
		<view class="payment-method-modal" v-if="showPaymentMethodModal">
			<view class="modal-content">
				<view class="modal-header">
					<text>选择支付方式</text>
					<view class="close-btn" @click="closePaymentMethodModal">×</view>
				</view>
				<view class="modal-body">
					<view class="order-summary">
						<text class="order-title">{{ selectedPackageData?.name }}</text>
						<text class="order-duration">{{ selectedPackageData?.duration }}</text>
					</view>
					
					<view class="payment-methods">
						<view class="payment-method-item" 
							  v-for="method in paymentMethods" 
							  :key="method.id"
							  :class="{ 'selected': selectedPaymentMethod === method.id }"
							  @click="selectPaymentMethod(method.id)">
							<view class="method-icon">
								<text class="icon">{{ method.icon === 'wechat' ? '💬' : '💰' }}</text>
							</view>
							<view class="method-info">
								<text class="method-name">{{ method.name }}</text>
								<text class="method-desc">{{ method.desc || '安全便捷的支付方式' }}</text>
							</view>
							<view class="method-radio" v-if="selectedPaymentMethod === method.id">✓</view>
						</view>
					</view>
					
					<view class="payment-actions">
						<view class="total-price">
							<text>总计：¥{{ selectedPackagePrice }}</text>
						</view>
						<view class="pay-btn" 
							  :class="{ 'disabled': !selectedPaymentMethod }"
							  @click="handlePayment">
							{{ isPaying ? '支付中...' : '立即支付' }}
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import PaymentService from '@/services/paymentService.js';
import PurchaseService from '@/services/purchaseService.js';
import wsService from '@/services/websocket.js';

// 用户信息
const userInfo = ref({
	name: '',
	uid: null,
	vipLevel: 0,
	days: 0
});

// 弹窗状态
const showPointsModal = ref(false);
const showPurchaseModal = ref(false);
const showOrdersModal = ref(false);
const showConfirmModal = ref(false);
const confirmData = ref(null);
const showCancelOrderModal = ref(false);
const cancelOrderData = ref(null);
const showPaymentMethodModal = ref(false);

// 支付相关状态
const selectedPaymentMethod = ref(null);
const isPaying = ref(false);
const paymentMethods = ref([
	{
		id: 'wechat',
		name: '微信支付',
		icon: 'wechat',
		desc: '安全便捷的支付方式'
	},
	{
		id: 'alipay',
		name: '支付宝',
		icon: 'alipay',
		desc: '快速安全的支付体验'
	}
]);

// 选中的套餐
const selectedPackage = ref(null);
const selectedPackagePrice = ref(0);

// 计算属性
const selectedPackageData = computed(() => {
	return servicePackages.value.find(p => p.id === selectedPackage.value);
});

// 积分商品
const pointsProducts = ref([
	{
		id: 1,
		name: 'VIP体验卡',
		description: '7天VIP体验，享受所有高级功能',
		points: 1000
	},
	{
		id: 2,
		name: 'AI绘图次数',
		description: '10次AI绘图机会',
		points: 500
	},
	{
		id: 3,
		name: '语音转文字',
		description: '100分钟语音转文字服务',
		points: 300
	},
	{
		id: 4,
		name: '高级客服',
		description: '24小时专属客服服务',
		points: 800
	}
]);

// 服务套餐
const servicePackages = ref([
	{
		id: 1,
		name: '基础版',
		price: 29,
		duration: '1个月',
		features: ['AI聊天', '基础绘图', '语音转换']
	},
	{
		id: 2,
		name: '专业版',
		price: 99,
		duration: '3个月',
		features: ['AI聊天', '高级绘图', '语音转换', 'MCP服务', '优先客服']
	},
	{
		id: 3,
		name: '企业版',
		price: 299,
		duration: '12个月',
		features: ['AI聊天', '无限绘图', '语音转换', 'MCP服务', '专属客服', 'API接口']
	}
]);

// 订单列表
const ordersList = ref([
	{
		id: 1,
		orderId: 'ORD20241201001',
		productName: '专业版服务',
		price: 99,
		status: 'completed',
		createTime: new Date('2024-12-01 10:30:00')
	},
	{
		id: 2,
		orderId: 'ORD20241202001',
		productName: '基础版服务',
		price: 29,
		status: 'pending',
		createTime: new Date('2024-12-02 14:20:00')
	},
	{
		id: 3,
		orderId: 'ORD20241130001',
		productName: '企业版服务',
		price: 299,
		status: 'completed',
		createTime: new Date('2024-11-30 09:15:00')
	}
]);

// 生成头像背景
const generateAvatarStyle = (name) => {
	const color = '#2575fc';
	return {
		background: `linear-gradient(45deg, ${color}, ${color}dd)`,
		color: '#fff',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontSize: '20px',
		fontWeight: 'bold'
	};
};

// 获取头像文字
const getAvatarText = (name) => {
	if (!name) return '?';
	const firstChar = name.charAt(0);
	if (/[\u4e00-\u9fa5]/.test(firstChar)) {
		return firstChar;
	}
	return firstChar.toUpperCase();
};

// 格式化时间
const formatTime = (date) => {
	const d = new Date(date);
	return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

// 获取状态文本
const getStatusText = (status) => {
	const statusMap = {
		'pending': '待支付',
		'completed': '已完成',
		'cancelled': '已取消',
		'refunded': '已退款'
	};
	return statusMap[status] || '未知';
};

// 返回上一页
const goBack = () => {

	uni.reLaunch({
        url: '/pages/home/home'
      });
};


// 打开设置
const openSettings = () => {
	uni.showToast({
		title: '设置功能暂未开放',
		icon: 'none'
	});
};

// 导航到积分商城
const navigateToPoints = () => {
	showPointsModal.value = true;
};

// 导航到购买服务
const navigateToPurchase = () => {
	showPurchaseModal.value = true;
};

// 导航到购买记录
const navigateToOrders = () => {
	uni.showToast({
		title: '购买记录暂未开放',
		icon: 'none'
	});
	// showOrdersModal.value = true;
};

// 导航到设置
const navigateToSettings = () => {
	uni.showToast({
		title: '设置功能暂未开放',
		icon: 'none'
	});
};

// 导航到帮助中心
const navigateToHelp = () => {
	uni.showToast({
		title: '帮助中心暂未开放',
		icon: 'none'
	});
};

// 导航到关于我们
const navigateToAbout = () => {
	uni.showToast({
		title: '关于我们暂未开放',
		icon: 'none'
	});
};

// 关闭积分商城弹窗
const closePointsModal = () => {
	showPointsModal.value = false;
};

// 关闭购买服务弹窗
const closePurchaseModal = () => {
	showPurchaseModal.value = false;
	selectedPackage.value = null;
	selectedPackagePrice.value = 0;
};

// 关闭购买记录弹窗
const closeOrdersModal = () => {
	showOrdersModal.value = false;
};

// 关闭确认弹窗
const closeConfirmModal = () => {
	showConfirmModal.value = false;
	confirmData.value = null;
};

// 处理确认兑换
const handleConfirmExchange = () => {
	if (confirmData.value) {
		// 这里应该调用API进行兑换
		const currentPoints = Number(userInfo.value.points || 0);
		userInfo.value.points = currentPoints - confirmData.value.points;
		uni.showToast({
			title: '兑换成功',
			icon: 'success'
		});
		closeConfirmModal();
	}
};

// 关闭取消订单弹窗
const closeCancelOrderModal = () => {
	showCancelOrderModal.value = false;
	cancelOrderData.value = null;
};

// 处理确认取消订单
const handleConfirmCancelOrder = () => {
	if (cancelOrderData.value) {
		// 这里应该调用API取消订单
		const orderIndex = ordersList.value.findIndex(order => order.id === cancelOrderData.value);
		if (orderIndex !== -1) {
			ordersList.value[orderIndex].status = 'cancelled';
		}
		uni.showToast({
			title: '订单已取消',
			icon: 'success'
		});
		closeCancelOrderModal();
	}
};

// 选择套餐
const selectPackage = (packageId) => {
	selectedPackage.value = packageId;
	const selectedPackageData = servicePackages.value.find(p => p.id === packageId);
	selectedPackagePrice.value = selectedPackageData ? selectedPackageData.price : 0;
};

// 兑换商品
const exchangeProduct = (product) => {
	if (userInfo.value.points < product.points) {
		uni.showToast({
			title: '积分不足',
			icon: 'none'
		});
		return;
	}
	
	// 显示自定义确认弹窗
	confirmData.value = product;
	showConfirmModal.value = true;
};

// 确认购买
const confirmPurchase = async () => {
	if (!selectedPackage.value) {
		uni.showToast({
			title: '请选择套餐',
			icon: 'none'
		});
		return;
	}
	
	const selectedPackageData = servicePackages.value.find(p => p.id === selectedPackage.value);
	if (!selectedPackageData) {
		uni.showToast({
			title: '套餐信息错误',
			icon: 'none'
		});
		return;
	}
	
	// 显示支付方式选择
	showPaymentMethodModal.value = true;
};

// 关闭支付方式选择弹窗
const closePaymentMethodModal = () => {
	showPaymentMethodModal.value = false;
	selectedPaymentMethod.value = null;
};

// 选择支付方式
const selectPaymentMethod = (methodId) => {
	selectedPaymentMethod.value = methodId;
};

// 处理支付
const handlePayment = async () => {
	if (!selectedPaymentMethod.value) {
		uni.showToast({ title: '请选择支付方式', icon: 'none' });
		return;
	}
	if (!selectedPackageData.value) {
		uni.showToast({ title: '套餐信息错误', icon: 'none' });
		return;
	}

	isPaying.value = true;

	try {
		const orderData = {
			packageId: selectedPackageData.value.id,
			price: selectedPackageData.value.price,
			packageName: selectedPackageData.value.name
		};

		let result;
		result = await PaymentService.initiatePayment(orderData, selectedPaymentMethod.value);

		if (result.pending) {
			// 支付宝跳转后，轮询支付状态（最多等 5 分钟）
			closePaymentMethodModal();
			uni.showToast({ title: '请在支付宝完成支付', icon: 'none', duration: 3000 });
			pollPaymentStatus(result.orderId);
		} else if (result.success) {
			uni.showToast({ title: '支付成功', icon: 'success' });
			closePaymentMethodModal();
			closePurchaseModal();
			await loadUserServiceInfo();
			await loadOrderList();
		} else {
			uni.showToast({ title: result.message || '支付失败', icon: 'none' });
		}
	} catch (error) {
		console.error('支付失败:', error);
		uni.showToast({ title: error.message || '支付失败，请重试', icon: 'none' });
	} finally {
		isPaying.value = false;
	}
};

// 轮询支付状态（支付宝跳转后使用）
const pollPaymentStatus = (orderId, maxAttempts = 30) => {
	let attempts = 0;
	const timer = setInterval(async () => {
		attempts++;
		try {
			const status = await PurchaseService.getPaymentStatus(orderId);
			if (status === 'completed' || status?.status === 'completed') {
				clearInterval(timer);
				uni.showToast({ title: '支付成功', icon: 'success' });
				closePurchaseModal();
				await loadUserServiceInfo();
				await loadOrderList();
			} else if (status === 'cancelled' || status?.status === 'cancelled') {
				clearInterval(timer);
				uni.showToast({ title: '支付已取消', icon: 'none' });
			}
		} catch (e) {
			// 忽略轮询错误
		}
		if (attempts >= maxAttempts) {
			clearInterval(timer);
		}
	}, 10000); // 每 10 秒查一次
};

// 取消订单
const cancelOrder = async (orderId) => {
	try {
		await PurchaseService.cancelOrder(orderId);
		uni.showToast({
			title: '订单已取消',
			icon: 'success'
		});
		// 刷新订单列表
		await loadOrderList();
	} catch (error) {
		console.error('取消订单失败:', error);
		uni.showToast({
			title: error.message || '取消订单失败',
			icon: 'none'
		});
	}
};

// 处理退出登录
const handleLogout = () => {
	uni.showModal({
		title: '提示',
		content: '确定要退出登录吗？',
		success: (res) => {
			if (res.confirm) {
				// 1. 断开 WebSocket 连接
				if (wsService) {
					console.log('退出登录：断开 WebSocket 连接');
					wsService.disconnect();
					wsService.clearMessages();
				}
				
				// 2. 清除本地存储的用户信息和token
				uni.removeStorageSync('token');
				uni.removeStorageSync('userInfo');
				
				// 3. 显示退出成功提示
				uni.showToast({
					title: '已退出登录',
					icon: 'success',
					duration: 1500
				});
				
				// 4. 延迟跳转到登录页，确保提示显示
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/login/login'
					});
				}, 1500);
			}
		}
	});
};

// 加载用户服务信息
const loadUserServiceInfo = async () => {
	// 从 localStorage 读取登录时存的用户信息
	const stored = uni.getStorageSync('userInfo');
	if (stored) {
		const data = typeof stored === 'string' ? JSON.parse(stored) : stored;
		if (data && data.name) {
			userInfo.value.name = data.name;
			userInfo.value.uid = data.uid || null;
		}
	}

	// 从服务器获取 VIP/积分等服务信息
	try {
		const serviceInfo = await PurchaseService.getUserServiceInfo();
		if (serviceInfo) {
			userInfo.value = {
				...userInfo.value,
				...serviceInfo
			};
		}
	} catch (error) {
		console.error('加载用户服务信息失败:', error);
		userInfo.value = {
			...userInfo.value,
			points: 0,
			vipLevel: 0,
			days: 0
		};
	}
};

// 加载订单列表
const loadOrderList = async () => {
	try {
		const orderData = await PurchaseService.getOrderList();
		if (orderData && orderData.data) {
			ordersList.value = orderData.data.map(order => ({
				...order,
				createTime: new Date(order.createTime)
			}));
		}
	} catch (error) {
		console.error('加载订单列表失败:', error);
		// 使用模拟数据
		ordersList.value = [
			{
				id: 1,
				orderId: 'ORD20241201001',
				productName: '专业版服务',
				price: 99,
				status: 'completed',
				createTime: new Date('2024-12-01 10:30:00')
			},
			{
				id: 2,
				orderId: 'ORD20241202001',
				productName: '基础版服务',
				price: 29,
				status: 'pending',
				createTime: new Date('2024-12-02 14:20:00')
			},
			{
				id: 3,
				orderId: 'ORD20241130001',
				productName: '企业版服务',
				price: 299,
				status: 'completed',
				createTime: new Date('2024-11-30 09:15:00')
			}
		];
	}
};

// 页面加载
onMounted(async () => {
		
	// 加载服务信息
	await loadUserServiceInfo();
	// 获取用户信息


	// 加载订单列表
	await loadOrderList();
});
</script>

<style lang="scss" scoped>
.profile-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #0f0f0f 100%);
	color: #ffffff;
	padding-bottom: 20px;
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

/* 头部导航 */
.header {
	height: 60px;
	background: rgba(0, 0, 0, 0.9);
	backdrop-filter: blur(20px);
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 15px;
	box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	position: relative;
	z-index: 10;
	
	.back-btn {
		width: 32px;
		height: 32px;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		font-size: 18px;
		color: #ffffff;
		background: rgba(255, 255, 255, 0.1);
		transition: all 0.3s ease;
		
		&:hover {
			background: rgba(255, 255, 255, 0.2);
			transform: translateY(-1px);
		}
	}
	
	.header-title {
		font-size: 16px;
		font-weight: bold;
		color: #ffffff;
	}
	
	.header-right {
		.settings-btn {
			width: 32px;
			height: 32px;
			border-radius: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			font-size: 16px;
			color: #ffffff;
			background: rgba(255, 255, 255, 0.1);
			transition: all 0.3s ease;
			
			&:hover {
				background: rgba(255, 255, 255, 0.2);
				transform: translateY(-1px);
			}
		}
	}
}

/* 用户信息卡片 */
.user-card {
	background: rgba(0, 0, 0, 0.8);
	backdrop-filter: blur(20px);
	margin: 15px;
	border-radius: 16px;
	padding: 20px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	border: 1px solid rgba(255, 255, 255, 0.1);
	position: relative;
	z-index: 1;
	
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
	}
	
	.user-info {
		display: flex;
		align-items: center;
		margin-bottom: 20px;
		
		.user-avatar {
			width: 60px;
			height: 60px;
			border-radius: 50%;
			margin-right: 15px;
			box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
		}
		
		.user-details {
			flex: 1;
			
			.user-name {
				display: block;
				font-size: 18px;
				font-weight: bold;
				color: #ffffff;
				margin-bottom: 5px;
			}
			
			.user-id {
				display: block;
				font-size: 14px;
				color: rgba(255, 255, 255, 0.6);
				margin-bottom: 3px;
			}
			
			.user-phone {
				display: block;
				font-size: 14px;
				color: rgba(255, 255, 255, 0.5);
			}
		}
	}
	
	.user-stats {
		display: flex;
		justify-content: space-around;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		padding-top: 15px;
		
		.stat-item {
			text-align: center;
			
			.stat-value {
				display: block;
				font-size: 20px;
				font-weight: bold;
				color: #667eea;
				margin-bottom: 5px;
			}
			
			.stat-label {
				display: block;
				font-size: 12px;
				color: rgba(255, 255, 255, 0.6);
			}
		}
	}
}

/* 功能菜单 */
.menu-section {
	margin: 15px;
	position: relative;
	z-index: 1;
	
	.menu-group {
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(20px);
		border-radius: 16px;
		margin-bottom: 15px;
		overflow: hidden;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		
		.menu-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 15px 20px;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			cursor: pointer;
			transition: all 0.3s ease;
			position: relative;
			
			&:last-child {
				border-bottom: none;
			}
			
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
				background: rgba(255, 255, 255, 0.05);
				transform: translateX(4px);
				
				&::before {
					opacity: 1;
				}
			}
			
			&:active {
				background: rgba(255, 255, 255, 0.1);
				transform: translateX(2px);
			}
			
			.menu-text {
				font-size: 16px;
				color: #ffffff;
				position: relative;
				z-index: 1;
			}
			
			.menu-arrow {
				font-size: 16px;
				color: rgba(255, 255, 255, 0.4);
				position: relative;
				z-index: 1;
			}
		}
	}
}

/* 退出登录按钮 */
.logout-section {
	margin: 15px;
	position: relative;
	z-index: 1;
	
	.logout-btn {
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(20px);
		border-radius: 16px;
		padding: 15px 20px;
		text-align: center;
		cursor: pointer;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 75, 43, 0.3);
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		
		&::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(135deg, rgba(255, 75, 43, 0.1), rgba(255, 107, 107, 0.1));
			opacity: 0;
			transition: opacity 0.3s ease;
		}
		
		&:hover {
			background: rgba(255, 75, 43, 0.1);
			transform: translateY(-2px);
			box-shadow: 0 12px 48px rgba(255, 75, 43, 0.2);
			
			&::before {
				opacity: 1;
			}
		}
		
		&:active {
			background: rgba(255, 75, 43, 0.15);
			transform: translateY(0);
		}
		
		text {
			font-size: 16px;
			color: #ff4b2b;
			font-weight: 500;
			position: relative;
			z-index: 1;
		}
	}
}

/* 弹窗样式 */
.points-modal,
.purchase-modal,
.orders-modal,
.confirm-modal,
.cancel-order-modal {
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
	z-index: 9999;
	
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
		box-shadow: 0 16px 64px rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.1);
		position: relative;
		z-index: 10000;
		
		.modal-header {
			padding: 20px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			background: rgba(0, 0, 0, 0.8);
			
			text {
				font-size: 18px;
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
				transition: all 0.3s ease;
				
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
		}
	}
}

/* 积分商城弹窗 */
.points-balance {
	text-align: center;
	margin-bottom: 20px;
	padding: 15px;
	background: linear-gradient(45deg, #667eea, #764ba2);
	border-radius: 12px;
	box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
	
	.balance-label {
		display: block;
		font-size: 14px;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 5px;
	}
	
	.balance-value {
		display: block;
		font-size: 24px;
		font-weight: bold;
		color: #fff;
	}
}

.points-products {
	.product-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		margin-bottom: 8px;
		background: rgba(255, 255, 255, 0.05);
		transition: all 0.3s ease;
		
		&:last-child {
			border-bottom: none;
			margin-bottom: 0;
		}
		
		&:hover {
			background: rgba(255, 255, 255, 0.1);
			transform: translateY(-1px);
		}
		
		.product-info {
			flex: 1;
			
			.product-name {
				display: block;
				font-size: 16px;
				color: #ffffff;
				margin-bottom: 5px;
				font-weight: 500;
			}
			
			.product-desc {
				display: block;
				font-size: 14px;
				color: rgba(255, 255, 255, 0.6);
			}
		}
		
		.product-action {
			display: flex;
			align-items: center;
			
			.product-points {
				font-size: 14px;
				color: #ff6b35;
				font-weight: bold;
				margin-right: 10px;
			}
			
			.exchange-btn {
				padding: 6px 12px;
				background: linear-gradient(45deg, #667eea, #764ba2);
				color: #fff;
				border-radius: 15px;
				font-size: 12px;
				cursor: pointer;
				transition: all 0.3s ease;
				
				&:hover {
					opacity: 0.9;
					transform: translateY(-1px);
					box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
				}
			}
		}
	}
}

/* 购买服务弹窗 */
.service-packages {
	.package-item {
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 15px;
		margin-bottom: 15px;
		cursor: pointer;
		transition: all 0.3s ease;
		background: rgba(255, 255, 255, 0.05);
		
		&.selected {
			border-color: #667eea;
			background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
			box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
		}
		
		&:hover {
			border-color: #667eea;
			background: rgba(255, 255, 255, 0.1);
			transform: translateY(-2px);
		}
		
		.package-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 10px;
			
			.package-name {
				font-size: 16px;
				font-weight: bold;
				color: #ffffff;
			}
			
			.package-price {
				font-size: 18px;
				font-weight: bold;
				color: #667eea;
			}
		}
		
		.package-features {
			margin-bottom: 10px;
			
			.feature-item {
				display: block;
				font-size: 14px;
				color: rgba(255, 255, 255, 0.8);
				margin-bottom: 3px;
				
				&::before {
					content: '✓';
					color: #4CAF50;
					margin-right: 5px;
				}
			}
		}
		
		.package-duration {
			font-size: 12px;
			color: rgba(255, 255, 255, 0.6);
		}
	}
}

.purchase-action {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 20px;
	padding-top: 15px;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	
	.total-price {
		font-size: 16px;
		font-weight: bold;
		color: #ffffff;
	}
	
	.purchase-btn {
		padding: 10px 20px;
		background: linear-gradient(45deg, #667eea, #764ba2);
		color: #fff;
		border-radius: 20px;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.3s ease;
		
		&:hover {
			opacity: 0.9;
			transform: translateY(-1px);
			box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
		}
	}
}

/* 购买记录弹窗 */
.orders-list {
	.order-item {
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 15px;
		margin-bottom: 15px;
		background: rgba(255, 255, 255, 0.05);
		transition: all 0.3s ease;
		
		&:hover {
			background: rgba(255, 255, 255, 0.1);
			transform: translateY(-1px);
		}
		
		.order-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 10px;
			
			.order-id {
				font-size: 14px;
				color: rgba(255, 255, 255, 0.7);
			}
			
			.order-status {
				font-size: 12px;
				padding: 4px 8px;
				border-radius: 12px;
				font-weight: 500;
				
				&.pending {
					background: rgba(255, 193, 7, 0.2);
					color: #ffc107;
					border: 1px solid rgba(255, 193, 7, 0.3);
				}
				
				&.completed {
					background: rgba(40, 167, 69, 0.2);
					color: #28a745;
					border: 1px solid rgba(40, 167, 69, 0.3);
				}
				
				&.cancelled {
					background: rgba(220, 53, 69, 0.2);
					color: #dc3545;
					border: 1px solid rgba(220, 53, 69, 0.3);
				}
				
				&.refunded {
					background: rgba(108, 117, 125, 0.2);
					color: #6c757d;
					border: 1px solid rgba(108, 117, 125, 0.3);
				}
			}
		}
		
		.order-content {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 10px;
			
			.order-name {
				font-size: 16px;
				color: #ffffff;
				font-weight: 500;
			}
			
			.order-price {
				font-size: 16px;
				font-weight: bold;
				color: #667eea;
			}
		}
		
		.order-footer {
			display: flex;
			justify-content: space-between;
			align-items: center;
			
			.order-time {
				font-size: 12px;
				color: rgba(255, 255, 255, 0.5);
			}
			
			.order-action {
				.cancel-btn {
					padding: 6px 12px;
					background: linear-gradient(45deg, #ff4b2b, #ff6b6b);
					color: #fff;
					border-radius: 12px;
					font-size: 12px;
					cursor: pointer;
					transition: all 0.3s ease;
					
					&:hover {
						opacity: 0.9;
						transform: translateY(-1px);
						box-shadow: 0 4px 15px rgba(255, 75, 43, 0.3);
					}
				}
			}
		}
	}
}

.empty-orders {
	text-align: center;
	padding: 40px 0;
	color: rgba(255, 255, 255, 0.5);
	font-size: 14px;
}

/* 确认弹窗样式 */
.confirm-content {
	text-align: center;
	padding: 20px 0;
	
	.confirm-text {
		font-size: 16px;
		color: #ffffff;
		line-height: 1.5;
	}
}

.confirm-actions {
	display: flex;
	justify-content: space-between;
	gap: 15px;
	margin-top: 20px;
	
	.cancel-btn,
	.confirm-btn {
		flex: 1;
		padding: 12px 20px;
		border-radius: 8px;
		text-align: center;
		font-size: 16px;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.cancel-btn {
		background-color: #f5f5f5;
		color: #666;
		border: 1px solid #ddd;
		
		&:hover {
			background-color: #e9e9e9;
		}
	}
	
	.confirm-btn {
		background: linear-gradient(45deg, #6a11cb, #2575fc);
		color: #fff;
		
		&:hover {
			opacity: 0.9;
		}
	}
}

/* 取消订单弹窗样式 */
.cancel-order-modal {
	.confirm-btn {
		background: linear-gradient(45deg, #ff4b2b, #ff6b6b);
		
		&:hover {
			opacity: 0.9;
		}
	}
}

/* 响应式设计 */
@media (max-width: 768px) {
	.user-card {
		margin: 10px;
		padding: 15px;
		
		.user-info {
			.user-avatar {
				width: 50px;
				height: 50px;
			}
			
			.user-details {
				.user-name {
					font-size: 16px;
				}
			}
		}
		
		.user-stats {
			.stat-item {
				.stat-value {
					font-size: 18px;
				}
			}
		}
	}
	
	.menu-section {
		margin: 10px;
		
		.menu-group {
			.menu-item {
				padding: 12px 15px;
				
				.menu-text {
					font-size: 15px;
				}
			}
		}
	}
	
	.logout-section {
		margin: 10px;
	}
}

/* 支付方式选择弹窗 */
.payment-method-modal {
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
	z-index: 9999;
	
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
		box-shadow: 0 16px 64px rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.1);
		position: relative;
		z-index: 10000;
		
		.modal-header {
			padding: 20px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			background: rgba(0, 0, 0, 0.8);
			
			text {
				font-size: 18px;
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
				transition: all 0.3s ease;
				
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
			
			.order-summary {
				background: rgba(102, 126, 234, 0.15);
				border: 1px solid rgba(102, 126, 234, 0.3);
				border-radius: 12px;
				padding: 15px 20px;
				margin-bottom: 20px;
				display: flex;
				justify-content: space-between;
				align-items: center;
				
				.order-title {
					font-size: 16px;
					font-weight: bold;
					color: #ffffff;
				}
				
				.order-duration {
					font-size: 13px;
					color: rgba(255, 255, 255, 0.5);
				}
			}
			
			.payment-methods {
				margin-bottom: 20px;
				
				.payment-method-item {
					display: flex;
					align-items: center;
					padding: 15px;
					border: 1px solid rgba(255, 255, 255, 0.1);
					border-radius: 12px;
					margin-bottom: 10px;
					cursor: pointer;
					transition: all 0.3s ease;
					background: rgba(255, 255, 255, 0.05);
					
					&:hover {
						border-color: rgba(102, 126, 234, 0.5);
						background: rgba(102, 126, 234, 0.1);
					}
					
					&.selected {
						border-color: #667eea;
						background: rgba(102, 126, 234, 0.2);
						box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2);
					}
					
					.method-icon {
						width: 40px;
						height: 40px;
						border-radius: 50%;
						background: rgba(255, 255, 255, 0.1);
						display: flex;
						align-items: center;
						justify-content: center;
						margin-right: 15px;
						flex-shrink: 0;
						
						.icon {
							font-size: 20px;
						}
					}
					
					.method-info {
						flex: 1;
						
						.method-name {
							display: block;
							font-size: 15px;
							font-weight: bold;
							color: #ffffff;
							margin-bottom: 4px;
						}
						
						.method-desc {
							display: block;
							font-size: 12px;
							color: rgba(255, 255, 255, 0.5);
						}
					}
					
					.method-radio {
						width: 22px;
						height: 22px;
						border-radius: 50%;
						background: linear-gradient(45deg, #667eea, #764ba2);
						color: #fff;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 12px;
						font-weight: bold;
						flex-shrink: 0;
					}
				}
			}
			
			.payment-actions {
				.total-price {
					text-align: center;
					margin-bottom: 15px;
					
					text {
						font-size: 20px;
						font-weight: bold;
						color: #667eea;
					}
				}
				
				.pay-btn {
					width: 100%;
					height: 48px;
					background: linear-gradient(45deg, #667eea, #764ba2);
					border-radius: 12px;
					display: flex;
					align-items: center;
					justify-content: center;
					color: #fff;
					font-size: 16px;
					font-weight: bold;
					cursor: pointer;
					transition: all 0.3s ease;
					box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
					
					&:hover:not(.disabled) {
						transform: translateY(-2px);
						box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
					}
					
					&.disabled {
						background: rgba(255, 255, 255, 0.1);
						color: rgba(255, 255, 255, 0.3);
						cursor: not-allowed;
						box-shadow: none;
					}
				}
			}
		}
	}
}
</style>
