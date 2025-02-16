<script setup>
import win from '@/assets/win.png';
import {
    NTooltip
} from "naive-ui";
import { onBeforeMount, ref } from 'vue';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { get_activity_window, timeAgo } from "./api";
const windowdata = ref()
function getactivitywindow() {
  get_activity_window()
    .then(data => {
      console.log(data);
      if (typeof (data) !== "string") {
        windowdata.value = data
      } else {
        toast(data, {
          "theme": "auto",
          "type": "error",
        })
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
  getactivitywindow()
})
</script>

<template>
  <div title="" v-if="windowdata?.activity_window" style="min-width: 700px;overflow: auto;">
    <p style=" margin: 0;">活动程序   {{ timeAgo(windowdata.report_time) }}</p>
    <div id="icarea" style="display: flex;justify-content: flex-start;align-items: center;">
      <img :src="win" class="ic" style="padding: 0px 5px;margin-top: -8px;"></img>
      <div v-for="item, index in windowdata.activity_window" :key="index" class="icitem">
        <n-tooltip trigger="hover" placement="top">
          <template #trigger>
            <img :src="'/exe_icon/' + item.exe_name + '.png'" class="ic"></img>
          </template>
          {{ item.title }}
        </n-tooltip>
      </div>
    </div>
  </div>
</template>
<style scoped>
#area {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  background-color: #2b2b2b2b;
  /* Windows 10 状态栏背景色 */
  padding: 5px;
  border-radius: 5px;
}

.icitem {
  margin: 10px;
  /* 图标之间的间距 */
  width:
    32px;
}

.ic {
  width: 32px;
  height: 32px;
  object-fit: cover;
  cursor: pointer;
}
</style>