<template>
  <div class="home">
    <div class="home-container">
      <n-card class="home-card" title="项目导航" bordered>
        <div class="home-content">
          <n-table class="route-table" :bordered="true" :stripe="true" :hoverable="true">
            <thead>
              <tr>
                <th>页面名称</th>
                <th>页面描述</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in $router.getRoutes().filter(rt => rt.path && rt.meta?.show === true)" :key="r.path">
                <td>
                  <n-button 
                    tag="a" 
                    :href="r.path.replace(/:\w+\??/g, '').replace(`//`, `/`)"
                    :title="r.meta?.description"
                    text 
                    type="primary"
                    size="small"
                    style="font-weight: bold;"
                  >
                    {{ r.meta?.title || r.name || r.path }}
                  </n-button>
                </td>
                <td v-html="r.meta?.summary || '—'" class="description-cell"></td>
              </tr>
            </tbody>
          </n-table>
          
          <!-- 恢复并美化待办事项部分 -->
          <div class="todo-description">
            <h2>项目进度</h2>
            <n-timeline>
              <n-timeline-item v-for="(item, index) in todoItems" :key="index" 
                :type="item.status === 'completed' ? 'success' : 'default'"
                :title="item.text"
              >
                <span v-if="item.status === 'completed'" class="status-badge completed">已完成</span>
                <span v-else class="status-badge pending">进行中</span>
              </n-timeline-item>
            </n-timeline>
          </div>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup>
import { NButton, NCard, NTable, NTimeline, NTimelineItem } from 'naive-ui';

// 待办事项数据
const todoItems = [
  { text: '显示steam在线情况', status: 'completed' },
  { text: 'report命令行->gui', status: 'completed' },
  { text: '应用时间统计', status: 'completed' },
  { text: '定时上传统计数据库', status: 'pending' },
  { text: '服务端应用时间统计接口', status: 'pending' },
  { text: '前端表格统计', status: 'pending' }
];
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.home-container {
  border-radius: 8px;
}

.home-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.home-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.home-content {
  padding: 0;
}

.intro-text {
  margin-bottom: 20px;
  font-size: 16px;
  line-height: 1.6;
  color: var(--n-secondary-text-color);
}

.route-table {
  margin-bottom: 30px;
}

.route-table th {
  background-color: var(--n-primary-color-light-5);
  font-weight: bold;
  color: var(--n-primary-color);
}

.route-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--n-divider-color);
}

.description-cell {
  line-height: 1.5;
  color: var(--n-secondary-text-color);
  max-width: 600px;
}

.todo-description {
  margin-top: 30px;
}

.todo-description h2 {
  font-size: 1.5em;
  margin-bottom: 20px;
  color: var(--n-primary-text-color);
  padding-bottom: 8px;
  border-bottom: 2px solid var(--n-primary-color-light-4);
}

.n-timeline {
  margin-left: 10px;
}

.status-badge {
  margin-left: 10px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.status-badge.completed {
  background-color: var(--n-success-color-light-4);
  color: var(--n-success-color);
}

.status-badge.pending {
  background-color: var(--n-warning-color-light-4);
  color: var(--n-warning-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .home {
    padding: 10px;
  }
  
  .route-table td {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .n-button {
    padding: 4px 8px;
    font-size: 14px;
  }
  
  .todo-description {
    margin-top: 20px;
  }
}
</style>