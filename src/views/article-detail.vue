<template>
  <div class="article-detail">
    <!-- <n-spin :show="loading">    </n-spin> -->
      <div v-if="article" class="article-container">
        <div class="article-header">
          <div class="back-button">
            <n-button text @click="goBack">
              <template #icon>
                <n-icon :component="Backspace" />
              </template>
              返回
            </n-button>
          </div>
          <h1 class="article-title">{{ article.title }}</h1>
          <div class="article-meta">
            <n-tag v-if="article.tag" type="info" size="small">
              {{ article.tag }}
            </n-tag>
            <span class="article-date">{{ formatDate(article.created_at) }}</span>
            <span class="article-views">
              <n-icon :component="EyeRegular" />
              {{ article.views || 0 }} 次阅读
            </span>
          </div>
          <div v-if="article.cover_url" class="article-cover">
            <img :src="article.cover_url" :alt="article.title" />
          </div>
        </div>

        <div v-if="article.summary" class="article-summary">
          {{ article.summary }}
        </div>

        <div class="article-content" v-html="renderedContent"></div>
      </div>

      <div v-else-if="error" class="error-container">
        <n-result status="error" title="加载失败" :description="error" />
        <n-button type="primary" @click="loadArticle">重试</n-button>
      </div>

      <div v-else class="empty-container">
        <n-empty description="文章不存在" />
      </div>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NButton, NEmpty, NIcon, NResult, NSpin, NTag, useMessage } from 'naive-ui';
import { Backspace, EyeRegular } from '@vicons/fa';
import { getArticle } from '@/components/api';
import MarkdownIt from 'markdown-it';

const route = useRoute();
const router = useRouter();
const message = useMessage();

const article = ref(null);
const loading = ref(true);  
const error = ref('');
let md = null;

const renderedContent = computed(() => {
  if (!md || !article.value?.content) return '';
  return md.render(article.value.content);
});

async function loadArticle() {
  const articleId = parseInt(route.params.id);
  if (!articleId) {
    error.value = '无效的文章ID';
    return;
  }

  loading.value = true;
  error.value = '';
  try {
    article.value = await getArticle(articleId);
  } catch (e) {
    error.value = e.message || '加载文章失败';
    message.error(error.value);
  } finally {
    loading.value = false;
  }
}

function goBack() {
  router.back();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

onMounted(() => {
  md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
  });
  loadArticle();
});
</script>

<style scoped>
.article-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.article-container {
  background: var(--n-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.article-header {
  padding: 32px;
  border-bottom: 1px solid var(--n-divider-color);
}

.back-button {
  margin-bottom: 20px;
}

.article-title {
  margin: 0 0 20px;
  font-size: 32px;
  font-weight: 700;
  color: var(--n-text-color);
  line-height: 1.4;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.article-date {
  color: var(--n-text-color-3);
  font-size: 14px;
}

.article-views {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--n-text-color-3);
  font-size: 14px;
}

.article-cover {
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--n-color-modal);
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-summary {
  padding: 24px 32px;
  font-size: 16px;
  line-height: 1.8;
  color: var(--n-text-color-2);
  font-style: italic;
  border-bottom: 1px solid var(--n-divider-color);
  background: var(--n-color-modal);
}

.article-content {
  padding: 32px;
  line-height: 1.8;
  color: var(--n-text-color);
}

.article-content :deep(h1),
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4),
.article-content :deep(h5),
.article-content :deep(h6) {
  margin-top: 32px;
  margin-bottom: 16px;
  font-weight: 600;
  color: var(--n-text-color);
}

.article-content :deep(h1) {
  font-size: 28px;
  border-bottom: 2px solid var(--n-primary-color-light-4);
  padding-bottom: 12px;
}

.article-content :deep(h2) {
  font-size: 24px;
}

.article-content :deep(h3) {
  font-size: 20px;
}

.article-content :deep(p) {
  margin-bottom: 16px;
  line-height: 1.8;
}

.article-content :deep(code) {
  padding: 2px 6px;
  background: var(--n-code-color);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.article-content :deep(pre) {
  padding: 16px;
  margin: 16px 0;
  background: var(--n-code-color);
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid var(--n-border-color);
}

.article-content :deep(pre code) {
  padding: 0;
  background: none;
  border: none;
}

.article-content :deep(blockquote) {
  padding: 12px 16px;
  margin: 16px 0;
  border-left: 4px solid var(--n-primary-color);
  background: var(--n-color-modal);
  border-radius: 4px;
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 16px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.article-content :deep(a) {
  color: var(--n-primary-color);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.article-content :deep(a:hover) {
  border-bottom-color: var(--n-primary-color);
}

.article-content :deep(ul),
.article-content :deep(ol) {
  padding-left: 24px;
  margin-bottom: 16px;
}

.article-content :deep(li) {
  margin-bottom: 8px;
  line-height: 1.6;
}

.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}

.article-content :deep(th),
.article-content :deep(td) {
  padding: 12px;
  text-align: left;
  border: 1px solid var(--n-border-color);
}

.article-content :deep(th) {
  background: var(--n-color-modal);
  font-weight: 600;
}

.article-content :deep(hr) {
  border: none;
  border-top: 2px solid var(--n-divider-color);
  margin: 32px 0;
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
}

.empty-container {
  padding: 60px 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .article-detail {
    padding: 12px;
  }

  .article-header {
    padding: 20px;
  }

  .article-title {
    font-size: 24px;
  }

  .article-cover {
    height: 250px;
  }

  .article-summary {
    padding: 16px 20px;
    font-size: 14px;
  }

  .article-content {
    padding: 20px;
  }

  .article-content :deep(h1) {
    font-size: 22px;
  }

  .article-content :deep(h2) {
    font-size: 20px;
  }

  .article-content :deep(h3) {
    font-size: 18px;
  }
}
</style>
