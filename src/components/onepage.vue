<template>
  <div class="page-container">
    <!-- 加载状态 -->
    <div v-if="result == '' && error == ''" class="loading-container">
      <n-spin size="large" />
      <p class="loading-text">正在加载文章内容...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error != ''" class="error-container">
      <n-empty description="加载失败" image-size="large">
        <template #extra>
          <n-button type="primary" @click="reloadPage">重新加载</n-button>
        </template>
      </n-empty>
    </div>

    <!-- 文章内容 -->
    <n-card v-else-if="result?.metadata?.content" class="article-card" bordered>
      <!-- 文章标题和元信息 -->
      <template #header>
        <div class="article-header">
          <!-- 文章标题 -->
          <h1 class="article-title">
            {{ result?.metadata?.content?.title || "" }}
          </h1>
          <!-- 元信息 -->
          <div class="article-meta">
            <div class="meta-item">
              <n-icon :component="Calendar" />
              <span>发布于: {{ formatDate(result?.publishedAt) }}</span>
            </div>
            <div class="meta-item">
              <n-icon :component="Clock" />
              <span>更新于: {{ formatDate(result?.updatedAt) }}</span>
            </div>
            <!-- 标签支持 -->
            <div v-if="result?.metadata?.content?.tags" class="meta-item">
              <n-icon :component="Tag" />
              <span>标签: {{ result?.metadata?.content?.tags.join(', ') }}</span>
            </div>
          </div>
          <!-- 原文链接 -->
          <div class="article-links">
            <div v-for="i in result?.metadata?.content?.attributes">
              <n-button :key="i?.trait_type" v-if="i?.trait_type == 'xlog_slug'" tag="a"
                :href="'https://xlog.not404.cc/' + i?.value" target="_blank" type="default" size="small" text>
                查看原文
              </n-button>
            </div>
          </div>
        </div>
      </template>

      <!-- 文章内容 -->
      <div class="article-content">
        <!-- 完整内容 -->
        <div v-if="result?.metadata?.content?.content" class="markdown-content"
          v-html="md.render(ipfsToCrossbell(result?.metadata?.content?.content) || '')"></div>

        <!-- 摘要和附件 -->
        <div v-else class="article-summary">
          <p>{{ result?.metadata?.content?.summary }}</p>
          <n-image v-if="result?.metadata?.content?.attachments[0]?.address"
            :src="result?.metadata?.content?.attachments[0]?.address" :width="400" :height="auto" object-fit="contain"
            class="article-image" preview-src-list="[result?.metadata?.content?.attachments[0]?.address]" />
          <div class="external-links">
            <n-button v-for="(i, index) in result?.metadata?.content?.external_urls" :key="index" tag="a" :href="i"
              target="_blank" type="primary" size="small" text class="external-link">
              {{ i }}
            </n-button>
          </div>
        </div>
      </div>
    </n-card>

    <!-- 文章未找到状态 -->
    <div v-else class="not-found-container">
      <n-empty description="文章未找到" image-size="large">
        <template #extra>
          <n-button type="primary" @click="router.back()">返回</n-button>
        </template>
      </n-empty>
    </div>
  </div>
</template>

<script setup>
import { imgSize } from "@mdit/plugin-img-size";
import { createIndexer } from "crossbell";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import powershell from "highlight.js/lib/languages/powershell";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/github.css"; // 使用更明亮的主题
import markdownit from "markdown-it";
import mditjs from "markdown-it-highlightjs/core";
import { onMounted, ref, h, render } from "vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { ipfsToCrossbell } from "./api";

// 导入 Naive UI 组件
import { Calendar, Clock, Tag } from '@vicons/fa';
import { NButton, NCard, NEmpty, NIcon, NImage, NSpin } from 'naive-ui';

// 注册 highlight.js 语言
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("powershell", powershell);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("python", python);

const route = useRoute(); // 获取当前路由对象
const router = useRouter(); // 获取路由实例
const nodeid = ref(route.params.id || "");

const result = ref("");
const error = ref("");

// 初始化 markdown 渲染器
const md = markdownit({
  html: true,
  linkify: true,
  breaks: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>';
      } catch (__) { }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
}).use(imgSize).use(mditjs, { hljs });
function vnodeToHTML(vnode) {
  const container = document.createElement('div')
  render(vnode, container)
  const html = container.innerHTML
  return html
}
// 自定义图片渲染器，将图片渲染为带有预览功能的格式
const defaultImageRenderer = md.renderer.rules.image;
md.renderer.rules.image = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const src = token.attrGet('src');
  const alt = token.content;
  const title = token.attrGet('title');

  // 返回自定义的图片渲染HTML，使用Naive UI NImage组件的结构
  return vnodeToHTML(h('div', { class: 'markdown-image-wrapper' }, [
    h(NImage, {
      src,
      alt,
      title: title || '',
      class: 'markdown-image',
      'object-fit': 'contain'
    })
  ]));
};

// 创建索引器
const indexer = createIndexer();

// 加载文章内容
const loadArticle = () => {
  result.value = "";
  error.value = "";

  indexer.note
    .get("50877", nodeid.value)
    .then((res) => {
      result.value = res;
      document.title = result.value?.metadata?.content?.title || "文章未找到";
      if (res === null) {
        error.value = "文章未找到";
      }
    })
    .catch((err) => {
      error.value = err.toString();
    });
};

// 重新加载页面
const reloadPage = () => {
  loadArticle();
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

// 路由更新时重新加载
onBeforeRouteUpdate((to, from, next) => {
  nodeid.value = to.params.id || "";
  loadArticle();
  next();
});

// 组件挂载时加载
onMounted(() => {
  loadArticle();
});
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  padding: 10px 20px;
  background-color: var(--n-color-light-5);
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.loading-text {
  margin-top: 20px;
  color: var(--n-secondary-text-color);
  font-size: 16px;
}

/* 错误状态 */
.error-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* 文章未找到状态 */
.not-found-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* 文章卡片 */
.article-card {
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  padding: 20px 30px;
}

/* 移动端优化卡片内边距 */
@media (max-width: 768px) {
  .article-card {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .article-card {
    padding: 15px;
  }
}

/* 文章标题 */
.article-header {
  text-align: center;
  margin-bottom: 20px;
}

.article-title {
  font-size: 2.5em;
  font-weight: 700;
  color: var(--n-primary-text-color);
  margin: 0 0 15px 0;
  line-height: 1.3;
  word-break: break-word;
  letter-spacing: -0.5px;
}

.article-links {
  display: flex;
  justify-content: center;
  gap: 10px;
}

/* 文章内容 */
.article-content {
  padding: 20px 0;
}

.markdown-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--n-primary-text-color);
  letter-spacing: 0.3px;
}

/* Markdown 样式增强 */
.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 35px;
  margin-bottom: 15px;
  font-weight: 600;
  color: var(--n-primary-text-color);
  line-height: 1.4;
  letter-spacing: -0.3px;
}

.markdown-content h1 {
  font-size: 2em;
  border-bottom: 2px solid var(--n-primary-color-light-4);
  padding-bottom: 10px;
}

.markdown-content h2 {
  font-size: 1.75em;
  border-bottom: 1px solid var(--n-primary-color-light-5);
  padding-bottom: 8px;
}

.markdown-content h3 {
  font-size: 1.5em;
}

.markdown-content p {
  margin-bottom: 1.5em;
  text-align: justify;
}

.markdown-content ul,
.markdown-content ol {
  margin-bottom: 1.5em;
  padding-left: 2em;
}

.markdown-content li {
  margin-bottom: 0.5em;
}

.markdown-content blockquote {
  margin: 1.5em 0;
  padding: 15px 20px;
  border-left: 4px solid var(--n-primary-color);
  background-color: var(--n-primary-color-light-5);
  color: var(--n-secondary-text-color);
  border-radius: 0 6px 6px 0;
  font-style: italic;
}

.markdown-content code {
  padding: 2px 6px;
  background-color: var(--n-primary-color-light-4);
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
  color: var(--n-primary-color);
}

/* 代码块样式 - 适配主题变化 */
.markdown-content pre {
  margin: 1.5em 0;
  padding: 20px;
  background-color: var(--n-color-dark-1);
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s ease;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
  color: var(--n-color-light-1);
  font-size: 0.95em;
  line-height: 1.6;
}

/* 自定义代码高亮样式 - 适配主题变化 */
.markdown-content pre.hljs {
  background-color: var(--n-color-dark-1) !important;
  color: var(--n-color-light-1) !important;
}

.markdown-content .hljs-comment,
.markdown-content .hljs-quote {
  color: var(--n-secondary-text-color) !important;
  font-style: italic;
}

.markdown-content .hljs-keyword,
.markdown-content .hljs-selector-tag,
.markdown-content .hljs-subst {
  color: var(--n-primary-color) !important;
}

.markdown-content .hljs-number,
.markdown-content .hljs-literal,
.markdown-content .hljs-variable,
.markdown-content .hljs-template-variable,
.markdown-content .hljs-tag .hljs-attr {
  color: var(--n-info-color) !important;
}

.markdown-content .hljs-string,
.markdown-content .hljs-doctag {
  color: var(--n-success-color) !important;
}

.markdown-content .hljs-title,
.markdown-content .hljs-section,
.markdown-content .hljs-selector-id {
  color: var(--n-warning-color) !important;
  font-weight: bold;
}

.markdown-content .hljs-subst {
  font-weight: normal;
}

.markdown-content .hljs-type,
.markdown-content .hljs-class .hljs-title {
  color: var(--n-primary-color) !important;
  font-weight: bold;
}

.markdown-content .hljs-tag,
.markdown-content .hljs-name,
.markdown-content .hljs-attribute {
  color: var(--n-primary-color) !important;
}

.markdown-content .hljs-regexp,
.markdown-content .hljs-link {
  color: var(--n-success-color) !important;
}

.markdown-content .hljs-symbol,
.markdown-content .hljs-bullet {
  color: var(--n-info-color) !important;
}

.markdown-content .hljs-built_in,
.markdown-content .hljs-builtin-name {
  color: var(--n-primary-color) !important;
}

.markdown-content .hljs-meta {
  color: var(--n-secondary-text-color) !important;
  font-weight: bold;
}

.markdown-content .hljs-deletion {
  background: var(--n-error-color-light-5) !important;
  color: var(--n-error-color) !important;
}

.markdown-content .hljs-addition {
  background: var(--n-success-color-light-5) !important;
  color: var(--n-success-color) !important;
}

.markdown-content .hljs-emphasis {
  font-style: italic;
}

.markdown-content .hljs-strong {
  font-weight: bold;
}

/* 图片样式 */
.markdown-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1.5em auto;
  display: block;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: zoom-in;
}

.markdown-content img:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.markdown-image-wrapper {
  text-align: center;
  margin: 1.5em 0;
}

.markdown-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  cursor: zoom-in;
}

/* 链接样式 */
.markdown-content a {
  color: var(--n-primary-color);
  text-decoration: none;
  transition: all 0.2s ease;
  border-bottom: 1px solid transparent;
}

.markdown-content a:hover {
  color: var(--n-primary-color-dark-2);
  border-bottom-color: var(--n-primary-color);
  text-decoration: none;
}

/* 文章摘要 */
.article-summary {
  text-align: center;
  padding: 20px;
}

.article-image {
  margin: 20px auto;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.external-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.external-link {
  word-break: break-all;
  max-width: 100%;
}

/* 文章元信息 */
.article-meta {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 30px;
  margin-bottom: 20px;
  color: var(--n-secondary-text-color);
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.meta-item .n-icon {
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container {
    padding: 10px;
  }

  .article-title {
    font-size: 2em;
  }

  .markdown-content {
    font-size: 15px;
    line-height: 1.7;
  }

  .article-meta {
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }

  .markdown-content h1 {
    font-size: 1.8em;
  }

  .markdown-content h2 {
    font-size: 1.5em;
  }

  .markdown-content h3 {
    font-size: 1.3em;
  }
}

@media (max-width: 480px) {
  .article-title {
    font-size: 1.8em;
  }

  .markdown-content {
    font-size: 14px;
  }

  .article-card {
    margin: 0;
    border-radius: 8px;
  }

  .markdown-content h1 {
    font-size: 1.6em;
  }

  .markdown-content h2 {
    font-size: 1.4em;
  }

  .markdown-content h3 {
    font-size: 1.2em;
  }
}
</style>