<template>
	<view class="news-container">
		<!-- 头部 -->
		<view class="news-header">
			<view class="back-btn" @click="goBack">
				<view class="back-icon"></view>
			</view>
			<text class="header-title">全球新闻</text>
			<view class="refresh-btn" @click="refreshNews">
				<view class="refresh-icon" :class="{ 'rotating': isRefreshing }"></view>
			</view>
		</view>

		<!-- 分类标签 -->
		<view class="category-tabs">
			<view 
				v-for="(cat, index) in categories" 
				:key="index"
				class="category-tab"
				:class="{ active: activeCategory === cat.value }"
				@click="switchCategory(cat.value)"
			>
				<text class="tab-icon">{{ cat.icon }}</text>
				<text class="tab-text">{{ cat.label }}</text>
			</view>
		</view>

		<!-- 新闻列表 -->
		<view class="news-content">
			<view v-if="isLoading" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<view v-else-if="newsList.length === 0" class="empty-container">
				<text class="empty-icon">📰</text>
				<text class="empty-text">暂无新闻</text>
			</view>

			<view v-else class="news-list">
				<view 
					v-for="(item, index) in newsList" 
					:key="index"
					class="news-item"
					@click="openNewsLink(item.link)"
				>
					<view class="news-item-header">
						<view class="news-category-badge" :class="getCategoryClass(item.category)">
							{{ getCategoryLabel(item.category) }}
						</view>
						<text class="news-source">{{ item.source }}</text>
					</view>
					
					<view class="news-content-wrapper">
						<view class="news-text-content">
							<text class="news-title">{{ item.title }}</text>
							<text v-if="item.summary" class="news-summary">{{ item.summary }}</text>
							<view class="news-item-footer">
								<text class="news-time">{{ formatTime(item.time) }}</text>
								<view class="news-arrow"></view>
							</view>
						</view>
						<!-- #ifdef H5 -->
						<img 
							v-if="item.image"
							:src="item.image" 
							class="news-image"
							@error="(e) => handleImageError(e, item)"
						/>
						<!-- #endif -->
						<!-- #ifndef H5 -->
						<image 
							v-if="item.image"
							:src="item.image" 
							class="news-image"
							mode="aspectFill"
							:lazy-load="true"
							@error="(e) => handleImageError(e, item)"
						/>
						<!-- #endif -->
						<view v-if="!item.image" class="news-image news-image-placeholder">
							<text class="placeholder-text">📰</text>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import API_URL from '@/utils/api';
import { getTokenValue } from '@/utils/auth';

// 占位图路径
import placeholderBilibili from '@/static/news-placeholder-bilibili.svg';
import placeholderWeibo from '@/static/news-placeholder-weibo.svg';
import placeholderZhihu from '@/static/news-placeholder-zhihu.svg';
import placeholderIthome from '@/static/news-placeholder-ithome.svg';
import placeholderTechcrunch from '@/static/news-placeholder-techcrunch.svg';
import placeholderDefault from '@/static/news-placeholder-default.svg';

// 分类配置
const categories = ref([
	{ label: '全部', value: 'all', icon: '🌐' },
	{ label: '科技生活', value: '科技生活', icon: '�' },
	{ label: '社交热点', value: '社交热点', icon: '🔥' },
	{ label: '行业动态', value: '行业动态', icon: '�' },
	{ label: '全球热点', value: '全球热点', icon: '🌍' }
]);

// 当前选中的分类
const activeCategory = ref('all');

// 新闻列表
const newsList = ref([]);

// 加载状态
const isLoading = ref(false);
const isRefreshing = ref(false);

// 获取新闻数据
const fetchNews = async () => {
	isLoading.value = true;
	
	try {
		const response = await new Promise((resolve, reject) => {
			uni.request({
				url: API_URL.getHotNews,
				method: 'GET',
				header: {
					'Authorization': getTokenValue()
				},
				data: {
					category: activeCategory.value,
					limit: 50
				},
				success: (res) => {
					if (res.data.code === 200 && res.data.data) {
						resolve(res.data.data);
					} else {
						reject(new Error(res.data.message || '获取新闻失败'));
					}
				},
				fail: (err) => {
					reject(err);
				}
			});
		});

		// 处理新闻数据
		if (response.categories && response.categories.length > 0) {
			const allNews = [];
			response.categories.forEach(cat => {
				if (cat.items && cat.items.length > 0) {
					allNews.push(...cat.items);
				}
			});
			newsList.value = allNews;
		} else {
			newsList.value = [];
		}
	} catch (error) {
		console.error('获取新闻失败:', error);
		uni.showToast({
			title: '获取新闻失败',
			icon: 'none'
		});
		newsList.value = [];
	} finally {
		isLoading.value = false;
		isRefreshing.value = false;
	}
};

// 切换分类
const switchCategory = (category) => {
	if (activeCategory.value === category) return;
	activeCategory.value = category;
	fetchNews();
};

// 刷新新闻
const refreshNews = () => {
	if (isRefreshing.value) return;
	isRefreshing.value = true;
	fetchNews();
};

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

// 打开新闻链接
const openNewsLink = (link) => {
	if (!link) {
		uni.showToast({
			title: '暂无链接',
			icon: 'none'
		});
		return;
	}

	// #ifdef H5
	window.open(link, '_blank');
	// #endif

	// #ifdef MP-WEIXIN
	uni.showToast({
		title: '请在浏览器中打开',
		icon: 'none'
	});
	// #endif

	// #ifdef APP-PLUS
	plus.runtime.openURL(link);
	// #endif
};

// 获取分类样式类名
const getCategoryClass = (category) => {
	const classMap = {
		'科技生活': 'category-tech-life',
		'社交热点': 'category-social',
		'行业动态': 'category-industry',
		'全球热点': 'category-global'
	};
	return classMap[category] || 'category-default';
};

// 获取分类标签
const getCategoryLabel = (category) => {
	// 直接返回分类名称，因为后端已经是中文了
	return category || '其他';
};

// 处理图片加载错误 - 根据来源使用不同占位符
const handleImageError = (e, item) => {
	if (!e.target) return;
	
	const source = (item?.source || '').toLowerCase();
	let placeholder = placeholderDefault;
	
	if (source.includes('哔哩哔哩') || source.includes('bilibili') || source.includes('b站')) {
		placeholder = placeholderBilibili;
	} else if (source.includes('微博热搜')) {
		placeholder = placeholderWeibo;
	} else if (source.includes('知乎') || source.includes('zhihu')) {
		placeholder = placeholderZhihu;
	} else if (source.includes('it之家') || source.includes('ithome')) {
		placeholder = placeholderIthome;
	} else if (source.includes('TechCrunch')) {
		placeholder = placeholderTechcrunch;
	}
	
	e.target.src = placeholder;
	e.target.style.objectFit = 'contain';
};

// 格式化时间
const formatTime = (timeStr) => {
	if (!timeStr) return '';
	
	try {
		const date = new Date(timeStr);
		const now = new Date();
		const diff = now - date;
		
		// 小于1小时
		if (diff < 3600000) {
			const minutes = Math.floor(diff / 60000);
			return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
		}
		
		// 小于24小时
		if (diff < 86400000) {
			const hours = Math.floor(diff / 3600000);
			return `${hours}小时前`;
		}
		
		// 小于7天
		if (diff < 604800000) {
			const days = Math.floor(diff / 86400000);
			return `${days}天前`;
		}
		
		// 显示日期
		return timeStr.split(' ')[0];
	} catch (error) {
		return timeStr;
	}
};

// 页面加载
onMounted(() => {
	fetchNews();
});
</script>

<style lang="scss" scoped>
.news-container {
	min-height: 100vh;
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
			radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%);
		pointer-events: none;
	}
}

/* 头部样式 */
.news-header {
	height: 60px;
	background: rgba(0, 0, 0, 0.9);
	backdrop-filter: blur(20px);
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 20px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	position: sticky;
	top: 0;
	z-index: 100;
	
	.back-btn, .refresh-btn {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.3s ease;
		
		&:hover {
			background: rgba(255, 255, 255, 0.1);
		}
	}
	
	.back-icon {
		width: 12px;
		height: 12px;
		border-left: 2px solid #ffffff;
		border-bottom: 2px solid #ffffff;
		transform: rotate(45deg);
	}
	
	.refresh-icon {
		width: 20px;
		height: 20px;
		border: 2px solid #ffffff;
		border-top-color: transparent;
		border-radius: 50%;
		transition: transform 0.3s ease;
		
		&.rotating {
			animation: rotate 1s linear infinite;
		}
	}
	
	.header-title {
		font-size: 18px;
		font-weight: 600;
		color: #ffffff;
	}
}

@keyframes rotate {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

/* 分类标签 */
.category-tabs {
	display: flex;
	padding: 15px 20px;
	gap: 10px;
	overflow-x: auto;
	background: rgba(0, 0, 0, 0.8);
	backdrop-filter: blur(10px);
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	position: sticky;
	top: 60px;
	z-index: 99;
	
	&::-webkit-scrollbar {
		display: none;
	}
	
	.category-tab {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 16px;
		border-radius: 20px;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		cursor: pointer;
		transition: all 0.3s ease;
		white-space: nowrap;
		flex-shrink: 0;
		
		&:hover {
			background: rgba(255, 255, 255, 0.1);
		}
		
		&.active {
			background: linear-gradient(135deg, #667eea, #764ba2);
			border-color: transparent;
			box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
			
			.tab-text {
				color: #ffffff;
				font-weight: 600;
			}
		}
		
		.tab-icon {
			font-size: 16px;
		}
		
		.tab-text {
			font-size: 14px;
			color: rgba(255, 255, 255, 0.8);
		}
	}
}

/* 新闻内容区 */
.news-content {
	padding: 20px;
	position: relative;
	z-index: 1;
}

/* 加载状态 */
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 20px;
	
	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(255, 255, 255, 0.1);
		border-top-color: #667eea;
		border-radius: 50%;
		animation: rotate 1s linear infinite;
		margin-bottom: 15px;
	}
	
	.loading-text {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.6);
	}
}

/* 空状态 */
.empty-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 60px 20px;
	
	.empty-icon {
		font-size: 48px;
		margin-bottom: 15px;
	}
	
	.empty-text {
		font-size: 14px;
		color: rgba(255, 255, 255, 0.6);
	}
}

/* 新闻列表 */
.news-list {
	display: flex;
	flex-direction: column;
	gap: 15px;
	
	.news-item {
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(20px);
		border-radius: 16px;
		padding: 20px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		cursor: pointer;
		transition: all 0.3s ease;
		
		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
			background: rgba(255, 255, 255, 0.05);
		}
		
		.news-item-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 12px;
			
			.news-category-badge {
				padding: 4px 12px;
				border-radius: 12px;
				font-size: 12px;
				font-weight: 600;
				
				&.category-tech-life {
					background: linear-gradient(135deg, #11998e, #38ef7d);
					color: #fff;
				}
				
				&.category-social {
					background: linear-gradient(135deg, #FF416C, #FF4B2B);
					color: #fff;
				}
				
				&.category-industry {
					background: linear-gradient(135deg, #667eea, #764ba2);
					color: #fff;
				}
				
				&.category-global {
					background: linear-gradient(135deg, #FFD700, #FFA500);
					color: #000;
				}
				
				&.category-default {
					background: rgba(255, 255, 255, 0.1);
					color: #fff;
				}
			}
			
			.news-source {
				font-size: 12px;
				color: rgba(255, 255, 255, 0.5);
			}
		}
		
		.news-content-wrapper {
			display: flex;
			gap: 15px;
			align-items: flex-start;
		}
		
		.news-text-content {
			flex: 1;
			min-width: 0;
		}
		
		.news-title {
			font-size: 16px;
			font-weight: 500;
			color: #ffffff;
			line-height: 1.5;
			margin-bottom: 8px;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}
		
		.news-summary {
			font-size: 13px;
			color: rgba(255, 255, 255, 0.6);
			line-height: 1.6;
			margin-bottom: 12px;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}
		
		.news-image {
			width: 120px;
			height: 90px;
			border-radius: 12px;
			object-fit: cover;
			flex-shrink: 0;
			background: rgba(255, 255, 255, 0.05);
		}
		
		.news-image-placeholder {
			display: flex;
			align-items: center;
			justify-content: center;
			background: rgba(102, 126, 234, 0.2);
			
			.placeholder-text {
				font-size: 32px;
				opacity: 0.6;
			}
		}
		
		.news-item-footer {
			display: flex;
			align-items: center;
			justify-content: space-between;
			
			.news-time {
				font-size: 12px;
				color: rgba(255, 255, 255, 0.5);
			}
			
			.news-arrow {
				width: 16px;
				height: 16px;
				border-top: 2px solid rgba(255, 255, 255, 0.5);
				border-right: 2px solid rgba(255, 255, 255, 0.5);
				transform: rotate(45deg);
			}
		}
	}
}

/* 响应式设计 */
@media (max-width: 768px) {
	.news-header {
		padding: 0 15px;
		overflow: hidden;
		box-sizing: border-box;
		width: 100%;
		
		.header-title {
			font-size: 15px;
			flex: 1;
			min-width: 0;
			text-align: center;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		
		.back-btn, .refresh-btn {
			width: 36px;
			height: 36px;
			flex-shrink: 0;
		}
	}
	
	.category-tabs {
		padding: 10px 12px;
		gap: 6px;
		
		.category-tab {
			padding: 5px 10px;
			gap: 4px;
			
			.tab-icon {
				display: none;
			}
			
			.tab-text {
				font-size: 12px;
			}
		}
	}
	
	.news-content {
		padding: 15px;
	}
	
	.news-list {
		gap: 12px;
		
		.news-item {
			padding: 15px;
			
			.news-content-wrapper {
				gap: 12px;
			}
			
			.news-title {
				font-size: 15px;
			}
			
			.news-image {
				width: 100px;
				height: 75px;
			}
			
			.news-image-placeholder {
				width: 100px;
				height: 75px;
				
				.placeholder-text {
					font-size: 24px;
				}
			}
		}
	}
}
</style>
