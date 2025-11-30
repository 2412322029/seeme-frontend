<script setup>
import { NButton, NCard, NInput } from 'naive-ui';
import { ref } from 'vue';
const api_key = ref(localStorage.getItem('admin_api_key') || '');
const emit = defineEmits(['auth-success', 'authSuccess']);

const save_key = () => {
    if (!api_key.value.trim()) {
        alert('请输入有效的 API Key');
        return;
    }
    localStorage.setItem('admin_api_key', api_key.value.trim());
    // 触发事件通知父组件，避免刷新页面
    emit('auth-success');
    emit('authSuccess');
};
</script>

<template>
    <n-card title="管理员认证" size="small" style="max-width: 400px; margin: 20px auto;">
        <div style="display: flex; flex-direction: column; gap: 12px;">
            <n-input 
                v-model:value="api_key" 
                type="password" 
                placeholder="请输入管理员 API Key"
                @keyup.enter="save_key"
            />
            <n-button type="primary" @click="save_key" block>保存并认证</n-button>
        </div>
    </n-card>
</template>