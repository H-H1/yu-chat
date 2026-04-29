# Markdown 处理器

简单的 Markdown 渲染器，支持代码块显示和复制功能。

## 功能特性

- ✅ **基本 Markdown 渲染**: 支持标题、段落、列表、链接等
- ✅ **代码块支持**: 自动识别代码块并添加复制功能
- ✅ **表格支持**: 完整的 Markdown 表格渲染和样式
- ✅ **语言标签**: 显示代码块的编程语言
- ✅ **一键复制**: 每个代码块都有复制按钮
- ✅ **响应式设计**: 适配各种屏幕尺寸
- ✅ **流式响应支持**: 处理 AI 实时返回的内容

## 文件结构

```
src/utils/markdown/
├── simpleMarkdown.js     # 主要的 Markdown 处理器
└── README.md            # 说明文档
```

## 使用方法

### 在 Vue 组件中使用

```javascript
import { renderMarkdown } from '@/utils/markdown/simpleMarkdown.js';

// 渲染 Markdown 内容
const htmlContent = renderMarkdown(markdownText);

// 在模板中使用
<view v-html="renderMarkdown(message.content)"></view>
```

### 支持的 Markdown 语法

#### 表格
```markdown
| 姓名 | 年龄 | 职业 |
|------|------|------|
| 张三 | 25 | 工程师 |
| 李四 | 30 | 设计师 |
| 王五 | 28 | 产品经理 |
```

#### 对齐表格
```markdown
| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:-------:|-------:|
| Left | Center | Right |
```

#### 代码块
```javascript
// JavaScript 代码
function hello() {
    console.log("Hello World!");
}
```

```python
# Python 代码
def hello():
    print("Hello Python!")
```

```
# 无语言标识的代码块
这里是普通代码
```

#### 其他语法
- **粗体文本**
- *斜体文本*
- ~~删除线~~
- [链接](https://example.com)
- `内联代码`

## 表格功能

### 自动识别
- 支持标准 Markdown 表格语法
- 自动解析表头和数据行
- 支持对齐语法（:--- :---: ---:）

### 样式特性
- 深色主题设计
- 响应式横向滚动
- 悬停高亮效果
- 清晰的边框和间距
- 表头背景区分

### 表格示例
```markdown
| 功能 | 状态 | 描述 |
|------|------|------|
| 代码块 | ✅ | 支持语法高亮 |
| 表格 | ✅ | 响应式设计 |
| 链接 | ✅ | 自动打开新窗口 |
```

## 代码块功能

### 自动识别
- 支持 ```language 格式的代码块
- 自动提取语言标识符
- 无语言标识时显示为 "text"

### 复制功能
- 每个代码块都有复制按钮
- 支持现代剪贴板 API
- 提供降级复制方案
- 复制成功后显示提示

### 样式特性
- 深色主题设计
- 美观的代码块头部
- 响应式布局
- 自定义滚动条

## 测试

项目包含多个测试文件：

1. **test-restored-code-blocks.html** - 基础功能测试
2. **debug-code-blocks.html** - 调试工具

### 运行测试

```bash
# 在浏览器中打开测试文件
open test-restored-code-blocks.html  # 代码块功能测试
open test-markdown-tables.html       # 表格功能测试
open simple-table-test.html          # 简单表格调试
open debug-code-blocks.html          # 调试工具
```

## 配置

### Marked 配置
```javascript
marked.setOptions({
  breaks: true,    // 支持换行符转换
  gfm: true,      // 支持 GitHub 风格 Markdown
});
```

### CSS 变量
代码块样式使用 CSS 变量，可以在 aiChat.vue 中自定义：

```css
:root {
  --md-text-color: #fff;
  --md-code-background: #2d2d2d;
  --md-border-color: #3d3d3d;
  --md-code-font-family: Monaco, Menlo, Consolas, monospace;
}
```

## 故障排除

### 常见问题

1. **代码块不显示**
   - 检查 CSS 样式是否正确加载
   - 确认 `renderMarkdown` 函数正确导入

2. **复制功能不工作**
   - 检查是否在 HTTPS 环境下
   - 确保 `copyCodeBlock` 函数已挂载到全局

3. **样式显示异常**
   - 检查 CSS 变量是否正确定义
   - 确认没有样式冲突

## 更新日志

### v2.0.0 (当前版本)
- 移除了 highlight.js 依赖
- 简化了代码块处理逻辑
- 保留了基本的代码块识别和复制功能
- 修复了样式冲突问题

### v1.0.0 (之前版本)
- 集成了 highlight.js 语法高亮
- 支持 20+ 种编程语言
- GitHub Dark 主题

## 技术栈

- **Marked.js**: Markdown 解析
- **原生 JavaScript**: 代码块处理和复制功能
- **CSS**: 样式和动画效果
- **Vue 3**: 组件集成

---

**简单、可靠、易用的 Markdown 处理方案**