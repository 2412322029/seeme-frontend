<template>
    <div class="page">
        <h2 style="text-align: center;"> {{ result?.metadata?.content?.title || '' }}</h2>
        <p style="text-align: center;"> {{ result?.metadata?.content?.date_published }}</p>
        <div v-if="result?.metadata?.content?.content" v-html="md.render(result?.metadata?.content?.content || '')">
        </div>
        <div v-else>
            <p>{{ result?.metadata?.content?.summary }}</p>
            <img :src="result?.metadata?.content?.attachments[0]?.address" style="width: 300px;" alt="">
            <div v-for="i in result?.metadata?.content?.external_urls" :key="i">
                <a :href="i" target="_blank">{{ i }}</a>
            </div>
        </div>
    </div>
</template>
<script setup>
import { imgSize } from '@mdit/plugin-img-size';
import { createIndexer } from 'crossbell';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import powershell from 'highlight.js/lib/languages/powershell';
import python from 'highlight.js/lib/languages/python';
import 'highlight.js/styles/github-dark.css'; // 加载样式
import markdownit from 'markdown-it';
import mditjs from "markdown-it-highlightjs/core";
import { ref } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("powershell", powershell);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("python", python);


const route = useRoute(); // 获取当前路由对象
const router = useRouter(); // 获取路由实例
const nodeid = ref(route.params.id || '');

const result = ref('')
const md = markdownit({
    html: true,
    linkify: true,
    breaks: true,
    typographer: true,
}).use(imgSize).use(mditjs, {
    hljs,
});
const indexer = createIndexer()
indexer.note.get("50877", nodeid.value).then(res => {
    result.value = res
})
onBeforeRouteUpdate((to, from, next) => {
    nodeid.value = to.params.address || '';
    next();
});

</script>
<style scoped>
.page {
    /* text-align: center; */
    max-width: 800px;
}

h1 {
    font-size: 2em;
    color: #42b983;
}

p {
    font-size: 1.2em;
}
</style>