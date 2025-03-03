<template>
  <n-card id="iheader" style="width: 100%;" >
      <template v-if="isMobile">
        <n-button @click="toggleMenu">☰</n-button>
        <n-drawer v-model:show="showMenu" placement="left">
          <div vertical style="display: flex;font-size: large;flex-direction: column;align-items: center;">
            <router-link class="linkm" to="/" tag="button">Home</router-link>
            <router-link class="linkm" to="/steam" tag="button">Steam Status</router-link>
            <router-link class="linkm" to="/mcstatus" tag="button">Minecraft Status</router-link>
            <router-link class="linkm" to="/calendar" tag="button">Calendar</router-link>
            <span class="linkm"><n-switch v-model:value="localDarktheme" /></span>
          </div>
        </n-drawer>
      </template>
      <div v-else style="display: flex;justify-content: space-between;">
        <div style="display: flex;  justify-content: space-between;">
          <router-link class="link" to="/" tag="button">Home</router-link>
          <router-link class="link" to="/steam" tag="button">Steam Status</router-link>
          <router-link class="link" to="/mcstatus" tag="button">Minecraft Status</router-link>
          <router-link class="link" to="/calendar" tag="button">Calendar</router-link>
        </div>
        <span><n-switch v-model:value="localDarktheme" /></span>
      </div>
  </n-card>
</template>

<script setup>
import { NButton, NCard, NDrawer, NSwitch } from 'naive-ui';
import { ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
  darktheme: Boolean
});

const emit = defineEmits(['update:darktheme']);

const localDarktheme = ref(props.darktheme);
const showMenu = ref(false);
const isMobile = ref(window.innerWidth < 800);

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
  margin: 0 20px;
}

.linkm {
  margin-top: 50px;
  padding-bottom: 0px;
}

.link:hover {
  background-color: var(--n-fill-color);
  color: rgb(42, 148, 125);
}
</style>