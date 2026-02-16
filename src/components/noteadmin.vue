<template>
  <div class="noteadmin-wrap">
    <n-card title="文章管理" size="small">
      <div class="toolbar">
        <n-space>
          <n-input
            v-model:value="searchKeyword"
            placeholder="搜索文章..."
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
          <n-select
            v-model:value="selectedTag"
            placeholder="筛选标签"
            clearable
            :options="tagOptions"
            style="width: 150px"
            @update:value="handleFilter"
          />
          <n-button type="primary" @click="handleSearch">搜索</n-button>
          <n-button @click="loadArticles">刷新</n-button>
          <n-button @click="goToEditor(null)">新建文章</n-button>
          <n-button @click="handleExport">导出数据库</n-button>
        </n-space>
      </div>
      <n-spin :show="loading">
        <n-data-table
          :columns="columns"
          :data="articles"
          :pagination="pagination"
          :row-key="(row) => row.id"
          striped
          size="small"
        />
      </n-spin>
    </n-card>

    <n-modal v-model:show="showDeleteModal" preset="dialog" title="确认删除">
      <span>确定要删除这篇文章吗？此操作不可恢复。</span>
      <template #action>
        <n-space>
          <n-button @click="showDeleteModal = false">取消</n-button>
          <n-button type="error" @click="confirmDelete" :loading="deleting">
            删除
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import {
  deleteArticle,
  exportDatabase,
  getArticles,
  getTags,
  searchArticles
} from "@/components/api";
import {
  NButton,
  NCard,
  NDataTable,
  NInput,
  NModal,
  NSelect,
  NSpace,
  NSpin,
  useMessage
} from "naive-ui";
import { computed, h, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const message = useMessage();
const loading = ref(false);
const deleting = ref(false);
const showDeleteModal = ref(false);
const articles = ref([]);
const tags = ref([]);
const selectedTag = ref(null);
const searchKeyword = ref("");
const currentArticleId = ref(null);

const pagination = ref({
  page: 1,
  pageSize: 10,
  itemCount: 0,
  showSizePicker: true,
  pageSizes: [10, 20, 50],
  onChange: (page) => {
    pagination.value.page = page;
    loadArticles();
  },
  onUpdatePageSize: (pageSize) => {
    pagination.value.pageSize = pageSize;
    pagination.value.page = 1;
    loadArticles();
  },
});

const tagOptions = computed(() => {
  return tags.value.map((tag) => ({ label: tag, value: tag }));
});

const columns = [
  {
    title: "ID",
    key: "id",
    width: 80,
  },
  {
    title: "标题",
    key: "title",
    width: 200,
    ellipsis: { tooltip: true },
  },
  {
    title: "标签",
    key: "tag",
    width: 120,
    ellipsis: { tooltip: true },
  },
  {
    title: "摘要",
    key: "summary",
    ellipsis: { tooltip: true },
  },
  {
    title: "创建时间",
    key: "created_at",
    width: 180,
    render: (row) => formatDate(row.created_at),
  },
  {
    title: "更新时间",
    key: "updated_at",
    width: 180,
    render: (row) => formatDate(row.updated_at),
  },
  {
    title: "操作",
    key: "actions",
    width: 150,
    render: (row) => {
      return h("div", { style: "display: flex; gap: 8px" }, [
        h(
          NButton,
          {
            size: "small",
            onClick: () => goToEditor(row.id),
          },
          { default: () => "编辑" }
        ),
        h(
          NButton,
          {
            size: "small",
            type: "error",
            onClick: () => openDeleteModal(row.id),
          },
          { default: () => "删除" }
        ),
      ]);
    },
  },
];

async function loadArticles() {
  loading.value = true;
  try {
    const params = {
      limit: pagination.value.pageSize,
      offset: (pagination.value.page - 1) * pagination.value.pageSize,
    };
    if (selectedTag.value) {
      params.tag = selectedTag.value;
    }
    const res = await getArticles(params);
    articles.value = res.articles || [];
  } catch (e) {
    message.error("加载文章列表失败: " + (e.message || String(e)));
  } finally {
    loading.value = false;
  }
}

async function loadTags() {
  try {
    const res = await getTags();
    tags.value = res.tags || [];
  } catch (e) {
    message.error("加载标签失败: " + (e.message || String(e)));
  }
}

function handleSearch() {
  if (searchKeyword.value.trim()) {
    performSearch();
  } else {
    loadArticles();
  }
}

async function performSearch() {
  loading.value = true;
  try {
    const params = {
      keyword: searchKeyword.value,
      limit: pagination.value.pageSize,
      offset: (pagination.value.page - 1) * pagination.value.pageSize,
    };
    const res = await searchArticles(searchKeyword.value, params);
    articles.value = res.articles || [];
  } catch (e) {
    message.error("搜索失败: " + (e.message || String(e)));
  } finally {
    loading.value = false;
  }
}

function handleFilter() {
  pagination.value.page = 1;
  loadArticles();
}

function goToEditor(articleId) {
  if (articleId) {
    router.push(`/admin/article/${articleId}`);
  } else {
    router.push('/admin/article');
  }
}

function openDeleteModal(articleId) {
  currentArticleId.value = articleId;
  showDeleteModal.value = true;
}

async function confirmDelete() {
  deleting.value = true;
  try {
    await deleteArticle(currentArticleId.value);
    message.success("文章删除成功");
    showDeleteModal.value = false;
    loadArticles();
  } catch (e) {
    message.error("删除失败: " + (e.response?.data?.error || e.message || String(e)));
  } finally {
    deleting.value = false;
  }
}

async function handleExport() {
  try {
    const res = await exportDatabase();
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `blog_backup_${new Date().toISOString().slice(0, 10)}.db`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    message.success("数据库导出成功");
  } catch (e) {
    message.error("导出失败: " + (e.message || String(e)));
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

onMounted(() => {
  loadArticles();
  loadTags();
});
</script>

<style scoped>
.noteadmin-wrap {
  padding: 16px;
  overflow-x: auto;
}

.toolbar {
  margin-bottom: 16px;
}

.noteadmin-wrap :deep(.n-data-table) {
  overflow-x: auto;
}

.noteadmin-wrap :deep(.n-data-table-wrapper) {
  overflow-x: auto;
}

.noteadmin-wrap :deep(.n-data-table-base-table) {
  min-width: 1000px;
}
</style>
