<template>
  <div class="home">
    <div class="home-container">
      <div class="home-content">
        <p>本项目包含若干页面，简要说明如下：</p>
        <ul>
          <li v-for="r in $router
            .getRoutes()
            .filter((rt) => rt.path && rt.meta?.show == true)" :key="r.path">
            <strong><a :href="r.path">{{ r.meta?.title || r.name || r.path }}</a></strong>
            <span v-if="r.meta?.description">：{{ r.meta.description }}</span>
            <p v-if="r.meta?.summary" v-html="r.meta.summary"></p>
          </li>
        </ul>
        <!-- <div class="todo-description">
          <h2>待办事项</h2>
          <ul>
            <li>显示steam在线情况（已完成）</li>
            <li>report命令行->gui（已完成部分功能）</li>
            <li>应用时间统计（已完成基本功能）</li>
            <li>定时上传统计数据库（未完成）</li>
            <li>服务端应用时间统计接口（未完成）</li>
            <li>前端表格统计（未完成）</li>
          </ul>
        </div> -->
      </div>
      <Message></Message>
    </div>
  </div>
</template>

<script setup>
import Message from '@/components/message.vue';
</script>

<style scoped>
.home {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.content img {
  max-width: 50% !important;
  height: auto;
}

.home-container {
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

h1 {
  font-size: 2em;
  margin-bottom: 10px;
}

h2 {
  font-size: 1.5em;
  margin-top: 30px;
  margin-bottom: 10px;
}

h3 {
  font-size: 1.2em;
  margin-top: 20px;
  margin-bottom: 10px;
}

p {
  line-height: 1.6;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

th,
td {
  padding: 8px;
  text-align: left;
}

.code-block {
  padding: 10px;
  padding-left: 0px;
  border-radius: 4px;
  font-family: monospace;
}

ul {
  list-style-type: disc;
  padding-left: 20px;
}
</style>
