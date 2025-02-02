<script setup>
import {
    NButton,
    NCard
} from "naive-ui";
import { onBeforeMount, ref } from 'vue';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { get_steam_info, timeAgo } from "./api";
const steamData = ref({ 'steam_enable': false })

function getsteaminfo() {
    steamData.value = { 'steam_enable': false }
    get_steam_info()
        .then(data => {
            console.log(data);
            if (typeof (data) !== "string") {
                steamData.value = data
                toast("get steam info successfully!", {
                "theme": "auto",
                "type": "info",
            })
            } else {
                console.log(data);
            }
        })
        .catch(error => {
            console.log("error:", error);
            toast(error, {
                "theme": "auto",
                "type": "error",
            })
        });
}
onBeforeMount(() => {
    getsteaminfo()
})
function setpersonastate(n) {
    let statusText = '';
    let color = 'gray'; // 默认颜色
    switch (n) {
        case 0:
            statusText = '离线';
            color = 'gray';
            break;
        case 1:
            statusText = '在线';
            color = '#69D1F5';
            break;
        case 2:
            statusText = '忙碌';
            color = 'red';
            break;
        case 3:
            statusText = '离开';
            color = 'orange';
            break;
        case 4:
            statusText = '隐身';
            color = 'blue';
            break;
        case 5:
            statusText = '寻找交易';
            color = 'purple';
            break;
        case 6:
            statusText = '寻找游戏';
            color = 'yellow';
            break;
        default:
            statusText = '未知状态';
            color = 'gray';
    }

    return `<span style="color: ${color};">${statusText}</span>`;
}
function getPersonaStateflagsHTML(n) {
    let statusText = '';
    let color = 'gray'; // 默认颜色
    if (n & 1) {
        statusText += '离线 ';
        color = 'gray';
    }
    if (n & 2) {
        statusText += '在线 ';
        color = 'green';
    }
    if (n & 4) {
        statusText += '金牌用户 ';
        color = 'gold';
    }
    if (n & 64) {
        statusText += '通过Steam大画面模式在线 ';
    }
    if (n & 256) {
        statusText += '通过Web客户端在线 ';
    }
    if (n & 512) {
        statusText += '通过移动设备在线 ';
    }
    if (n & 1024) {
        statusText += '通过Steam控制器在线 ';
    }
    statusText = statusText.trim();
    return `<span style="color: ${color};">${statusText}</span>`;
}
</script>

<template>
    <n-card v-if="steamData['steam_enable']" title="Steam Status" >
        <div v-if="steamData['status_code'] == 200" v-for="(item, index) in steamData.data.response.players"
            :key="index">
            <div style="display: flex;">
                <img :src="item.avatarfull" alt="头像" style="width: 70px; height: 70px;">
                <div style="margin:0 10px;">
                    <a :href="item.profileurl" target="_blank" style="padding: 0;color: #69D1F5;">{{ item.personaname }}</a>
                    <div v-html="setpersonastate(item.personastate)"></div>
                    <div v-html="getPersonaStateflagsHTML(item.personastateflags)"></div>
                    <div>最后登录时间: {{ timeAgo(new Date(item.lastlogoff * 1000).toLocaleString())}}</div>
                </div>
            </div>
        </div>
        <div v-else>
            <div v-html='steamData["text"] || "未知错误"'></div>
        </div>
        <n-button @click="getsteaminfo" text style="margin:10px 0;float:right;font-size: 20px;" title="刷新">↻</n-button>
    </n-card>
</template>