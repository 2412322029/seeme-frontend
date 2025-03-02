<template>
    <footer style="display: flex; align-items: center;justify-content: center;margin: 10px;flex-direction: column">
            <span style="display: flex;flex-wrap: wrap;align-items: center; justify-content: center;">
                <n-tag :bordered="false" type="info" style="margin: 5px;">Deploy Time: {{ devInfo.deploy_time }}</n-tag>
                <n-tag :bordered="false" type="info" style="margin: 5px;">Git Hash: {{ devInfo.git_hash }}</n-tag>    
                <n-tag :bordered="false" type="info" style="margin: 5px;">Access Count: {{ devInfo.access_count }}</n-tag>    
            </span>

        <div>
            <span>made by </span>
            <a href="https://github.com/2412322029/seeme" target="_blank">https://github.com/2412322029/seeme</a>
        </div>
    </footer>
</template>
<script setup>
import { NTag } from 'naive-ui';
import { onBeforeMount, ref } from 'vue';
import "vue3-toastify/dist/index.css";
import { get_deployment_info } from "./api";
const devInfo = ref({ 'deploy_time': 'loading', 'git_hash': 'loading', 'access_count': 'loading' })
function getdevInfo() {
    get_deployment_info()
        .then(data => {
            devInfo.value = data
            console.log(data);
        })
        .catch(error => {
            console.log("error:", error);
        });
}
onBeforeMount(() => {
    // getdevInfo()
})
</script>