<template>
    <div class="start-page">
        <div v-for="item in result.list" :key="item.id" class="onepart"
            style="cursor: pointer;transition: background-color .18s; border-radius: 6px;"
            @mouseover="$event.currentTarget.style.backgroundColor = 'rgb(41 149 126 /20%)'"
            @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'">
            <router-link :to="{ name: 'page', params: { id: item.noteId } }"
                style="text-decoration: none; color: inherit; display: contents;">
                <h2
                    style="margin: 5px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: background-color .18s, color .18s;">
                    {{ item.metadata.content.title }}
                </h2>
                <div style="width:100%; padding-top:56.25%; position:relative; border-radius:6px; overflow:hidden;">
                    <div v-if="item.metadata.content?.cover" :style="{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'url(' + ipfsToCrossbell(item.metadata.content.cover) + ')',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }"></div>

                    <div v-else
                        style="position:absolute; top:0; left:0; right:0; bottom:0; display:flex; align-items:center; justify-content:center; padding:8px; text-align:center;">
                        <span style="font-size:20px; word-break:break-word;">No Cover</span>
                    </div>
                </div>
                <span style="color: grey;font-size: small;">{{ formatDate(item.createdAt) }}</span>
                <!-- <a :href="'https://xlog.not404.cc/' + item.metadata.content.slug" target="_blank">原文</a> -->
                <span
                    style="float: right;display: flex;flex-direction: row;align-items: center;color: gray;font-size: 12px;">
                    <span
                        style="display: flex;flex-direction: row;justify-content: center;align-items: center;margin: 5px;">
                        <component :is="EyeRegular" style="width: 12px; margin-right: 7px;" />
                        {{ item.stat.viewDetailCount }}
                    </span>
                    <span
                        style="display: flex;flex-direction: row;justify-content: center;align-items: center;margin: 5px;">
                        <component :is="CommentRegular" style="width: 12px; margin-right: 7px;" />
                        {{ item.stat.commentsCount }}
                    </span>
                    <span
                        style="display: flex;flex-direction: row;justify-content: center;align-items: center;margin: 5px;">
                        <component :is="HeartRegular" style="width: 12px; margin-right: 7px;" />
                        {{ item.stat.likesCount }}
                    </span>
                </span>
                <p v-html="md.render(item.metadata.content.summary)"
                    style="word-wrap:break-word;font-size:small;display:-webkit-box;line-clamp:3;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;text-overflow:ellipsis;">
                </p>
            </router-link>
        </div>
        <div v-if="err">
            <ERROR :msg="err" title="fetch error occurred" />
        </div>
        <div v-else style="text-align: center; width: 100%; margin-top: 50px;">
            加载中...
        </div>
    </div>
</template>

<script setup>
import { CommentRegular, EyeRegular, HeartRegular } from '@vicons/fa';
import markdownit from 'markdown-it';
import { onMounted, ref } from 'vue';
import { formatDate, getxlog, ipfsToCrossbell } from './api';
import ERROR from './error.vue';
const md = markdownit()
const result = ref('')
const err = ref("")
onMounted(async () => {
    const res = await getxlog()
    if (res.status !== 200) {
        err.value = res
        console.log(err.value)
    } else {
        result.value = res.data
    }
})
</script>

<style scoped>
.start-page {
    /* text-align: center; */
    max-width: 800px;
    margin: 10PX;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

a:hover {
    background-color: transparent !important;
}

.onepart {
    border: 1px solid rgb(39, 39, 42);
    border-radius: 10px;
    overflow: auto;
    width: 45%;
    padding: 10px;
    margin: 5px;
}

/* 窄屏时每个条目占满一行（左右保留 margin） */
@media (max-width: 700px) {
    .onepart {
        width: calc(100% - 20px);
    }
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