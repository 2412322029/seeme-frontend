<template>
  <div class="article-edit-page">
    <div class="page-header">
      <n-space align="center">
        <n-button @click="goBack" quaternary>
          <template #icon>
            <span>←</span>
          </template>
          返回
        </n-button>
        <div class="save-status" :class="{ saved: isSaved, unsaved: !isSaved }">
          <span v-if="!isSaved">未保存</span>
          <span v-else>{{ saveStatusText }}</span>
        </div>
        <n-button type="primary" @click="handleSave" :loading="saving">
          保存文章
        </n-button>
      </n-space>
    </div>

    <article-editor
      ref="editorRef"
      :article-id="articleId"
      :initial-data="initialData"
      :dark-theme="darkTheme"
      @save="handleSaveSuccess"
      @auto-save="handleAutoSave"
    />
  </div>
</template>

<script setup>
import { createArticle, getArticle, updateArticle } from '@/components/api';
import ArticleEditor from '@/components/article-editor.vue';
import { NButton, NSpace, useMessage } from 'naive-ui';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const message = useMessage();

const articleId = computed(() => {
  const id = route.params.id;
  return id ? parseInt(id) : null;
});

const darkTheme = ref(localStorage.getItem('darktheme') === 'true');

const initialData = ref({});
const editorRef = ref(null);
const saving = ref(false);
const isSaved = ref(true);
const lastSaveTime = ref(null);

const saveStatusText = computed(() => {
  if (!lastSaveTime.value) return '已保存';
  const now = new Date();
  const diff = Math.floor((now - lastSaveTime.value) / 1000);
  
  if (diff < 60) return '刚刚保存';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前保存`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前保存`;
  return `${Math.floor(diff / 86400)} 天前保存`;
});

function goBack() {
  if (articleId.value) {
    router.push('/admin');
  } else {
    router.push('/admin');
  }
}

async function loadArticle() {
  if (!articleId.value) return;
  
  try {
    const article = await getArticle(articleId.value);
    initialData.value = {
      title: article.title || '',
      tag: article.tag || '',
      content: article.content || '',
      summary: article.summary || '',
      cover_url: article.cover_url || '',
    };
  } catch (e) {
    message.error('加载文章失败: ' + (e.message || String(e)));
  }
}

async function handleSave() {
  saving.value = true;
  try {
    const formData = await editorRef.value?.getFormData();
    
    if (articleId.value) {
      await updateArticle(articleId.value, formData);
      message.success('文章更新成功');
    } else {
      const result = await createArticle(formData);
      message.success('文章创建成功');
      if (result.id) {
        router.push(`/admin/article/${result.id}`);
      }
    }
    
    clearDraft();
    isSaved.value = true;
    lastSaveTime.value = new Date();
  } catch (e) {
    message.error('保存失败: ' + (e.message || String(e)));
  } finally {
    saving.value = false;
  }
}

function clearDraft() {
  const draftKey = articleId.value ? `draft_${articleId.value}` : 'draft_new';
  localStorage.removeItem(draftKey);
}

function handleSaveSuccess() {
  isSaved.value = true;
  lastSaveTime.value = new Date();
}

function handleAutoSave() {
  isSaved.value = false;
  lastSaveTime.value = new Date();
}

onMounted(() => {
  loadArticle();
  
  window.addEventListener('storage', (e) => {
    if (e.key === 'darktheme') {
      darkTheme.value = e.newValue === 'true';
    }
  });
});
</script>

<style scoped>
.article-edit-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--n-color);
  padding: 16px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--n-divider-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.save-status {
  flex: 1;
  text-align: center;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.save-status.unsaved {
  color: #f0a020;
  background: rgba(240, 160, 32, 0.1);
}

.save-status.saved {
  color: #18a058;
  background: rgba(24, 160, 88, 0.1);
}
</style>
