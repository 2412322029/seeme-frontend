<template>
  <div class="gdmap-wrap">
    <auth v-if="!isAuthed" @auth-success="onAuthed" @authSuccess="onAuthed" />
    <n-card v-else title="历史轨迹" size="small">
      <div class="toolbar">
        <n-date-picker v-model:value="range" type="datetimerange" size="small" style="max-width:320px" />
        <n-button size="small" @click="loadTrack" :disabled="!range || loading" :loading="loading">加载</n-button>
        <n-button size="small" tertiary @click="clearTrack" :disabled="!startMarker">清除</n-button>
        <n-popover trigger="hover" v-if="stats.count > 0">
          <template #trigger>
            <span class="stats-badge">📊 {{ stats.count }}</span>
          </template>
          <div class="stats-detail">
            <div><strong>点位:</strong> {{ stats.count }}</div>
            <div><strong>时长:</strong> {{ stats.timeSpan }}</div>
            <div v-if="stats.distance"><strong>距离:</strong> {{ stats.distance }}</div>
            <div v-if="stats.avgSpeed"><strong>速度:</strong> {{ stats.avgSpeed }}</div>
          </div>
        </n-popover>
      </div>
      <div ref="mapRef" class="map-box"></div>
      <n-alert v-if="err" type="error" :title="String(err)" style="margin-top:8px" closable @close="err=''" />
    </n-card>
  </div>
</template>

<script setup>
import { qlocation } from "@/components/api";
import AMapLoader from "@amap/amap-jsapi-loader";
import { NAlert, NButton, NCard, NDatePicker, NPopover } from "naive-ui";
import { onMounted, ref, watch } from "vue";
import Auth from "./auth.vue";

const isAuthed = ref(!!localStorage.getItem("admin_api_key"));
function onAuthed() { isAuthed.value = !!localStorage.getItem("admin_api_key"); }

const mapRef = ref(null);
let map = null;
let startMarker = null;
let endMarker = null;
let pointMarkers = [];
let infoWindow = null;
let cluster = null;

const now = Date.now();
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
const range = ref([oneMonthAgo.getTime(), now]);
const loading = ref(false);
const err = ref("");
const stats = ref({ count: 0, timeSpan: '', distance: '', avgSpeed: '' });

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY || localStorage.getItem('amap_key') || '';

async function loadAMapJs() {
  if (window.AMap) return window.AMap;
  if (!AMAP_KEY) throw new Error('缺少 AMap Key');
  
  return await AMapLoader.load({
    key: AMAP_KEY,
    version: '2.0',
    plugins: [], // 暂时移除聚合，直接渲染
  });
}

async function ensureMap() {
  if (map || !mapRef.value) return;
  const AMap = await loadAMapJs();
  map = new AMap.Map(mapRef.value, { 
    resizeEnable: true, 
    zoom: 12, 
    center: [114.30, 30.60] 
  });
}

function clearTrack() {
  err.value = "";
  stats.value = { count: 0, timeSpan: '', distance: '', avgSpeed: '' };
  if (cluster) { cluster.setMap(null); cluster = null; }
  // 聚合模式下不单独移除 marker，只清空数组
  pointMarkers = [];
  startMarker = null;
  endMarker = null;
  if (infoWindow) { try { infoWindow.close(); } catch {} infoWindow = null; }
}

function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function calcStats(locs) {
  if (!locs?.length) return { count: 0, timeSpan: '', distance: '', avgSpeed: '' };
  const count = locs.length;
  const timeSpanSec = locs[locs.length - 1].ts - locs[0].ts;
  const hours = Math.floor(timeSpanSec / 3600);
  const mins = Math.floor((timeSpanSec % 3600) / 60);
  const timeSpan = hours > 0 ? `${hours}h${mins}m` : `${mins}m`;
  let totalDist = 0;
  for (let i = 1; i < locs.length; i++) {
    totalDist += calcDistance(locs[i-1].lat, locs[i-1].lon, locs[i].lat, locs[i].lon);
  }
  const distance = totalDist > 1000 ? `${(totalDist/1000).toFixed(2)}km` : `${totalDist.toFixed(0)}m`;
  const avgSpeed = timeSpanSec > 0 ? `${((totalDist/timeSpanSec)*3.6).toFixed(1)}km/h` : '';
  return { count, timeSpan, distance, avgSpeed };
}

function formatTs(sec, short = false) {
  if (!sec) return "";
  const d = new Date(Number(sec) * 1000);
  const pad = n => n < 10 ? `0${n}` : n;
  if (short) return `${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function loadTrack() {
  if (!isAuthed.value) { err.value = "请先认证"; return; }
  if (!range.value?.length) return;
  err.value = "";
  loading.value = true;
  try {
    const AMap = await loadAMapJs();
    await ensureMap();
    const start = Math.floor(range.value[0] / 1000);
    const end = Math.floor(range.value[1] / 1000);
    const res = await qlocation(start, end);
    const locs = res?.locations || [];
    console.log('加载点位数据:', locs);
    stats.value = calcStats(locs);
    if (!locs.length) { clearTrack(); err.value = "无轨迹点"; return; }
    clearTrack();
    infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30) });

    const addMarker = (loc, idx, isStart, isEnd) => {
      const pos = [loc.lon, loc.lat];
      const bgClass = isStart ? 'marker-start' : isEnd ? 'marker-end' : 'marker-point';
      const displayIdx = isStart ? 1 : isEnd ? locs.length : idx + 1;
      
      // 创建 DOM 结构
      const markerDiv = document.createElement('div');
      markerDiv.className = bgClass;
      markerDiv.innerHTML = `
        <div class="marker-dot"></div>
        <div class="marker-label" style="color: #000 !important;">${displayIdx}</div>
      `;
      
       const m = new AMap.Marker({
         position: pos,
         content: markerDiv,
         anchor: 'center',
         clickable: true,
         extData: { index: idx, location: loc }
       });
       m.on('click', () => {
         const { location: l, index: i } = m.getExtData();
         const fullTime = formatTs(l.ts);
         let prevDist = '', nextDist = '';
         if (i > 0) {
           const d = calcDistance(locs[i-1].lat, locs[i-1].lon, l.lat, l.lon);
           prevDist = d > 1000 ? `${(d/1000).toFixed(2)}km` : `${d.toFixed(0)}m`;
         }
         if (i < locs.length - 1) {
           const d = calcDistance(l.lat, l.lon, locs[i+1].lat, locs[i+1].lon);
           nextDist = d > 1000 ? `${(d/1000).toFixed(2)}km` : `${d.toFixed(0)}m`;
         }
         const label = i === 0 ? '🟢起点' : i === locs.length - 1 ? '🔴终点' : '点位';
         infoWindow.setContent(`
           <div class="info-content">
             <div class="info-title">${label} #${i+1}/${locs.length}</div>
             <div>📅 ${fullTime}</div>
             <div>📍 ${l.lat.toFixed(6)}, ${l.lon.toFixed(6)}</div>
             ${prevDist ? `<div>⬅️ ${prevDist}</div>` : ''}
             ${nextDist ? `<div>➡️ ${nextDist}</div>` : ''}
           </div>
         `);
         infoWindow.open(map, pos);
       });
       return m;
     };

    // 创建所有点位
    locs.forEach((p, idx) => {
       const isStart = idx === 0;
       const isEnd = idx === locs.length - 1;
       const m = addMarker(p, idx, isStart, isEnd);
       pointMarkers.push(m);
     });
     
    console.log('创建标记数量:', pointMarkers.length, '坐标:', pointMarkers.map(m => m.getPosition()));
    
    // 直接添加所有标记到地图（不使用聚合）
    if (pointMarkers.length > 0) {
      map.add(pointMarkers);
      console.log('已添加', pointMarkers.length, '个标记到地图');
    }
    
     // 保存起点终点引用
     if (pointMarkers.length > 0) {
       startMarker = pointMarkers[0];
       endMarker = pointMarkers[pointMarkers.length - 1];
     }
     
     // 自适应视野（包含所有点）
     if (pointMarkers.length > 0) {
      map.setFitView(pointMarkers, false, [100,100,100,100]);
      console.log('视野已适配');
     }
   } catch (e) {
     console.error('加载轨迹失败:', e);
     err.value = e?.message || String(e);
   } finally {
     loading.value = false;
   }
 }

onMounted(async () => {
  if (!isAuthed.value) return;
  try { await loadAMapJs(); await ensureMap(); loadTrack(); } 
  catch (e) { err.value = e?.message || String(e); }
});

watch(isAuthed, async v => {
  if (!v) return;
  try { await loadAMapJs(); await ensureMap(); } 
  catch (e) { err.value = e?.message || String(e); }
});
</script>

<style scoped>
.gdmap-wrap { width: 100%; }
.toolbar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 8px; }
.stats-badge {
  background: var(--n-color-target);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: help;
  transition: all 0.2s;
}
.stats-badge:hover { opacity: 0.8; }
.stats-detail { font-size: 13px; line-height: 1.8; }
.stats-detail > div { padding: 2px 0; }
.map-box { width: 100%; height: 60vh; min-height: 320px; border-radius: 8px; overflow: hidden; }

/* 点位容器 */
.marker-point, .marker-start, .marker-end {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 24px;
  height: 40px;
}

/* 圆点图像 */
.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  transition: all 0.3s;
}

.marker-point .marker-dot {
  background: radial-gradient(circle, rgba(22,119,255,0.9), rgba(22,119,255,0.6));
  animation: pulse 2s ease-in-out infinite;
}
.marker-start .marker-dot {
  background: linear-gradient(135deg, #10b981, #059669);
}
.marker-end .marker-dot {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

/* 悬停效果 */
.marker-point:hover .marker-dot,
.marker-start:hover .marker-dot,
.marker-end:hover .marker-dot {
  width: 16px;
  height: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  animation: none;
}


.marker-label {
  position: absolute;
  top: 14px;
  background: rgba(255, 255, 255, 0.98) !important;
  color: #000 !important;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 3px;
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.marker-point:hover .marker-label,
.marker-start:hover .marker-label,
.marker-end:hover .marker-label {
  opacity: 1;
}

/* 起点终点标签始终显示 */
.marker-start .marker-label,
.marker-end .marker-label {
  opacity: 1 !important;
  background: rgba(255, 255, 255, 1) !important;
  font-weight: 700;
}

/* 起点终点圆点更大 */
.marker-start .marker-dot,
.marker-end .marker-dot {
  width: 14px;
  height: 14px;
}

.marker-start:hover .marker-dot,
.marker-end:hover .marker-dot {
  width: 18px;
  height: 18px;
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% { 
    transform: scale(1);
     opacity: 1; 
   }
   50% { 
    transform: scale(1.15);
     opacity: 0.8; 
   }
}

/* 信息窗口内容（适配暗色） */
:global(.amap-info-content) {
  background: var(--n-color) !important;
}
.info-content { 
  padding: 8px 10px; 
  font-size: 13px; 
  line-height: 1.6;
  color: #000 !important;
}
.info-title {
  font-weight: 600;
  margin-bottom: 6px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 4px;
  color: #000 !important;
}
.info-content > div { margin: 4px 0; }

@media (max-width: 600px) {
  .map-box { height: 50vh; }
  .marker-dot { width: 10px; height: 10px; }
  .marker-point:hover .marker-dot { width: 14px; height: 14px; }
  .marker-start .marker-dot, .marker-end .marker-dot { width: 12px; height: 12px; }
  .marker-start:hover .marker-dot, .marker-end:hover .marker-dot { width: 16px; height: 16px; }
  /* .marker-label { font-size: 9px; padding: 1px 4px; top: 12px; } */
}
.marker-label{
    color: #000 !important;
}
</style>