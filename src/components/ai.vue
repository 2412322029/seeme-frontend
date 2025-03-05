<template>
    <div id="ai-container" style="max-width: 800px;border: 1px solid #5c5c5c;
    border-radius: 20px;padding: 10px;margin: 5px;" v-html="messageText"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { baseURL } from './api';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
const messageText = ref('');

onMounted(() => {
    try {
        const eventSource = new EventSource(baseURL + '/ai_summary');
        messageText.value += '<p style="margin: 5px;color: aquamarine;"> AI 摘要</p>';
        eventSource.onmessage = (event) => {
            messageText.value += event.data
        };
        eventSource.addEventListener('end', () => {
            // console.log('服务器通知结束连接');
            eventSource.close();
        });
        eventSource.onerror = (error) => {
            // console.error('SSE error:', error);
            eventSource.close();
        };
        window.eventSource = eventSource;
    } catch (e) {
        toast(e.message, {
            "theme": "auto",
            "type": "error",
        });
        messageText.value += `<p style="color: red;">${e.message}</p>`;
        console.log(e);
    }
});

onUnmounted(() => {
    window.eventSource?.close();
    window.eventSource = undefined;
});
</script>