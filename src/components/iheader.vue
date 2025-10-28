<template>
  <header id="iheader"
    style="width: 100%;border-bottom: 1px solid rgb(39, 39, 42);display: flex;justify-content: center;">
    <template v-if="isMobile">
      <div @click="toggleMenu" style="display: flex;justify-content: center; align-items: center; width: 100%;">
        <n-icon size="15" style="margin: 5px;" :component="Bars" />
        <span>目录</span>
      </div>
      <n-drawer v-model:show="showMenu" placement="left">
        <div vertical style="display: flex;font-size: large;flex-direction: column;align-items: flex-start;">
          <template v-for="link in links" :key="link.to">
            <router-link class="linkm" :to="link.to" tag="button" @click.native="closeMenu">
              <component :is="link.icon" style="width: 15px; margin-right: 7px;" v-if="link.icon" />
              <span >{{ link.label }}</span>
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
    <div v-else style="display: flex;justify-content: space-between; width: 800px;">
      <div style="display: flex;  justify-content: space-between;">
        <template v-for="link in links" :key="link.to">
          <router-link
            class="link"
            :to="link.to"
            tag="button"
            style="font-size: small;"
            :style="{ color: (link.to === '/' ? $route.path === '/' : $route.path.startsWith(link.to)) ? 'rgb(42, 148, 125)' : '' }"
          >
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
  </header>
</template>

<script setup>
//https://www.xicons.org/#/
import { Bars, Calendar, Home, Moon, Paste, Server, Steam, StickyNote, Sun, UserClock } from '@vicons/fa';
import { NDrawer, NIcon, NSwitch } from 'naive-ui';
import { ref, watch } from 'vue';
import { RouterLink,useRoute } from 'vue-router';
const routes = useRoute(); // 获取当前路由对象
const keysss = ref(routes.params.id || "");
const props = defineProps({
  darktheme: Boolean
});

const emit = defineEmits(['update:darktheme']);

const localDarktheme = ref(props.darktheme);
const showMenu = ref(false);
const isMobile = ref(window.innerWidth < 800);
// 生成3位 a-z 随机字符串
const gen3Lower = () => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => letters[b % 26]).join('');
};

const links = [
  { to: '/', label: 'home', icon: Home },
  { to: '/note', label: 'Note', icon: StickyNote },
  { to: '/doing', label: 'Doing', icon: UserClock },
  { to: '/steam', label: 'Steam Status', icon: Steam },
  { to: '/mcstatus', label: 'MC Status', icon: Server },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/e/' + keysss.value || gen3Lower(), label: 'Paste', icon: Paste }

];

const toggleMenu = () => showMenu.value = !showMenu.value;

const closeMenu = () => showMenu.value = false;

watch(localDarktheme, (newValue) => emit('update:darktheme', newValue));

window.addEventListener('resize', () => isMobile.value = window.innerWidth < 900);
</script>

<style scoped>
#iheader {
  box-sizing: border-box;
  margin-bottom: 30px;
  padding: 10px;
}

.link {
  color: var(--n-text-color);
  margin: 0 20px;
  margin-left: 5px
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