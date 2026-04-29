<template>
	<view class="tools-container">
		<view class="tools-header">
			<view class="back-button" @click="backToHome">
				<text class="back-icon">←</text>
				<text class="back-text">返回</text>
			</view>
			<view class="header-content">
				<text class="tools-title">AI工具集合</text>
				<text class="tools-subtitle">探索前沿AI工具，涵盖写作、图像、音视频、办公、编程等完整生态</text>
			</view>
		</view>
		
		<view class="tools-content">
			<view class="tools-layout">
				<view class="tools-sidebar">
					<view
						class="sidebar-item"
						v-for="item in sectionNav"
						:key="item.id"
						@click="scrollToSection(item.id)"
					>
						<text class="sidebar-dot"></text>
						<text class="sidebar-text">{{ item.name }}</text>
					</view>
				</view>
				
				<view class="tools-main">
			<view class="search-container">
				<view class="search-box">
					<view class="search-icon"></view>
					<input 
						class="search-input" 
						type="text" 
						v-model="searchKeyword" 
						placeholder="搜索工具名称..." 
						@input="handleSearch"
						@focus="handleSearchFocus"
					/>
					<view class="search-clear" v-if="searchKeyword" @click="clearSearch">
						<text>×</text>
					</view>
				</view>
				<view class="search-results" v-if="searchKeyword && searchResults.length > 0">
					<view 
						class="search-result-item"
						v-for="(result, index) in searchResults"
						:key="index"
						@click="navigateToTool(result)"
					>
						<text class="result-name">{{ result.name }}</text>
						<text class="result-category">{{ result.category }}</text>
					</view>
				</view>
				<view class="search-no-results" v-if="searchKeyword && searchResults.length === 0">
					<text>未找到相关工具</text>
				</view>
			</view>
			
			<view class="category-intro">
				<text class="intro-highlight">精选 {{ categorizedTools.length + 3 }} 大分类 · 覆盖 200+ AI 工具</text>
				<text class="intro-desc">点击任意工具即可打开官网，快速体验</text>
			</view>
			
			<view class="writing-section" id="section-writing">
				<view class="writing-header">
					<text class="writing-title">AI写作工具</text>
					<text class="writing-subtitle">支持论文、小说、文案等多场景创作</text>
				</view>
				
				<view class="writing-grid">
					<view 
						class="writing-card"
						:class="{ 'highlighted': isToolHighlighted('writing', index, tool.name) }"
						v-for="(tool, index) in writingTools"
						:key="index"
						:id="`tool-writing-${index}`"
						@click="openTool(tool)"
					>
						<view class="writing-info">
							<image class="writing-logo" :src="tool.logo" mode="aspectFit" />
							<view class="writing-text">
								<text class="writing-name">{{ tool.name }}</text>
								<text class="writing-desc" v-if="tool.desc">{{ tool.desc }}</text>
							</view>
						</view>
						<text class="writing-price">{{ tool.price }}</text>
					</view>
				</view>
			</view>
			
			<view class="chat-section" id="section-chat">
				<view class="writing-header">
					<text class="writing-title">AI聊天助手</text>
					<text class="writing-subtitle">多模型中文对话与多语言问答</text>
				</view>
				
				<view class="image-grid">
					<view 
						class="image-card"
						:class="{ 'highlighted': isToolHighlighted('chat', index, tool.name) }"
						v-for="(tool, index) in chatTools"
						:key="index"
						:id="`tool-chat-${index}`"
						@click="openTool(tool)"
					>
						<view class="image-info">
							<image class="writing-logo" :src="tool.logo" mode="aspectFit" />
							<view class="image-text">
								<text class="writing-name">{{ tool.name }}</text>
								<text class="image-desc" v-if="tool.desc">{{ tool.desc }}</text>
							</view>
						</view>
						<text class="image-price">{{ tool.price }}</text>
					</view>
				</view>
			</view>
			
			<view class="image-section" id="section-image">
				<view class="writing-header">
					<text class="writing-title">AI图像工具</text>
					<text class="writing-subtitle">从文生图到修图增强，这里都有</text>
				</view>
				
				<view class="image-grid">
					<view 
						class="image-card"
						:class="{ 'highlighted': isToolHighlighted('image', index, tool.name) }"
						v-for="(tool, index) in imageTools"
						:key="index"
						:id="`tool-image-${index}`"
						@click="openTool(tool)"
					>
						<view class="image-info">
							<image class="writing-logo" :src="tool.logo" mode="aspectFit" />
							<view class="image-text">
								<text class="writing-name">{{ tool.name }}</text>
								<text class="image-desc" v-if="tool.desc">{{ tool.desc }}</text>
							</view>
						</view>
						<text class="image-price">{{ tool.price }}</text>
					</view>
				</view>
			</view>
			
			<view
				class="image-section"
				v-for="(category, catIndex) in categorizedTools"
				:key="catIndex"
				:id="'section-cat-' + catIndex"
			>
				<view class="writing-header">
					<text class="writing-title">{{ category.name }}</text>
					<text class="writing-subtitle">{{ category.tools.length }} 款工具</text>
				</view>
				
				<view class="image-grid">
					<view
						class="image-card"
						:class="{ 'highlighted': isToolHighlighted('cat', catIndex, toolIndex, tool.name) }"
						v-for="(tool, toolIndex) in category.tools"
						:key="toolIndex"
						:id="`tool-cat-${catIndex}-${toolIndex}`"
						@click="openTool(tool)"
					>
						<view class="image-info">
							<image class="writing-logo" :src="tool.icon" mode="aspectFit" />
							<view class="image-text">
								<text class="writing-name">{{ tool.name }}</text>
								<text class="image-desc" v-if="tool.desc">{{ tool.desc }}</text>
							</view>
						</view>
						<text class="image-price" v-if="tool.price">{{ tool.price }}</text>
					</view>
				</view>
			</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';

const writingTools = ref([
	{ name: '讯飞绘文', logo: 'https://ai-bot.cn/wp-content/uploads/2024/08/turbodesk-logo.png', url: 'https://turbodesk.xfyun.cn/?channelid=aitool1', price: '免费', desc: '科大讯飞出品的 AI 写作助手，适合教育、办公等正式文本创作。' },
	{ name: '66AI论文', logo: 'https://ai-bot.cn/wp-content/uploads/2024/08/66aipaper-website.png', url: 'https://www.66paper.cn/AI_A2E1C09', price: '付费', desc: '专注毕业论文与报告写作的智能辅助工具。' },
	{ name: '光速写作', logo: 'https://ai-bot.cn/wp-content/uploads/2024/01/guangsuxie-icon.png', url: 'https://www.guangsuxie.com/static/college-write-web/home?from=AItools', price: '免费+付费', desc: '主打学生论文与课程报告的快速生成与修改。' },
	{ name: '新华妙笔', logo: 'https://ai-bot.cn/wp-content/uploads/2023/12/xinhua-miaobi-icon.png', url: 'https://miaobi.xinhuaskl.com/?channel=shuzhi', price: '付费', desc: '新华社旗下 AI 写作工具，适合新闻、政务等严肃内容。' },
	{ name: '稿定AI文案', logo: 'https://ai-bot.cn/wp-content/uploads/2023/05/gaoding-design-icon.png', url: 'https://www.gaoding.com/utms/cd3cc3a1cb0149d3bfc4a71b5e157098', price: '免费+付费', desc: '适合电商与新媒体的高转化文案生成工具，与设计深度结合。' },
	{ name: '笔灵AI写作', logo: 'https://ai-bot.cn/wp-content/uploads/2023/07/ibiling-icon.png', url: 'https://ibiling.cn/?from=ai-bot', price: '付费', desc: '专注高质量中文内容生成，支持多种文体和长文创作。' },
	{ name: '蛙蛙写作', logo: 'https://ai-bot.cn/wp-content/uploads/2025/07/wawa-logo.png', url: 'https://wawawriter.com/app/?utm_source=ai', price: '免费+付费', desc: '多场景中文写作平台，支持论文、报告、营销文案等一键生成与润色。' },
	{ name: 'Flowith', logo: 'https://ai-bot.cn/wp-content/uploads/2024/04/flowith-icon.png', url: 'https://flowith.net/blank?inv=AIBOTT', price: '免费+付费', desc: '主打灵感激发与结构化写作，适合创作型工作者。' },
	{ name: '笔灵AI小说', logo: 'https://ai-bot.cn/wp-content/uploads/2024/09/biling-novel-logo.png', url: 'https://ibiling.cn/novel-workbench/?from=aibotnovel', price: '付费', desc: '面向作者的 AI 小说创作平台，提供剧情续写与人物设定。' },
	{ name: '笔目鱼', logo: 'https://ai-bot.cn/wp-content/uploads/2025/06/bmysci-logo.png', url: 'https://www.bmysci.com/?channelCode=aibotad', price: '付费', desc: '科研写作与文献管理平台，帮助完成论文撰写与规范排版。' },
	{ name: 'Paperpal', logo: 'https://ai-bot.cn/wp-content/uploads/2024/01/paperpal-icon.png', url: 'https://www.editage.cn/paperpal?utm_source=ai-bot&utm_medium=Banner&utm_campaign=Banner', price: '免费试用+付费', desc: '学术论文写作与润色助手，支持英文科研写作与语法优化。' },
	{ name: '稿易AI论文', logo: 'https://ai-bot.cn/wp-content/uploads/2025/01/gaoyiai-logo.png', url: 'https://gaoyiai.com', price: '免费+付费', desc: '面向学生与科研人员的论文写作与降重工具。' },
	{ name: '墨问', logo: 'https://ai-bot.cn/wp-content/uploads/2025/09/mowen-logo.png', url: 'https://mowen.cn/?utm_source=ai-bot.cn', price: '免费+付费', desc: '专注内容创作的 AI 助手，支持多角色和多风格输出。' },
	{ name: '千笔AI论文', logo: 'https://ai-bot.cn/wp-content/uploads/2024/01/aipaperpass-icon.png', url: 'https://www.qianbixiezuo.com/?pic=g5DP', price: '付费', desc: '集选题、写作、修改为一体的论文写作平台。' },
	{ name: '茅茅虫', logo: 'https://ai-bot.cn/wp-content/uploads/2024/01/mymmc-ai-logo.png', url: 'https://mymmc.cn/?fromId=954f8p78', price: '免费+付费', desc: '支持报告、公文、方案等多类型文本的一站式写作工具。' },
	{ name: '维普科创助手', logo: 'https://ai-bot.cn/wp-content/uploads/2025/08/cqvip-icon.png', url: 'https://super.cqvip.com/?invite=aibot', price: '付费', desc: '维普出品的科研写作助手，支持选题、综述与写作规范建议。' },
	{ name: '沁言学术', logo: 'https://ai-bot.cn/wp-content/uploads/2025/07/qinyanai-logo-1.png', url: 'https://www.qinyanai.com/?utm_source=ai-bot.cn', price: '付费', desc: '面向高校与研究机构的学术写作与润色平台。' },
	{ name: 'GetDraft', logo: 'https://ai-bot.cn/wp-content/uploads/2025/11/GetDraft-logo1.png', url: 'https://getdraft.ai/?utm_source=ai-bot.cn', price: '付费', desc: '英文写作生产力工具，适合博客、邮件和长文创作。' },
	{ name: 'YouMind', logo: 'https://ai-bot.cn/wp-content/uploads/2025/08/YouMind-logo.png', url: 'https://youmind.com/invite/84LX6W', price: '免费+付费', desc: '集对话、写作和知识管理于一体的 AI 助手。' },
	{ name: '万能小in', logo: 'https://ai-bot.cn/wp-content/uploads/2025/05/xiaoin-logo-1.png', url: 'https://xiaoin.com.cn/home/index?sharerUserId=1815301629231030274', price: '免费+付费', desc: '日常问答与写作辅助工具，适合学习与办公场景。' },
	{ name: 'FeelFish', logo: 'https://cdn.feelfish.com/static/icon-fill.png', url: 'https://www.feelfish.com/?fr=aibot', price: '付费', desc: '内容创作与项目协作平台，适合团队使用。' },
	{ name: '落笔AI写作', logo: 'https://ai-bot.cn/wp-content/uploads/2025/11/luobi-icon.png', url: 'https://luobi.net/?utm_source=ai-bot.cn', price: '付费', desc: '偏向文案与营销内容的中文写作平台。' },
	{ name: 'Rubriq', logo: 'https://ai-bot.cn/wp-content/uploads/2025/10/rubriq-icon-1.png', url: 'https://rubriq.cn/?utm_source=ai&utm_medium=ai-bot&utm_campaign=2025rubriq_cn', price: '免费试用+付费', desc: '为论文和学术报告提供结构化写作与评审建议。' },
	{ name: 'Loomi', logo: 'https://ai-bot.cn/wp-content/uploads/2025/11/Loomi-logo.png', url: 'https://loomi.live/?utm_source=ai-bot.cn', price: '付费', desc: '主打实时协作与多模态内容创作的写作助手。' },
	{ name: '量子探险', logo: 'https://ai-bot.cn/wp-content/uploads/2025/10/yfbudong-icon-1.png', url: 'https://www.yfbudong.com/?utm_source=ai-bot.cn', price: '免费+付费', desc: '结合学习与写作的 AI 工具，适合学生与内容创作者。' },
	{ name: '小鱼AI写作', logo: 'https://ai-bot.cn/wp-content/uploads/2024/09/xiaoyuAI-logo.png', url: 'https://www.xiaoyuxiezuo.com/AI_A2E1C09', price: '免费+付费', desc: '专门面向毕业论文和学术写作的 AI 工具。' },
	{ name: '创一AI', logo: 'https://ai-bot.cn/wp-content/uploads/2025/05/creatifyone-logo.png', url: 'https://www.creatifyone.com/?utm_source=ai-bot.cn', price: '付费', desc: '面向品牌和营销团队的创意内容生成平台。' },
	{ name: 'ReadPo', logo: 'https://ai-bot.cn/wp-content/uploads/2024/12/ReadPo-logo.png', url: 'https://readpo.com/zh', price: '免费+付费', desc: '聚焦阅读理解与摘要生成的阅读写作助手。' },
	{ name: 'QuillBot', logo: 'https://ai-bot.cn/wp-content/uploads/2023/03/quillbot-icon.png', url: 'https://try.quillbot.com/6eqrqpoysmlh', price: '免费+付费', desc: '知名英文改写与润色工具，适合学术与日常写作。' },
	{ name: 'Muset', logo: 'https://ai-bot.cn/wp-content/uploads/2025/09/Muset-logo.png', url: 'https://muset.ai/?s=aibot', price: '付费', desc: '以灵感和故事为核心的创作助手，适合小说与剧本写作。' }
]);

const imageTools = ref([
	{ name: '即梦', logo: 'https://ai-bot.cn/wp-content/uploads/2024/10/jimeng-logo-1.png', url: 'https://dis.csqixiang.cn/unpo/jimeng_1.html', price: '免费', desc: '国风 AI 绘画平台，支持多风格文生图。' },
	{ name: '堆友AI反应堆', logo: 'https://ai-bot.cn/wp-content/uploads/2023/07/d-design-ai-icon.png', url: 'https://d.design/ai/generate?from=ab1', price: '免费', desc: '腾讯堆友推出的一站式 AI 设计与生成平台。' },
	{ name: '绘蛙', logo: 'https://ai-bot.cn/wp-content/uploads/2024/03/ihuiwa-icon.png', url: 'https://ihuiwa.paluai.com/aibot', price: '免费', desc: '国内热门 AI 绘图工具，支持插画、二次元等多种风格。' },
	{ name: '光子AI', logo: 'https://ai-bot.cn/wp-content/uploads/2025/07/photonaiclub-icon.png', url: 'https://flowith.net/blank?inv=AIBOTT', price: '免费+付费', desc: '集成多模型的 AI 图像生成与优化平台。' },
	{ name: '稿定AI', logo: 'https://ai-bot.cn/wp-content/uploads/2023/05/gaoding-design-icon.png', url: 'https://www.gaoding.com/utms/68f2b6d26cdb4048adf21904798c7229', price: '免费', desc: '面向电商与自媒体的在线设计和智能生成工具。' },
	{ name: '阿贝智能', logo: 'https://ai-bot.cn/wp-content/uploads/2024/08/abeiai-logo.jpg', url: 'https://abeiai.com/?r=133', price: '免费+付费', desc: '提供 AI 设计、图像生成与模板资源的一站式平台。' },
	{ name: 'LiblibAI·哩布哩布AI', logo: 'https://ai-bot.cn/wp-content/uploads/2025/10/liblib.art-logo.png', url: 'https://www.liblib.art/video-effect?sourceid=004810', price: '免费+付费', desc: '创意素材与 AI 生成相结合的图像与视频平台。' },
	{ name: 'Midjourney', logo: 'https://ai-bot.cn/wp-content/uploads/2023/03/midjourney-icon.png', url: 'https://www.midjourney.com/home', price: '付费', desc: '知名 AI 绘画工具，支持高质量艺术风格图像生成。' },
	{ name: 'Stable Diffusion', logo: 'https://ai-bot.cn/wp-content/uploads/2023/03/stability-ai-icon.png', url: 'https://ai-bot.cn/sites/123.html', price: '免费+付费', desc: '开源 AI 图像生成模型生态，支持本地和云端部署。' },
	{ name: 'Civitai', logo: 'https://ai-bot.cn/wp-content/uploads/2023/05/civitai-icon.png', url: 'https://civitai.com', price: '免费', desc: 'Stable Diffusion 模型与素材社区，海量风格可选。' },
	{ name: '吐司AI', logo: 'https://ai-bot.cn/wp-content/uploads/2024/07/tusiart-logo.png', url: 'https://www.liblib.art/?sourceId=002141&keywordid=69354943189&planid=4005672077&groupid=2667356171&creativeid=8791670495&qhclickid=f3176f063bee9d56', price: '免费+付费', desc: '面向普通用户的 AI 绘画平台，支持图生图与写实风格。' },
	{ name: '造点AI', logo: 'https://ai-bot.cn/wp-content/uploads/2025/09/zaodian-logo.png', url: 'https://www.zaodian.com/?utm_source=ai-bot.cn', price: '免费+付费', desc: '适合品牌与电商的智能视觉素材生成工具。' },
	{ name: 'RunningHub', logo: 'https://ai-bot.cn/wp-content/uploads/2025/07/RunningHub-logo1.png', url: 'https://www.runninghub.cn/?utm_source=ai-bot.cn', price: '免费+付费', desc: '提供多种 AI 模型的图像生成和创意工作台。' },
	{ name: '通义万相', logo: 'https://ai-bot.cn/wp-content/uploads/2025/09/tongyi-icon.png', url: 'https://tongyi.aliyun.com/wanxiang/?utm_source=ai-bot.cn', price: '免费', desc: '阿里通义家族的图像生成平台，支持多行业场景。' },
	{ name: '可灵AI', logo: 'https://ai-bot.cn/wp-content/uploads/2025/03/klingai-logo.png', url: 'https://app.klingai.com/cn/?utm_source=ai-bot.cn', price: '免费+付费', desc: '字节系多模态平台，可生成图片和视频内容。' },
	{ name: 'insMind', logo: 'https://ai-bot.cn/wp-content/uploads/2025/08/insMind-logo.png', url: 'https://www.insmind.com/?utm_source=ai-bot.cn', price: '免费', desc: '适合社交媒体与电商的智能修图与设计工具。' },
	{ name: 'AI改图神器', logo: 'https://ai-bot.cn/wp-content/uploads/2025/09/aidesigntools-logo.png', url: 'https://img.logosc.cn/?utm_source=ai-bot.cn', price: '免费+付费', desc: '提供抠图、消除、换背景等多种一键图像处理能力。' },
	{ name: '炉米Lumi', logo: 'https://ai-bot.cn/wp-content/uploads/2024/11/lumi-logo.png', url: 'https://ai-bot.cn/lumi/', price: '免费', desc: '轻量级 AI 画图工具，适合快速生成灵感草图。' },
	{ name: 'Krea AI', logo: 'https://ai-bot.cn/wp-content/uploads/2023/12/krea-ai-icon.png', url: 'https://www.krea.ai/?ref=ai-bot.cn', price: '免费+付费', desc: '实时预览的 AI 绘画与设计工具，适合创意工作者。' },
	{ name: 'Kira', logo: 'https://ai-bot.cn/wp-content/uploads/2025/07/Kira-icon.png', url: 'https://kira.art/?utm_source=ai-bot.cn', price: '免费+付费', desc: '面向插画与概念设计的 AI 绘画平台。' },
	{ name: 'Photoroom', logo: 'https://ai-bot.cn/wp-content/uploads/2024/08/Photoroom-logo.png', url: 'https://www.photoroom.com/zh?utm_source=ai-bot.cn', price: '免费+付费', desc: '主打商品图与人像抠图的在线图片编辑工具。' },
	{ name: 'Ribbet.ai', logo: 'https://ai-bot.cn/wp-content/uploads/2023/03/ribbet-ai-icon.png', url: 'https://ribbet.ai', price: '免费', desc: '适合入门用户的在线图片编辑与 AI 滤镜工具。' },
	{ name: '万相营造', logo: 'https://ai-bot.cn/wp-content/uploads/2024/11/wanxiangyingzao-logo.png', url: 'https://agi.taobao.com/?utm_source=ai-bot.cn', price: '免费', desc: '电商场景下的智能视觉生成与装修效果图平台。' },
	{ name: '悟空图像PhotoSir', logo: 'https://ai-bot.cn/wp-content/uploads/2023/04/photosir-icon.png', url: 'https://www.photosir.com/?ref=ai-bot.cn', price: '免费+付费', desc: '提供批量修图、抠图与设计模板的在线平台。' },
	{ name: '360智图', logo: 'https://ai-bot.cn/wp-content/uploads/2023/08/chacha-so-icon.png', url: 'https://chacha.so.com/home?utm_source=ai-bot.cn', price: '免费', desc: '360 出品的在线抠图与图片处理工具。' },
	{ name: '像素蛋糕', logo: 'https://ai-bot.cn/wp-content/uploads/2024/08/pixcakea-logo.png', url: 'https://www.pixcakeai.com/?utm_source=ai-bot.cn', price: '付费', desc: '专注照片风格化与艺术效果的 AI 图像服务。' },
	{ name: '如果相机', logo: 'https://ifshot.com/images/logo.png', url: 'https://ifshot.com/?utm_source=ai-bot.cn', price: '免费+付费', desc: '结合相机与云端 AI 的图像创作工具。' },
	{ name: 'remove.bg', logo: 'https://ai-bot.cn/wp-content/uploads/2023/03/remove-bg-icon.png', url: 'https://www.remove.bg/zh?aid=kkgjrdhppgtrhbyn&utm_campaign=affiliate+marketing&utm_medium=referral&utm_source=affiliate', price: '免费+付费', desc: '经典在线抠图工具，一键去除图片背景。' },
	{ name: 'ARC', logo: 'https://ai-bot.cn/wp-content/uploads/2023/03/tencent-arc-icon.png', url: 'https://arc.tencent.com/zh/ai-demos', price: '免费', desc: '腾讯 ARC 实验室的 AI 图像增强与修复展示平台。' },
	{ name: 'Cutout.Pro', logo: 'https://ai-bot.cn/wp-content/uploads/2023/03/cutout-pro-icon.png', url: 'https://www.cutout.pro', price: '免费+付费', desc: '提供抠图、修复、动漫化等多种 AI 图像功能。' },
	{ name: '堆友AI高清', logo: 'https://ai-bot.cn/wp-content/uploads/2023/07/d-design-ai-icon.png', url: 'https://d.design/toolbox/hd?from=ab13', price: '免费', desc: '图片高清放大与修复工具，适合老照片与素材增强。' },
	{ name: '绘蛙AI高清', logo: 'https://ai-bot.cn/wp-content/uploads/2024/03/ihuiwa-icon.png', url: 'https://www.ihuiwa.com/workspace/partial-redraw?editType=enhance-image&huiwaInviteCode=EMRCAL', price: '免费', desc: '绘蛙旗下的高清修图与增强服务。' },
	{ name: '光子AI高清', logo: 'https://ai-bot.cn/wp-content/uploads/2025/07/photonaiclub-icon.png', url: 'https://www.photonaiclub.com/workspace/imageProcess?invitationType=register&inviterId=7328241868114231444', price: '免费+付费', desc: '主打图片清晰度提升与细节增强的工具。' },
	{ name: '稿定AI变清晰', logo: 'https://ai-bot.cn/wp-content/uploads/2023/05/gaoding-design-icon.png', url: 'https://www.gaoding.com/utms/2a5760f7f0d74446b2c8ef68a34d5bfc', price: '免费', desc: '稿定出品的一键图片高清放大功能。' },
	{ name: 'Facet', logo: 'https://ai-bot.cn/wp-content/uploads/2023/03/facet-ai-icon.png', url: 'https://facet.ai', price: '免费+付费', desc: '面向设计师的 AI 批量修图与风格迁移工具。' },
	{ name: 'Relight', logo: 'https://ai-bot.cn/wp-content/uploads/2023/03/clipdrop-relight-icon-1.png', url: 'https://clipdrop.co/relight', price: '免费+付费', desc: 'Clipdrop 出品的光照重构工具，可调整照片光影效果。' },
	{ name: '一键抠图', logo: 'https://ai-bot.cn/wp-content/uploads/2023/03/yijiankoutu-icon.png', url: 'https://www.yijiankoutu.com', price: '免费', desc: '国产在线抠图工具，适合电商与证件照处理。' },
	{ name: '美图云修', logo: 'https://ai-bot.cn/wp-content/uploads/2025/08/yunxiu.meitu-logo1.png', url: 'https://yunxiu.meitu.com/?utm_source=ai-bot.cn', price: '免费+付费', desc: '美图出品的云端修图与批量处理平台。' },
	{ name: 'Remini', logo: 'https://ai-bot.cn/wp-content/uploads/2023/12/remini-icon.png', url: 'https://remini.ai/?ref=ai-bot.cn', price: '免费+付费', desc: '知名老照片修复与清晰化工具。' },
	{ name: 'jpgHD', logo: 'https://ai-bot.cn/wp-content/uploads/2023/04/jpghd-icon.png', url: 'https://jpghd.com/zh', price: '免费+付费', desc: '专注 JPEG 图片高清放大与压缩优化。' },
	{ name: '像素蛋糕PixCake', logo: 'https://ai-bot.cn/wp-content/uploads/2023/11/pixcakeai-icon.png', url: 'https://www.pixcakeai.com/?ref=ai-bot.cn', price: '付费', desc: 'AI 驱动的照片艺术化和风格迁移工具。' },
	{ name: '咻图AI', logo: 'https://ai-bot.cn/wp-content/uploads/2023/12/xiutu-ai-icon.png', url: 'https://www.aixtsy.com/?ref=ai-bot.cn', price: '付费', desc: '主打商用级图片修复与生成服务的平台。' },
	{ name: 'restorePhotos.io', logo: 'https://ai-bot.cn/wp-content/uploads/2023/03/restorephotos-icon.png', url: 'https://www.restorephotos.io', price: '免费', desc: '老照片修复工具，可在线恢复模糊的人像细节。' },
	{ name: 'PicMa Studio', logo: 'https://ai-bot.cn/wp-content/uploads/2024/08/PicMa-Studio-logo.png', url: 'https://picma.magictiger.ai/zh?utm_source=ai-bot.cn', price: '免费+付费', desc: '多功能 AI 图像工作室，支持修复、上色和风格化。' },
	{ name: 'transpic', logo: 'https://ai-bot.cn/wp-content/uploads/2023/08/transpic-ai-icon.png', url: 'https://transpic.cn/?utm_source=ai-bot.cn', price: '免费', desc: '主打证件照、头像等快速处理的在线工具。' },
	{ name: 'Cutout.Pro老照片上色', logo: 'https://ai-bot.cn/wp-content/uploads/2023/03/cutout-pro-icon.png', url: 'https://www.cutout.pro/zh-CN/photo-colorizer-black-and-white', price: '免费+付费', desc: '为黑白老照片一键上色的专业工具。' },
	{ name: 'Palette', logo: 'https://ai-bot.cn/wp-content/uploads/2023/03/palette-icon.png', url: 'https://palette.fm', price: '免费+付费', desc: '高质量黑白照片上色与风格化服务。' },
	{ name: 'Playground AI', logo: 'https://ai-bot.cn/wp-content/uploads/2023/03/playground-ai-icon.png', url: 'https://playgroundai.com', price: '免费+付费', desc: '面向创意设计的 AI 画图与图像编辑平台。' },
	{ name: '吐司AI高清', logo: 'https://ai-bot.cn/wp-content/uploads/2024/07/tusiart-logo.png', url: 'https://tusiart.com/template/820721890405622530', price: '免费+付费', desc: '吐司 AI 提供的高清修图与模板增强服务。' }
]);

const chatTools = ref([
	{ name: 'Claude', logo: 'https://ai-bot.cn/wp-content/uploads/2023/03/anthropic-icon.png', url: 'https://claude.ai', price: '免费+付费', desc: '长文本处理能力强，适合阅读文档、总结和深度讨论。' },
	{ name: 'DeepSeek', logo: 'https://ai-bot.cn/wp-content/uploads/2023/11/deepseek-chat-icon.png', url: 'https://deepseek.com/?utm_source=ai-bot.cn', price: '免费', desc: '国产开源路线的大模型聊天工具，推理能力突出。' },
	{ name: '豆包', logo: 'https://ai-bot.cn/wp-content/uploads/2023/08/doubao-icon.png', url: 'https://ai-w3cschool.com', price: '免费', desc: '字节系大模型对话助手，支持代码、写作和日常问答。' },
	{ name: 'Gemini', logo: 'https://ai-bot.cn/wp-content/uploads/2024/05/googel-gemini-app-icon.webp', url: 'https://deepmind.google/technologies/gemini', price: '免费', desc: '谷歌多模态模型，支持文本、图片等多种输入形式。' },
	{ name: 'Kimi智能助手', logo: 'https://ai-bot.cn/wp-content/uploads/2024/05/kimi-ai-logo.png', url: 'https://www.kimi.com/?utm_source=ai-bot.cn', price: '免费', desc: '面向长文阅读与网页理解的智能对话助手。' },
	{ name: '千问', logo: 'https://ai-bot.cn/wp-content/uploads/2025/11/tongyi-logo.png', url: 'https://www.tongyi.com/?utm_source=ai-bot.cn', price: '免费', desc: '阿里通义家族通用聊天入口，适合日常问答与创作。' },
	{ name: 'Flowith', logo: 'https://ai-bot.cn/wp-content/uploads/2024/04/flowith-icon.png', url: 'https://flowith.net/?inv=AIBOTT', price: '免费+付费', desc: '多模型对话与工作流平台，支持知识库问答与自动化任务。' },
	{ name: '讯飞星火', logo: 'https://ai-bot.cn/wp-content/uploads/2024/01/xunfei-xinghuo-logo.png', url: 'https://xinghuo.xfyun.cn/desk?ch=xh_36dgz', price: '免费', desc: '科大讯飞出品，偏重教育、办公和多语言对话场景。' },
	{ name: 'ChatGPT', logo: 'https://ai-bot.cn/wp-content/uploads/2025/07/Chatgpt-logo.png', url: 'https://chatgpt.com', price: '免费+付费', desc: '通用型对话与创作助手，支持代码、写作、分析等多种场景。' },
	{ name: '腾讯元宝', logo: 'https://ai-bot.cn/wp-content/uploads/2024/05/tencent-yuanbao-icon.png', url: 'https://txyuanbao.chatdesks.cn', price: '免费', desc: '腾讯推出的中文大模型助手，适合日常办公与学习。' },
	{ name: '逗逗AI', logo: 'https://ai-bot.cn/wp-content/uploads/2024/12/doudou-logo.png', url: 'https://doudou.paluai.com/web_aitool', price: '免费', desc: '偏向娱乐和轻量创作体验的对话助手。' },
	{ name: 'Grok', logo: 'https://ai-bot.cn/wp-content/uploads/2023/11/xai-icon.png', url: 'https://grok.com', price: '付费', desc: 'X AI 推出的聊天助手，风格轻松，接入实时互联网内容。' },
	{ name: 'Z.ai', logo: 'https://ai-bot.cn/wp-content/uploads/2025/09/Z.ai-logo.png', url: 'https://z.ai/?utm_source=ai-bot.cn', price: '免费', desc: '主打多领域综合对话体验的新一代聊天助手。' },
	{ name: 'Qwen Chat', logo: 'https://ai-bot.cn/wp-content/uploads/2024/04/tongyi-icon.png', url: 'https://www.qianwen.com/?code=nckasud4n6', price: '免费', desc: '通义千问官方 Web 端聊天入口，支持多语言和工具调用。' },
	{ name: 'MiniMax', logo: 'https://ai-bot.cn/wp-content/uploads/2025/03/MiniMax-logo.png', url: 'https://chat.minimaxi.com/?utm_source=ai-bot.cn', price: '免费', desc: '国内多模态模型服务商，支持图片理解与文本对话。' },
	{ name: 'LongCat', logo: 'https://ai-bot.cn/wp-content/uploads/2025/09/LongCat-icon.png', url: 'https://longcat.chat/?utm_source=ai-bot.cn', price: '免费', desc: '针对长上下文对话优化的聊天助手。' },
	{ name: '文心一言', logo: 'https://ai-bot.cn/wp-content/uploads/2023/03/baidu-yiyan-icon.png', url: 'https://yiyan.baidu.com/?utm_source=ai-bot.cn', price: '免费', desc: '百度文心大模型对话产品，适合搜索、办公与创作。' },
	{ name: '智谱清言', logo: 'https://ai-bot.cn/wp-content/uploads/2023/08/zhipu-ai-chatglm-icon.png', url: 'https://chatglm.cn/?utm_source=ai-bot.cn', price: '免费', desc: '基于 ChatGLM 系列模型的中文对话助手。' },
	{ name: '华为小艺', logo: 'https://ai-bot.cn/wp-content/uploads/2025/02/xiaoyi-huawei-logo.png', url: 'https://consumer.huawei.com/cn/mobileservices/celia/', price: '免费', desc: '华为生态里的智能助手，支持手机与终端深度联动。' },
	{ name: '问小白', logo: 'https://ai-bot.cn/wp-content/uploads/2025/04/wenxiaobai-logo-2.png', url: 'https://www.wenxiaobai.com/?utm_source=ai-bot.cn', price: '免费', desc: '主打学习与职场问答的新一代 AI 问答助手。' },
	{ name: '百灵大模型', logo: 'https://ai-bot.cn/wp-content/uploads/2025/10/ling-chat-icon.png', url: 'https://ling.tbox.cn/chat?utm_source=ai-bot.cn', price: '免费', desc: '面向企业与个人用户的中文通用对话工具。' },
	{ name: '书生大模型', logo: 'https://ai-bot.cn/wp-content/uploads/2025/06/shusheng-logo.png', url: 'https://intern-ai.org.cn/home', price: '免费', desc: '偏向科研与教育领域的国产大模型聊天入口。' },
	{ name: '阶跃AI', logo: 'https://ai-bot.cn/wp-content/uploads/2024/03/stepchat-icon.png', url: 'https://yuewen.cn/chats/new?utm_source=ai-bot.cn', price: '免费', desc: '支持角色设定和长会话的中文对话助手。' },
	{ name: '百小应', logo: 'https://ai-bot.cn/wp-content/uploads/2024/05/ying-ai-icon.png', url: 'https://ying.baichuan-ai.com/chat?from=ai-bot.cn', price: '免费', desc: '百川大模型官方对话入口，适合编程与问答。' },
	{ name: '天工AI', logo: 'https://ai-bot.cn/wp-content/uploads/2023/08/tiangong-ai-search-icon.png', url: 'https://www.tiangong.cn/?utm_source=ai-bot.cn', price: '免费', desc: '昆仑万维旗下多模态大模型产品，支持搜索与聊天。' },
	{ name: '商量SenseChat', logo: 'https://ai-bot.cn/wp-content/uploads/2024/04/sensechat-new-icon.png', url: 'https://chat.sensetime.com/wb/home?utm_source=ai-bot.cn', price: '免费', desc: '商汤科技推出的中文对话助手，适合办公与学习场景。' },
	{ name: 'Me.bot', logo: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/ae/39/fa/ae39fa8f-aa28-f211-8aa5-40fdd111feda/AppIcon-0-0-1x_U007ephone-0-85-220.png/460x0w.webp', url: 'https://www.me.bot/?utm_source=ai-bot.cn', price: '免费+付费', desc: '更偏个人助理定位的聊天应用，支持移动端体验。' },
	{ name: 'Saylo', logo: 'https://ai-bot.cn/wp-content/uploads/2024/09/Saylo-logo.png', url: 'https://www.sayloai.com/?utm_source=ai-bot.cn', price: '免费+付费', desc: '主打多人协作与 AI 小组讨论体验的聊天工具。' },
	{ name: 'Poe', logo: 'https://ai-bot.cn/wp-content/uploads/2025/10/Poe-logo.png', url: 'https://poe.com/?utm_source=ai-bot.cn', price: '免费+付费', desc: '聚合多家模型（如 GPT、Claude 等）的统一聊天入口。' },
	{ name: 'Copilot', logo: 'https://ai-bot.cn/wp-content/uploads/2023/11/microsoft-copilot-icon.png', url: 'https://copilot.microsoft.com', price: '免费', desc: '微软生态中的 AI 助手，深度集成 Office 与 Windows。' }
]);

const categorizedTools = ref([
	{
		name: 'AI编程工具',
		accent: '#A18CD1',
		tools: [
			{ name: 'TRAE', icon: 'https://ai-bot.cn/wp-content/uploads/2025/11/TRAE-logo.png', url: 'https://www.trae.cn/?utm_source=advertising&utm_medium=aibot_ug_cpa&utm_term=hw_trae_aibot', price: '免费+付费', desc: '国产 AI 编程工具，支持代码补全与调试辅助。' },
			{ name: '码上飞', icon: 'https://ai-bot.cn/wp-content/uploads/2025/11/CodeFlying-icon-1.png', url: 'https://ai-bot.cn/sites/60995.html', price: '免费+付费', desc: '面向中国开发者的云端 AI 编程环境。' },
			{ name: '代码小浣熊', icon: 'https://ai-bot.cn/wp-content/uploads/2023/12/sensetime-raccoon-code-icon.png', url: 'https://www.xiaohuanxiong.com/login?utm_source=blmay1', price: '免费', desc: '商汤推出的代码助手，支持多语言编程协作。' },
			{ name: '文心快码', icon: 'https://ai-bot.cn/wp-content/uploads/2024/08/comate-baidu-logo.png', url: 'https://comate.baidu.com/?inviteCode=8f8or9cz', price: '免费', desc: '百度文心生态下的智能编程助手，深度集成 IDE。' },
			{ name: 'Qoder', icon: 'https://ai-bot.cn/wp-content/uploads/2025/08/qoder-logo.png', url: 'https://qoder.com/?utm_source=ai-bot.cn', price: '付费', desc: 'AI 驱动的全栈开发平台，支持从需求到代码的一体化生成。' },
			{ name: 'Cursor', icon: 'https://ai-bot.cn/wp-content/uploads/2025/10/Cursor-logo.png', url: 'https://www.cursor.com/?utm_source=ai-bot.cn', price: '付费', desc: '基于 GPT 的下一代 IDE，支持自然语言写代码与重构。' },
			{ name: '豆包AI编程', icon: 'https://ai-bot.cn/wp-content/uploads/2023/08/doubao-icon.png', url: 'https://ai-bot.cn/doubao-aicoding/', price: '免费', desc: '豆包生态中的在线 AI 编程体验入口。' },
			{ name: 'Google Antigravity', icon: 'https://ai-bot.cn/wp-content/uploads/2025/11/Google-Antigravity-logo.png', url: 'https://antigravity.google/?utm_source=ai-bot.cn', price: '免费', desc: '谷歌推出的新一代 AI 辅助开发环境。' },
			{ name: 'Codex', icon: 'https://ai-bot.cn/wp-content/uploads/2023/03/openai-codex-icon.png', url: 'https://openai.com/index/codex-now-generally-available', price: '付费', desc: 'OpenAI 早期代码模型，为多种 IDE 和工具提供支持。' },
			{ name: 'Claude Code', icon: 'https://ai-bot.cn/wp-content/uploads/2025/07/Claude-Code-logo1.png', url: 'https://www.anthropic.com/claude-code?utm_source=ai-bot.cn', price: '付费', desc: 'Anthropic 出品的代码助手，适合长上下文项目开发。' },
			{ name: 'Kiro', icon: 'https://ai-bot.cn/wp-content/uploads/2025/07/Kiro-logo.png', url: 'https://kiro.dev/?utm_source=ai-bot.cn', price: '免费+付费', desc: '轻量级 AI 编程助手，支持浏览器内快速改代码。' },
			{ name: 'CodeBuddy IDE', icon: 'https://ai-bot.cn/wp-content/uploads/2025/07/codebuddy-logo-1.png', url: 'https://www.codebuddy.ai/?utm_source=ai-bot.cn', price: '付费', desc: '集成本地与云端项目管理的 AI IDE。' },
			{ name: 'CatPaw', icon: 'https://ai-bot.cn/wp-content/uploads/2025/11/Meituan-CatPaw-logo.png', url: 'https://catpaw.meituan.com/?utm_source=ai-bot.cn', price: '免费', desc: '美团内部开放的 AI 编程工具，适合服务端与微服务开发。' },
			{ name: 'Lovable', icon: 'https://ai-bot.cn/wp-content/uploads/2025/08/Lovable-logo.png', url: 'https://lovable.dev/?utm_source=ai-bot.cn', price: '免费+付费', desc: '主打"一键生成完整应用"的 AI 开发平台。' },
			{ name: 'Augment Code', icon: 'https://ai-bot.cn/wp-content/uploads/2024/04/augment-code-icon.png', url: 'https://www.augmentcode.com/?utm_source=ai-bot.cn', price: '付费', desc: '偏向企业团队协作的 AI 代码助手解决方案。' },
			{ name: 'iFlow CLI', icon: 'https://ai-bot.cn/wp-content/uploads/2024/07/iflow-icon.png', url: 'https://cli.iflow.cn/?utm_source=ai-bot.cn', price: '免费+付费', desc: '命令行形态的 AI 助手，适合 DevOps 与自动化脚本。' },
			{ name: '通义灵码', icon: 'https://ai-bot.cn/wp-content/uploads/2023/12/tongyi-lingma-icon-1.png', url: 'https://lingma.aliyun.com/lingma', price: '免费', desc: '阿里云推出的智能编码助手，支持多种 IDE 插件。' },
			{ name: 'GitHub Copilot', icon: 'https://ai-bot.cn/wp-content/uploads/2023/03/github-copilot-icon.png', url: 'https://github.com/features/copilot', price: '付费', desc: '最早的主流 AI 编程助手之一，深度集成 GitHub 与 VS Code。' },
			{ name: 'Firebase Studio', icon: 'https://ai-bot.cn/wp-content/uploads/2025/04/Firebase-Studio-logo.png', url: 'https://ai-bot.cn/firebase-studio/', price: '免费+付费', desc: '基于 Firebase 后端的 AI 应用搭建控制台。' },
			{ name: 'Windsurf', icon: 'https://ai-bot.cn/wp-content/uploads/2024/11/Windsurf-logo.png', url: 'https://ai-bot.cn/windsurf/', price: '付费', desc: '强调"多文件重构和项目级理解"的 AI IDE。' },
			{ name: 'Bolt.new', icon: 'https://ai-bot.cn/wp-content/uploads/2024/10/Bolt.new-logo.png', url: 'https://ai-bot.cn/bolt%E2%80%A4new/', price: '免费+付费', desc: '通过对话快速生成 Web 应用与前端页面。' },
			{ name: 'CodeFlicker', icon: 'https://ai-bot.cn/wp-content/uploads/2025/10/CodeFlicker-icon.png', url: 'https://www.codeflicker.ai', price: '付费', desc: '聚焦代码审查与重构建议的 AI 工具。' },
			{ name: 'Clacky AI', icon: 'https://ai-bot.cn/wp-content/uploads/2025/06/Clacky-logo.png', url: 'https://ai-bot.cn/clacky-ai/', price: '免费+付费', desc: '带有键盘拟态 UI 的趣味 AI 编程助手。' },
			{ name: 'Replit Agent', icon: 'https://ai-bot.cn/wp-content/uploads/2024/09/Replit-Agent-logo.png', url: 'https://ai-bot.cn/replit-agent/', price: '免费+付费', desc: 'Replit 官方智能代理，可自动修改与运行代码。' },
			{ name: 'Warp Code', icon: 'https://ai-bot.cn/wp-content/uploads/2025/09/Warp-Code-logo.png', url: 'https://www.warp.dev/code?utm_source=ai-bot.cn', price: '付费', desc: 'Warp 终端下的 AI 代码伙伴，适合命令行工作流。' },
			{ name: 'CodeWhisperer', icon: 'https://ai-bot.cn/wp-content/uploads/2023/04/codewhisperer-icon.png', url: 'https://aws.amazon.com/codewhisperer', price: '免费', desc: 'AWS 推出的 AI 编程助手，面向云原生开发。' },
			{ name: 'Zread', icon: 'https://ai-bot.cn/wp-content/uploads/2025/07/Zread-logo.png', url: 'https://zread.ai/?utm_source=ai-bot.cn', price: '免费+付费', desc: '帮助阅读和理解代码库的智能助手。' },
			{ name: 'Junie', icon: 'https://ai-bot.cn/wp-content/uploads/2025/01/Junie-logo-1.png', url: 'https://ai-bot.cn/junie/', price: '付费', desc: '付费向的专业 AI 工程师助手，适合复杂项目开发。' },
			{ name: 'CodeBuddy', icon: 'https://ai-bot.cn/wp-content/uploads/2025/05/CodeBuddy-logo.png', url: 'https://ai-bot.cn/codebuddy/', price: '免费+付费', desc: '集成项目管理和对话能力的 AI 编程搭档。' },
			{ name: 'Qodo', icon: 'https://ai-bot.cn/wp-content/uploads/2025/07/Qodo-logo.png', url: 'https://www.codium.ai', price: '免费+付费', desc: '偏重单元测试与代码质量分析的 AI 工具。' }
		]
	},
	{
		name: 'AI办公工具',
		accent: '#F6D365',
		tools: [
			{ name: 'AiPPT', icon: 'https://ai-bot.cn/wp-content/uploads/2025/05/AiPPT-logo-0526.png', url: 'https://www.aippt.cn/?utm_type=Navweb&utm_source=ai-bot&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=50608', price: '免费+付费', desc: '输入大纲即可自动生成整套 PPT，支持多主题与智能排版。' },
			{ name: '扣子PPT', icon: 'https://ai-bot.cn/wp-content/uploads/2023/12/coze-ai-icon.png', url: 'https://dis.csqixiang.cn/unpo/cozeaibot.html', price: '免费', desc: '基于大模型的一键生成演示文档工具，适合快速做课件和汇报。' },
			{ name: '咔片PPT', icon: 'https://ai-bot.cn/wp-content/uploads/2025/03/cappt-logo-1.png', url: 'https://www.cappt.cc/?mtm_campaign=CZQD-aibot-zxsl-10008', price: '免费+付费', desc: '偏向商务与营销场景的 AI PPT 生成平台，模板丰富。' },
			{ name: '文多多AiPPT', icon: 'https://ai-bot.cn/wp-content/uploads/2024/09/wenduoduo-Logo.png', url: 'https://docmee.cn/?source=ai-bot', price: '免费+付费', desc: '支持文档导入生成 PPT，适合教学与培训场景。' },
			{ name: '博思AIPPT', icon: 'https://ai-bot.cn/wp-content/uploads/2024/06/pptgo-icon.png', url: 'https://pptgo.cn/?utm_source=referrals&utm_content=aibot&_channel_track_key=LkU8aJjk', price: '免费+付费', desc: '主打商用演示与方案汇报的一键生成与美化工具。' },
			{ name: 'Pi智能演示文档', icon: 'https://ai-bot.cn/wp-content/uploads/2025/09/pi-logo.png', url: 'https://pi.deepvinci.tech/login?share_token=N7R2OU24EGHCU', price: '免费+付费', desc: '集文档、PPT 于一体的智能演示平台，支持团队协作。' },
			{ name: 'iSlide AIPPT', icon: 'https://ai-bot.cn/wp-content/uploads/2024/02/islide-icon.png', url: 'https://www.islide.cc/?mtm_campaign=ai-bot', price: '免费+付费', desc: '知名 PPT 插件，提供智能排版、图表和海量模板。' },
			{ name: '稿定PPT', icon: 'https://ai-bot.cn/wp-content/uploads/2023/05/gaoding-design-icon.png', url: 'https://www.gaoding.com/utms/c2eb98df0bf24cd9a4b691b0e8d2914e', price: '免费', desc: '稿定设计旗下 PPT 生成工具，适合电商与新媒体展示。' },
			{ name: '笔格AIPPT', icon: 'https://ai-bot.cn/wp-content/uploads/2025/09/bigppt-icon.png', url: 'https://www.bigppt.cn/?hmmd=aibot', price: '免费+付费', desc: '支持从大纲到整套 PPT 的 AI 生成与在线编辑。' },
			{ name: '笔灵AIPPT', icon: 'https://ai-bot.cn/wp-content/uploads/2024/07/biling-aippt-logo.png', url: 'https://ibiling.cn/ppt-zone?from=aibotaippt', price: '付费', desc: '笔灵旗下 PPT 产品，适合教育、论文答辩等正式场景。' },
			{ name: '百度文库AI助手', icon: 'https://ai-bot.cn/wp-content/uploads/2023/10/baidu-wenku-ai-icon.png', url: 'https://wenku.baidu.com/ndlaunch/browse/chat?fr=dist_wk_aiasis&dist_source=kfpt-WD&utm_account=dist&keyword=PPT&searchFr=1&third_id=wkds_98a21f011a37f111f0855b83_400000159', price: '免费+付费', desc: '基于文库资料一键生成 PPT 和讲稿，适合教学与分享。' },
			{ name: '讯飞智文', icon: 'https://ai-bot.cn/wp-content/uploads/2023/11/xunfei-zhiwen-icon.png', url: 'https://zhiwen.xfyun.cn/home?from=aitool2', price: '免费+付费', desc: '讯飞推出的文档/PPT 智能创作助手，支持多种办公场景。' },
			{ name: 'Gamma', icon: 'https://ai-bot.cn/wp-content/uploads/2023/03/gamma-app-icon.png', url: 'https://gamma.app', price: '免费+付费', desc: '国外热门 AI 演示工具，可从提示快速生成精美网页式演示文稿。' },
			{ name: 'Napkin', icon: 'https://ai-bot.cn/wp-content/uploads/2024/08/Napkin-logo.png', url: 'https://www.napkin.ai/?utm_source=ai-bot.cn', price: '免费+付费', desc: '主打思维整理与视觉化表达，可一键输出演示内容。' },
			{ name: '飞象老师', icon: 'https://ai-bot.cn/wp-content/uploads/2025/12/feixianglaoshi-icon.png', url: 'https://www.feixianglaoshi.com/?utm_source=ai-bot.cn', price: '免费+付费', desc: '偏向老师和培训讲师的 AI 备课与课件生成平台。' },
			{ name: 'PicDoc', icon: 'https://ai-bot.cn/wp-content/uploads/2025/06/PicDoc-logo.png', url: 'https://www.picdoc.cn/?utm_source=ai-bot.cn', price: '免费+付费', desc: '支持图文混排文档与演示制作的智能办公工具。' },
			{ name: 'AiBiao', icon: 'https://ai-bot.cn/wp-content/uploads/2025/02/VisDoc-logo.png', url: 'https://www.aibiao.com/?utm_source=ai-bot.cn', price: '免费+付费', desc: '聚焦数据可视化与报表演示，一键生成可视化 PPT。' },
			{ name: '美图AI PPT', icon: 'https://ai-bot.cn/wp-content/uploads/2023/04/meitu-ai-ppt.jpg', url: 'https://www.designkit.com/ppt/?channel=ai-bot.cn', price: '免费+付费', desc: '美图系 AI PPT 工具，强调视觉效果和图片素材。' },
			{ name: 'Kimi PPT助手', icon: 'https://ai-bot.cn/wp-content/uploads/2024/05/kimi-ai-logo.png', url: 'https://www.kimi.com/kimiplus/cvvm7bkheutnihqi2100', price: '免费', desc: '基于 Kimi 模型的 PPT 助手，擅长从长文档生成演示稿。' },
			{ name: '夸克PPT', icon: 'https://ai-bot.cn/wp-content/uploads/2024/11/quark-logo-1.png', url: 'https://ppt.quark.cn/?utm_source=ai-bot.cn', price: '免费', desc: '夸克浏览器推出的一键生成与在线编辑 PPT 工具。' },
			{ name: '清言PPT', icon: 'https://ai-bot.cn/wp-content/uploads/2025/01/qingyan-ppt-logo.jpg', url: 'https://aippt.360.com/?srcg=aippt&src=dianjing&aivip_extjson=%7B%22360ocpc%22%3A%20%7B%22accountid%22%3A%20%223516447901%22%2C%22qhclickid%22%3A%20%225bdc54b314906a91%22%2C%22keywordid%22%3A%20%2271985429812%22%2C%22creativeid%22%3A%20%229865865766%22%2C%22groupid%22%3A%223733135443%22%2C%22planid%22%3A%223183593857%22%2C%22cia%22%3A%227002%22%7D%2C%22pcsem%22%3A%7B%22medium%22%3A%22dianjingps%22%7D%7D', price: '免费', desc: '智谱清言衍生的 PPT 工具，支持从对话内容直接生成。' },
			{ name: '万兴智演', icon: 'https://ai-bot.cn/wp-content/uploads/2024/07/zhiyan-ai-icon.png', url: 'https://zhiyan.wondershare.cn/?utm_source=ai-bot.cn', price: '免费+付费', desc: '万兴科技出品的智能演示平台，支持视频+PPT 多形态输出。' },
			{ name: '麦当秀MindShow', icon: 'https://ai-bot.cn/wp-content/uploads/2024/09/401726222454_.pic_.png', url: 'https://www.mindshow.vip/workstation/?from=ai-bot.cn', price: '免费+付费', desc: '偏向培训与商业路演的演示工具，模板与动画效果丰富。' },
			{ name: 'VoxDeck', icon: 'https://ai-bot.cn/wp-content/uploads/2025/09/VoxDeck-logo.png', url: 'https://www.voxdeck.ai/?utm_source=dhvoxaibot', price: '免费+付费', desc: '英文 AI 演示平台，支持从文本或大纲自动生成专业 Deck。' },
			{ name: 'ChatBA', icon: 'https://ai-bot.cn/wp-content/uploads/2023/03/chatba-icon.png', url: 'https://www.chatba.com', price: '免费+付费', desc: '从数据分析到 PPT 生成一体化的商业分析助手。' },
			{ name: 'Decktopus AI', icon: 'https://ai-bot.cn/wp-content/uploads/2023/03/decktopus-ai-icon.png', url: 'https://www.decktopus.com/?utm_source=ai-bot.cn', price: '免费+付费', desc: '国外老牌 AI PPT 工具，擅长商务和学术演示。' },
			{ name: 'Powerpresent AI', icon: 'https://ai-bot.cn/wp-content/uploads/2025/07/PowerPresent-AI-logo.png', url: 'https://powerpresent.ai/?utm_source=ai-bot.cn', price: '付费', desc: '面向专业演讲场景的 AI 演示文稿生成服务。' },
			{ name: '希沃白板', icon: 'https://ai-bot.cn/wp-content/uploads/2024/11/xiwobaiban-logo2.png', url: 'https://easinote.seewo.com/?utm_source=ai-bot.cn', price: '免费', desc: '教育场景常用的互动白板软件，支持课件制作与演示。' },
			{ name: '秒出PPT', icon: 'https://ai-bot.cn/wp-content/uploads/2024/10/10sppt-logo-1.png', url: 'https://10sppt.com/pptx/?utm_source=ai-bot.cn', price: '免费+付费', desc: '强调"十秒出 PPT"的快速生成工具，适合即时汇报。' },
			{ name: 'GAIPPT', icon: 'https://ai-bot.cn/wp-content/uploads/2024/11/GaiPPT-logo.png', url: 'https://www.gaippt.com/?utm_source=ai-bot.cn', price: '免费+付费', desc: '一站式 AI PPT 平台，支持多行业模板与智能美化。' }
		]
	}
]);

const sectionNav = computed(() => {
	const base = [
		{ id: 'section-writing', name: 'AI写作工具' },
		{ id: 'section-chat', name: 'AI聊天助手' },
		{ id: 'section-image', name: 'AI图像工具' }
	];
	const categories = categorizedTools.value.map((cat, index) => ({
		id: `section-cat-${index}`,
		name: cat.name
	}));
	return base.concat(categories);
});

const scrollToSection = (id) => {
	// 使用 selector 让 uni-app 在各端滚动到对应区域
	uni.pageScrollTo({
		selector: `#${id}`,
		duration: 300
	});
};

const getAccentStyle = (accent) => {
	return {
		background: `linear-gradient(120deg, ${accent}, ${accent}80)`
	};
};

const openTool = (tool) => {
	// #ifdef H5
	window.open(tool.url, '_blank');
	// #endif
	
	// #ifdef MP-WEIXIN
	uni.showToast({
		title: `请在浏览器中打开: ${tool.url}`,
		icon: 'none',
		duration: 3000
	});
	// #endif
	
	// #ifdef APP-PLUS
	plus.runtime.openURL(tool.url);
	// #endif
};

const backToHome = () => {
	uni.reLaunch({
		url: '/pages/home/home'
	});
};

// 搜索功能
const searchKeyword = ref('');
const highlightedToolId = ref('');

// 所有工具的扁平化列表，用于搜索
const allTools = computed(() => {
	const tools = [];
	
	// 写作工具
	writingTools.value.forEach((tool, index) => {
		tools.push({
			name: tool.name,
			category: 'AI写作工具',
			sectionId: 'section-writing',
			type: 'writing',
			index: index,
			tool: tool
		});
	});
	
	// 聊天工具
	chatTools.value.forEach((tool, index) => {
		tools.push({
			name: tool.name,
			category: 'AI聊天助手',
			sectionId: 'section-chat',
			type: 'chat',
			index: index,
			tool: tool
		});
	});
	
	// 图像工具
	imageTools.value.forEach((tool, index) => {
		tools.push({
			name: tool.name,
			category: 'AI图像工具',
			sectionId: 'section-image',
			type: 'image',
			index: index,
			tool: tool
		});
	});
	
	// 分类工具
	categorizedTools.value.forEach((category, catIndex) => {
		category.tools.forEach((tool, toolIndex) => {
			tools.push({
				name: tool.name,
				category: category.name,
				sectionId: `section-cat-${catIndex}`,
				type: 'cat',
				catIndex: catIndex,
				index: toolIndex,
				tool: tool
			});
		});
	});
	
	return tools;
});

// 搜索结果
const searchResults = computed(() => {
	if (!searchKeyword.value.trim()) {
		return [];
	}
	
	const keyword = searchKeyword.value.toLowerCase().trim();
	return allTools.value.filter(tool => 
		tool.name.toLowerCase().includes(keyword) ||
		(tool.tool.desc && tool.tool.desc.toLowerCase().includes(keyword))
	).slice(0, 10); // 限制显示10个结果
});

// 处理搜索
const handleSearch = () => {
	// 搜索逻辑已在 computed 中实现
};

// 处理搜索框聚焦
const handleSearchFocus = () => {
	// 可以在这里添加聚焦时的逻辑
};

// 清除搜索
const clearSearch = () => {
	searchKeyword.value = '';
	highlightedToolId.value = '';
};

// 导航到工具并高亮
const navigateToTool = async (result) => {
	// 先滚动到对应的section
	await scrollToSection(result.sectionId);
	
	// 等待滚动完成后再高亮
	setTimeout(() => {
		let toolId = '';
		if (result.type === 'writing') {
			toolId = `tool-writing-${result.index}`;
		} else if (result.type === 'chat') {
			toolId = `tool-chat-${result.index}`;
		} else if (result.type === 'image') {
			toolId = `tool-image-${result.index}`;
		} else if (result.type === 'cat') {
			toolId = `tool-cat-${result.catIndex}-${result.index}`;
		}
		
		highlightedToolId.value = toolId;
		
		// 滚动到具体工具
		nextTick(() => {
			// #ifdef H5
			const element = document.getElementById(toolId);
			if (element) {
				element.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
			// #endif
			
			// #ifndef H5
			// 在非H5环境下，使用uni.pageScrollTo
			uni.pageScrollTo({
				selector: `#${toolId}`,
				duration: 300
			});
			// #endif
		});
		
		// 3秒后取消高亮
		setTimeout(() => {
			highlightedToolId.value = '';
		}, 3000);
	}, 350);
	
	// 清除搜索框
	clearSearch();
};

// 判断工具是否高亮
const isToolHighlighted = (type, index, nameOrCatIndex, toolIndex = null) => {
	if (!highlightedToolId.value) return false;
	
	let toolId = '';
	if (type === 'writing') {
		toolId = `tool-writing-${index}`;
	} else if (type === 'chat') {
		toolId = `tool-chat-${index}`;
	} else if (type === 'image') {
		toolId = `tool-image-${index}`;
	} else if (type === 'cat') {
		// nameOrCatIndex 实际上是 catIndex，toolIndex 是 toolIndex
		toolId = `tool-cat-${nameOrCatIndex}-${toolIndex}`;
	}
	
	return highlightedToolId.value === toolId;
};
</script>

<style lang="scss" scoped>
.tools-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #0f0f0f 100%);
	color: #fff;
	position: relative;

	&::before {
		content: '';
		position: fixed;
		inset: 0;
		background:
			radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.06) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.04) 0%, transparent 50%);
		pointer-events: none;
		z-index: 0;
	}
}

.tools-header {
	position: relative;
	background: rgba(0, 0, 0, 0.9);
	backdrop-filter: blur(20px);
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	padding: 0 20px;
	height: 64px;
	display: flex;
	align-items: center;
	z-index: 20;

	&::after {
		content: '';
		position: absolute;
		bottom: 0; left: 0; right: 0; height: 1px;
		background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
	}

	.back-button {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 14px;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.1);
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
		margin-right: 16px;

		&:hover {
			background: rgba(102, 126, 234, 0.2);
			border-color: rgba(102, 126, 234, 0.4);
		}

		.back-icon {
			font-size: 16px;
			color: #fff;
		}

		.back-text {
			font-size: 14px;
			color: #fff;
			font-weight: 500;
		}
	}

	.header-content {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 16px;

		.tools-title {
			font-size: 16px;
			font-weight: 700;
			background: linear-gradient(135deg, #fff 60%, rgba(167, 139, 250, 0.8));
			background-clip: text;
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			white-space: nowrap;
		}

		.tools-subtitle {
			font-size: 13px;
			color: rgba(255, 255, 255, 0.4);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
}

.tools-content {
	max-width: 1400px;
	margin: 0 auto;
	padding: 20px 20px 60px;
	position: relative;
	z-index: 1;
}

.tools-layout {
	display: flex;
	gap: 20px;
}

.tools-sidebar {
	width: 160px;
	position: sticky;
	top: 80px;
	align-self: flex-start;
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.sidebar-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 10px;
	border-radius: 999px;
	cursor: pointer;
	color: rgba(255, 255, 255, 0.45);
	font-size: 13px;
	transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;

	&:hover {
		background: rgba(102, 126, 234, 0.1);
		color: #a78bfa;
		transform: translateX(2px);
	}
}

.sidebar-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: linear-gradient(135deg, #6366f1, #ec4899);
}

.sidebar-text {
	white-space: nowrap;
}

.tools-main {
	flex: 1;
	min-width: 0;
}

.writing-section {
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 16px;
	padding: 24px;
	margin-bottom: 24px;
}

.writing-header {
	display: flex;
	flex-direction: column;
	gap: 4px;
	margin-bottom: 20px;
	padding-bottom: 12px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.07);

	.writing-title {
		font-size: 16px;
		font-weight: 700;
		color: #fff;
	}

	.writing-subtitle {
		font-size: 13px;
		color: rgba(255, 255, 255, 0.35);
	}
}

.writing-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
	gap: 16px;
}

.writing-card,
.image-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 14px;
	border: 1px solid rgba(255, 255, 255, 0.07);
	border-radius: 12px;
	background: rgba(255, 255, 255, 0.02);
	cursor: pointer;
	transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

	&:hover {
		border-color: rgba(102, 126, 234, 0.3);
		background: rgba(255, 255, 255, 0.05);
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
	}

	&.highlighted {
		border-color: rgba(102, 126, 234, 0.6);
		background: rgba(102, 126, 234, 0.1);
		box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
		animation: highlightPulse 1.5s ease-in-out;
		transform: scale(1.02);
	}
}

@keyframes highlightPulse {
	0%, 100% {
		box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
	}
	50% {
		box-shadow: 0 8px 32px rgba(102, 126, 234, 0.5);
	}
}
	
.writing-info,
.image-info {
	display: flex;
	align-items: center;
	gap: 12px;
	flex: 1;
	min-width: 0;
}

.writing-logo {
	width: 36px;
	height: 36px;
	border-radius: 10px;
	background: rgba(255, 255, 255, 0.06);
	object-fit: contain;
}

.writing-text {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.writing-name {
	font-size: 14px;
	font-weight: 600;
	color: #fff;
}

.writing-desc {
	font-size: 12px;
	color: rgba(255, 255, 255, 0.4);
}

/* 价格标签统一样式，避免“免费 / 付费 / 免费+付费”长度不同导致布局偏差 */
.writing-price,
.image-price {
	font-size: 11px;
	font-weight: 600;
	padding: 2px 10px;
	border-radius: 999px;
	background: rgba(79, 70, 229, 0.08);
	color: #f3f3f3;
	white-space: nowrap;
	max-width: 90px;
	text-align: center;
	overflow: hidden;
	text-overflow: ellipsis;
	align-self: center;
	flex-shrink: 0;
	margin-left: 10px;
}

.image-section {
background: rgba(255, 255, 255, 0.03);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 16px;
padding: 24px;
margin-bottom: 24px;
}

.image-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
	gap: 16px;
}

/* .image-card 与 .image-info 的基础样式已合并到上方的 .writing-card, .image-card 和 .writing-info, .image-info 中，保证写作区和图片区卡片完全一致 */

.image-text {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.image-desc {
font-size: 12px;
color: rgba(255, 255, 255, 0.4);
}

/* 单独控制图片区价格在文字块中的位置 */
/* .writing-price 与 .image-price 已统一在上方，保证价格徽标在卡片右侧排版一致 */

.search-container {
	margin-bottom: 30px;
	position: relative;
}

.search-box {
	display: flex;
	align-items: center;
	background: rgba(255, 255, 255, 0.05);
border-radius: 25px;
	padding: 12px 20px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	border: 1px solid rgba(255, 255, 255, 0.1);
	transition: all 0.3s ease;
	
	&:focus-within {
border-color: rgba(102, 126, 234, 0.5);
box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
}
}

.search-icon {
	width: 20px;
	height: 20px;
	margin-right: 12px;
	background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>');
	background-size: contain;
	background-repeat: no-repeat;
	background-position: center;
	flex-shrink: 0;
}

.search-input {
	flex: 1;
	border: none;
	outline: none;
	font-size: 15px;
color: #fff;
background: transparent;
	
	&::placeholder {
color: rgba(255, 255, 255, 0.3);
}
}

.search-clear {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.1);
display: flex;
align-items: center;
justify-content: center;
cursor: pointer;
margin-left: 8px;
	transition: all 0.2s ease;
	
	&:hover {
background: rgba(255, 255, 255, 0.15);
}
	
	text {
		font-size: 20px;
color: rgba(255, 255, 255, 0.6);
line-height: 1;
	}
}

.search-results {
position: absolute;
top: 100%;
left: 0;
right: 0;
background: #1a1a2e;
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 12px;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
	margin-top: 8px;
	max-height: 400px;
	overflow-y: auto;
	z-index: 100;
}

.search-result-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 12px 20px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	cursor: pointer;
	transition: all 0.2s ease;
	
	&:hover {
background: rgba(102, 126, 234, 0.1);
}
	
	&:last-child {
		border-bottom: none;
	}
}

.result-name {
font-size: 15px;
font-weight: 600;
color: #fff;
}

.result-category {
font-size: 12px;
color: rgba(255, 255, 255, 0.4);
background: rgba(255, 255, 255, 0.07);
	padding: 4px 10px;
	border-radius: 12px;
}

.search-no-results {
padding: 20px;
text-align: center;
color: rgba(255, 255, 255, 0.35);
font-size: 14px;
background: rgba(255, 255, 255, 0.03);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 12px;
margin-top: 8px;
}

.category-intro {
	margin: 25px 0 35px;
	text-align: center;
	
	.intro-highlight {
		display: block;
		font-size: 20px;
		font-weight: 700;
		color: #a78bfa;
		margin-bottom: 6px;
	}
	
	.intro-desc {
color: rgba(255, 255, 255, 0.4);
		font-size: 14px;
	}
}

.categories-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
	gap: 24px;
}

.category-card {
background: rgba(255, 255, 255, 0.03);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 16px;
padding: 20px;
display: flex;
flex-direction: column;
gap: 20px;
transition: transform 0.3s ease, box-shadow 0.3s ease;

&:hover {
transform: translateY(-4px);
background: rgba(255, 255, 255, 0.05);
border-color: rgba(102, 126, 234, 0.3);
box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}
}

.category-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	
	.category-title {
		font-size: 20px;
		font-weight: 700;
		color: #fff;
display: block;
	}
	
	.category-count {
font-size: 13px;
color: rgba(255, 255, 255, 0.35);
}
	
	.category-accent {
		width: 50px;
		height: 6px;
		border-radius: 999px;
	}
}

.category-tools {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 14px;
}

.tool-item {
display: flex;
align-items: center;
gap: 12px;
padding: 10px 12px;
border: 1px solid rgba(255, 255, 255, 0.07);
border-radius: 12px;
background: rgba(255, 255, 255, 0.02);
transition: all 0.25s ease;
cursor: pointer;

&:hover {
border-color: rgba(102, 126, 234, 0.3);
background: rgba(255, 255, 255, 0.05);
transform: translateY(-2px);
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.tool-icon {
width: 34px;
height: 34px;
border-radius: 8px;
background: rgba(255, 255, 255, 0.06);
object-fit: contain;
}

.tool-name {
font-size: 14px;
font-weight: 600;
color: #fff;
}
}

/* 响应式设计 */
@media (max-width: 768px) {
.tools-header {
height: auto;
padding: 12px 16px;
flex-wrap: wrap;
gap: 8px;

.header-content {
.tools-subtitle {
display: none;
}
}
}
	
	.tools-content {
		padding: 0 15px 40px;
	}
	
	.category-intro .intro-highlight {
		font-size: 18px;
	}
	
	.category-tools {
		grid-template-columns: 1fr;
	}
	
	.writing-section {
		padding: 18px;
	}
	
	.writing-grid {
		grid-template-columns: 1fr;
	}
	
	.image-section {
		padding: 18px;
	}
	
	.image-grid {
		grid-template-columns: 1fr;
	}
	
	.search-box {
		padding: 10px 16px;
	}
	
	.search-input {
		font-size: 14px;
	}
	
	.search-results {
		max-height: 300px;
	}
}
</style>
