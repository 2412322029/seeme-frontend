<template>
  <div style="width: 100%; height: 100px;"></div>
  <header id="iheader"
    style="width: 100%;border-bottom: 1px solid rgb(39, 39, 42);display: flex;justify-content: center;">
    <template v-if="isMobile">
      <n-layout-header bordered @click="toggleMenu"
        style="display: flex;justify-content: center; align-items: center; width: 100%; height: 40px;">
        <n-icon size="15" style="margin: 5px;" :component="Bars" />
        <span>目录</span>
      </n-layout-header>
      <n-drawer v-model:show="showMenu" placement="left">
        <div vertical style="display: flex;font-size: large;flex-direction: column;align-items: flex-start;">
          <template v-for="link in links" :key="link.to||link.at">
            <router-link v-if="link.to" class="linkm" :to="link.to" tag="button" @click.native="closeMenu">
              <component :is="link.icon" style="width: 15px; margin-right: 7px;" v-if="link.icon" />
              <span>{{ link.label }}</span>
            </router-link>
            <a v-if="link.at" class="linkm" :href="link.at" target="_blank" @click="closeMenu">
              <component :is="link.icon" style="width: 15px; margin-right: 7px;" v-if="link.icon" />
              <span>{{ link.label }}</span>
            </a>
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
    <!-- 使用 class 控制紧凑/展开样式，动画与背景都通过 CSS 实现 -->
    <n-layout-header v-else class="main-header" :class="{ 'header-compact': headerswitch, 'dark': darktheme }">
      <div class="header-left"> </div>
      <div class="header-center">
        <template v-for="(link, idx) in links.slice(0, showcount)" :key="link.to + idx">
          <router-link class="link" :to="link.to" tag="button" style="font-size: small;"
            :style="{ color: (link.to === '/' ? $route.path === '/' : $route.path.startsWith(link.to)) ? 'rgb(42, 148, 125)' : '' }">
            <component :is="link.icon" style="width: 15px; margin-right: 7px;" v-if="link.icon" />
            <span>{{ link.label }}</span>
          </router-link>
        </template>
        <n-dropdown :options="moreOptions" @select="onMoreSelect" trigger="click" placement="bottom">
          <n-button class="link more-btn" :bordered="false"
            style="background: transparent; display: flex; align-items: center;font-size: small;">
            <n-icon :component="Bars" style="margin-right:6px;" />
            <span>更多</span>
          </n-button>
        </n-dropdown>
      </div>

      <span class="header-right" style="display: flex;align-items: center;">
        <n-switch :value="darktheme" @update:value="$emit('update:darktheme', $event)">
          <template #checked-icon>
            <n-icon :component="Moon" />
          </template>
          <template #unchecked-icon>
            <n-icon :component="Sun" />
          </template>
        </n-switch>
      </span>
    </n-layout-header>
  </header>
</template>

<script setup>
//https://www.xicons.org/#/
import { Bars, Calendar, CommentDots, ExternalLinkAlt, Home, Link, Moon, Paste, Server, Steam, StickyNote, Sun, UserClock, SolarPanel } from '@vicons/fa';
import { NButton, NDrawer, NDropdown, NIcon, NLayoutHeader, NSwitch } from 'naive-ui';
import { computed, h, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const routes = useRoute();
const router = useRouter();
const keysss = ref(routes.params.id || "");
const props = defineProps({
  darktheme: Boolean
});

const emit = defineEmits(['update:darktheme']);
const showcount = ref(6);
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
  { to: '/', label: '主页', icon: Home },
  { to: '/note', label: '笔记', icon: StickyNote },
  { to: '/doing', label: 'doing', icon: UserClock },
  { to: '/e/' + keysss.value || gen3Lower(), label: '剪切板', icon: Paste },
  { to: '/calendar', label: '番剧日历', icon: Calendar },
  { to: '/comment', label: '留言', icon: CommentDots },
  { to: '/steam', label: 'Steam 状态', icon: Steam },
  { to: '/mcstatus', label: 'Minecraft 状态', icon: Server },
  { to: '/admin', label: '管理', icon: SolarPanel },
  { at: 'https://status.not404.cc', label: '站点状态', icon: Link },
  { at: 'https://cloud.umami.is/share/saNvFCcrXlKMpGie', label: '访问统计', icon: ExternalLinkAlt },
];

const toggleMenu = () => showMenu.value = !showMenu.value;

const closeMenu = () => showMenu.value = false;
const headerswitch = ref(false);
watch(localDarktheme, (newValue) => emit('update:darktheme', newValue));
function handleScroll() {
  headerswitch.value = window.scrollY > 40;
}
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', () => isMobile.value = window.innerWidth < 900);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

function renderIcon(icon) {
  if (!icon) return null;
  return () => h(NIcon, null, { default: () => h(icon) });
}

const moreOptions = computed(() =>
  links.slice(showcount.value).map((l) => ({
    label: l.label,
    key: l.to || l.at,
    icon: renderIcon(l.icon),
    children: l.children,
    props: {
      onClick: () => {
        if (l.to) {
          router.push(l.to).catch(() => { });
        }
        if (l.at) {
          window.open(l.at, '_blank');
        }
      }
    },

  }))
);

function onMoreSelect(option) {
  if (!option || !option.key) return;
  router.push(option.key).catch(() => { });
}
</script>

<style scoped>
#iheader {
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
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

/* 新增：主 header 样式与切换动画（磨砂背景、尺寸、字体与间距平滑过渡） */
.main-header {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  height: 70px;
  padding: 10px 20px;
  box-sizing: border-box;
  /* 半透明磨砂背景 */
  /* background: rgba(255, 255, 255, 0.55); */
  /* 深色主题时可覆盖变量或在运行时调整 */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(39, 39, 42, 0.08);
  transition: height 250ms ease, padding 250ms ease, background 250ms ease, box-shadow 250ms ease, color 250ms ease;
  color: var(--n-text-color);
}

/* 暗色模式 */
.main-header.dark {
  background: rgba(20, 20, 24, 0.55);
  color: var(--n-foreground-color, #fff);
}

/* 紧凑模式（滚动后） */
.main-header.header-compact {
  height: 40px;
  padding: 6px 16px;
  /* background: rgba(255, 255, 255, 0.45); */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

/* 左、中、右 区域更细粒度控制 */
.header-left {
  font-size: 1rem;
  transition: font-size 250ms ease;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 12px;
  transition: gap 250ms ease;
}

.header-right {
  transition: transform 250ms ease;
}

/* 链接、更多按钮样式平滑变化 */
.link {
  font-size: 16px;
  transition: font-size 250ms ease, margin 250ms ease;
  padding: 6px 8px;
  border-radius: 4px;
}

.more-btn {
  padding: 6px 8px;
}

/* 紧凑时字体与间距缩小 */
.main-header.header-compact .link {
  font-size: 14px;
  padding: 4px 6px;
}

.main-header.header-compact .header-center {
  gap: 8px;
}

.main-header.header-compact .header-left {
  font-size: 0.9rem;
}

.main-header.header-compact .header-right {
  transform: translateY(-1px);
}
</style>