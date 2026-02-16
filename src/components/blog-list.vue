<template>
  <div class="blog-list">
    <div v-if="loading" class="loading-container">
      <n-spin size="large" />
      <p class="loading-text">加载中...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <n-result status="error" title="加载失败" :description="error" />
      <n-button type="primary" @click="loadArticles">重试</n-button>
    </div>

    <div v-else-if="articles.length === 0" class="empty-container">
      <n-empty description="暂无文章" />
    </div>

    <template v-else>
      <div class="blog-grid">
        <div
          v-for="article in articles"
          :key="article.id"
          class="blog-card"
          @click="goToArticle(article.id)"
        >
          <div v-if="article.cover_url" class="card-cover">
            <img :src="article.cover_url" :alt="article.title" />
          </div>
          <div class="card-content">
            <div class="card-meta">
              <n-tag v-if="article.tag" type="info" size="small">
                {{ article.tag }}
              </n-tag>
              <span class="card-date">{{ formatDate(article.created_at) }}</span>
            </div>
            <h3 class="card-title">{{ article.title }}</h3>
            <p v-if="article.summary" class="card-summary">
              {{ article.summary }}
            </p>
            <div class="card-footer">
              <span class="card-views">
                <n-icon :component="EyeRegular" />
                {{ article.views || 0 }} 次阅读
              </span>
              <span class="card-more">阅读更多 →</span>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination-container">
        <n-pagination
          v-model:page="currentPage"
          :page-size="pageSize"
          :item-count="totalItems"
          show-size-picker
          :page-sizes="[6, 12, 18, 24]"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { NButton, NEmpty, NIcon, NPagination, NResult, NSpin, NTag, useMessage } from 'naive-ui';
import { EyeRegular } from '@vicons/fa';
import { getArticles } from '@/components/api';

const router = useRouter();
const message = useMessage();

const articles = ref([]);
const loading = ref(false);
const error = ref('');
const currentPage = ref(1);
const pageSize = ref(12);
const totalItems = ref(0);

const totalPages = computed(() => {
  return Math.ceil(totalItems.value / pageSize.value);
});

async function loadArticles() {
  loading.value = true;
  error.value = '';
  try {
    const params = {
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value,
    };
    const res = await getArticles(params);
    articles.value = res.articles || [];
    totalItems.value = res.total || articles.value.length;
  } catch (e) {
    error.value = e.message || '加载文章列表失败';
    message.error(error.value);
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page) {
  currentPage.value = page;
  loadArticles();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handlePageSizeChange(size) {
  pageSize.value = size;
  currentPage.value = 1;
  loadArticles();
}

function goToArticle(articleId) {
  router.push(`/blog/${articleId}`);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  if (diff < 86400) {
    return `${month}-${day}`;
  } else if (diff < 2592000) {
    return `${year}-${month}-${day}`;
  } else {
    return `${year}-${month}-${day}`;
  }
}

onMounted(() => {
  loadArticles();
});
</script>

<style scoped>
.blog-list {
  padding: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-text {
  margin-top: 20px;
  color: var(--n-text-color-3);
  font-size: 14px;
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

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.blog-card {
  background: var(--n-color);
  border: 1px solid var(--n-border-color);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.blog-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: var(--n-primary-color);
}

.card-cover {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: var(--n-color-modal);
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.blog-card:hover .card-cover img {
  transform: scale(1.05);
}

.card-content {
  padding: 20px;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;
}

.card-date {
  color: var(--n-text-color-3);
  font-size: 13px;
}

.card-title {
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
  color: var(--n-text-color);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-summary {
  margin: 0 0 16px;
  color: var(--n-text-color-2);
  font-size: 14px;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--n-divider-color);
  margin-top: 16px;
}

.card-views {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--n-text-color-3);
  font-size: 13px;
}

.card-more {
  color: var(--n-primary-color);
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.blog-card:hover .card-more {
  color: var(--n-primary-color-hover);
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 32px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .blog-list {
    padding: 12px;
  }

  .blog-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .blog-card {
    border-radius: 8px;
  }

  .card-cover {
    height: 160px;
  }

  .card-content {
    padding: 16px;
  }

  .card-title {
    font-size: 16px;
  }

  .card-summary {
    font-size: 13px;
    -webkit-line-clamp: 2;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .blog-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) and (max-width: 1440px) {
  .blog-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1441px) {
  .blog-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
