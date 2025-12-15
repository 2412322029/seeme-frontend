<template>
  <div class="header-placeholder"></div>
  <header id="iheader">
    <template v-if="isMobile">
      <n-layout-header class="mobile-header" bordered @click="toggleMenu">
        <n-icon size="15" class="mobile-menu-icon" :component="Bars" />
        <span>目录</span>
      </n-layout-header>
      <n-drawer v-model:show="showMenu" placement="left" class="mobile-drawer">
        <div class="drawer-content">
          <template v-for="link in links" :key="link.to||link.at">
            <router-link v-if="link.to" class="drawer-link" :to="link.to" tag="button" @click.native="closeMenu"
              :class="{ 'active': isActiveLink(link) }">
              <component :is="link.icon" class="drawer-link-icon" v-if="link.icon" />
              <span>{{ link.label }}</span>
            </router-link>
            <a v-if="link.at" class="drawer-link" :href="link.at" target="_blank" @click="closeMenu">
              <component :is="link.icon" class="drawer-link-icon" v-if="link.icon" />
              <span>{{ link.label }}</span>
            </a>
          </template>
          <div class="drawer-theme-switch">
            <n-switch v-model:value="localDarktheme">
              <template #checked-icon>
                <n-icon :component="Moon" />
              </template>
              <template #unchecked-icon>
                <n-icon :component="Sun" />
              </template>
            </n-switch>
          </div>
        </div>
      </n-drawer>
    </template>
    <!-- 使用 class 控制紧凑/展开样式，动画与背景都通过 CSS 实现 -->
    <n-layout-header v-else class="main-header" :class="{ 'header-compact': headerswitch }">
      <div class="header-left"> </div>
      <div class="header-center">
        <template v-for="(link, idx) in links.slice(0, showcount)" :key="link.to + idx">
          <router-link class="main-link" :to="link.to" tag="button" :class="{ 'active': isActiveLink(link) }">
            <component :is="link.icon" class="main-link-icon" v-if="link.icon" />
            <span>{{ link.label }}</span>
          </router-link>
        </template>
        <n-dropdown :options="moreOptions" @select="onMoreSelect" trigger="click" placement="bottom">
          <n-button class="more-btn" :bordered="false">
            <n-icon :component="Bars" class="more-btn-icon" />
            <span>更多</span>
          </n-button>
        </n-dropdown>
      </div>

      <div class="header-right">
        <n-switch v-model:value="localDarktheme">
          <template #checked-icon>
            <n-icon :component="Moon" class="theme-switch-icon" />
          </template>
          <template #unchecked-icon>
            <n-icon :component="Sun" class="theme-switch-icon" />
          </template>
        </n-switch>
      </div>
    </n-layout-header>
  </header>
</template>

<script setup>
//https://www.xicons.org/#/
import { Bars, Calendar, CommentDots, ExternalLinkAlt, Home, Link, Moon, Paste, Server, SolarPanel, Steam, StickyNote, Sun, Toolbox, UserClock } from '@vicons/fa';
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
const showcount = ref(7);
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
  { to: '/tools', label: '工具', icon: Toolbox },
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
  if (option.key.startsWith('http')) {
    window.open(option.key, '_blank');
  } else {
    router.push(option.key).catch(() => { });
  }
}

function isActiveLink(link) {
  if (link.to === '/') {
    return routes.path === '/';
  }
  // 确保路径匹配是完整的段，避免/note和/notes的混淆
  return routes.path === link.to || routes.path.startsWith(link.to + '/');
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
  border-bottom: 1px solid var(--n-border-color);
  display: flex;
  justify-content: center;
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.header-placeholder {
  width: 100%;
  height: 100px;
}

/* 移动端样式增强 */
.mobile-header {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 40px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: var(--n-card-background-color);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px) saturate(1.2);
}

.mobile-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.mobile-header:hover::before {
  left: 100%;
}

.mobile-header:hover {
  background-color: var(--n-hover-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mobile-menu-icon {
  margin: 5px;
  transition: transform 0.3s ease;
}

.mobile-header:hover .mobile-menu-icon {
  transform: rotate(90deg);
}

/* 抽屉动画增强 */
.mobile-drawer {
  --n-drawer-body-background-color: var(--n-card-background-color);
  --n-drawer-body-border-color: var(--n-border-color);
  --n-drawer-box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.dark-theme .mobile-drawer {
  --n-drawer-box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1);
}

/* 抽屉内容增强 */
.drawer-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  font-size: 18px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

/* 菜单项增强 */
.drawer-link {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  width: calc(100% - 40px);
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  text-align: left;
  text-decoration: none;
  color: var(--n-text-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 3px;
  margin-bottom: 8px;
  /* border: 1px solid transparent; */
  position: relative;
  overflow: hidden;
  font-weight: 400;
}

.drawer-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background-color: var(--n-primary-color);
  transition: height 0.3s ease;
}

.drawer-link:hover {
  background-color: var(--n-hover-color);
  color: var(--n-primary-color);
  border-color: var(--n-primary-color-light-8);
  transform: translateX(8px);
}

.drawer-link:hover::before {
  height: 60%;
}

.drawer-link:active {
  transform: translateX(4px);
  transition: transform 0.1s ease;
  color: hsla(160, 100%, 37%, 1);
  background-color: var(--n-primary-color-light-9);
  border-color: var(--n-primary-color-light-7);
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.drawer-link.active::before {
  height: 60%;
}

.active {
  color: hsla(160, 100%, 37%, 1) !important;
}

/* 图标增强 */
.drawer-link-icon {
  width: 22px;
  height: 22px;
  margin-right: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-link:hover .drawer-link-icon {
  transform: scale(1.2) rotate(5deg);
  color: var(--n-primary-color);
}

/* 主题切换开关增强 */
.drawer-theme-switch {
  margin-top: 30px;
  padding: 20px;
  width: calc(100% - 40px);
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: 1px solid var(--n-border-color);
  background-color: var(--n-card-background-color);
  border-radius: 12px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
  position: relative;
}

.drawer-theme-switch::before {
  content: '切换主题';
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--n-card-background-color);
  padding: 0 12px;
  font-size: 12px;
  color: var(--n-text-color-2);
  border-radius: 6px;
  border: 1px solid var(--n-border-color);
}

/* 外部链接样式区分 */
.drawer-link[target="_blank"] {
  border-left: 2px solid var(--n-info-color);
}

.drawer-link[target="_blank"]::after {
  content: '↗';
  margin-left: auto;
  opacity: 0.6;
  font-size: 14px;
}

/* 滚动条样式 */
.drawer-content::-webkit-scrollbar {
  width: 6px;
}

.drawer-content::-webkit-scrollbar-track {
  background: var(--n-card-background-color);
  border-radius: 3px;
}

.drawer-content::-webkit-scrollbar-thumb {
  background: var(--n-border-color);
  border-radius: 3px;
}

.drawer-content::-webkit-scrollbar-thumb:hover {
  background: var(--n-border-color-hover);
}

/* 桌面端样式 */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  /* max-width: 1200px; */
  height: 70px;
  padding: 0 24px;
  box-sizing: border-box;
  backdrop-filter: blur(12px) saturate(1.2);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--n-border-color);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: var(--n-card-background-color);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transform: translateY(0);
}

/* 紧凑模式（滚动后） */
.main-header.header-compact {
  height: 50px;
  padding: 0 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid var(--n-border-color-hover);
  backdrop-filter: blur(20px) saturate(1.3);
  -webkit-backdrop-filter: blur(20px);
}

.header-left {
  width: 80px;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: gap 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-header.header-compact .header-center {
  gap: 4px;
}

.header-right {
  display: flex;
  align-items: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-header.header-compact .header-right {
  transform: translateY(-1px);
}

/* 导航链接样式 */
.main-link {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  /* border: 1px solid transparent; */
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  text-decoration: none;
  color: var(--n-text-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 3px;
  white-space: nowrap;
}

.main-link:hover {
  background-color: var(--n-hover-color);
  color: var(--n-primary-color);
  border-color: var(--n-primary-color-light-8);
}

.main-link.active {
  background-color: var(--n-primary-color-light-9);
  font-weight: 900;
}

.main-link-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-header.header-compact .main-link {
  padding: 6px 8px;
  font-size: 13px;
}

.main-header.header-compact .main-link-icon {
  width: 14px;
  height: 14px;
  margin-right: 6px;
}

/* 更多按钮样式 */
.more-btn {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: var(--n-text-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 3px;
}

.more-btn:hover {
  background-color: var(--n-hover-color);
  color: var(--n-primary-color);
  border-color: var(--n-primary-color-light-8);
}

.more-btn-icon {
  width: 14px;
  height: 14px;
  margin-right: 6px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-header.header-compact .more-btn {
  padding: 6px 8px;
  font-size: 13px;
}

.main-header.header-compact .more-btn-icon {
  width: 13px;
  height: 13px;
  margin-right: 4px;
}

/* 主题切换按钮 */
.theme-switch-icon {
  width: 16px;
  height: 16px;
}

/* 主题增强效果 */
/* 深色主题增强效果 */
.dark-theme .drawer-link {
  color: var(--n-text-color);
}

.dark-theme .drawer-link:hover {
  color: var(--n-primary-color);
  border-color: var(--n-primary-color-light-6);
}

.dark-theme .main-link:hover {
  border-color: var(--n-primary-color-light-6);
}

/* 主题切换动画增强 */
.n-switch {
  transition: transform 0.3s ease;
}

.n-switch:hover {
  transform: scale(1.05);
}

.theme-switch-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.n-switch:hover .theme-switch-icon {
  transform: scale(1.2) rotate(15deg);
}

/* 移动端主题切换增强 */
.dark-theme .mobile-header {
  background-color: var(--n-card-background-color);
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.1);
}

.light-theme .mobile-header {
  background-color: var(--n-card-background-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 增强主题背景效果 */
.dark-theme .main-header {
  background-color: rgba(24, 24, 24, 0.8);
}

.light-theme .main-header {
  background-color: rgba(255, 255, 255, 0.8);
}

/* 增强主题边框效果 */
.dark-theme .main-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.light-theme .main-header {
  border-bottom-color: rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 800px) {
  .header-placeholder {
    height: 40px;
  }
}

@media (min-width: 801px) and (max-width: 1024px) {
  .main-header {
    max-width: 100%;
    padding: 0 16px;
  }
}
</style>