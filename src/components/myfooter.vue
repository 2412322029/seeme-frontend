<template>
  <footer style="display: flex; align-items: center;justify-content: center;margin:40px 10px;flex-direction: column">
    <span style="display: flex;flex-wrap: wrap;align-items: center; justify-content: center;">
      <n-tag :bordered="false" type="info" style="margin: 5px;">Deploy Time: {{ devInfo.deploy_time }}</n-tag>
      <n-tag :bordered="false" type="info" style="margin: 5px;">Git Hash: {{ devInfo.git_hash }}</n-tag>    
      <n-tag :bordered="false" type="info" style="margin: 5px;">Access Count: {{ devInfo.access_count }}</n-tag>    
    </span>
    <div v-if="hitokoto">
      <span>{{ hitokoto.hitokoto }} —— {{ hitokoto.from }}
        <template v-if="hitokoto.from_who">
          ({{ hitokoto.from_who }})
        </template>
        
      </span>
    </div>
    <div>
      <span>made by </span>
      <a href="https://github.com/2412322029/seeme" target="_blank">https://github.com/2412322029/seeme</a>
    </div>
    <n-button
      v-show="showButton"
      circle
      type="primary"
      size="large"
      :style="buttonStyle"
      @click="scrollToTop"
    >
      ↑
    </n-button>
  </footer>
</template>

<script setup>
import { NButton, NTag } from 'naive-ui';
import { computed, onBeforeMount, onMounted, onUnmounted, ref } from 'vue';
import "vue3-toastify/dist/index.css";
import { get_deployment_info, gethitokoto } from "./api";

const devInfo = ref({ 'deploy_time': 'loading', 'git_hash': 'loading', 'access_count': 'loading' });
const hitokoto = ref(null);
const showButton = ref(false);

function getdevInfo() {
  get_deployment_info()
    .then(data => {
      devInfo.value = data;
      console.log(data);
    })
    .catch(error => {
      console.log("error:", error);
    });
}

function fetchHitokoto() {
  gethitokoto()
    .then(data => {
      hitokoto.value = data;
      console.log(data);
    })
    .catch(error => {
      console.log("error:", error);
    });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleScroll() {
  showButton.value = window.scrollY > 200;
}

const buttonStyle = computed(() => {
  return {
    position: 'fixed',
    bottom: '60px',
    right: window.innerWidth < 800 ? '20px' : '50px', 
  };
});

onBeforeMount(() => {
  getdevInfo();
  fetchHitokoto();
});

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', () => {
    buttonStyle.value.right = window.innerWidth < 800 ? '20px' : '50px';
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', () => {
    buttonStyle.value.right = window.innerWidth < 800 ? '20px' : '50px';
  });
});
</script>