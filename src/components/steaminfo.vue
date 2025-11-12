<script setup>
import {
    NButton,
    NCard,
    NCollapse,
    NCollapseItem
} from "naive-ui";
import { onBeforeMount, ref } from 'vue';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { get_steam_friend_info, get_steam_info, timeAgo } from "./api";
const steamData = ref({ 'steam_enable': false })
const steamfrData = ref({ 'steam_enable': false })

function getsteaminfo() {
    get_steam_info()
        .then(data => {
            if (typeof (data) !== "string") {
                steamData.value = data
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
function getsteamfrinfo() {
    get_steam_friend_info()
        .then(data => {
            if (typeof (data) !== "string") {
                steamfrData.value = data
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
    getsteamfrinfo()
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
            statusText = '休息';
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
    <n-card title="Steam Status" style="min-width: 200px;">
        <div v-if="steamData['status_code'] == 200 && steamData['steam_enable']" 
        v-for="(item, index) in steamData.data.response.players"
            style="margin: 5px;" :key="index">
            <div style="display: flex;">
                <img :src="item.avatarfull" alt="头像" style="width: 70px; height: 70px;">
                <div style="margin:0 10px;">
                    <a :href="item.profileurl" target="_blank" style="padding: 0;color: #69D1F5;">{{ item.personaname
                        }}</a>
                    <div v-html="setpersonastate(item.personastate)"></div>
                    <div v-if="item.gameextrainfo"><a :href="'https://store.steampowered.com/app/' + item.gameid"
                            target="_blank" style="padding: 0;">
                            {{ item.gameextrainfo }}</a></div>
                    <div v-html="getPersonaStateflagsHTML(item.personastateflags)"></div>
                    <div>最后登录时间: {{ timeAgo(new Date(item.lastlogoff * 1000).toLocaleString()) }}</div>
                </div>
            </div>
        </div>
        <div v-else>
            <div v-html='steamData["text"] || "loading"'></div>
        </div>
        <n-collapse :default-expanded-names="['1' ]">
            <n-collapse-item title="好友" name="1">

                <div v-if="steamfrData['status_code'] == 200" v-for="(item, index) in steamfrData.data.response.players"
                    style="margin: 5px;" :key="index">
                    <div style="display: flex;">
                        <img :src="item.avatarfull" alt="头像" style="width: 70px; height: 70px;">
                        <div style="margin:0 10px;">
                            <a :href="item.profileurl" target="_blank" style="padding: 0;color: #69D1F5;">{{
                                item.personaname }}</a>
                                <br>
                            <span v-html="setpersonastate(item.personastate)"></span>
                            <span v-if="item.gameextrainfo" style="margin: 5px;"><a
                                    :href="'https://store.steampowered.com/app/' + item.gameid" target="_blank"
                                    style="padding: 0;">
                                    {{ item.gameextrainfo }}</a></span>
                            <div v-html="getPersonaStateflagsHTML(item.personastateflags)"></div>
                            <div>{{ timeAgo(new Date(item.lastlogoff * 1000).toLocaleString()) }}</div>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <div v-html='steamData["text"] || "loading"'></div>
                </div>
            </n-collapse-item>
        </n-collapse>
    </n-card>
    <!-- <n-skeleton v-else text :repeat="5" /> -->
</template>