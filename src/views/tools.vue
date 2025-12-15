<template>
  <div class="tools-container">
    <!-- 如果有工具ID参数，则显示对应的工具组件 -->
    <!-- 面包屑导航 -->
    <div v-if="currentToolId" class="breadcrumb-section">
      <n-breadcrumb>
        <n-breadcrumb-item @click="router.push('/tools')">
          工具列表
        </n-breadcrumb-item>
        <n-breadcrumb-item>
          {{ currentTool?.title || '工具' }}
        </n-breadcrumb-item>
      </n-breadcrumb>
    </div>
    
    <div v-if="currentToolId">
      <n-card :title="currentTool?.title || '工具'" class="main-card">
        <component :is="currentToolComponent"></component>
      </n-card>
    </div>
    <!-- 否则显示工具列表 -->
    <n-card v-else title="工具列表" class="main-card">
      <n-space vertical :size="24">
        <!-- 搜索框 -->
        <div class="search-section">
          <n-input v-model:value="searchQuery" placeholder="搜索工具..." round clearable>
            <template #prefix>
              <n-icon :component="Search" />
            </template>
          </n-input>
        </div>
        <!-- 工具列表 -->
        <div class="tool-list">
          <n-card v-for="tool in filteredTools" :key="tool.name" :title="tool.title" size="large" class="tool-card"
            hoverable @click="navigateToTool(tool.name)">
            <template #header-extra>
              <n-icon :component="tool.icon" :size="32" />
            </template>
            <div class="tool-description">{{ tool.description }}</div>
          </n-card>
        </div>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { Search, Toolbox } from '@vicons/fa';
import { NBreadcrumb, NBreadcrumbItem, NCard, NIcon, NInput, NSpace } from 'naive-ui';
import AgvTool from './tools/agv.vue';

import { computed, ref, shallowRef  } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

const searchQuery = ref('');

const tools = shallowRef([
  {
    name: 'agv',
    title: 'AGV-EQ协议解析工具',
    description: '用于解析AGV设备的通信协议数据，查看设备状态和端口信息。',
    component: AgvTool,
    icon: Toolbox
  }
  // 可以在此处添加更多工具
]);

const currentToolId = computed(() => route.params.id);
const currentTool = computed(() => tools.value.find(tool => tool.name === currentToolId.value));
const currentToolComponent = computed(() => currentTool.value?.component);

const filteredTools = computed(() => {
  if (!searchQuery.value) {
    return tools.value;
  }
  const query = searchQuery.value.toLowerCase();
  return tools.value.filter(tool =>
    tool.title.toLowerCase().includes(query) ||
    tool.description.toLowerCase().includes(query)
  );
});

const navigateToTool = (toolName) => {
  router.push(`/tools/${toolName}`);
};
</script>

<style scoped>
.tools-container {
  padding: 20px;
}

.main-card {
  max-width: 1200px;
  margin: 0 auto;
}

.search-section {
  margin-bottom: 16px;
}

.tool-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.tool-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.tool-card:hover {
  transform: translateY(-5px);
}

.tool-description {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

.breadcrumb-section {
  margin-bottom: 20px;
  padding: 0 20px;
  max-width: 1200px;
  margin: 0 auto 20px;
}
</style>