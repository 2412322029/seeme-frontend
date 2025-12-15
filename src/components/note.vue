<template>
    <div class="start-page">
        <n-card
            v-for="item in result.list"
            :key="item.id"
            class="note-card"
            hoverable
            bordered
            size="small"
        >
            <router-link :to="{ name: 'page', params: { id: item.noteId } }" class="note-link">
                <h2 class="note-title">{{ item.metadata.content.title }}</h2>
                <div class="note-cover">
                    <div v-if="item.metadata.content?.cover" class="note-image" :style="{
                        backgroundImage: 'url(' + ipfsToCrossbell(item.metadata.content.cover) + ')' 
                    }"></div>
                    <div v-else class="note-no-cover">
                        <span class="no-cover-text">No Cover</span>
                    </div>
                </div>
                <div class="note-meta">
                    <span class="note-date">{{ formatDate(item.createdAt) }}</span>
                    <div class="note-stats">
                        <span class="stat-item">
                            <component :is="EyeRegular" class="stat-icon" />
                            {{ item.stat.viewDetailCount }}
                        </span>
                        <span class="stat-item">
                            <component :is="CommentRegular" class="stat-icon" />
                            {{ item.stat.commentsCount }}
                        </span>
                        <span class="stat-item">
                            <component :is="HeartRegular" class="stat-icon" />
                            {{ item.stat.likesCount }}
                        </span>
                    </div>
                </div>
                <p class="note-summary" v-html="md.render(item.metadata.content.summary)"></p>
            </router-link>
        </n-card>
        <div v-if="err" class="error-container">
            <ERROR :msg="err" title="获取笔记失败" />
        </div>
        <div v-if="loading" class="loading-container">
            <n-spin size="large" />
            <span class="loading-text">加载中...</span>
        </div>
    </div>
</template>

<script setup>
import { CommentRegular, EyeRegular, HeartRegular } from '@vicons/fa';
import markdownit from 'markdown-it';
import { NCard, NSpin } from 'naive-ui';
import { onMounted, ref } from 'vue';
import { formatDate, getxlog, ipfsToCrossbell } from './api';
import ERROR from './error.vue';

const md = markdownit()
const result = ref('')
const err = ref("")
const loading = ref(true)

onMounted(async () => {
    const res = await getxlog()
    if (res.status !== 200) {
        err.value = res
        console.log(err.value)
    } else {
        result.value = res.data
        loading.value = false
    }
})
</script>

<style scoped>
.start-page {
    max-width: 800px;
    margin: 20px auto;
    padding: 0 10px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
    justify-items: center;
}

.note-card {
    width: 100%;
    border-radius: 12px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.note-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.note-link {
    text-decoration: none;
    color: inherit;
    display: block;
}

.note-title {
    margin: 0 0 10px 0;
    font-size: 18px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.3s ease;
}

.note-link:hover .note-title {
    color: #42b983;
}

.note-cover {
    width: 100%;
    padding-top: 56.25%;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 12px;
    background-color: #f5f5f5;
}

.note-image {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    transition: transform 0.3s ease;
}

.note-card:hover .note-image {
    transform: scale(1.05);
}

.note-no-cover {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    text-align: center;
    background-color: #f0f0f0;
    color: #666;
}

.no-cover-text {
    font-size: 20px;
    word-break: break-word;
    font-weight: 500;
}

.note-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
}

.note-date {
    color: #999;
    font-size: 12px;
    font-weight: 400;
}

.note-stats {
    display: flex;
    align-items: center;
    gap: 12px;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #999;
    font-size: 12px;
}

.stat-icon {
    width: 14px;
    height: 14px;
}

.note-summary {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: #666;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.error-container {
    grid-column: 1 / -1;
    margin: 40px 0;
}

.loading-container {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 60px 0;
    gap: 16px;
}

.loading-text {
    color: #666;
    font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .start-page {
        grid-template-columns: 1fr;
        gap: 16px;
        margin: 10px auto;
    }
    
    .note-card {
        width: calc(100% - 20px);
    }
    
    .note-title {
        font-size: 16px;
    }
    
    .note-summary {
        font-size: 13px;
    }
}
</style>