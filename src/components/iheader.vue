<template>
  <n-card id="iheader">
    <n-space justify="space-between" align="center" style="width: 100%;">
      <template v-if="isMobile">
        <n-button @click="toggleMenu">☰</n-button>
        <n-drawer v-model:show="showMenu" placement="left">
          <div vertical style="display: flex;flex-direction: column; align-items: center;font-size: large">
            <router-link class="linkm" to="/" tag="button">Home</router-link>
            <router-link class="linkm" to="/steam" tag="button">Steam Status</router-link>
            <router-link class="linkm" to="/mcstatus" tag="button">Minecraft Status</router-link>
            <span class="linkm">暗色模式 <n-switch v-model:value="localDarktheme" /></span>
          </div>
        </n-drawer>
      </template>
      <template v-else>
        <router-link class="link" to="/" tag="button">Home</router-link>
        <router-link class="link" to="/steam" tag="button">Steam Status</router-link>
        <router-link class="link" to="/mcstatus" tag="button">Minecraft Status</router-link>
        <span>暗色模式 <n-switch v-model:value="localDarktheme" /></span>
      </template>
    </n-space>
  </n-card>
</template>

<script setup>
import { NButton, NCard, NDrawer, NSpace, NSwitch } from 'naive-ui';
import { ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
  darktheme: Boolean
});

const emit = defineEmits(['update:darktheme']);

const localDarktheme = ref(props.darktheme);
const showMenu = ref(false);
const isMobile = ref(window.innerWidth < 600);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

watch(localDarktheme, (newValue) => {
  emit('update:darktheme', newValue);
});

window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth < 600;
});
</script>

<style scoped>
#iheader {
  box-sizing: border-box; 
  margin-bottom: 10px;
}

.link {
  color: var(--n-text-color); 
}
.linkm {
  padding-top: 50px;
  padding-bottom: 0px;
}

.link:hover {
  background-color: var(--n-fill-color);
}
</style>