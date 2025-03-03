<script setup>
import {
    NButton,
    NCard,
    NDivider,
    NDrawer,
    NDrawerContent,
    NEllipsis,
    NImage,
    NRate,
    NScrollbar,
    NSpin,
    NTable,
    NTag,
    NTooltip
} from "naive-ui";
import { onBeforeMount, ref, watch } from 'vue';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { getcalendar, getepisodes, getsubject } from "./api";
import bar from "./bar.vue";

const calData = ref();
const subData = ref();
const epiData = ref();
const showDrawer = ref(false);
const selectedItem = ref(null);
const errors = ref("");
const loading = ref(false);
const loading1 = ref(false);

function calendar() {
    getcalendar()
        .then(data => {
            if (typeof (data) !== "string") {
                calData.value = data;
            } else {
                console.log(data);
            }
        })
        .catch(error => {
            errors.value = error;
            console.log("error:", error);
            toast(error, {
                "theme": "auto",
                "type": "error",
            });
        });
}
function getsub(id) {
    loading.value = true;
    getsubject(id)
        .then(data => {
            if (typeof (data) !== "string") {
                subData.value = data;
            } else {
                console.log(data);
            }
        })
        .catch(error => {
            console.log("error:", error);
            toast(error, {
                "theme": "auto",
                "type": "error",
            });
        })
        .finally(() => {
            loading.value = false;
        });
}

function getepi(id) {
    loading1.value = true;
    getepisodes(id)
        .then(data => {
            if (typeof (data) !== "string") {
                epiData.value = data;
            } else {
                console.log(data);
            }
        })
        .catch(error => {
            console.log("error:", error);
            toast(error, {
                "theme": "auto",
                "type": "error",
            });
        })
        .finally(() => {
            loading1.value = false;
        });
}
function openDrawer(item) {
    selectedItem.value = item;
    showDrawer.value = true;
}
watch(showDrawer, (newVal) => {
    if (!newVal) {
        subData.value = null;
        epiData.value = null;
    }
});
onBeforeMount(() => {
    calendar();
});


</script>

<template>
    <div v-if="calData" v-for="item in calData" :key="item.weekday.en" style="margin: 10px;">
        <n-card :title="item.weekday.cn" style="max-width:850px;">
            <div style="display: flex;flex-wrap: wrap;flex-direction: row;align-items: flex-start;">
                <div v-for="i in item.items" :key="i.id"
                    style="display: flex;flex-direction: column; width: 140px;margin: 10px; cursor:pointer;"
                    @click="openDrawer(i)">
                    <n-image lazy :src="i.images.common" width="140" height="200" object-fit="cover" preview-disabled />
                    <n-ellipsis style="max-width: 140px">{{ i.name_cn || i.name }}</n-ellipsis>
                </div>
            </div>
        </n-card>
    </div>
    <div v-else>
        <n-card>
            <p style="color: red;">{{ errors }} to fetch {{ errors.config?.url }}</p>
        </n-card>
    </div>
    <n-drawer v-model:show="showDrawer" placement="right" width="600px" style="max-width: 80%;">
        <n-drawer-content>
            <n-scrollbar trigger="hover">
                <div v-if="selectedItem" style="margin-right: 10px;">
                    <n-image :src="selectedItem.images.large" width="100%" height="auto" object-fit="cover" />
                    <h2>
                        <a :href="selectedItem.url" target="_blank" style="color: cadetblue;">
                            {{ selectedItem.name_cn || selectedItem.name }}
                        </a>
                    </h2>
                    <p>名称: {{ selectedItem.name }}</p>
                    <p>放送日期: {{ selectedItem.air_date }}</p>
                    <p>排名: {{ selectedItem.rank }}</p>
                    <p>在看: {{ selectedItem.collection?.doing }}</p>
                    <p>评分: <n-rate allow-half readonly :default-value="selectedItem.rating.score / 2" size="small" />
                        ({{ selectedItem.rating.score }}分/{{ selectedItem.rating.total }} votes)</p>
                    <bar :rating="selectedItem.rating" />

                    <n-divider>
                        <span> more info</span>
                    </n-divider>
                    <div>
                        <n-button v-if="!subData && !loading" @click="getsub(selectedItem.id)">点击加载更多信息</n-button>
                        <n-spin size="medium" v-if="loading" />
                        <div v-if="subData">
                            <p>{{ subData.summary }}</p>
                            <div v-if="subData.collection" style="display: flex;flex-direction: row; flex-wrap: wrap;">
                                <span style="margin: 2px;"> <n-tag type="success">收藏数{{ subData.collection.collect
                                }}</n-tag></span>
                                <span style="margin: 2px;"> <n-tag type="success">看过{{ subData.collection.watched
                                }}</n-tag></span>
                                <span style="margin: 2px;"> <n-tag type="success">在看{{ subData.collection.doing
                                }}</n-tag></span>
                                <span style="margin: 2px;"> <n-tag type="success">搁置{{ subData.collection.dropped
                                }}</n-tag></span>
                                <span style="margin: 2px;"> <n-tag type="success">想看{{ subData.collection.wish
                                }}</n-tag></span>
                            </div>
                            <p>总集数 {{ subData.total_episodes }} ; 平台 {{ subData.platform }}</p>
                            <div style="display: flex;flex-direction: row; flex-wrap: wrap;">
                                <span v-for="t in subData.meta_tags" style="margin: 2px;">
                                    <n-tag>{{ t }} </n-tag>
                                </span>
                            </div>
                            <p>大家将 {{ subData.name }} 标注为</p>

                            <div style="display: flex;flex-direction: row; flex-wrap: wrap;">
                                <div v-for="t in subData.tags" style="margin: 2px;;">
                                    <n-tag type="info" :round="true">
                                        <a :href='"https://bgm.tv/anime/tag/" + t.name' target="_blank">{{ t.name }} {{
                                            t.count }}</a></n-tag>
                                </div>
                            </div>
                            <n-table>
                                <tr v-for="info in subData.infobox" :key="info.key">
                                    <td style="min-width: 70px;">{{ info.key }}</td>
                                    <td>
                                        <span v-if="Array.isArray(info.value)">
                                            <template v-for="v in info.value">
                                                <span>{{ v.k }} 《{{ v.v }}》</span><br>
                                            </template>
                                        </span>
                                        <span v-else>
                                            <a style="color: steelblue;" v-if="info.key.includes('网站')"
                                                :href="info.value" target="_blank">{{ info.value }}</a>
                                            <span v-else> {{ info.value }}</span>
                                        </span>
                                    </td>
                                </tr>
                            </n-table>
                        </div>
                        <n-button v-if="!epiData && !loading1" @click="getepi(selectedItem.id)">点击加载集数信息</n-button>
                        <n-spin size="medium" v-if="loading1" />
                        <div v-if="epiData">
                            <p>集数信息</p>
                            <n-table>
                                <tr v-for="epi in epiData.data" :key="epi.ep">
                                    <td>{{ epi.ep }}</td>
                                    <td>
                                        <n-tooltip trigger="hover">
                                            <template #trigger>
                                                <span>{{ epi.name_cn || epi.name }}</span>
                                            </template>
                                            <div>
                                                <p>原名: {{ epi.name }}</p>
                                                <p>放送日期: {{ epi.airdate }}</p>
                                                <p>评论数: {{ epi.comment }}</p>
                                                <p>描述: {{ epi.desc }}</p>
                                                <p>时长: {{ epi.duration }}</p>
                                            </div>
                                        </n-tooltip>
                                    </td>
                                    <td>
                                        <a style="color: cadetblue;" target="_blank"
                                         :href='"https://bgm.tv/ep/"+epi.id'>bgm.tv/ep/{{ epi.id }}</a>
                                    </td>
                                </tr>
                            </n-table>
                        </div>
                    </div>
                </div>
            </n-scrollbar>
        </n-drawer-content>
    </n-drawer>
</template>
<style scoped>
a {
    color: var(--n-text-color);

}

a:hover {
    background-color: transparent;
    color: rgb(42, 148, 125);
}
</style>