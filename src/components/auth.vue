<script setup>
import { NButton, NInput } from 'naive-ui';
import { ref } from 'vue';
const api_key = ref(localStorage.getItem('admin_api_key') || '');
const save_key = () => {
    localStorage.setItem('admin_api_key', api_key.value);
    window.location.reload();
};
const emit = defineEmits(['auth-success', 'authSuccess']);
</script>

<template>
    <NInput v-model:value="api_key" type="password" placeholder="请输入管理员 API Key" style="width: 300px; margin: 20px;" />
    <NButton type="primary" @click="save_key" style="margin: 20px;">保存</NButton>
</template>