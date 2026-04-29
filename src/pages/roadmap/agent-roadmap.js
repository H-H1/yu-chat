// Auto-generated from agent-roadmap.md
const content = `# LLM-Agent 开发学习路线

**食用注意：避免篇幅过长，这里主要是过一遍 Agent 开发需要学习的名词，不会做深度解析，可以通过本文了解需要学习的大概内容，避免迷茫**

---

## 第一部分：核心知识与必备基础（大模型基础八股）

> 💡 如果你是后端，想补一点 agent 相关的知识，那 Transformer 架构、GPT 架构、机器学习深度学习的基础不是你必须的，但你最好了解现在比较火的 mcp、skill、function calling 等概念

### 1.1 大模型与 Agent 基础概念

参考资料：[https://www.promptingguide.ai/zh/techniques/tot](https://www.promptingguide.ai/zh/techniques/tot)

这里是大模型的基础知识，重点包括 Transformer 架构、GPT 架构、机器学习深度学习的基础。

- **Transformer 架构**：一切的基石。现代 LLM（如 GPT 系列）都基于此架构。你不需要从零实现它，但理解其核心的**自注意力机制 (Self-Attention)** 如何让模型理解上下文至关重要。

  精选资料：
  - [图解 Transformer (The Illustrated Transformer)](https://jalammar.github.io/illustrated-transformer/) — 用通俗易懂的图文形式解释了 Transformer 的工作原理，是入门的黄金标准。
  - [什么是 GPT？Transformer 工作原理的动画展示](http://arthurchiao.art/blog/visual-intro-to-transformers-zh/) — 3Blue1Brown 的视频译文，用动画直观展示了数据在 Transformer 内部的流动过程。

  > 开山鼻祖级别的存在，如果想做 agent 开发一定要有印象，大模型各种应用基本离不开 Transformer

- **LLM 推理与调用**：通过 API 使用大模型。了解如何调用 OpenAI、Anthropic (Claude) 或国产大模型的 API，理解 **Token**、**温度 (Temperature)**、**Top-p** 等核心参数的含义。

  > 温度、top-p 这些参数需要了解，八股会问！！！

- **提示工程 (Prompt Engineering)**：与 LLM 沟通的艺术。好的提示能极大提升模型表现。掌握提供清晰指令、上下文、示例（Few-shot Learning）等基本原则。

  > 编写 prompt 的能力，结合 Skill 相关概念学习

- **函数调用 / 工具使用 (Function Calling / Tool Use)**：这是 Agent 的"手和脚"。LLM 本身无法与外部世界交互，但通过函数调用，它可以"请求"执行代码（如查询数据库、调用 API、搜索网页），从而获取外部信息或执行操作。

  > Function Calling 部分现在常用 MCP，需要了解 MCP 和 FC 的区别，这个经常问！！！

### 1.2 Agent 系统基本架构

一个 Agent 系统通常包含以下几个部分，理解这个流程至关重要：

\`\`\`
感知输入 → 推理规划 → 工具调用 → 记忆存储 → 输出结果
\`\`\`

---

## 第二部分：主流的开发框架

**学习目标**：工欲善其事，必先利其器。聚焦于当前最主流的 Agent 开发框架，学习如何使用它们快速搭建 Agent 应用，并理解各自的优劣势。

**最佳实践**：对于初学者，强烈建议从 **LangChain** 开始，拥有最庞大的社区和最丰富的文档资源。

> 💡 如果你会 Python，先学 LangChain 就好了，其次是掌握 Agent 评测——LangSmith。如果你想学基于 Go 的 agent 开发，可以学习字节开源的 Eino 框架

### 2.1 主流 Python Agent 框架对比

| 框架 | 核心优势 | 适用场景 | 上手难度 |
| --- | --- | --- | --- |
| **LangChain & LangGraph** | 大而全的"瑞士军刀"，组件化程度高，生态最成熟，支持几乎所有主流模型和工具。LangGraph 提供了更灵活的图结构来构建复杂 Agent。 | 快速原型验证、构建复杂的 Agent 工作流、多工具协作。 | ★★☆☆☆ |
| **LlamaIndex** | 专注 RAG，数据索引和检索能力极强，尤其擅长处理复杂文档（如 PDF、PPT），与 LangChain 无缝集成。 | 构建知识库问答、文档分析、数据驱动的 Agent。 | ★★☆☆☆ |
| **AutoGen (Microsoft)** | 多 Agent 协作框架，擅长通过定义不同角色的 Agent 并让它们对话来解决复杂问题。 | 模拟团队协作（如"产品经理+程序员+测试"小组）、代码生成与调试、复杂规划任务。 | ★★★☆☆ |
| **Eino (字节)** | 基于 Go 的 Agent 开发框架，适合 Go 后端开发者。 | Go 技术栈的 Agent 开发。 | ★★★☆☆ |

---

## 第三部分：RAG — 让 Agent 拥有你的知识（很重要，必不可少）

**学习目标**：掌握检索增强生成（Retrieval-Augmented Generation, RAG）的核心技术栈。这是让 Agent 能够基于私有知识（如公司内部文档、个人笔记）进行回答的关键，也是目前商业应用最广泛的场景。

> 💡 RAG 这块如果深入学习，干货也非常多，各个场景适用的 RAG 优化策略不同，种类也很多，并且如果是工业界实际落地，也需要针对数据类型、效果等深入完善系统，这里只做简单罗列。

### 3.1 RAG 核心流程

RAG 的本质是"先检索，再生成"。当用户提问时，系统首先从知识库中找到最相关的文档片段，然后将这些片段和用户问题一起作为上下文，交给 LLM 生成最终答案。

\`\`\`
用户提问 → 向量检索 → 召回相关文档片段 → 拼接上下文 → LLM 生成答案
\`\`\`

### 3.2 RAG 技术栈拆解

**1. 文档加载与切分 (Loading & Splitting)**

- **加载**：从各种来源（PDF、TXT、HTML、Notion...）加载文档。
- **切分**：将长文档切分成更小的、语义完整的块 (Chunks)。切分的好坏直接影响检索效果。常见策略有按字符数切分、按 Token 数切分、递归字符切分等。
- **主流工具**：LangChain 和 LlamaIndex 都提供了丰富的 DocumentLoaders 和 TextSplitters。

**2. 嵌入与向量存储 (Embedding & Vector Stores)**

- **嵌入 (Embedding)**：使用 Embedding 模型将文本块转换为高维向量。这些向量能够捕捉文本的语义信息，相似的文本在向量空间中距离更近。
- **向量数据库 (Vector Database)**：专门用于存储和高效检索这些高维向量的数据库。
- 参考资料：[什么是 Embedding？](https://www.pinecone.io/learn/vector-embeddings-for-developers/)

---

## 第四部分：多智能体、ReAct、A2A、ToT、CoT

> 💡 实际应用的业务 Agent 架构都是相当复杂的，这里需要去学习更深入的 Agent 技术，包括 A2A 的具体实现、ReAct 的具体实现、多智能体架构是什么、怎么多协同，这个阶段推荐通过一个项目去学习。

### 一、ReAct（Reason + Act）

**核心论文**：[ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)

这是所有 Agent 框架的祖师爷级论文。

**它解决了什么问题？**

在 ReAct 之前：
- 要么纯 CoT（只推理，不查资料）
- 要么工具调用（直接调用工具，没有显式推理链）

ReAct 做了一件事：

\`\`\`
Thought → Action → Observation → Thought → Action → ...
\`\`\`

模型先思考，再决定是否调用工具，再根据结果继续思考。这让 Agent 能动态查资料、能纠错、能自我反思。

### 二、多智能体（Multi-Agent）

**推荐论文**：
- [CAMEL: Communicative Agents for Mind Exploration](https://arxiv.org/abs/2303.17760)
- [AutoGen（微软）](https://github.com/microsoft/autogen) — 目前最有代表性的多智能体框架

**多智能体解决的问题**：

| 单 Agent 问题 | 多 Agent 解决方式 |
| --- | --- |
| 上下文爆炸 | 角色拆分 |
| 推理能力弱 | 专家化 |
| 复杂流程难控 | 流程分层 |

**常见多 Agent 架构**：

1. **Supervisor 模式**

\`\`\`
Planner → Worker → Reviewer
\`\`\`

2. **Debate 模式**

\`\`\`
Agent A ↔ Agent B → Judge
\`\`\`

3. **Loop 模式**（推荐重点学）：LangGraph、AutoGen GroupChat

---

## 第五部分：上下文工程与记忆

> Agent 的记忆与状态：为了完成复杂任务，Agent 需要记住之前的对话历史（短期记忆）和关键信息（长期记忆）。本质就是上下文工程。

### 一、MemGPT

**论文**：[MemGPT: Towards LLMs as Operating Systems](https://arxiv.org/abs/2310.08560)

核心思想：把 LLM 当操作系统，内存分成：

\`\`\`
Working Memory（上下文窗口）
Archival Memory（外部存储）
Recall 机制 + Memory Paging
≈ RAM + Disk + Page Swap
\`\`\`

这篇论文会改变你对 Agent 的理解。

### 二、mem0（仿人脑海马体的记忆框架）

核心思想：自动提取重要记忆，而不是存全部历史。

- 只存"重要事实"，自动更新，可长期使用
- 参考：[https://github.com/mem0ai/mem0](https://github.com/mem0ai/mem0)

### 三、向量数据库与记忆

学习方向：Embedding 原理、Top-K 检索、Hybrid Search（BM25 + Dense）、父子索引

### 四、上下文工程的核心能力

真正高级的 Context Engineering 包括：

1. Prompt 编排
2. 动态裁剪
3. Memory 压缩
4. Summary 机制
5. 角色化上下文隔离
6. Token 预算调度

---

## 第六部分：评测、安全、监控与链路追踪

"没有度量，就没有优化。" 如何客观地评估 Agent 的表现，是其能否上线的核心问题。

**核心评测维度**：
- **RAG 质量**：上下文精度 (Context Precision)、上下文召回率 (Context Recall)、答案忠实度 (Faithfulness)、答案相关性 (Answer Relevancy)
- **Agent 质量**：任务完成率、工具使用正确率、鲁棒性等

**评测方法**：
- **人工评估**：最可靠，但成本高
- **LLM-as-a-Judge**：使用更强大的 LLM（如 GPT-4）来评估 Agent 的输出，是目前的主流方案

| 工具/框架 | 核心特点 |
| --- | --- |
| **LangSmith** | LangChain 官方出品，集日志、监控、调试、评估于一体。可视化追踪 Agent 每一步的思考和工具调用，支持在线和离线评估。 |
| **TruLens** | 专注于 RAG 的"三元组"评估（答案、上下文、问题之间的相关性），提供细粒度的可观测性。 |
| **Phoenix (Arize)** | 基于 OpenTelemetry 的开源 LLM 可观测性工具，强大的可视化能力，能通过 Embedding 聚类发现问题数据。 |
| **DeepEval** | 偏向单元测试和基准测试的评估框架，让你像写 Pytest 一样编写 LLM 的评测用例，与 CI/CD 流程集成。 |

---

## 第七部分：进阶内容

LoRA 微调、RL 强化学习、BERT 模型、Planner 优化

- **LoRA 微调**：低秩适配，用极少参数对大模型进行领域微调
- **RLHF / DPO**：基于人类反馈的强化学习，让模型输出更符合人类偏好
- **BERT 模型**：双向编码器，适合分类、NER、语义相似度等任务
- **Planner 优化**：如何让 Agent 的规划能力更强、更稳定
- **量化部署**：INT4/INT8 量化，降低推理成本
- **vLLM 推理加速**：PagedAttention 技术，大幅提升吞吐量
`;

export default content;
