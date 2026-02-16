<template>
  <div class="article-editor">
    <div class="editor-container">
      <div class="editor-form">
        <n-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-placement="left"
          label-width="80px"
        >
          <n-form-item label="标题" path="title">
            <n-input
              v-model:value="formData.title"
              placeholder="请输入文章标题"
              maxlength="200"
              show-count
              @input="handleInput"
            />
          </n-form-item>
          <n-form-item label="标签" path="tag">
            <n-input
              v-model:value="formData.tag"
              placeholder="请输入标签"
              @input="handleInput"
            />
          </n-form-item>
          <n-form-item label="封面URL" path="cover_url">
            <n-input
              v-model:value="formData.cover_url"
              placeholder="请输入封面图片URL（可选）"
              @input="handleInput"
            />
          </n-form-item>
          <n-form-item label="摘要" path="summary">
            <n-input
              v-model:value="formData.summary"
              type="textarea"
              placeholder="请输入文章摘要（可选）"
              :rows="3"
              @input="handleInput"
            />
          </n-form-item>
          <n-form-item label="内容" path="content">
            <div ref="vditorRef" class="vditor-container"></div>
          </n-form-item>
        </n-form>
      </div>
    </div>

    <n-modal v-model:show="showPreview" preset="card" title="文章预览" style="width: 900px">
      <div class="preview-content">
        <h1>{{ formData.title }}</h1>
        <div class="meta-info">
          <n-tag v-if="formData.tag" type="info">{{ formData.tag }}</n-tag>
          <span class="time">{{ formatDate(new Date()) }}</span>
        </div>
        <div v-if="formData.cover_url" class="cover-image">
          <img :src="formData.cover_url" alt="封面" />
        </div>
        <div v-if="formData.summary" class="summary">
          {{ formData.summary }}
        </div>
        <div class="content" v-html="previewContent"></div>
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showPreview = false">关闭</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import MarkdownIt from "markdown-it";
import {
  NButton,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSpace,
  NTag,
  useMessage
} from "naive-ui";
import Vditor from "vditor";
import "vditor/dist/index.css";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps({
  articleId: {
    type: Number,
    default: null
  },
  initialData: {
    type: Object,
    default: () => ({})
  },
  darkTheme: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['save', 'auto-save']);

const message = useMessage();
const formRef = ref(null);
const vditorRef = ref(null);
const showPreview = ref(false);
let vditor = null;
let md = null;
let autoSaveTimer = null;

const formData = ref({
  title: "",
  tag: "",
  content: "",
  summary: "",
  cover_url: "",
});

const rules = {
  title: [
    { required: true, message: "请输入标题", trigger: "blur" },
    { type: "string", min: 1, max: 200, message: "标题长度为 1-200 个字符", trigger: "blur" }
  ],
  tag: { required: true, message: "请输入标签", trigger: "blur" },
  content: { required: true, message: "请输入内容", trigger: "blur" },
};

const content = computed(() => formData.value.content);

const previewContent = computed(() => {
  if (!md) return '';
  return md.render(formData.value.content || '');
});

function initVditor() {
  if (!vditorRef.value) return;
  
  const theme = props.darkTheme ? 'dark' : 'classic';
  
  vditor = new Vditor(vditorRef.value, {
    height: 500,
    placeholder: "请输入文章内容...",
    theme: theme,
    icon: "ant",
    cache: {
      enable: false,
    },
    value: formData.value.content || "",
    after: () => {
      if (formData.value.content) {
        vditor.setValue(formData.value.content);
      }
    },
    input: (value) => {
      formData.value.content = value;
      handleInput();
    },
  });
}

function initMarkdownIt() {
  md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
  });
}

function handleInput() {
  debouncedAutoSave();
}

function debouncedAutoSave() {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
  autoSaveTimer = setTimeout(() => {
    autoSaveDraft();
  }, 3000);
}

function autoSaveDraft() {
  const draftKey = props.articleId ? `draft_${props.articleId}` : 'draft_new';
  const draftData = {
    title: formData.value.title,
    tag: formData.value.tag,
    content: formData.value.content,
    summary: formData.value.summary,
    cover_url: formData.value.cover_url,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(draftKey, JSON.stringify(draftData));
  emit('auto-save', draftData);
}

function handleSave() {
  return new Promise((resolve, reject) => {
    formRef.value?.validate((errors) => {
      if (errors) {
        reject(new Error('表单验证失败'));
        return;
      }

      if (vditor) {
        formData.value.content = vditor.getValue();
      }

      if (!formData.value.content || formData.value.content.trim() === "") {
        message.error("请输入内容");
        reject(new Error('内容为空'));
        return;
      }

      resolve(formData.value);
    });
  });
}

function clearDraft() {
  const draftKey = props.articleId ? `draft_${props.articleId}` : 'draft_new';
  localStorage.removeItem(draftKey);
}

function handlePreview() {
  if (vditor) {
    formData.value.content = vditor.getValue();
  }
  showPreview.value = true;
}

function handleThemeChange() {
  if (vditor) {
    const theme = props.darkTheme ? 'dark' : 'classic';
    vditor.setTheme(theme);
  }
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

watch(() => props.initialData, (newData) => {
  if (newData && Object.keys(newData).length > 0) {
    formData.value = {
      title: newData.title || "",
      tag: newData.tag || "",
      content: newData.content || "",
      summary: newData.summary || "",
      cover_url: newData.cover_url || "",
    };
    nextTick(() => {
      if (vditor) {
        vditor.setValue(formData.value.content);
      }
    });
  }
}, { immediate: true });

watch(() => props.darkTheme, () => {
  handleThemeChange();
});

onMounted(() => {
  initMarkdownIt();
  initVditor();
});

onUnmounted(() => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }
  if (vditor) {
    vditor.destroy();
    vditor = null;
  }
});

defineExpose({
  handleSave,
  getFormData: () => formData.value,
  setFormData: (data) => {
    formData.value = { ...formData.value, ...data };
    if (vditor && data.content) {
      vditor.setValue(data.content);
    }
  }
});
</script>

<style scoped>
.article-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: var(--n-color);
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
}

.editor-form {
  max-width: 100%;
}

.vditor-container {
  width: 100%;
  min-height: 500px;
}

.preview-content {
  padding: 20px;
  line-height: 1.8;
}

.preview-content h1 {
  font-size: 28px;
  margin-bottom: 16px;
  color: var(--n-text-color);
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--n-divider-color);
}

.time {
  color: var(--n-text-color-3);
  font-size: 14px;
}

.cover-image {
  margin: 20px 0;
  text-align: center;
}

.cover-image img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.summary {
  padding: 16px;
  margin: 20px 0;
  background: var(--n-color-modal);
  border-left: 4px solid var(--n-primary-color);
  border-radius: 4px;
  font-style: italic;
}

.content {
  margin-top: 20px;
}

.content :deep(h1),
.content :deep(h2),
.content :deep(h3) {
  margin-top: 24px;
  margin-bottom: 16px;
  color: var(--n-text-color);
}

.content :deep(p) {
  margin-bottom: 16px;
  line-height: 1.8;
}

.content :deep(code) {
  padding: 2px 6px;
  background: var(--n-code-color);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.content :deep(pre) {
  padding: 16px;
  margin: 16px 0;
  background: var(--n-code-color);
  border-radius: 8px;
  overflow-x: auto;
}

.content :deep(blockquote) {
  padding: 12px 16px;
  margin: 16px 0;
  border-left: 4px solid var(--n-primary-color);
  background: var(--n-color-modal);
}

.content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}

.content :deep(a) {
  color: var(--n-primary-color);
  text-decoration: none;
}

.content :deep(a:hover) {
  text-decoration: underline;
}
</style>
