<template>
    <div class="not-found">
        <h1>404 - 页面未找到</h1>
        <p>抱歉，您访问的页面不存在。</p>
        <router-link to="/">返回首页</router-link>
    </div>
    <n-global-style />
</template>
<script setup>
import { NGlobalStyle } from 'naive-ui';
import { RouterLink } from 'vue-router';
</script>
<style scoped>
.not-found {
    text-align: center;
    margin-top: 50px;
}
</style>