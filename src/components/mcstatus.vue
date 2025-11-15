<script setup>
import { ShareAlt } from "@vicons/fa";
import {
  NAlert,
  NAvatar,
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NDynamicTags,
  NIcon,
  NInput,
  NSelect,
  NSkeleton,
  NTable,
  NTag,
  NTooltip,
} from "naive-ui";
import { onBeforeMount, reactive, ref, watch } from "vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { McInfo } from "./api";

const route = useRoute(); // 获取当前路由对象
const router = useRouter(); // 获取路由实例
const mcserveraddr = ref(route.params.address || "");
const loading = ref(false);
const errormsg = reactive({
  mcserveraddr: "",
});
const mcdata = ref();
const mctype = ref(route.params.type || "java");
const history = ref(
  JSON.parse(localStorage.getItem("mcserveraddr_history") || "[]")
);
watch(mctype, (newValue) => {
  router.push({
    name: "mcstatus",
    params: { address: mcserveraddr.value, type: mctype.value },
  });
});
function getMcInfo() {
  if (loading.value) { return; }
  errormsg.mcserveraddr = "";
  mcdata.value = "";
  if (!/:[0-9]{1,5}$/.test(mcserveraddr.value)) {
    toast("端口错误", {
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
  if (mctype.value !== "java" && mctype.value !== "bedrock" && mctype.value !== "auto") {
    errormsg.mcserveraddr = "错误的版本类型 java/bedrock/auto";
    return;
  }
  loading.value = true;
  console.log(loading.value);
  McInfo(mcserveraddr.value, mctype.value)
    .then((data) => {
      if (typeof data !== "string" && data.error === undefined) {
        mcdata.value = data;
        router.push({
          name: "mcstatus",
          params: { address: mcserveraddr.value, type: mctype.value },
        });
        mctype.value = data.type;
        updateHistory(mcserveraddr.value);
      } else {
        errormsg.mcserveraddr = data;
      }
      loading.value = false;
    })
    .catch((error) => {
      console.log("error:", error);
      toast(error + "<br>" + JSON.stringify(error.response.data), {
        theme: "auto",
        type: "error",
      });
      loading.value = false;
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
</script>

<template>
  <n-card ref="mc" title="Mincraft Server Status"
    style="min-width: 300px; width: 100%; max-width: 800px; overflow: auto">
    <div style="display: flex;">
      <n-select v-model:value="mctype" style="width: 100px;margin: 4px;" size="medium" :options="[{ label: 'Java版', value: 'java' },
      { label: '基岩版', value: 'bedrock' }, { label: '自动', value: 'auto' }]" />
      <n-input placeholder="host:port" v-model:value="mcserveraddr" @keydown.enter="getMcInfo" clearable autosize
        style="width:50%; margin: 5px" />
      <n-button type="primary" style="margin: 5px" @click="getMcInfo" :loading="loading">查询</n-button>
    </div>

    <div style="margin: 5px">
      <n-dynamic-tags v-model:value="history" @click="(e) => {
        const tagEl = e.target.closest('.n-tag');
        if (tagEl) {
          mcserveraddr = tagEl.textContent.trim();
        }
      }" />
    </div>
    <br />
    <n-alert :show-icon="false" type="error" closable v-if="errormsg.mcserveraddr">
      {{ errormsg.mcserveraddr }}
    </n-alert>
    <span v-if="!errormsg.mcserveraddr && mcdata" style="overflow: auto">
      <n-table :bordered="false" size="small" striped>
        <tbody>
          <tr>
            <td>host</td>
            <td>
              <n-tag v-once type="success">{{ route.params.address }}</n-tag>
              <n-icon @click="copyText(fullpath)" title="点击复制" style="margin-left: 5px; cursor: pointer">
                <ShareAlt />
              </n-icon>
            </td>
          </tr>
          <tr>
            <td>latency</td>
            <td>{{ mcdata.latency }}</td>
          </tr>
          <tr>
            <td>version</td>
            <td>{{ mcdata.type }} - {{ mcdata.version.name }}</td>
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
                      <n-avatar size="small" :src="'https://crafatar.com/avatars/' + p.uuid" />
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
          <tr v-if="mcdata.forge_data">
            <td>forge_data</td>
            <td>
              fml_network_version : {{ mcdata.forge_data.fml_network_version }}
              <n-collapse style="margin-top:6px;"  arrow-placement="right">
                <n-collapse-item style="cursor: pointer; font-weight: 600;"
                  :title="'Mods(' + mcdata.forge_data.mods.length + ')'">
                  <div style="padding: 8px 12px;">
                    <div v-for="(mod, i) in mcdata.forge_data.mods" :key="mod.modid"
                      style="padding:2px 0; font-family: monospace; display:flex; align-items:center;">
                      <span style=" flex:none;">{{ i + 1 }}.</span>
                      <a :href="'https://www.curseforge.com/minecraft/search?search=' + mod.modid + '&class=mc-mods'"
                        :title="mod.modid" target="_blank"
                        style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:200px; display:inline-block;">
                        {{ mod.modid }}
                      </a>
                      <span style="color:gray; margin-left:auto; flex:none;">{{ mod.version }}</span>
                    </div>
                  </div>
                </n-collapse-item>

              </n-collapse>
              <n-collapse style="margin-top:6px;" arrow-placement="right">
                <n-collapse-item style="cursor: pointer; font-weight: 600;"
                  :title="'channels (' + mcdata.forge_data.channels.length + ')'">
                  <div v-for="(channel, i) in mcdata.forge_data.channels" :key="channel"
                    style="padding: 4px 0;  font-family: monospace;">
                    {{ i + 1 }}.{{ channel.name }} <span style="color: gray;"> {{ channel.version }}
                      <span style="float: right;"> required:{{ channel.required }} </span>

                    </span>
                  </div>
                </n-collapse-item>
              </n-collapse>
            </td>
          </tr>
        </tbody>
      </n-table>
    </span>
    <n-skeleton v-else text :repeat="2" />
  </n-card>
</template>
<style scoped>
.n-table td {
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
  overflow-wrap: break-word;
  max-width: 200px;
  min-width: 70px;
}

a {
  color: oklch(62.3% .214 259.815);
  font-family: monospace;
}

a:hover {
  background-color: transparent;
  text-decoration-line: underline;
}
</style>
