<script setup>
import desktopicon from "@/assets/desktop.png";
import { baseURL } from "./api";
import {
  NCard,
  NCheckbox,
  NFloatButton,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NSpace,
  NTable,
  NTimeline,
  NTimelineItem,
  NTooltip
} from "naive-ui";
import { onBeforeMount, onMounted, reactive, ref, watch } from "vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import Ai from "./ai.vue";
import { getinfo, getlimit, timeAgo } from "./api";
import { getphoneIcon } from "./imgmap";
import Show_activity_window from "./show_activity_window.vue";
const showtimeline = ref(false);
const showwhat = reactive([true, true, true]);
onMounted(() => {
  const storedShowTimeline = localStorage.getItem("showtimeline");
  showtimeline.value = storedShowTimeline
    ? JSON.parse(storedShowTimeline)
    : window.innerWidth <= 900;

  const storedShowWhat = localStorage.getItem("showwhat");
  if (storedShowWhat) {
    const parsedShowWhat = JSON.parse(storedShowWhat);
    showwhat[0] = parsedShowWhat[0];
    showwhat[1] = parsedShowWhat[1];
    showwhat[2] = parsedShowWhat[2];
  } else {
    showwhat.fill(true);
  }
});

watch(showtimeline, (newValue) => {
  localStorage.setItem("showtimeline", JSON.stringify(newValue));
});
watch(showwhat, (newValue) => {
  localStorage.setItem("showwhat", JSON.stringify(newValue));
});
const errormsg = reactive({
  info: "",
});

const infodata = ref();
const limitdata = ref({ browser: 0, pc: 0, phone: 0 });

function getall() {
  infodata.value = undefined;
  getlimit()
    .then((data) => {
      console.log(data);
      if (typeof data !== "string") {
        limitdata.value = data;
      } else {
        toast(data, {
          theme: "auto",
          type: "error",
        });
      }
    })
    .catch((error) => {
      console.log("error:", error);
      toast(error, {
        theme: "auto",
        type: "error",
      });
    });
  getinfo()
    .then((data) => {
      console.log(data);
      if (typeof data !== "string") {
        infodata.value = data;
      } else {
        errormsg.info = data;
      }
    })
    .catch((error) => {
      console.log("error:", error);
      toast(error, {
        theme: "auto",
        type: "error",
      });
    });
}
onBeforeMount(() => {
  getall();
});
function truncateString(str, n) {
  if (str.length > n) {
    return str.substring(0, n) + "...";
  }
  return str;
}
function formatTimestamp(timestamp) {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
function checkGoogleChrome(str) {
  // 或许不应该直接显示浏览器标题(´。＿。｀)
  if (str.includes("Google Chrome")) {
    return "Google Chrome";
  } else {
    return str;
  }
}
function reversed(o) {
  return o.slice().reverse();
}
function handleImageError(event) {
  event.target.src = desktopicon;
}
</script>

<template>
  <n-layout>
    <n-layout-header>
      <n-card title="你在干什么?" style="margin-bottom: 10px">
        <div>
          <p>通过网站，可以让别人知道你在干什么。</p>
          <p>数据可以包含电脑、浏览器、手机这几个维度。</p>
          <n-table :bordered="true" stripe>
            <thead>
              <tr>
                <th>平台</th>
                <th>功能</th>
                <th>自/手动</th>
                <th>触发方式</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>电脑端</td>
                <td>最近活动程序、程序标题、图标、更新时间</td>
                <td>自动</td>
                <td>固定时间间隔（默认10分钟）</td>
              </tr>
              <tr>
                <td>浏览器端</td>
                <td>网站信息、网站标题、无参数URL、更新时间</td>
                <td>手动</td>
                <td>点击上传按钮</td>
              </tr>
              <tr>
                <td>安卓端</td>
                <td>前台应用名称、WiFi信息、电池电量、更新时间</td>
                <td>自动</td>
                <td>切换应用时更新</td>
              </tr>
            </tbody>
          </n-table>
        </div>
        <n-space>
          <span>时间线表示 <n-checkbox v-model:checked="showtimeline" /></span>
          <span>显示电脑 <n-checkbox v-model:checked="showwhat[0]" /></span>
          <span>显示浏览器 <n-checkbox v-model:checked="showwhat[1]" /></span>
          <span>显示手机 <n-checkbox v-model:checked="showwhat[2]" /></span>
        </n-space>
        
        <Ai />
      </n-card>
    </n-layout-header>
    <n-layout-content>
      <n-space vertical>
        <n-space vertical v-if="infodata">
          <n-card v-if="showwhat[0]" :title="'电脑(最新' + limitdata.pc + '项)'">
            <template #header-extra>
              <n-tooltip trigger="hover" placement="right">
                <template #trigger>
                  <a target="_blank" style="background-color: transparent"
                    href="https://github.com/2412322029/seeme/releases">
                    <n-float-button position="relative">?</n-float-button>
                  </a>
                </template>
                电脑端自动报告程序,点击前往
              </n-tooltip>
            </template>
            <Show_activity_window />

            <n-table :bordered="false" v-if="!showtimeline">
              <thead>
                <tr>
                  <th>可执行程序</th>
                  <th>前台窗口标题</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in reversed(infodata.pc)" :key="index">
                  <td>
                    <div style="display: flex; align-items: center">
                      <img size="small" :src="baseURL + '/exe_icon/' + item.exe_name + '.png'" @error="handleImageError"
                        style="margin: 0 5px; width: 20px" />
                      {{ item.exe_name }}
                    </div>
                  </td>
                  <td>
                    <n-tooltip :show-arrow="false" trigger="hover">
                      <template #trigger>
                        {{
                          truncateString(
                            checkGoogleChrome(item.running_exe),
                            30
                          )
                        }}
                      </template>
                      {{ item.running_exe }}
                    </n-tooltip>
                  </td>
                  <td>{{ timeAgo(item.report_time) }}</td>
                </tr>
              </tbody>
            </n-table>
            <div v-else>
              <n-timeline>
                <n-timeline-item v-for="(item, index) in infodata.pc" :key="index" type="success" :title="item.exe_name"
                  :content="item.running_exe" :time="timeAgo(item.report_time)">
                  <template #icon v-if="item.exe_name">
                    <img :src="baseURL + '/exe_icon/' + item.exe_name + '.png'" alt="" @error="handleImageError"
                      style="width: 20px; z-index: 2" />
                  </template>
                </n-timeline-item>
              </n-timeline>
            </div>
          </n-card>
          <n-card v-if="showwhat[1]" :title="'电脑浏览器(最新' + limitdata.browser + '项)'">
            <template #header-extra>
              <n-tooltip trigger="hover" placement="right">
                <template #trigger>
                  <a target="_blank" style="background-color: transparent"
                    href="https://github.com/2412322029/seeme/blob/master/report/自动汇报.js">
                    <n-float-button position="relative">?</n-float-button>
                  </a>
                </template>
                浏览器油猴脚本,点击前往
              </n-tooltip>
            </template>
            <n-table :bordered="false" v-if="!showtimeline">
              <thead>
                <tr>
                  <th>网页标题</th>
                  <th>网页链接</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in reversed(infodata.browser)" :key="index">
                  <td>
                    <n-tooltip trigger="hover">
                      <template #trigger>
                        {{ truncateString(item.title, 30) }}
                      </template>
                      {{ item.title }}
                    </n-tooltip>
                  </td>
                  <td>
                    <a target="_blank" :href="item.url" class="nowrap-ellipsis">{{ truncateString(item.url, 30) }}</a>
                  </td>
                  <td>{{ timeAgo(item.report_time) }}</td>
                </tr>
              </tbody>
            </n-table>
            <div v-else>
              <n-timeline>
                <n-timeline-item v-for="(item, index) in infodata.browser" :key="index" type="success"
                  :title="truncateString(item.title, 70)" :content="truncateString(item.url, 70)"
                  :time="timeAgo(item.report_time)">
                  <template #icon>
                    <img :src="getphoneIcon('Chrome')" alt="" srcset="" style="width: 20px; z-index: 2" />
                  </template>
                </n-timeline-item>
              </n-timeline>
            </div>
          </n-card>
          <n-card v-if="showwhat[2]" :title="'手机(最新' + limitdata.phone + '项)'">
            <template #header-extra>
              <n-tooltip trigger="hover" placement="right">
                <template #trigger>
                  <a target="_blank" style="background-color: transparent"
                    href="https://github.com/2412322029/seeme/blob/master/report/%E8%87%AA%E5%8A%A8%E6%B1%87%E6%8A%A5.macro">
                    <n-float-button position="relative">?</n-float-button>
                  </a>
                </template>
                点击前往, 下载文件导入安卓MacroDroid软件
              </n-tooltip>
            </template>
            <n-table :bordered="false" v-if="!showtimeline">
              <thead>
                <tr>
                  <th>前台应用</th>
                  <th>电池</th>
                  <th>wifi</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in reversed(infodata.phone)" :key="index">
                  <td>
                    <div style="display: flex; align-items: center">
                      <img size="small" :src="getphoneIcon(item.app)" style="margin: 0 5px; width: 20px" />
                      {{ item.app }}
                    </div>
                  </td>
                  <td>{{ item.battery_level }}</td>
                  <td>{{ item.wifi_ssid }}</td>
                  <td>{{ timeAgo(formatTimestamp(item.report_time)) }}</td>
                </tr>
              </tbody>
            </n-table>
            <div v-else>
              <n-timeline>
                <n-timeline-item v-for="(item, index) in infodata.phone" :key="index" type="success" :title="item.app"
                  :content="item.battery_level + '  / wifi信号:  ' + item.wifi_ssid
                    " :time="timeAgo(formatTimestamp(item.report_time))">
                  <template #icon v-if="getphoneIcon(item.app)">
                    <img :src="getphoneIcon(item.app)" alt="" srcset="" style="width: 20px; z-index: 2" />
                  </template>
                </n-timeline-item>
              </n-timeline>
            </div>
          </n-card>
        </n-space>
      </n-space>
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
.nowrap-ellipsis {
  white-space: nowrap;
  /* 不换行 */
  overflow: hidden;
  /* 隐藏溢出的内容 */
  text-overflow: ellipsis;
  /* 使用省略号表示溢出的内容 */
  display: inline-block;
  /* 使元素可以设置宽度 */
  max-width: 100%;
  /* 最大宽度为容器的100% */
}

table {
  overflow: auto;
}
</style>
