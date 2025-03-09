<template>
    <div class="start-page">
        <div v-for="item in result.list" :key="item.id">
            <h1>
                <router-link :to="{ name: 'page', params: { id: item.noteId } }">
                    {{ item.metadata.content.title }}
                </router-link>
            </h1>
            <p v-html="md.render(item.metadata.content.summary)"></p>
            <hr>
        </div>
    </div>
</template>

<script setup>
import markdownit from 'markdown-it';
import { onMounted, ref } from 'vue';
import { getxlog } from './api';
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
}

h1 {
    font-size: 2em;
    color: #42b983;
}

p {
    font-size: 1.2em;
}
img{
    width: 100%;
    height: auto;
    display: block;
    margin: 0 auto;
}
</style>