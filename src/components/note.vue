<template>
    <div class="start-page">
        <div v-for="item in result.list" :key="item.id" style="border-bottom: 1px solid rgb(39, 39, 42);overflow: auto;">
            <h2>
                <router-link :to="{ name: 'page', params: { id: item.noteId } }">
                    {{ item.metadata.content.title }}
                </router-link>
            </h2>
            <span style="color: grey;font-size: small;">{{ formatDate(item.createdAt) }}</span>
            <!-- <a :href="'https://xlog.not404.cc/' + item.metadata.content.slug" target="_blank">原文</a> -->
            <span style="float: right;display: flex;flex-direction: row;align-items: center;color: gray;font-size: 12px;">
                <span style="display: flex;flex-direction: row;justify-content: center;align-items: center;margin: 5px;">
                    <component :is="EyeRegular" style="width: 12px; margin-right: 7px;" />
                    {{ item.stat.viewDetailCount }}
                </span>
                <span style="display: flex;flex-direction: row;justify-content: center;align-items: center;margin: 5px;">
                    <component :is="CommentRegular" style="width: 12px; margin-right: 7px;" />
                    {{ item.stat.commentsCount }}
                </span>
                <span style="display: flex;flex-direction: row;justify-content: center;align-items: center;margin: 5px;">
                    <component :is="HeartRegular" style="width: 12px; margin-right: 7px;" />
                    {{ item.stat.likesCount }}
                </span>
            </span>
            <p v-html="md.render(item.metadata.content.summary)" style="word-wrap: break-word;font-size: small;"></p>
            
        </div>
    </div>
</template>

<script setup>
import { CommentRegular, EyeRegular, HeartRegular } from '@vicons/fa';

import markdownit from 'markdown-it';
import { onMounted, ref } from 'vue';
import { formatDate, getxlog } from './api';
const md = markdownit()
const result = ref('')
onMounted(async () => {
    const res = await getxlog()
    result.value = res
    console.log(res)
})
</script>

<style scoped>
.start-page {
    /* text-align: center; */
    max-width: 800px;
    margin: 20PX;
}

h1 {
    font-size: 2em;
    color: #42b983;
}

p {
    font-size: 1.2em;
}

img {
    width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
}
</style>