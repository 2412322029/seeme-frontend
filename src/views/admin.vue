<template>
  <div style="margin: 10px;">
	<!-- 顶部工具栏 -->
	<div class="admin-toolbar">
		<div class="toolbar-left">Admin 控制台</div>
		<div class="toolbar-right">
			<n-space>
				<n-button size="small" @click="checkAuth" secondary>刷新状态</n-button>
				<n-button size="small" @click="logout" tertiary>登出</n-button>
			</n-space>
		</div>
	</div>

	<div class="admin-body">
		<n-spin v-if="loading" size="large" style="width:100%;display:flex;justify-content:center;padding:24px 0" />

		<!-- 未认证：居中显示登录组件 -->
		<div v-else-if="!isAuthenticated" class="auth-wrap">
			<n-card size="large" style="max-width:720px;width:100%;">
				<template #header>
					<div style="font-weight:600">请先登录</div>
				</template>
				<auth @auth-success="onAuthSuccess" />
			</n-card>
			<n-alert v-if="error" type="error" :title="error" style="margin-top:12px; max-width:720px" />
		</div>

		<!-- 已认证：使用标签页显示各个面板 -->
		<div v-else>
			<n-tabs v-model:value="activeTab" type="line" size="large">
				<n-tab-pane name="redis" tab="Redis">
					<div style="padding:8px 0"><redis /></div>
				</n-tab-pane>
				<n-tab-pane name="logs" tab="Logs">
					<div style="padding:8px 0"><Log /></div>
				</n-tab-pane>
        <n-tab-pane name="gdmap" tab="高德地图">
          <div style="padding:8px 0"><gdmap /></div>
        </n-tab-pane>
			</n-tabs>
		</div>
	</div>
  </div>

</template>

<script setup>
import { isauth } from '@/components/api';
import auth from '@/components/auth.vue';
import gdmap from '@/components/gdmap.vue';
import Log from '@/components/logs.vue';
import redis from '@/components/redis.vue';
import { NAlert, NButton, NCard, NSpace, NSpin, NTabPane, NTabs } from 'naive-ui';
import { onMounted, ref, watch } from 'vue';

const isAuthenticated = ref(false);
const loading = ref(true);
const error = ref('');

// 标签页当前激活项
const activeTab = ref('redis');

/* 解析 hash 支持多种写法：#redis、#logs、#tab=redis、#tab=logs */
function parseHashTab() {
  try {
    const h = (window.location.hash || '').replace(/^#/, '');
    if (!h) return null;
    // 支持 tab=xxx
    const m = h.match(/(?:tab=)?(.+)/);
    if (m && m[1]) {
      const t = m[1].toString().toLowerCase();
      return t;
    }
  } catch (_) {}
  return null;
}

/* 同步 activeTab 到 location.hash（采用 tab=xxx 形式） */
watch(activeTab, (v) => {
  try {
    if (v) {
      const newHash = `tab=${v}`;
      // 仅在不同的时候写入，避免触发多次历史记录
      if (window.location.hash.replace(/^#/, '') !== newHash) {
        window.history.replaceState(null, '', `#${newHash}`);
      }
    }
  } catch (_) {}
});

/* 初始化：检查 hash 并设置 activeTab */
onMounted(() => {
  checkAuth();
  const t = parseHashTab();
  if (t) activeTab.value = t;
});

async function checkAuth() {
  loading.value = true;
  error.value = '';
  try {
    const res = await isauth();
    if (res && (res.status === 'success' || res.auth === true || res.authenticated === true)) {
      isAuthenticated.value = true;
    } else {
      isAuthenticated.value = false;
    }
  } catch (e) {
    isAuthenticated.value = false;
    error.value = e?.message || String(e) || '认证检查失败';
  } finally {
    loading.value = false;
  }
}

function onAuthSuccess() {
  isAuthenticated.value = true;
  error.value = '';
}

function logout() {
  try {
    localStorage.removeItem('admin_api_key');
  } catch (_) {}
  isAuthenticated.value = false;
}
</script>

<style scoped>
.admin-toolbar {
  display:flex;
  justify-content:space-between;
  align-items:center;
  width:100%;
  max-width:1100px;
  margin: 12px auto;
  padding: 6px 12px;
  box-sizing:border-box;
}
.toolbar-left { font-weight:700; font-size:16px; }
.toolbar-right { display:flex; align-items:center; gap:8px; }

.admin-body {
  max-width:1100px;
  margin: 8px auto 60px;
  padding: 8px;
  box-sizing: border-box;
  width: 100%;
}

/* 登录居中区域 */
.auth-wrap {
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:12px;
  padding: 12px;
}

/* 已认证面板：左右两列，响应式 */
.panel-wrap {
  display:flex;
  gap:16px;
  align-items:flex-start;
  width:100%;
  box-sizing:border-box;
}
.panel-left { flex:2 1 680px; min-width:320px; }
.panel-right { flex:1 1 360px; min-width:300px; }

/* 小屏幕时堆叠 */
@media (max-width: 900px) {
  .panel-wrap { flex-direction:column; }
  .admin-toolbar, .admin-body { padding:8px 12px; }
}
</style>