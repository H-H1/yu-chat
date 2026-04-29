<template>
	<view class="roadmap-container">
		<!-- Header -->
		<view class="roadmap-header">
			<view class="back-btn" @click="handleBack">
				<text class="back-icon">←</text>
			</view>
			<text class="header-title">{{ currentArticle ? currentArticle.title : 'Agent 学习路线' }}</text>
			<view class="toc-toggle" v-if="currentArticle" @click="showToc = !showToc">
				<text>{{ showToc ? '✕' : '☰' }}</text>
			</view>
		</view>

		<!-- 文章列表页 -->
		<scroll-view v-if="!currentArticle" class="list-page" scroll-y="true">
			<!-- Hero -->
			<view class="list-hero">
				<view class="list-hero-icon">🗺️</view>
				<view class="list-hero-title">Agent 学习路线</view>
				<view class="list-hero-sub">系统化学习 LLM-Agent 开发，从基础到进阶</view>
			</view>

			<!-- 文章卡片 -->
			<view
				v-for="group in articleGroups"
				:key="group.name"
				class="article-group"
			>
				<view class="group-header">
					<text class="group-icon">{{ group.icon }}</text>
					<text class="group-name">{{ group.name }}</text>
					<text class="group-count">{{ group.articles.length }} 篇</text>
				</view>
				<view class="article-grid">
					<view
						v-for="(article, i) in group.articles"
						:key="i"
						class="article-card"
						@click="openArticle(article)"
					>
						<view class="article-card-top">
							<view class="article-emoji">{{ article.emoji }}</view>
							<view class="article-meta">
								<view class="article-tag">{{ article.tag }}</view>
								<view class="article-level" :class="'level-' + article.level">{{ article.levelText }}</view>
							</view>
						</view>
						<view class="article-title">{{ article.title }}</view>
						<view class="article-desc">{{ article.desc }}</view>
						<view class="article-footer">
							<text class="article-chapters">{{ article.chapters }} 个章节</text>
							<view class="article-source" v-if="article.source">
								<text class="source-at">@</text>
								<text class="source-name">{{ article.source }}</text>
							</view>
							<text class="article-arrow">→</text>
						</view>
					</view>
				</view>
			</view>
			<view style="height: 40px;"></view>
		</scroll-view>

		<!-- 文章阅读页 -->
		<view v-else class="reader-body">
			<!-- 左侧 TOC -->
			<!-- #ifdef H5 -->
			<view class="toc-sidebar" :class="{ 'toc-mobile-open': showToc }">
				<view class="toc-label">目录</view>
				<view
					v-for="(item, i) in tocItems"
					:key="i"
					class="toc-item"
					:class="{ 'toc-active': activeIndex === i, ['toc-h' + item.level]: true }"
					@click="scrollToHeading(i)"
				>
					<text class="toc-dot"></text>
					<text class="toc-text">{{ item.text }}</text>
				</view>
			</view>
			<view class="toc-overlay" v-if="showToc" @click="showToc = false"></view>
			<!-- #endif -->

			<scroll-view class="reader-content" scroll-y="true" @scroll="onScroll">
				<!-- #ifdef H5 -->
				<view class="md-body" v-html="rendered"></view>
				<!-- #endif -->
				<!-- #ifndef H5 -->
				<text class="md-plain">{{ currentArticle.raw }}</text>
				<!-- #endif -->
				<view style="height: 60px;"></view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue';
import agentRoadmap from './agent-roadmap.js';
import agentCoreSkills from './agent-core-skills.js';
import claudeCodeContext from './claude-code-context.js';
import contextEngineering from './context-engineering.js';
import harnessEngineering from './harness-engineering.js';
import harnessEngineeringDeep from './harness-engineering-deep.js';
import multiAgentDesign from './multi-agent-design.js';
import claudeCodeSecurity from './claude-code-security.js';
import claudeCodeOverview from './claude-code-overview.js';
import claudeCodeTools from './claude-code-tools.js';
import claudeCodeMemory from './claude-code-memory.js';
import claudeCodeMemoryRecall from './claude-code-memory-recall.js';
import claudeCodeMemoryWrite from './claude-code-memory-write.js';
import claudeCodeSystemPrompt from './claude-code-system-prompt.js';
import { renderMarkdown } from '@/utils/markdown/simpleMarkdown.js';

// 文章列表 — 后续新增文章在这里加
const articles = ref([
	{
		title: 'ClaudeCode源码（1）：全景拆解',
		desc: '一个 while 循环、三层 Harness、三级压缩流水线——Claude Code 源码泄露后的完整骨架拆解。',
		emoji: '🏛️',
		tag: 'Source Code',
		level: 1,
		levelText: '入门必读',
		chapters: 6,
		source: '每日AI精读',
		raw: claudeCodeOverview
	},
	{
		title: 'ClaudeCode源码（2）：上下文工程',
		desc: '四层压缩架构、25万次API调用的生产事故、熔断器设计——上下文工程在源码里的真实面貌。',
		emoji: '🔬',
		tag: 'Source Code',
		level: 2,
		levelText: '进阶',
		chapters: 6,
		source: '每日AI精读',
		raw: claudeCodeContext
	},
	{
		title: 'ClaudeCode源码（3）：安全与约束',
		desc: '分层规则、生成与评估分离、不可绕过的底线——Agent 乱来的根本原因和 Claude Code 的解法。',
		emoji: '🔐',
		tag: 'Source Code',
		level: 2,
		levelText: '进阶',
		chapters: 5,
		source: '每日AI精读',
		raw: claudeCodeSecurity
	},
	{
		title: 'ClaudeCode源码（4），为什么一个 Agent 不够用？',
		desc: 'Claude Code 源码揭示的多 Agent 架构设计：六个角色分离的 Agent、三层隔离机制、硬约束兜底的设计哲学。',
		emoji: '🤝',
		tag: 'Source Code',
		level: 2,
		levelText: '进阶',
		chapters: 7,
		source: '每日AI精读',
		raw: multiAgentDesign
	},
	{
		title: 'Claude Code源码（5）工具设计原则',
		desc: '万能工具里写"别用我"、工具按需发现、输出有预算——三个从源码提炼的工具设计原则。',
		emoji: '🔧',
		tag: 'Source Code',
		level: 2,
		levelText: '进阶',
		chapters: 4,
		source: '每日AI精读',
		raw: claudeCodeTools
	},
	{
		title: 'Claude Code源码（6）：拆解记忆系统',
		desc: '4种该存的记忆类型、5类不该存的东西——记忆是代码的补集，代码能回答的不让记忆来回答。',
		emoji: '🧠',
		tag: 'Source Code',
		level: 2,
		levelText: '进阶',
		chapters: 5,
		source: '每日AI精读',
		raw: claudeCodeMemory
	},
	{
		title: 'Claude Code源码（7）：记忆检索机制',
		desc: '两阶段检索、便宜模型做选择、过期警告——200条记忆每轮只挑5条，成本差一个数量级。',
		emoji: '🔎',
		tag: 'Source Code',
		level: 2,
		levelText: '进阶',
		chapters: 5,
		source: '每日AI精读',
		raw: claudeCodeMemoryRecall
	},
	{
		title: 'Claude Code源码（8）：记忆写入机制',
		desc: '后台子Agent自动提取、权限锁死、游标防重复——让记忆生产自动化但不失控的四个设计。',
		emoji: '✍️',
		tag: 'Source Code',
		level: 2,
		levelText: '进阶',
		chapters: 5,
		source: '每日AI精读',
		raw: claudeCodeMemoryWrite
	},
	{
		title: 'Claude Code源码（9） 系统提示词模块化',
		desc: '静态段与动态段分离、代码风格具体化、双向防谎约束——系统提示词是 Agent 的操作系统。',
		emoji: '📋',
		tag: 'Source Code',
		level: 2,
		levelText: '进阶',
		chapters: 5,
		source: '每日AI精读',
		raw: claudeCodeSystemPrompt
	},
	{
		title: 'LLM-Agent 开发学习路线',
		desc: '从 Transformer 基础到多智能体架构，系统梳理 Agent 开发所需的核心知识与工具链。',
		emoji: '🤖',
		tag: 'Agent',
		level: 1,
		levelText: '入门 → 进阶',
		chapters: 7,
		raw: agentRoadmap,
		source:'Stellar鱼'
	},
	{
		title: 'Agent 工程师的核心能力',
		desc: '上下文管理、控制流设计、错误恢复、反馈回路——比任何框架都重要的四项不变能力。',
		emoji: '⚙️',
		tag: 'Engineering',
		level: 1,
		levelText: '必读',
		chapters: 5,
		raw: agentCoreSkills
	},
	{
		title: '上下文工程到底是什么？',
		desc: '六层拆解：压缩重启、外化记忆、即时加载、上下文隔离、工具设计、缓存友好架构，附面试答题框架。',
		emoji: '🧠',
		tag: 'Context',
		level: 1,
		levelText: '必读',
		chapters: 8,
		raw: contextEngineering
	},
	{
		title: 'Harness Engineering 实战',
		desc: 'Anthropic 用 3-Agent 系统从一句话生成音乐制作软件：GAN 架构迁移、评估器调优、迭代合同机制。',
		emoji: '🎛️',
		tag: 'Harness',
		level: 2,
		levelText: '进阶',
		chapters: 7,
		raw: harnessEngineering
	},
	{
		title: 'Harness Engineering 全景：概念、实践与争议',
		desc: '从 Anthropic、OpenAI、Google DeepMind、Stripe 的实践到六大核心模块，附风险与局限的诚实评估。',
		emoji: '🏗️',
		tag: 'Harness',
		level: 2,
		levelText: '深度',
		chapters: 9,
		raw: harnessEngineeringDeep
	},

]);

const currentArticle = ref(null);
const rendered = ref('');
const tocItems = ref([]);
const activeIndex = ref(0);
const showToc = ref(false);

const articleGroups = computed(() => [
	{
		name: 'ClaudeCode 源码系列',
		icon: '🔍',
		articles: articles.value.filter(a => a.tag === 'Source Code')
	},
	{
		name: 'Agent 工程',
		icon: '🤖',
		articles: articles.value.filter(a => ['Agent', 'Engineering', 'Context'].includes(a.tag))
	},
	{
		name: 'Harness Engineering',
		icon: '🎛️',
		articles: articles.value.filter(a => a.tag === 'Harness')
	},
]);

const extractToc = (md) => {
	return md.split('\n')
		.filter(line => /^#{1,3}\s/.test(line))
		.map(line => {
			const m = line.match(/^(#{1,3})\s+(.+)/);
			return { level: m[1].length, text: m[2].replace(/\*\*/g, '').trim() };
		});
};

const addAnchors = (html, items) => {
	let idx = 0;
	return html.replace(/<h([1-3])([^>]*)>([\s\S]*?)<\/h\1>/g, (match, level, attrs, content) => {
		const id = `heading-${idx++}`;
		return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
	});
};

const openArticle = (article) => {
	if (!article.raw) {
		uni.showToast({ title: '文章正在编写中...', icon: 'none' });
		return;
	}
	currentArticle.value = article;
	showToc.value = false;
	activeIndex.value = 0;
	tocItems.value = extractToc(article.raw);
	const html = renderMarkdown(article.raw);
	rendered.value = addAnchors(html, tocItems.value);
};

const handleBack = () => {
	if (currentArticle.value) {
		currentArticle.value = null;
		return;
	}
	const pages = getCurrentPages();
	if (pages.length > 1) {
		uni.navigateBack({ delta: 1 });
	} else {
		uni.switchTab({ url: '/pages/home/home' });
	}
};

const scrollToHeading = (index) => {
	showToc.value = false;
	nextTick(() => {
		const el = document.getElementById(`heading-${index}`);
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
	});
};

const onScroll = (e) => {
	const scrollY = e.detail ? e.detail.scrollTop : 0;
	let current = 0;
	tocItems.value.forEach((_, i) => {
		const el = document.getElementById(`heading-${i}`);
		if (el && el.offsetTop - 80 <= scrollY) current = i;
	});
	activeIndex.value = current;
};
</script>

<style lang="scss" scoped>
.roadmap-container {
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #0f0f0f 100%);
	color: #fff;
	position: relative;
	overflow: hidden;
	box-sizing: border-box;

	&::before {
		content: '';
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.08) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.06) 0%, transparent 50%);
		pointer-events: none;
	}
}

/* Header */
.roadmap-header {
	display: flex;
	align-items: center;
	padding: 0 20px;
	background: rgba(0, 0, 0, 0.9);
	backdrop-filter: blur(20px);
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	height: 64px;
	flex-shrink: 0;
	position: relative;
	z-index: 20;

	&::after {
		content: '';
		position: absolute;
		bottom: 0; left: 0; right: 0; height: 1px;
		background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.3), transparent);
	}

	.back-btn {
		width: 36px; height: 36px;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.1);
		display: flex; align-items: center; justify-content: center;
		cursor: pointer; margin-right: 14px; flex-shrink: 0;
		transition: all 0.2s ease;
		&:hover { background: rgba(102, 126, 234, 0.2); border-color: rgba(102, 126, 234, 0.4); }
		.back-icon { font-size: 18px; color: #fff; }
	}

	.header-title {
		flex: 1;
		font-size: 16px; font-weight: 600;
		background: linear-gradient(135deg, #fff 60%, rgba(167, 139, 250, 0.8));
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
	}

	.toc-toggle {
		display: none;
		width: 36px; height: 36px;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.1);
		align-items: center; justify-content: center;
		cursor: pointer; font-size: 16px; color: #fff; flex-shrink: 0;
	}
}

/* ===== 列表页 ===== */
.list-page {
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	padding: 24px 20px;
	position: relative; z-index: 1;
	-webkit-overflow-scrolling: touch;
	box-sizing: border-box;
	width: 100%;
}

.list-hero {
	text-align: center;
	padding: 36px 20px 28px;
	margin-bottom: 24px;
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.07);
	border-radius: 20px;
	position: relative; overflow: hidden;
	box-sizing: border-box;
	width: 100%;

	&::before {
		content: '';
		position: absolute; inset: 0;
		background: radial-gradient(ellipse at 50% 0%, rgba(102, 126, 234, 0.12) 0%, transparent 70%);
		pointer-events: none;
	}

	.list-hero-icon { font-size: 44px; margin-bottom: 14px; display: block; }
	.list-hero-title {
		font-size: 26px; font-weight: 700; margin-bottom: 8px;
		background: linear-gradient(135deg, #fff, #a78bfa);
		background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
	}
	.list-hero-sub { font-size: 14px; color: rgba(255,255,255,0.45); }
}

.article-group {
	margin-bottom: 32px;
}

.group-header {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 14px;
	padding-bottom: 10px;
	border-bottom: 1px solid rgba(255,255,255,0.07);

	.group-icon { font-size: 18px; }

	.group-name {
		font-size: 16px;
		font-weight: 700;
		color: #fff;
		flex: 1;
	}

	.group-count {
		font-size: 11px;
		color: rgba(255,255,255,0.3);
		background: rgba(255,255,255,0.06);
		padding: 2px 8px;
		border-radius: 10px;
	}
}

.article-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 16px;
	width: 100%;
	box-sizing: border-box;
}

.article-card {
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 16px;
	padding: 20px;
	cursor: pointer;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	display: flex; flex-direction: column; gap: 10px;

	&:hover {
		transform: translateY(-4px);
		background: rgba(255, 255, 255, 0.06);
		border-color: rgba(102, 126, 234, 0.3);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
	}

	.article-card-top {
		display: flex; align-items: center; justify-content: space-between;

		.article-emoji { font-size: 32px; }

		.article-meta {
			display: flex; flex-direction: column; align-items: flex-end; gap: 4px;

			.article-tag {
				padding: 2px 10px;
				background: rgba(102, 126, 234, 0.15);
				border: 1px solid rgba(102, 126, 234, 0.25);
				color: #a78bfa; border-radius: 20px; font-size: 11px; font-weight: 600;
			}

			.article-level {
				padding: 2px 8px; border-radius: 8px; font-size: 10px; font-weight: 600;
				&.level-1 {
					background: rgba(52, 211, 153, 0.12);
					border: 1px solid rgba(52, 211, 153, 0.25);
					color: #6ee7b7;
				}
				&.level-2 {
					background: rgba(251, 191, 36, 0.12);
					border: 1px solid rgba(251, 191, 36, 0.25);
					color: #fcd34d;
				}
				&.level-3 {
					background: rgba(239, 68, 68, 0.12);
					border: 1px solid rgba(239, 68, 68, 0.25);
					color: #fca5a5;
				}
			}
		}
	}

	.article-title {
		font-size: 15px; font-weight: 600; color: #fff; line-height: 1.4;
	}

	.article-desc {
		font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.6; flex: 1;
	}

	.article-footer {
		display: flex; align-items: center; justify-content: space-between;
		padding-top: 10px;
		border-top: 1px solid rgba(255,255,255,0.06);

		.article-chapters { font-size: 12px; color: rgba(255,255,255,0.3); }
		.article-arrow { font-size: 16px; color: rgba(102, 126, 234, 0.6); transition: transform 0.2s; }
	}

	.article-source {
		display: flex;
		align-items: center;
		gap: 2px;
		margin-left: auto;
		margin-right: 8px;

		.source-at {
			font-size: 10px;
			color: #a78bfa;
			font-weight: 700;
		}

		.source-name {
			font-size: 10px;
			color: rgba(167, 139, 250, 0.7);
			white-space: nowrap;
		}
	}

	&:hover .article-arrow { transform: translateX(4px); color: #a78bfa; }
}

/* ===== 阅读页 ===== */
.reader-body {
	flex: 1; display: flex; overflow: hidden;
	position: relative; z-index: 1;
}

.toc-sidebar {
	width: 220px; flex-shrink: 0;
	background: rgba(0, 0, 0, 0.6);
	backdrop-filter: blur(20px);
	border-right: 1px solid rgba(255, 255, 255, 0.07);
	overflow-y: auto; padding: 20px 0;
	-webkit-overflow-scrolling: touch;

	.toc-label {
		font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
		color: rgba(255,255,255,0.25); text-transform: uppercase;
		padding: 0 16px 10px;
		border-bottom: 1px solid rgba(255,255,255,0.05);
		margin-bottom: 6px;
	}

	.toc-item {
		display: flex; align-items: center; gap: 8px;
		padding: 6px 16px; cursor: pointer;
		border-left: 2px solid transparent;
		transition: all 0.2s ease;

		&.toc-h1, &.toc-h2 { padding-left: 16px; }
		&.toc-h3 { padding-left: 28px; }

		.toc-dot {
			width: 5px; height: 5px; border-radius: 50%;
			background: rgba(255,255,255,0.15); flex-shrink: 0;
			transition: all 0.2s ease;
		}

		.toc-text {
			font-size: 12px; color: rgba(255,255,255,0.45);
			overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
			transition: color 0.2s ease;
		}

		&:hover {
			background: rgba(102, 126, 234, 0.08);
			.toc-text { color: rgba(255,255,255,0.8); }
			.toc-dot { background: rgba(102, 126, 234, 0.5); }
		}

		&.toc-active {
			border-left-color: #667eea;
			background: rgba(102, 126, 234, 0.1);
			.toc-text { color: #a78bfa; font-weight: 500; }
			.toc-dot { background: #667eea; box-shadow: 0 0 6px rgba(102, 126, 234, 0.5); }
		}
	}
}

.reader-content {
	flex: 1; overflow-y: auto;
	overflow-x: hidden;
	padding: 28px 24px;
	-webkit-overflow-scrolling: touch;
	min-width: 0;
}

.md-body {
	color: #e0e0e0; font-size: 15px; line-height: 1.8;
	max-width: 820px;
	width: 100%;
	box-sizing: border-box;
	background: rgba(255, 255, 255, 0.02);
	border: 1px solid rgba(255, 255, 255, 0.06);
	border-radius: 16px; padding: 32px;
	overflow-x: hidden;
}

.md-plain {
	color: #ccc; font-size: 14px; line-height: 1.7;
	white-space: pre-wrap; padding: 16px;
}

/* 移动端 */
@media (max-width: 768px) {
	.toc-toggle { display: flex !important; }

	.toc-sidebar {
		position: fixed; top: 64px; left: 0; bottom: 0;
		width: 260px; z-index: 100;
		transform: translateX(-100%);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		&.toc-mobile-open { transform: translateX(0); }
	}

	.toc-overlay {
		position: fixed; inset: 0; top: 64px;
		background: rgba(0,0,0,0.5); z-index: 99;
	}

	.article-grid { grid-template-columns: 1fr; }

	.reader-content, .list-page { padding: 16px 12px; }

	.md-body { padding: 20px 16px; border-radius: 12px; }
}
</style>

<style>
.reader-content .md-body p,
.reader-content .md-body li,
.reader-content .md-body span,
.reader-content .md-body div { color: #ddd !important; }

.reader-content .md-body h1,
.reader-content .md-body h2,
.reader-content .md-body h3,
.reader-content .md-body h4 { color: #fff !important; }

.reader-content .md-body h1 {
	font-size: 24px !important;
	border-bottom: 1px solid rgba(102, 126, 234, 0.3) !important;
	padding-bottom: 12px !important; margin-bottom: 20px !important;
}

.reader-content .md-body h2 {
	font-size: 19px !important; color: #a78bfa !important;
	border-left: 3px solid rgba(102, 126, 234, 0.6) !important;
	padding: 6px 0 6px 12px !important; margin-top: 32px !important;
	background: rgba(102, 126, 234, 0.05) !important;
	border-radius: 0 6px 6px 0 !important;
}

.reader-content .md-body h3 {
	font-size: 16px !important; color: #c4b5fd !important; margin-top: 24px !important;
}

.reader-content .md-body blockquote {
	background: rgba(102, 126, 234, 0.06) !important;
	border-left: 3px solid rgba(102, 126, 234, 0.4) !important;
	color: rgba(255,255,255,0.55) !important;
	padding: 10px 14px !important; border-radius: 0 8px 8px 0 !important; margin: 12px 0 !important;
}

.reader-content .md-body strong { color: #fff !important; }

.reader-content .md-body a {
	color: #a78bfa !important; text-decoration: none !important;
	border-bottom: 1px solid rgba(167, 139, 250, 0.3) !important;
	transition: all 0.2s ease !important;
}

.reader-content .md-body a:hover {
	color: #c4b5fd !important;
	border-bottom-color: rgba(196, 181, 253, 0.6) !important;
}

.reader-content .md-body hr {
	border: none !important;
	border-top: 1px solid rgba(255,255,255,0.08) !important; margin: 28px 0 !important;
}

.reader-content .md-body table {
	width: 100% !important; border-collapse: collapse !important;
	margin: 16px 0 !important; font-size: 13px !important;
}

.reader-content .md-body th {
	background: rgba(102, 126, 234, 0.15) !important; color: #a78bfa !important;
	padding: 10px 14px !important; border: 1px solid rgba(255,255,255,0.08) !important;
	text-align: left !important; font-weight: 600 !important;
}

.reader-content .md-body td {
	color: rgba(255,255,255,0.7) !important; padding: 9px 14px !important;
	border: 1px solid rgba(255,255,255,0.06) !important;
	vertical-align: top !important; line-height: 1.5 !important;
}

.reader-content .md-body tr:hover td { background: rgba(102, 126, 234, 0.05) !important; }

.reader-content .md-body code:not(.md-code) {
	background: rgba(167, 139, 250, 0.12) !important; color: #c4b5fd !important;
	padding: 2px 6px !important; border-radius: 4px !important; font-size: 13px !important;
	border: 1px solid rgba(167, 139, 250, 0.2) !important;
}

.reader-content .md-body pre {
	background: rgba(0,0,0,0.5) !important;
	border: 1px solid rgba(255,255,255,0.08) !important;
	border-radius: 10px !important; padding: 16px !important;
	overflow-x: auto !important; margin: 14px 0 !important;
}

.reader-content .md-body pre code {
	color: #c3e88d !important; background: transparent !important;
	padding: 0 !important; border: none !important;
	font-size: 13px !important; font-family: Monaco, Menlo, monospace !important;
}
</style>
