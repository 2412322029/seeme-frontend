<script setup>
import { ShareAlt } from "@vicons/fa";
import {
  NAlert,
  NAvatar,
  NButton,
  NCard,
  NDynamicTags,
  NIcon,
  NInput,
  NSkeleton,
  NTable,
  NTag,
  NTooltip,
} from "naive-ui";
import { onBeforeMount, onMounted, reactive, ref, watch } from "vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { McInfo, Mclatency } from "./api";

const route = useRoute(); // 获取当前路由对象
const router = useRouter(); // 获取路由实例
const mcserveraddr = ref(route.params.address || "");
const errormsg = reactive({
  mcserveraddr: "",
});
const mcdata = ref();
const mclay = ref();
const history = ref(
  JSON.parse(localStorage.getItem("mcserveraddr_history") || "[]")
);

function getMcInfo() {
  errormsg.mcserveraddr = "";
  mcdata.value = "";
  if (!/:[0-9]{1,5}$/.test(mcserveraddr.value)) {
    mcserveraddr.value += ":25565";
    toast("使用默认端口 25565", {
      theme: "auto",
      type: "info",
    });
  }
  if (
    /^(?!((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+):([0-9]{1,5})$)).*$/gm.test(
      mcserveraddr.value
    )
  ) {
    errormsg.mcserveraddr = mcserveraddr.value + "  错误的地址 <host:port>";
    return;
  }
  McInfo(mcserveraddr.value)
    .then((data) => {
      if (typeof data !== "string" && data.error === undefined) {
        mcdata.value = data;
        router.push({
          name: "mcstatus",
          params: { address: mcserveraddr.value },
        });
        updateHistory(mcserveraddr.value);
      } else {
        errormsg.mcserveraddr = data;
      }
    })
    .catch((error) => {
      console.log("error:", error);
      toast(error + "<br>" + JSON.stringify(error.response.data), {
        theme: "auto",
        type: "error",
      });
    });
  Mclatency(mcserveraddr.value)
    .then((data) => {
      mclay.value = data;
    })
    .catch((error) => {
      console.log("error:", error);
      toast(error, {
        theme: "auto",
        type: "error",
      });
    });
}
const fullpath = ref(window.location.href);
function updateHistory(address) {
  const index = history.value.indexOf(address);
  if (index !== -1) {
    history.value.splice(index, 1);
  }
  history.value.unshift(address);
  if (history.value.length > 10) {
    history.value.pop();
  }
  localStorage.setItem("mcserveraddr_history", JSON.stringify(history.value));
}
watch(history, (newValue) => {
  localStorage.setItem("mcserveraddr_history", JSON.stringify(newValue));
});
onBeforeRouteUpdate((to, from, next) => {
  mcserveraddr.value = to.params.address || "";
  next();
});
onBeforeMount(() => {
  if (mcserveraddr.value) {
    getMcInfo();
  }
});

// 复制文本的函数
const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast(`已复制到剪贴板！路径: ${text}`, {
      theme: "auto",
      type: "success",
    });
  } catch (err) {
    console.error("复制失败:", err);
    toast("复制失败，请手动复制。", {
      theme: "auto",
      type: "error",
    });
  }
};

onMounted(() => {
  // 创建并添加脚本元素
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.charset = "utf-8";
  script.src = "https://widget.tsarvar.com/load.js?v=2";
  document.head.appendChild(script);

  // 模拟外部脚本初始化逻辑
  (function (k) {
    (window[k] || (window[k] = [])).push({
      element: '*[data-tsarvarServerId="483478"]',
      serverId: 483478,
      serverIp: "49.234.20.77",
      serverPort: 25565,
      color: "#18181c",
      blackMode: true,
    });
  })("TsarvarWidgetQueue");
});
</script>

<template>
  <n-card
    ref="mc"
    title="Mincraft Server Status"
    style="min-width: 300px; width: 100%; max-width: 800px; overflow: auto"
  >
    <n-input
      placeholder="host:port"
      v-model:value="mcserveraddr"
      clearable
      autosize
      style="width: 80%; margin: 5px"
    />
    <n-button type="primary" style="margin: 5px" @click="getMcInfo"
      >查询</n-button
    >
    <div style="margin: 5px">
      <n-dynamic-tags
        v-model:value="history"
        @click="mcserveraddr = $event.srcElement.innerText"
      />
    </div>
    <br />
    <n-alert
      :show-icon="false"
      type="error"
      closable
      v-if="errormsg.mcserveraddr"
    >
      {{ errormsg.mcserveraddr }}
    </n-alert>
    <span v-if="!errormsg.mcserveraddr && mcdata" style="overflow: auto">
      <n-tag style="margin: 5px"
        >Ping to the server :{{ mclay?.time || mclay?.error }}</n-tag
      >
      <n-table :bordered="false">
        <tbody>
          <tr>
            <td>host</td>
            <td>
              <n-tag type="success"> {{ mcserveraddr }}</n-tag>
              <n-icon
                @click="copyText(fullpath)"
                title="点击复制"
                style="margin-left: 5px; cursor: pointer"
              >
                <ShareAlt />
              </n-icon>
            </td>
          </tr>
          <tr>
            <td>version</td>
            <td>{{ mcdata.version.name }}</td>
          </tr>
          <tr>
            <td>protocol</td>
            <td>{{ mcdata.version.protocol }}</td>
          </tr>
          <tr>
            <td>icon</td>
            <td><img :src="mcdata.icon" alt="" /></td>
          </tr>
          <tr>
            <td>players</td>
            <td>
              {{ mcdata.players.online }}/{{ mcdata.players.max }}
              <br />
              <p v-for="p in mcdata.players.sample">
                <n-tooltip placement="top-start" trigger="hover">
                  <template #trigger>
                    <p style="display: flex">
                      <n-avatar
                        size="small"
                        :src="'https://crafatar.com/avatars/' + p.uuid"
                      />
                      <span style="margin: 5px; height: 20px">{{
                        p.name
                      }}</span>
                    </p>
                  </template>
                  {{ p.uuid }}
                </n-tooltip>
              </p>
            </td>
          </tr>
          <tr>
            <td>motd</td>
            <td v-html="mcdata.motd.html"></td>
          </tr>
        </tbody>
      </n-table>
    </span>
    <n-skeleton v-else text :repeat="2" />
  </n-card>
  <div style="margin-top: 10px; text-align: center">
    <!-- style="position: fixed; top: 50px; left: 20px; width: 220px" -->
    <a
      href="https://tsarvar.com/servers/minecraft/49.234.20.77:25565"
      data-tsarvarServerId="483478"
    >
      神秘服务器 🎭 𝔐𝔞𝔰𝔮𝔲𝔢𝔯𝔞𝔡𝔢
    </a>
  </div>
</template>
<style scoped></style>
