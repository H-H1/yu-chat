/**
 * 简单的Markdown处理器 - 使用marked库和动态加载的highlight.js
 */

import { marked } from 'marked';

// 动态加载 highlight.js
function loadHighlightJS() {
  if (typeof window === 'undefined') return Promise.resolve();
  
  // 如果已经加载，直接返回
  if (window.hljs) return Promise.resolve(window.hljs);
  
  return new Promise((resolve, reject) => {
    console.log('🔄 开始加载 highlight.js...');
    
    // 加载 highlight.js 核心库
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
    script.onload = () => {
      console.log('✅ highlight.js 核心库加载完成');
      
      // 加载常用语言支持
      const languages = [
        'javascript', 'typescript', 'python', 'java', 'cpp', 
        'css', 'xml', 'json', 'sql', 'bash', 'php', 'go', 
        'rust', 'swift', 'kotlin', 'csharp', 'ruby', 'yaml', 'markdown'
      ];
      
      const loadLanguage = (lang) => {
        return new Promise((langResolve) => {
          const langScript = document.createElement('script');
          langScript.src = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/${lang}.min.js`;
          langScript.onload = () => {
            console.log(`✅ 语言加载完成: ${lang}`);
            langResolve();
          };
          langScript.onerror = () => {
            console.warn(`⚠️ 语言加载失败: ${lang}`);
            langResolve(); // 即使失败也继续
          };
          document.head.appendChild(langScript);
        });
      };
      
      // 并行加载所有语言
      Promise.all(languages.map(loadLanguage)).then(() => {
        console.log('✅ 所有语言加载完成');
        
        // 加载样式
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
        style.onload = () => {
          console.log('✅ highlight.js 样式加载完成');
          resolve(window.hljs);
        };
        style.onerror = () => {
          console.warn('⚠️ highlight.js 样式加载失败，使用内置样式');
          resolve(window.hljs);
        };
        document.head.appendChild(style);
      });
    };
    
    script.onerror = () => {
      console.error('❌ highlight.js 核心库加载失败');
      reject(new Error('Failed to load highlight.js'));
    };
    
    document.head.appendChild(script);
  });
}

/**
 * 配置marked选项
 */
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * 预处理内容，修复常见的 Markdown 格式问题
 * @param {string} content - 原始内容
 * @returns {string} 修复后的内容
 */
function preprocessContent(content) {
  if (!content) return '';
  
  // 修复代码块后紧跟中文文字的问题（不影响语言标识符）
  // 只匹配代码块结束后直接跟中文字符的情况
  content = content.replace(
    /(```[\s\S]*?```)([\u4e00-\u9fa5])/g, 
    '$1\n\n$2'
  );
  
  // 修复代码块前缺少空行的问题（但不要影响已经有空行的情况）
  content = content.replace(
    /([^\n])(```)/g,
    '$1\n\n$2'
  );
  
  return content;
}

/**
 * 高亮代码
 * @param {string} code - 代码内容
 * @param {string} language - 语言类型
 * @returns {string} 高亮后的HTML
 */
function highlightCode(code, language) {
  if (!code) return '';
  
  try {
    // 如果 highlight.js 可用
    if (window.hljs) {
      // 如果指定了语言且支持该语言，则进行高亮
      if (language && window.hljs.getLanguage(language)) {
        const result = window.hljs.highlight(code, { language });
        return result.value;
      } else {
        // 尝试自动检测语言
        const result = window.hljs.highlightAuto(code);
        return result.value;
      }
    } else {
      console.warn('highlight.js 未加载，返回原始代码');
      return code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  } catch (error) {
    console.warn('代码高亮失败:', error);
    // 如果高亮失败，返回转义后的原始代码
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

/**
 * 渲染markdown内容 - 带 highlight.js 支持（修复闪动问题）
 * @param {string} content - markdown内容
 * @returns {Promise<string>} HTML字符串
 */
export async function renderMarkdownWithHighlight(content) {
  if (!content) return '';

  try {
    // 确保 highlight.js 已加载
    await loadHighlightJS();
    
    // 预处理内容
    const processedContent = preprocessContent(content);
    
    // 使用marked渲染markdown
    let html = marked.parse(processedContent);
    
    // 添加CSS类名以应用样式
    html = html
      .replace(/<h([1-6])([^>]*)>/g, '<h$1$2 class="md-header md-h$1">')
      .replace(/<p>/g, '<p class="md-paragraph">')
      // 处理表格 - 确保正确的HTML结构
      .replace(/<table>/g, '<div class="md-table-wrapper"><table class="md-table">')
      .replace(/<\/table>/g, '</table></div>')
      .replace(/<thead>/g, '<thead class="md-table-head">')
      .replace(/<tbody>/g, '<tbody class="md-table-body">')
      .replace(/<tr>/g, '<tr class="md-table-row">')
      .replace(/<th([^>]*)>/g, '<th$1 class="md-table-header">')
      .replace(/<td([^>]*)>/g, '<td$1 class="md-table-cell">')
      // 处理代码块 - 添加语法高亮（一次性完成，避免闪动）
      .replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (_, attrs, code) => {
        const copyId = 'copy-' + Math.random().toString(36).substring(2, 9);
        // 提取语言信息
        const langMatch = attrs.match(/class="[^"]*language-([^"\s]+)/);
        const lang = langMatch ? langMatch[1] : '';
        
        // 解码HTML实体
        const decodedCode = code
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        
        // 应用语法高亮 - 直接在渲染时完成，避免后续DOM操作
        const highlightedCode = highlightCode(decodedCode, lang);
        
        // 确保全局函数可用
        if (typeof window !== 'undefined') {
          window.copyCodeBlock = copyCodeBlock;
        }
        
        return `<div class="md-code-block">
          <div class="md-code-header">
            <span class="md-code-lang">${lang || 'text'}</span>
            <button class="md-code-copy" onclick="window.copyCodeBlock && window.copyCodeBlock('${copyId}')" title="复制代码">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              复制
            </button>
          </div>
          <pre class="md-code-pre"><code class="md-code hljs hljs-processed" id="${copyId}">${highlightedCode}</code></pre>
        </div>`;
      })
      // 处理内联代码
      .replace(/<code>/g, '<code class="md-inline-code">')
      .replace(/<ul>/g, '<ul class="md-list md-unordered-list">')
      .replace(/<ol>/g, '<ol class="md-list md-ordered-list">')
      .replace(/<li>/g, '<li class="md-list-item">')
      .replace(/<blockquote>/g, '<blockquote class="md-blockquote">')
      .replace(/<strong>/g, '<strong class="md-bold">')
      .replace(/<em>/g, '<em class="md-italic">')
      .replace(/<del>/g, '<del class="md-strikethrough">')
      .replace(/<a /g, '<a class="md-link" target="_blank" rel="noopener noreferrer" ');

    // 直接返回渲染结果，不再进行额外的DOM操作
    return html;

  } catch (error) {
    console.error('Markdown渲染失败:', error);
    // 降级到简单渲染
    return renderSimpleMarkdown(content);
  }
}

/**
 * 简单的markdown渲染（降级方案）
 * @param {string} content - markdown内容
 * @returns {string} HTML字符串
 */
function renderSimpleMarkdown(content) {
  if (!content) return '';
  
  try {
    // 预处理内容
    const processedContent = preprocessContent(content);
    
    // 使用marked渲染markdown（不使用highlight.js）
    let html = marked.parse(processedContent);
    
    // 添加CSS类名
    html = html
      .replace(/<h([1-6])([^>]*)>/g, '<h$1$2 class="md-header md-h$1">')
      .replace(/<p>/g, '<p class="md-paragraph">')
      .replace(/<table>/g, '<div class="md-table-wrapper"><table class="md-table">')
      .replace(/<\/table>/g, '</table></div>')
      .replace(/<thead>/g, '<thead class="md-table-head">')
      .replace(/<tbody>/g, '<tbody class="md-table-body">')
      .replace(/<tr>/g, '<tr class="md-table-row">')
      .replace(/<th([^>]*)>/g, '<th$1 class="md-table-header">')
      .replace(/<td([^>]*)>/g, '<td$1 class="md-table-cell">')
      // 处理代码块 - 不使用语法高亮
      .replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (_, attrs, code) => {
        const copyId = 'copy-' + Math.random().toString(36).substring(2, 9);
        const langMatch = attrs.match(/class="[^"]*language-([^"\s]+)/);
        const lang = langMatch ? langMatch[1] : '';
        
        // 解码HTML实体
        const decodedCode = code
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        
        // 转义代码内容
        const escapedCode = decodedCode
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        
        // 确保全局函数可用
        if (typeof window !== 'undefined') {
          window.copyCodeBlock = copyCodeBlock;
        }
        
        return `<div class="md-code-block">
          <div class="md-code-header">
            <span class="md-code-lang">${lang || 'text'}</span>
            <button class="md-code-copy" onclick="window.copyCodeBlock && window.copyCodeBlock('${copyId}')" title="复制代码">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              复制
            </button>
          </div>
          <pre class="md-code-pre"><code class="md-code" id="${copyId}">${escapedCode}</code></pre>
        </div>`;
      })
      .replace(/<code>/g, '<code class="md-inline-code">')
      .replace(/<ul>/g, '<ul class="md-list md-unordered-list">')
      .replace(/<ol>/g, '<ol class="md-list md-ordered-list">')
      .replace(/<li>/g, '<li class="md-list-item">')
      .replace(/<blockquote>/g, '<blockquote class="md-blockquote">')
      .replace(/<strong>/g, '<strong class="md-bold">')
      .replace(/<em>/g, '<em class="md-italic">')
      .replace(/<del>/g, '<del class="md-strikethrough">')
      .replace(/<a /g, '<a class="md-link" target="_blank" rel="noopener noreferrer" ');

    return html;
  } catch (error) {
    console.error('简单Markdown渲染失败:', error);
    // 最终降级到纯文本
    return content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }
}

/**
 * 主要的渲染函数 - 兼容原有接口（简化版本，避免闪动）
 * @param {string} content - markdown内容
 * @returns {string} HTML字符串
 */
export function renderMarkdown(content) {
  // 检查highlight.js是否已加载
  if (window.hljs) {
    // 如果已加载，直接使用增强渲染
    console.log('🎯 使用已加载的highlight.js直接渲染');
    return renderMarkdownWithHighlightSync(content);
  }
  
  // 如果未加载，先返回简单渲染
  const simpleResult = renderSimpleMarkdown(content);
  
  // 静默加载highlight.js，不触发重新渲染事件（避免闪动）
  loadHighlightJS().then(() => {
    console.log('✅ highlight.js加载完成（静默模式）');
  }).catch(error => {
    console.error('❌ highlight.js加载失败:', error);
  });
  
  return simpleResult;
}

/**
 * 专门用于新消息的渲染函数（确保使用最新功能）
 * @param {string} content - markdown内容
 * @returns {Promise<string>} HTML字符串
 */
export async function renderMarkdownForNewMessage(content) {
  if (!content) return '';
  
  try {
    // 确保highlight.js已加载
    await loadHighlightJS();
    
    // 使用同步增强渲染
    return renderMarkdownWithHighlightSync(content);
  } catch (error) {
    console.error('❌ 新消息渲染失败:', error);
    return renderSimpleMarkdown(content);
  }
}

/**
 * 同步版本的增强渲染（当highlight.js已加载时使用）
 * @param {string} content - markdown内容
 * @returns {string} HTML字符串
 */
function renderMarkdownWithHighlightSync(content) {
  if (!content) return '';
  
  try {
    // 预处理内容
    const processedContent = preprocessContent(content);
    
    // 使用marked渲染markdown
    let html = marked.parse(processedContent);
    
    // 添加CSS类名以应用样式
    html = html
      .replace(/<h([1-6])([^>]*)>/g, '<h$1$2 class="md-header md-h$1">')
      .replace(/<p>/g, '<p class="md-paragraph">')
      // 处理表格
      .replace(/<table>/g, '<div class="md-table-wrapper"><table class="md-table">')
      .replace(/<\/table>/g, '</table></div>')
      .replace(/<thead>/g, '<thead class="md-table-head">')
      .replace(/<tbody>/g, '<tbody class="md-table-body">')
      .replace(/<tr>/g, '<tr class="md-table-row">')
      .replace(/<th([^>]*)>/g, '<th$1 class="md-table-header">')
      .replace(/<td([^>]*)>/g, '<td$1 class="md-table-cell">')
      // 处理代码块 - 直接应用高亮
      .replace(/<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, (_, attrs, code) => {
        const copyId = 'copy-' + Math.random().toString(36).substring(2, 9);
        const langMatch = attrs.match(/class="[^"]*language-([^"\s]+)/);
        const lang = langMatch ? langMatch[1] : '';
        
        const decodedCode = code
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        
        const highlightedCode = highlightCode(decodedCode, lang);
        
        if (typeof window !== 'undefined') {
          window.copyCodeBlock = copyCodeBlock;
        }
        
        return `<div class="md-code-block">
          <div class="md-code-header">
            <span class="md-code-lang">${lang || 'text'}</span>
            <button class="md-code-copy" onclick="window.copyCodeBlock && window.copyCodeBlock('${copyId}')" title="复制代码">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              复制
            </button>
          </div>
          <pre class="md-code-pre"><code class="md-code hljs hljs-processed" id="${copyId}">${highlightedCode}</code></pre>
        </div>`;
      })
      // 处理其他元素
      .replace(/<code>/g, '<code class="md-inline-code">')
      .replace(/<ul>/g, '<ul class="md-list md-unordered-list">')
      .replace(/<ol>/g, '<ol class="md-list md-ordered-list">')
      .replace(/<li>/g, '<li class="md-list-item">')
      .replace(/<blockquote>/g, '<blockquote class="md-blockquote">')
      .replace(/<strong>/g, '<strong class="md-bold">')
      .replace(/<em>/g, '<em class="md-italic">')
      .replace(/<del>/g, '<del class="md-strikethrough">')
      .replace(/<a /g, '<a class="md-link" target="_blank" rel="noopener noreferrer" ');

    return html;
  } catch (error) {
    console.error('❌ 同步增强渲染失败:', error);
    return renderSimpleMarkdown(content);
  }
}

/**
 * 复制代码块内容到剪贴板
 * @param {string} codeId - 代码块的ID
 */
export function copyCodeBlock(codeId) {
  try {
    const codeElement = document.getElementById(codeId);
    if (!codeElement) {
      console.error('找不到代码元素:', codeId);
      return;
    }
    
    const codeText = codeElement.textContent || codeElement.innerText;
    
    // 使用现代剪贴板API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(codeText).then(() => {
        showCopySuccess();
      }).catch(() => {
        fallbackCopyTextToClipboard(codeText);
      });
    } else {
      fallbackCopyTextToClipboard(codeText);
    }
  } catch (error) {
    console.error('复制代码失败:', error);
  }
}

/**
 * 降级复制方法
 * @param {string} text - 要复制的文本
 */
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    // 使用已弃用但仍广泛支持的方法
    const successful = document.execCommand('copy');
    if (successful) {
      showCopySuccess();
    } else {
      console.error('execCommand copy failed');
    }
  } catch (err) {
    console.error('降级复制失败:', err);
  }
  
  document.body.removeChild(textArea);
}

/**
 * 显示复制成功提示
 */
function showCopySuccess() {
  // 在uni-app环境中使用uni.showToast
  if (typeof uni !== 'undefined') {
    uni.showToast({
      title: '代码已复制',
      icon: 'success',
      duration: 1500
    });
  } else {
    // 在普通web环境中显示简单提示
    console.log('代码已复制到剪贴板');
  }
}

/**
 * 检测并修复缺失的复制按钮
 * @param {Element} container - 包含代码块的容器元素
 */
export function ensureCopyButtons(container) {
  if (typeof window === 'undefined' || !container) return;
  
  try {
    // 查找所有代码块
    const codeBlocks = container.querySelectorAll('pre code, .md-code-block');
    let fixedCount = 0;
    
    codeBlocks.forEach(codeElement => {
      // 检查是否是已经处理过的代码块
      if (codeElement.closest('.md-code-block')) {
        const codeBlock = codeElement.closest('.md-code-block');
        const copyButton = codeBlock.querySelector('.md-code-copy');
        
        // 如果复制按钮存在但没有点击事件，重新绑定
        if (copyButton && !copyButton.onclick) {
          const codeId = codeElement.id || 'copy-' + Math.random().toString(36).substring(2, 9);
          codeElement.id = codeId;
          copyButton.onclick = () => window.copyCodeBlock && window.copyCodeBlock(codeId);
          fixedCount++;
        }
        
        // 检查并修复复制按钮的样式
        if (copyButton) {
          ensureButtonStyles(copyButton);
        }
        return;
      }
      
      // 检查是否是未处理的 pre > code 结构
      if (codeElement.tagName === 'CODE' && codeElement.parentElement.tagName === 'PRE') {
        const preElement = codeElement.parentElement;
        
        // 检查是否已经被包装在 md-code-block 中
        if (preElement.closest('.md-code-block')) return;
        
        // 创建新的代码块结构
        const copyId = 'copy-' + Math.random().toString(36).substring(2, 9);
        const langClass = codeElement.className.match(/language-([^\s]+)/);
        const lang = langClass ? langClass[1] : 'text';
        
        // 获取代码内容
        const codeContent = codeElement.innerHTML;
        
        // 创建新的代码块HTML
        const newCodeBlockHTML = `
          <div class="md-code-block">
            <div class="md-code-header">
              <span class="md-code-lang">${lang}</span>
              <button class="md-code-copy" title="复制代码">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                复制
              </button>
            </div>
            <pre class="md-code-pre"><code class="md-code hljs" id="${copyId}">${codeContent}</code></pre>
          </div>
        `;
        
        // 替换原有的 pre 元素
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newCodeBlockHTML;
        const newCodeBlock = tempDiv.firstElementChild;
        
        preElement.parentNode.replaceChild(newCodeBlock, preElement);
        
        // 绑定复制事件
        const copyButton = newCodeBlock.querySelector('.md-code-copy');
        if (copyButton) {
          copyButton.onclick = () => window.copyCodeBlock && window.copyCodeBlock(copyId);
          // 确保按钮样式正确
          ensureButtonStyles(copyButton);
        }
        
        fixedCount++;
      }
    });
    
    if (fixedCount > 0) {
      console.log(`🔧 修复了 ${fixedCount} 个缺失的复制按钮`);
    }
    
    // 确保全局复制函数可用
    if (!window.copyCodeBlock) {
      window.copyCodeBlock = copyCodeBlock;
    }
    
    // 确保CSS样式已加载
    ensureCopyButtonStyles();
    
    // 检测并修复表格样式
    ensureTableStyles(container);
    
  } catch (error) {
    console.error('❌ 检测复制按钮时出错:', error);
  }
}

/**
 * 确保复制按钮的样式正确应用
 * @param {Element} button - 复制按钮元素
 */
function ensureButtonStyles(button) {
  if (!button) return;
  
  // 直接设置内联样式，确保样式生效
  const styles = {
    background: 'transparent',
    border: 'none',
    color: '#aaa',
    cursor: 'pointer',
    padding: '6px 8px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    transition: 'all 0.2s ease',
    opacity: '0.7',
    fontSize: '12px',
    minWidth: '60px',
    whiteSpace: 'nowrap'
  };
  
  Object.assign(button.style, styles);
  
  // 添加hover效果
  button.addEventListener('mouseenter', () => {
    button.style.background = 'rgba(255, 255, 255, 0.1)';
    button.style.color = '#fff';
    button.style.opacity = '1';
    button.style.transform = 'scale(1.05)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.background = 'transparent';
    button.style.color = '#aaa';
    button.style.opacity = '0.7';
    button.style.transform = 'scale(1)';
  });
  
  button.addEventListener('mousedown', () => {
    button.style.transform = 'scale(0.95)';
  });
  
  button.addEventListener('mouseup', () => {
    button.style.transform = 'scale(1.05)';
  });
  
  // 确保SVG样式
  const svg = button.querySelector('svg');
  if (svg) {
    svg.style.width = '14px';
    svg.style.height = '14px';
    svg.style.stroke = 'currentColor';
    svg.style.flexShrink = '0';
  }
}

/**
 * 检测并修复表格样式
 * @param {Element} container - 包含表格的容器元素
 */
export function ensureTableStyles(container) {
  if (typeof window === 'undefined' || !container) return;
  
  try {
    // 查找所有表格
    const tables = container.querySelectorAll('table, .md-table-wrapper');
    let fixedCount = 0;
    
    tables.forEach(tableElement => {
      // 检查是否是已经处理过的表格
      if (tableElement.classList.contains('md-table-wrapper')) {
        const table = tableElement.querySelector('table');
        if (table) {
          ensureTableElementStyles(table, tableElement);
          fixedCount++;
        }
        return;
      }
      
      // 检查是否是未处理的原始表格
      if (tableElement.tagName === 'TABLE' && !tableElement.closest('.md-table-wrapper')) {
        // 创建表格包装器
        const wrapper = document.createElement('div');
        wrapper.className = 'md-table-wrapper';
        
        // 将表格移动到包装器中
        tableElement.parentNode.insertBefore(wrapper, tableElement);
        wrapper.appendChild(tableElement);
        
        // 应用样式
        ensureTableElementStyles(tableElement, wrapper);
        fixedCount++;
      }
    });
    
    if (fixedCount > 0) {
      console.log(`📊 修复了 ${fixedCount} 个表格的样式`);
    }
    
    // 确保表格CSS样式已加载
    ensureTableCSSStyles();
    
  } catch (error) {
    console.error('❌ 检测表格样式时出错:', error);
  }
}

/**
 * 为单个表格元素应用样式
 * @param {Element} table - 表格元素
 * @param {Element} wrapper - 表格包装器
 */
function ensureTableElementStyles(table, wrapper) {
  if (!table || !wrapper) return;
  
  // 应用包装器样式
  const wrapperStyles = {
    overflowX: 'auto',
    margin: '16px 0',
    borderRadius: '8px',
    border: '1px solid #3d3d3d',
    background: 'rgba(255, 255, 255, 0.02)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
  };
  Object.assign(wrapper.style, wrapperStyles);
  
  // 应用表格样式
  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
    lineHeight: '1.5',
    background: 'transparent'
  };
  Object.assign(table.style, tableStyles);
  
  // 添加CSS类
  table.classList.add('md-table');
  
  // 处理表头
  const thead = table.querySelector('thead');
  if (thead) {
    thead.classList.add('md-table-head');
    thead.style.background = 'rgba(255, 255, 255, 0.1)';
    
    const headers = thead.querySelectorAll('th');
    headers.forEach((th, index) => {
      th.classList.add('md-table-header');
      const headerStyles = {
        padding: '12px 16px',
        textAlign: 'left',
        fontWeight: '600',
        color: '#fff',
        borderBottom: '2px solid #3d3d3d',
        borderRight: index < headers.length - 1 ? '1px solid #3d3d3d' : 'none',
        background: 'rgba(255, 255, 255, 0.1)'
      };
      Object.assign(th.style, headerStyles);
    });
  }
  
  // 处理表体
  const tbody = table.querySelector('tbody');
  if (tbody) {
    tbody.classList.add('md-table-body');
    
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((tr, rowIndex) => {
      tr.classList.add('md-table-row');
      tr.style.transition = 'background-color 0.2s ease';
      
      // 添加hover效果
      tr.addEventListener('mouseenter', () => {
        tr.style.background = 'rgba(255, 255, 255, 0.05)';
      });
      tr.addEventListener('mouseleave', () => {
        tr.style.background = 'transparent';
      });
      
      const cells = tr.querySelectorAll('td');
      cells.forEach((td, cellIndex) => {
        td.classList.add('md-table-cell');
        const cellStyles = {
          padding: '10px 16px',
          color: '#fff',
          borderBottom: rowIndex < rows.length - 1 ? '1px solid #3d3d3d' : 'none',
          borderRight: cellIndex < cells.length - 1 ? '1px solid #3d3d3d' : 'none',
          verticalAlign: 'top'
        };
        Object.assign(td.style, cellStyles);
      });
    });
  }
  
  // 处理没有thead/tbody的简单表格
  if (!thead && !tbody) {
    const rows = table.querySelectorAll('tr');
    rows.forEach((tr, rowIndex) => {
      tr.classList.add('md-table-row');
      tr.style.transition = 'background-color 0.2s ease';
      
      // 添加hover效果
      tr.addEventListener('mouseenter', () => {
        tr.style.background = 'rgba(255, 255, 255, 0.05)';
      });
      tr.addEventListener('mouseleave', () => {
        tr.style.background = 'transparent';
      });
      
      const cells = tr.querySelectorAll('td, th');
      cells.forEach((cell, cellIndex) => {
        if (cell.tagName === 'TH') {
          cell.classList.add('md-table-header');
          const headerStyles = {
            padding: '12px 16px',
            textAlign: 'left',
            fontWeight: '600',
            color: '#fff',
            borderBottom: '2px solid #3d3d3d',
            borderRight: cellIndex < cells.length - 1 ? '1px solid #3d3d3d' : 'none',
            background: 'rgba(255, 255, 255, 0.1)'
          };
          Object.assign(cell.style, headerStyles);
        } else {
          cell.classList.add('md-table-cell');
          const cellStyles = {
            padding: '10px 16px',
            color: '#fff',
            borderBottom: rowIndex < rows.length - 1 ? '1px solid #3d3d3d' : 'none',
            borderRight: cellIndex < cells.length - 1 ? '1px solid #3d3d3d' : 'none',
            verticalAlign: 'top'
          };
          Object.assign(cell.style, cellStyles);
        }
      });
    });
  }
}

/**
 * 确保表格CSS样式已加载
 */
function ensureTableCSSStyles() {
  if (typeof window === 'undefined') return;
  
  // 检查是否已经添加了表格样式
  if (document.getElementById('md-table-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'md-table-styles';
  style.textContent = `
    .md-table-wrapper {
      overflow-x: auto !important;
      margin: 16px 0 !important;
      border-radius: 8px !important;
      border: 1px solid #3d3d3d !important;
      background: rgba(255, 255, 255, 0.02) !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
    }
    
    .md-table {
      width: 100% !important;
      border-collapse: collapse !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      background: transparent !important;
    }
    
    .md-table-head {
      background: rgba(255, 255, 255, 0.1) !important;
    }
    
    .md-table-header {
      padding: 12px 16px !important;
      text-align: left !important;
      font-weight: 600 !important;
      color: #fff !important;
      border-bottom: 2px solid #3d3d3d !important;
      border-right: 1px solid #3d3d3d !important;
      background: rgba(255, 255, 255, 0.1) !important;
    }
    
    .md-table-header:last-child {
      border-right: none !important;
    }
    
    .md-table-row {
      transition: background-color 0.2s ease !important;
    }
    
    .md-table-row:hover {
      background: rgba(255, 255, 255, 0.05) !important;
    }
    
    .md-table-cell {
      padding: 10px 16px !important;
      color: #fff !important;
      border-bottom: 1px solid #3d3d3d !important;
      border-right: 1px solid #3d3d3d !important;
      vertical-align: top !important;
    }
    
    .md-table-cell:last-child {
      border-right: none !important;
    }
    
    .md-table-body .md-table-row:last-child .md-table-cell {
      border-bottom: none !important;
    }
    
    /* 确保表格在消息气泡中正确显示 */
    .ai-bubble .md-table-wrapper {
      margin: 12px 0 !important;
    }
    
    .ai-bubble .md-table-header,
    .ai-bubble .md-table-cell {
      color: #fff !important;
    }
    
    /* 响应式设计 */
    @media (max-width: 768px) {
      .md-table-wrapper {
        font-size: 12px !important;
      }
      
      .md-table-header,
      .md-table-cell {
        padding: 8px 12px !important;
      }
    }
  `;
  
  document.head.appendChild(style);
  console.log('✅ 表格CSS样式已注入');
}

/**
 * 确保复制按钮的CSS样式已加载
 */
function ensureCopyButtonStyles() {
  if (typeof window === 'undefined') return;
  
  // 检查是否已经添加了样式
  if (document.getElementById('md-copy-button-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'md-copy-button-styles';
  style.textContent = `
    .md-code-copy {
      background: transparent !important;
      border: none !important;
      color: #aaa !important;
      cursor: pointer !important;
      padding: 6px 8px !important;
      border-radius: 4px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 4px !important;
      transition: all 0.2s ease !important;
      opacity: 0.7 !important;
      font-size: 12px !important;
      min-width: 60px !important;
      white-space: nowrap !important;
    }
    
    .md-code-copy:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      color: #fff !important;
      opacity: 1 !important;
      transform: scale(1.05) !important;
    }
    
    .md-code-copy:active {
      transform: scale(0.95) !important;
    }
    
    .md-code-copy svg {
      width: 14px !important;
      height: 14px !important;
      stroke: currentColor !important;
      flex-shrink: 0 !important;
    }
    
    .md-code-block {
      background: #1e1e1e !important;
      border: 1px solid #3d3d3d !important;
      border-radius: 8px !important;
      margin: 16px 0 !important;
      overflow: hidden !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
    }
    
    .md-code-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      background: rgba(255, 255, 255, 0.08) !important;
      border-bottom: 1px solid #3d3d3d !important;
      padding: 8px 12px !important;
      min-height: 36px !important;
    }
    
    .md-code-lang {
      background: transparent !important;
      color: #aaa !important;
      padding: 0 !important;
      font-size: 12px !important;
      border: none !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      font-weight: 500 !important;
      font-family: Monaco, Menlo, Consolas, "Courier New", monospace !important;
    }
    
    .md-code-pre {
      margin: 0 !important;
      padding: 16px !important;
      overflow-x: auto !important;
      background: #1e1e1e !important;
    }
    
    .md-code {
      font-family: Monaco, Menlo, Consolas, "Courier New", monospace !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      color: #e6e6e6 !important;
      white-space: pre !important;
      display: block !important;
      background: transparent !important;
      margin: 0 !important;
      padding: 0 !important;
    }
  `;
  
  document.head.appendChild(style);
  console.log('✅ 复制按钮CSS样式已注入');
}

/**
 * 自动检测页面中的代码块并添加复制按钮（用于页面加载后的检测）
 */
export function autoFixCopyButtons() {
  if (typeof window === 'undefined') return;
  
  // 等待DOM完全加载
  const checkAndFix = () => {
    const containers = [
      document.body,
      ...document.querySelectorAll('.message-content, .ai-bubble, .message-bubble')
    ];
    
    containers.forEach(container => {
      if (container) {
        ensureCopyButtons(container);
        ensureTableStyles(container);
      }
    });
    
    // 确保CSS样式已加载
    ensureCopyButtonStyles();
    ensureTableCSSStyles();
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndFix);
  } else {
    checkAndFix();
  }
  
  // 也可以定期检查（可选）
  setTimeout(checkAndFix, 1000);
}

// 将复制函数挂载到全局，供HTML中的onclick使用
// 立即执行，确保函数始终可用
if (typeof window !== 'undefined') {
  window.copyCodeBlock = copyCodeBlock;
  
  // 添加页面加载完成后的重新挂载，确保在任何情况下都可用
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.copyCodeBlock = copyCodeBlock;
      autoFixCopyButtons();
    });
  } else {
    // 如果页面已经加载完成，立即挂载
    window.copyCodeBlock = copyCodeBlock;
    autoFixCopyButtons();
  }
}