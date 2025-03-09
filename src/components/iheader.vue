<template>
  <n-card id="iheader" style="width: 100%;">
    <template v-if="isMobile">
      <n-button @click="toggleMenu"> <n-icon size="15" style="margin: 2px;" :component="Bars" />
        目录</n-button>
      <n-drawer v-model:show="showMenu" placement="left">
        <div vertical style="display: flex;font-size: large;flex-direction: column;align-items: flex-start;">
          <template v-for="link in links" :key="link.to">
            <router-link class="linkm" :to="link.to" tag="button" @click.native="closeMenu">
              <component :is="link.icon" style="width: 15px; margin-right: 7px;" v-if="link.icon" />
              <span>{{ link.label }}</span>
            </router-link>
          </template>
          <span class="linkm">
            <n-switch v-model:value="localDarktheme">
              <template #checked-icon>
                <n-icon :component="Moon" />
              </template>
              <template #unchecked-icon>
                <n-icon :component="Sun" />
              </template>
            </n-switch>
          </span>
        </div>
      </n-drawer>
    </template>
    <div v-else style="display: flex;justify-content: space-between;">
      <div style="display: flex;  justify-content: space-between;">
        <template v-for="link in links" :key="link.to">
          <router-link class="link" :to="link.to" tag="button">
            <component :is="link.icon" style="width: 15px; margin-right: 7px;" v-if="link.icon" />
            <span>{{ link.label }}</span>
          </router-link>
        </template>
      </div>
      <span style="display: flex;align-items: center;">
        <n-switch v-model:value="localDarktheme">
          <template #checked-icon>
            <n-icon :component="Moon" />
          </template>
          <template #unchecked-icon>
            <n-icon :component="Sun" />
          </template>
        </n-switch>
      </span>
    </div>
  </n-card>
</template>

<script setup>
import { Bars, Calendar, Home, Moon, Server, Steam, Sun,UserClock } from '@vicons/fa';
import { NButton, NCard, NDrawer, NIcon, NSwitch } from 'naive-ui';
import { ref, watch } from 'vue';
import { RouterLink } from 'vue-router';

const props = defineProps({
  darktheme: Boolean
});

const emit = defineEmits(['update:darktheme']);

const localDarktheme = ref(props.darktheme);
const showMenu = ref(false);
const isMobile = ref(window.innerWidth < 800);

const links = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/doing', label: 'Doing', icon: UserClock },
  { to: '/steam', label: 'Steam Status', icon: Steam },
  { to: '/mcstatus', label: 'Minecraft Status', icon: Server },
  { to: '/calendar', label: 'Calendar', icon: Calendar }

];

const toggleMenu = () => showMenu.value = !showMenu.value;

const closeMenu = () => showMenu.value = false;

watch(localDarktheme, (newValue) => emit('update:darktheme', newValue));

window.addEventListener('resize', () => isMobile.value = window.innerWidth < 1200);
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
  padding: 20px;
  width: calc(100% - 40px);
}

.link,
.linkm {
  display: flex;
  align-items: center;
  border: none;
  cursor: pointer;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
  transition-duration: 0.4s;
}

.link:hover {
  background-color: var(--n-fill-color);
  color: rgb(42, 148, 125);
}
</style>