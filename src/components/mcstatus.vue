<script setup>
import {
    darkTheme,
    lightTheme,
    NAlert, NAvatar, NButton, NCard,
    NConfigProvider,
    NGlobalStyle,
    NInput,
    NSkeleton,
    NSwitch,
    NTable, NTag,
    NTooltip
} from "naive-ui";
import { onBeforeMount, reactive, ref, watch } from 'vue';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { McInfo, Mclatency } from "./api";
const darktheme = ref(true)
const mcserveraddr = ref("")
const errormsg = reactive({
    "mcserveraddr": "",
})
const mcdata = ref()
const mclay = ref()
function getMcInfo() {
    errormsg.mcserveraddr = ""
    mcdata.value = ""
    if (/^(?!((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+):([0-9]{1,5})$)).*$/gm.test(mcserveraddr.value)) {
        errormsg.mcserveraddr = mcserveraddr.value + "  错误的地址 <host:port>"
        // console.log(mcserveraddr.value);

        return
    }
    McInfo(mcserveraddr.value)
        .then(data => {
            // console.log(data);
            if (typeof (data) !== "string") {
                mcdata.value = data
                localStorage.setItem('mcserveraddr', mcserveraddr.value);
            } else {
                errormsg.mcserveraddr = data
            }
        })
        .catch(error => {
            console.log("error:", error);
            toast(error + "<br>" + JSON.stringify(error.response.data), {
                "theme": "auto",
                "type": "error",
            })
        });
    Mclatency(mcserveraddr.value)
        .then(data => {
            mclay.value = data
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
    const savedAddr = localStorage.getItem('mcserveraddr');
    mcserveraddr.value = savedAddr;
    // const url = new URL(window.location.href);
    // const params = url.searchParams;
    // var mcadder = params.get('mc')
    // if (mcadder !== "") {
    //     mcserveraddr.value = mcadder
    //     const mc = ref(null);


    //     getMcInfo()
    //     const scrollToDiv = () => {
    //         if (mc.value) { 
    //             mc.value.scrollIntoView({
    //                 behavior: 'smooth',
    //                 block: 'top'
    //             });
    //         }
    //     };
    //     scrollToDiv()
    // }

})
watch(darktheme, (newValue) => {
  localStorage.setItem('darktheme', JSON.stringify(newValue));
});
</script>

<template>
  <n-config-provider :theme="darktheme ? darkTheme : lightTheme">
    <n-card ref="mc" title="Mincraft Server Status" style="min-width: 700px; width: 100%;overflow: auto;">
        <span style="margin-left: 5px;">暗色模式 <n-switch v-model:value="darktheme" /></span>
        <br>
        <n-input placeholder="host:port" v-model:value="mcserveraddr" clearable autosize
            style="min-width: 100px; margin: 5px;" />
        <n-button type="primary" style=" margin: 5px;" @click="getMcInfo">查询</n-button>
        <br>
        <n-alert :show-icon="false" type="error" closable v-if="errormsg.mcserveraddr">
            {{ errormsg.mcserveraddr }}
        </n-alert>
        <span v-if="!errormsg.mcserveraddr && mcdata" style="overflow: auto;">
            <n-tag style="margin: 5px;">Ping to the server :{{ mclay }}</n-tag>
            <n-table :bordered="false">
                <tbody>
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
                        <td><img :src="mcdata.icon" alt=""></td>
                    </tr>
                    <tr>
                        <td>players</td>
                        <td>{{ mcdata.players.online }}/{{ mcdata.players.max }}
                            <br>
                            <p v-for="p in mcdata.players.sample">
                                <n-tooltip placement="top-start" trigger="hover">
                                    <template #trigger>
                                        <p style="display: flex">
                                            <n-avatar size="small" :src="'https://crafatar.com/avatars/' + p.uuid" />
                                            <span style="margin: 5px; height: 20px;">{{ p.name }}</span>
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
    <n-global-style />
</n-config-provider>
</template>