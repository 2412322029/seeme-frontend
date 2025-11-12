<template>
  <div class="paste-page">
    <!-- 标题及右侧操作按钮：收藏与管理放在标题右侧 -->
    <h3 v-if="key && key.trim()" class="title-row">
      <span class="title-left">Paste</span>
      <span class="title-key"><code v-if="validKey">{{ key }}.txt </code></span>
      <span class="title-actions">
        <!-- 收藏按钮始终显示，按 validKey 控制可用性 -->
        <n-button @click="toggleFavorite" :disabled="!validKey" size="small">
          <n-icon :component="Star" :color="isFavorited ? '#f5b400' : ''" />
        </n-button>
        <!-- 分享按钮（Share） -->
        <n-button @click="showModal = true" :disabled="!validKey" size="small">
          <n-icon :component="Qrcode" />
        </n-button>
        <!-- 收藏管理抽屉打开（AlignRight） -->
        <n-button @click="showFavorites = true" size="small">
          <n-icon :component="AlignRight" />
        </n-button>
      </span>
    </h3>
    <!-- 空 key 时的介绍内容 -->
    <div v-if="!key || !key.trim()" class="intro">
      <h3>关于 Paste 页面</h3>
      <p>
        这是一个简单的文本粘贴/分享服务。你可以以任意的三字母（例如
        <code>abc</code>）作为唯一标识，之后通过
        <code>{{ origin }}/e/abc</code> 读取或分享该文本。
        <code>收藏和管理功能，数据保存在浏览器本地</code>
      </p>
      <ul>
        <li>Key 格式：恰好 3 个英文字母（a-z）。</li>
        <li>内容大小限制：最多 8KB（UTF-8 字节）。</li>
        <li>#TODO 保存读取时diff远程本地不同之处，提示是否执行覆盖</li>
      </ul>
      <div style="
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          flex-direction: row-reverse;
        ">
        <n-button @click="generateAndOpen" type="primary">随机打开一个</n-button>
      </div>
    </div>

    <div class="editor" v-else>
      <div style="width: 100%">
        <n-input type="textarea" v-model:value="content" id="msgContent"
          :placeholder="'在此编辑内容，最多 ' + maxBytes + ' 字节（UTF-8）'" rows="12"></n-input>
      </div>
      <div class="meta">
        <span>大小：{{ utf8Size(content) }} 字节</span>
        <span v-if="utf8Size(content) > maxBytes" class="error">超过 8KB 限制</span>
      </div>
      <div class="row">
        <n-button @click="load" :disabled="loading || !validKey">读取</n-button>
        <n-button @click="save" :disabled="saving || !validKey">保存</n-button>
        <n-button @click="copyToClipboard" :disabled="!content">复制</n-button>
        <n-button @click="pasteFromClipboard">粘贴</n-button>
      </div>

      <div class="hint" v-if="!validKey">
        url:/e/xxx 必须为恰好 3 个英文字母（A-Z / a-z）。
      </div>
    </div>

    <div class="status" v-if="loading">读取中...</div>
    <div class="status" v-if="saving">保存中...</div>
    <div class="status error" v-if="error">{{ error }}</div>
    <div class="status success" v-if="success">{{ success }}</div>
  </div>

  <!-- 收藏管理抽屉 -->
  <n-drawer v-model:show="showFavorites" placement="right" :width="350">
    <div class="fav-drawer">
      <div style=" display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h4 style="margin: 0">
          <n-radio-group v-model:value="checkStrategy">
            <n-radio-button value="1"> 收藏管理 </n-radio-button>
            <n-radio-button value="2"> 草稿管理 </n-radio-button>
          </n-radio-group>
        </h4>
        <n-button size="small" @click="showFavorites = false">关闭</n-button>
      </div>
      <div v-if="(checkStrategy == '1')">
        <div style="
            display: flex;
            gap: 8px;
            align-items: center;
            margin-bottom: 8px;
          ">
          <n-button size="small" @click="selectedPaths.size > 0 ? selectAllno() : selectAll()">{{ selectedPaths.size > 0
            ? "全不选" : "全选" }}</n-button>
          <n-button size="small" tertiary @click="deleteSelected" :disabled="selectedPaths.size === 0">删除选中</n-button>
          <div style="flex: 1"></div>
          <div style="font-size: 12px; color: #666">
            共 {{ favorites.length }} 项
          </div>
        </div>
        <div v-if="favorites.length === 0" class="no-favs">暂无收藏</div>
        <div v-else class="fav-list">
          <div v-for="(f, idx) in favorites" :key="f.path" class="fav-item">
            <div class="fav-top">
              <!-- 使用 checked 布尔绑定，避免未初始化 value 导致的 prop 类型警告 -->
              <n-checkbox :checked="!!selectedMap[f.path]"
                @update:checked="(val) => onSelectChangeValue(f.path, val)" />
              <div class="fav-path clickable" @click="openFavorite(f.path)" title="点击打开">
                {{ f.path }}
              </div>
              <div class="fav-created">{{ formatCreated(f.created) }}</div>
            </div>
            <div class="fav-note-row">
              <!-- 显示 tags 列表（存在 tags 且未编辑），点击进入编辑 -->
              <!-- <div v-if="f.tags && f.tags.length && !f.editing" class="fav-tags" @click="f.editing = true">
              <n-tag v-for="(t,i) in f.tags" :key="i" size="small" style="margin-right:6px;">{{ t }}</n-tag>
            </div> -->

              <!-- 编辑状态：使用 NDynamicTags 编辑 tags -->
              <div style="padding-top: 9px">
                <n-dynamic-tags v-model:value="f.tags" placeholder="添加备注标签，回车确认" @update:value="() => saveFavorites()"
                  size="small" style="flex: 1" />
              </div>

              <!-- 单项删除已取消，批量删除请使用复选 + 删除选中 -->
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="(checkStrategy == '2')">
        <div style="font-size:12px; color:#666">编辑内容时每3s自动保存一次</div>
        <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
          <!-- <n-button size="small" @click="refreshDrafts">刷新</n-button> -->
          <n-popconfirm @positive-click="handleDelOk" @negative-click="handleDelSuspend">
            <template #trigger>
              <n-button size="small" :disabled="draftCount === 0" type="error">全部清除</n-button>
            </template>
            确认全部删除吗
          </n-popconfirm>
          <div style="flex:1"></div>
          <div style="font-size:12px; color:#666">
            共 {{ draftCount }} 项
          </div>
        </div>

        <div v-if="draftCount === 0" class="no-favs">
          暂无草稿
        </div>

        <div v-else class="fav-list">
          <div v-for="(draftKey, di) in draftKeys" :key="draftKey" class="fav-item">
            <div class="fav-top" style="align-items:flex-start;">
              <div style="display:flex; gap:8px; align-items:center; width:100%;">
                <div class="fav-path clickable" title="点击打开草稿" @click="openDraft(draftKey)">
                  ({{ di }}) paste_local:{{ draftKey }}
                </div><span v-if="draftKey == key" style="color: #f35f5f;">(当前编辑)</span>
                <div style="font-size:12px; color:#888; margin-left:auto;">
                  {{ utf8Size(getLocalDraft(draftKey) || '') }} 字节
                </div>
              </div>
            </div>

            <div
              style="padding-top:8px; color:#555; font-size:13px; white-space:pre-wrap; max-height:6em; overflow:hidden;">
              {{ (getLocalDraft(draftKey) || '').slice(0, 200) }}...
            </div>

            <div style="display:flex; gap:8px; margin-top:8px; justify-content: space-between">
              <div style="display:flex; gap:8px;">
                <n-button size="small" @click="openDraft(draftKey)">打开</n-button>
                <n-button size="small" tertiary @click="copyDraft(draftKey)">复制内容</n-button>
              </div>
              <n-button size="small" secondary type="error" @click="deleteDraft(draftKey)">删除</n-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </n-drawer>
  <n-modal v-model:show="showModal" transform-origin="center" aria-label="分享二维码" style="width: 300px" preset="card"
    title="分享二维码">
    <div>
      <n-qr-code :value="origin + '/e/' + key" :size="200" />
    </div>
  </n-modal>
</template>

<script setup>
import { AlignRight, Qrcode, Star } from "@vicons/fa";
import {
  NButton,
  NCheckbox,
  NDrawer,
  NDynamicTags,
  NIcon,
  NInput,
  NModal,
  NPopconfirm,
  NQrCode,
  NRadioButton,
  NRadioGroup,
  useDialog,
} from "naive-ui";
import { computed, h, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getPaste, setPaste } from "../components/api"; // 相对路径与项目结构一致
const checkStrategy = ref('1');
const showModal = ref(false);
const origin = import.meta.env.SSR ? "" : window.location.origin;
const route = useRoute(); // 获取当前路由对象
const router = useRouter(); // 获取路由实例
const key = ref(route.params.id || "");
const content = ref("");
// 新增：标记是否已保存过当前 key（控制收藏按钮显示）
const savedFlag = ref(false);
const loading = ref(false);
const saving = ref(false);
const error = ref("");
const success = ref("");
const maxBytes = 8 * 1024;
const validKey = computed(() => /^[A-Za-z]{3}$/.test((key.value || "").trim()));

function onKeyInput() {
  // 强制大写/小写可选，这里保留用户输入不改变
  error.value = "";
  success.value = "";
}

function utf8Size(str) {
  if (!str) return 0;
  try {
    return new TextEncoder().encode(str).length;
  } catch (e) {
    // 退回到简单计算：若不支持 TextEncoder
    return unescape(encodeURIComponent(str)).length;
  }
}
function share() {
  if (!validKey.value) {
    error.value = "Key 无效，无法分享";
    return;
  }
  const shareData = {
    title: `Paste: ${key.value}.txt`,
    text: content.value || "",
    url: `${origin}/e/${key.value}`,
  };
  if (navigator.share) {
    navigator
      .share(shareData)
      .then(() => {
        success.value = "已调用系统分享界面";
        setTimeout(() => (success.value = ""), 2000);
      })
      .catch((err) => {
        console.error("分享失败", err);
        error.value =
          "分享失败：" + (err && err.message ? err.message : String(err));
        setTimeout(() => (error.value = ""), 2500);
      });
  } else {
    // Fallback: 复制链接到剪贴板
    const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        success.value = "分享信息已复制到剪贴板";
        setTimeout(() => (success.value = ""), 2000);
      })
      .catch((err) => {
        console.error("复制分享信息失败", err);
        error.value =
          "复制分享信息失败：" +
          (err && err.message ? err.message : String(err));
        setTimeout(() => (error.value = ""), 2500);
      });
  }
}

// 新增：复制到剪贴板（兼容检测与 fallback）
async function copyToClipboard() {
  error.value = "";
  success.value = "";
  try {
    const text = content.value || "";
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      navigator.clipboard.writeText
    ) {
      await navigator.clipboard.writeText(text);
      success.value = "已复制到剪贴板";
    } else {
      // fallback：临时 textarea + execCommand
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      success.value = "已复制（兼容模式）";
    }
  } catch (e) {
    console.error("copy failed", e);
    error.value = "复制失败";
  } finally {
    setTimeout(() => {
      success.value = "";
      error.value = "";
    }, 2000);
  }
}

// 新增：从剪贴板粘贴到编辑区（受限于权限/浏览器支持）
async function pasteFromClipboard() {
  error.value = "";
  success.value = "";
  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      navigator.clipboard.readText
    ) {
      const t = await navigator.clipboard.readText();
      content.value = (content.value || "") + t;
      success.value = "已粘贴剪贴板内容";
    } else {
      error.value = "当前环境不支持剪贴板读取";
    }
  } catch (e) {
    console.error("paste failed", e);
    error.value = "粘贴失败（可能需要授权或不受支持）";
  } finally {
    setTimeout(() => {
      success.value = "";
      error.value = "";
    }, 2000);
  }
}

// 生成随机三字母 key 并打开（导航）
function randomKey() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  return Array.from(
    { length: 3 },
    () => letters[Math.floor(Math.random() * letters.length)]
  ).join("");
}
function generateAndOpen() {
  const k = randomKey();
  router.push({ name: "Paste", params: { id: k } });
  // 设置并加载
  key.value = k;
  load();
}
/* ========== 新版收藏数据结构 ========== */
const FAVORITES_KEY = "paste_favorites";
// 每项 { path, tags:[], created, editing }
const favorites = ref([]);

// 新增：控制收藏管理抽屉显示
const showFavorites = ref(false);
// 选中 map（reactive），用于批量删除
const selectedMap = reactive({});

// derived 通过 selectedMap 自动计算选中集合
const selectedPaths = computed(() => {
  return new Set(Object.keys(selectedMap).filter((k) => selectedMap[k]));
});

/* 当前页面用于收藏的标识路径（使用 /e/xxx 格式） */
const currentPath = computed(() => {
  const k = (key.value || "").trim();
  return k ? `/e/${k}` : "";
});

const isFavorited = computed(() => {
  if (!currentPath.value) return false;
  return favorites.value.some((f) => f.path === currentPath.value);
});

function formatCreated(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString();
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        favorites.value = arr.map((it) => {
          let obj;
          if (typeof it === "string") {
            obj = { path: it, tags: [], created: Date.now(), editing: false };
          } else {
            const oldNote = it.note || "";
            const tags = Array.isArray(it.tags)
              ? it.tags
              : oldNote
                ? oldNote
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
                : [];
            obj = {
              path: it.path || it,
              tags,
              created: it.created || Date.now(),
              editing: false,
            };
          }
          // 初始化 selectedMap（reactive）
          if (!(obj.path in selectedMap)) selectedMap[obj.path] = false;
          return obj;
        });
      }
    }
  } catch (_) {
    favorites.value = [];
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(
        favorites.value.map((f) => ({
          path: f.path,
          tags: f.tags || [],
          created: f.created,
        }))
      )
    );
    // ensure selectedMap keys exist
    favorites.value.forEach((f) => {
      if (!(f.path in selectedMap)) selectedMap[f.path] = false;
    });
  } catch (_) { }
}

function addFavorite(path, tags = []) {
  if (!path) return;
  if (!favorites.value.some((f) => f.path === path)) {
    const obj = { path, tags: tags || [], created: Date.now(), editing: false };
    favorites.value.unshift(obj);
    if (!(obj.path in selectedMap)) selectedMap[obj.path] = false;
    if (favorites.value.length > 100) favorites.value.length = 100;
    saveFavorites();
  }
}

function removeFavorite(path) {
  const idx = favorites.value.findIndex((f) => f.path === path);
  if (idx !== -1) {
    favorites.value.splice(idx, 1);
    delete selectedMap[path];
    saveFavorites();
  }
}

// 修改：直接使用 router.push(path)，确保能打开
function openFavorite(path) {
  if (!path) return;
  // 如果是 /e/xxx 等内部路径，直接 push path
  router.push(path)
}

/* 删除逻辑：只删除选中项 */
function deleteSelected() {
  const sel = Array.from(selectedPaths.value);
  if (sel.length === 0) {
    return;
  }
  sel.forEach((p) => removeFavorite(p));
  // 清空选择
  Object.keys(selectedMap).forEach((k) => {
    selectedMap[k] = false;
  });
  saveFavorites();
}

function selectAll() {
  favorites.value.forEach((f) => {
    selectedMap[f.path] = true;
  });
}
function selectAllno() {
  favorites.value.forEach((f) => {
    selectedMap[f.path] = false;
  });
}
// NCheckbox 回调适配（保留以防需要）
function onSelectChangeValue(path, val) {
  selectedMap[path] = !!val;
}

// // 备注 tags 失焦/变更时保存
// function onNoteBlur(f){
//   f.editing = false;
//   saveFavorites();
// }

// // 备注由 NDynamicTags 编辑时也保存
// function onTagsChange(){
//   saveFavorites();
// }

// toggleFavorite 保持，addFavorite 使用 tags 兼容
function toggleFavorite() {
  const p = currentPath.value;
  if (!p) return;
  if (favorites.value.some((f) => f.path === p)) {
    removeFavorite(p);
    success.value = "已从收藏移除";
  } else {
    addFavorite(p, []);
    success.value = "已收藏";
  }
  setTimeout(() => (success.value = ""), 2000);
}

async function save() {
  error.value = "";
  success.value = "";
  if (!validKey.value) {
    error.value = "Key 无效";
    return;
  }
  const k = key.value.trim();
  const txt = content.value || "";
  const size = utf8Size(txt);
  if (size === 0) {
    error.value = "内容不能为空";
    return;
  }
  if (size > maxBytes) {
    error.value = `内容超过 ${maxBytes} 字节限制（当前 ${size} 字节）`;
    return;
  }
  saving.value = true;
  try {
    // 先安全地获取远端当前内容并比较
    // let remote = '';
    // try {
    //   const r = await getPaste(k);
    //   remote = (r && typeof r.data === "string") ? r.data : (r && r.data) || '';
    // } catch (e) {
    //   // 若获取远端失败，不阻止保存，但提示用户
    //   console.warn('读取远端内容失败，直接尝试保存', e);
    // }
    // if (remote !== undefined && remote !== null && remote !== '' && remote !== txt) {
    //   // 若远端与编辑内容不同，提示是否覆盖远端（确定=覆盖，取消=中止保存）
    //   const doOverwrite = window.confirm("检测到远端内容与当前编辑内容不同。\n点击“确定”将覆盖远端内容并保存；点击“取消”将中止保存。");
    //   if (!doOverwrite) {
    //     saving.value = false;
    //     messageStatusTemp('已取消保存');
    //     return;
    //   }
    // }
    // 执行保存
    const res = await setPaste(k, txt);
    if (res && (res.status === "ok" || res.key)) {
      success.value = "保存成功";
      // 更新本地草稿为已保存内容
      saveLocalDraft(k, txt);
      savedFlag.value = true;
      // 若尚未收藏则自动收藏（原逻辑）
      if (validKey.value && !isFavorited.value) addFavorite(currentPath.value);
    } else {
      error.value = "保存失败";
    }
  } catch (e) {
    console.error(e);
    error.value = "保存失败：" + (e && e.message ? e.message : String(e));
  } finally {
    saving.value = false;
    setTimeout(() => (success.value = ""), 2500);
  }
}

// 简短消息提示（用于取消等非错误信息）
function messageStatusTemp(txt) {
  success.value = txt;
  setTimeout(() => (success.value = ""), 1800);
}

/* 初始化时加载收藏 */
onMounted(() => {
  loadFavorites();
  // 在初始化时，如果 route 提供 id，按原逻辑处理（无需另外强制覆盖）
  const rid = route.params.id;
  if (rid && typeof rid === "string") {
    const v = rid.trim();
    if (/^[A-Za-z]{3}$/.test(v)) {
      key.value = v;
      load();
    } else if (v.length > 0) {
      key.value = v.slice(0, 3);
    }
  }
  // 启动自动保存（每 3000ms）
  startAutoSave(3000);
});

/* 新增：组件卸载时清理定时器 */
onUnmounted(() => {
  stopAutoSave();
});

/* 监听 key/路由 变化，清除提示（保持其他行为） */
watch(
  () => route.params.id,
  (nid) => {
    if (nid && typeof nid === "string") {
      const v = nid.trim();
      if (/^[A-Za-z]{3}$/.test(v)) {
        key.value = v;
        load();
      } else if (v.length > 0) {
        key.value = v.slice(0, 3);
      }
    }
  }
);

const LOCAL_DRAFT_PREFIX = "paste_local:";
function getLocalDraft(k) {
  try {
    if (!k) return null;
    const ls = typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
    if (!ls) return null;
    const raw = ls.getItem(LOCAL_DRAFT_PREFIX + k);
    return raw === null ? null : raw;
  } catch (_) {
    return null;
  }
}
function saveLocalDraft(k, txt) {
  try {
    if (!k) return;
    const ls = typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
    if (!ls) return;
    // 如果内容为空或仅空白，则移除本地草稿，避免保存空字符串产生冲突提示
    if (!txt || (typeof txt === "string" && txt.trim() === "")) {
      ls.removeItem(LOCAL_DRAFT_PREFIX + k);
      return;
    }
    ls.setItem(LOCAL_DRAFT_PREFIX + k, String(txt));
  } catch (_) { }
}
function clearLocalDraft(k) {
  try {
    if (!k) return;
    const ls = typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
    if (!ls) return;
    ls.removeItem(LOCAL_DRAFT_PREFIX + k);
  } catch (_) { }
}

const draftKeys = computed(() => {
  try {
    const ls = typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
    if (!ls) return [];
    return Object.keys(ls)
      .filter((k) => k.startsWith(LOCAL_DRAFT_PREFIX))
      .map((k) => k.slice(LOCAL_DRAFT_PREFIX.length));
  } catch (_) {
    return [];
  }
});

const draftCount = computed(() => {
  try {
    const ls = typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
    if (!ls) return 0;
    return Object.keys(ls).filter((k) => k.startsWith(LOCAL_DRAFT_PREFIX)).length;
  } catch (_) {
    return 0;
  }
});

function refreshDrafts() {
  if (typeof window !== "undefined") window.location.reload();
}

function handleDelOk() {
  clearAllDrafts();
}

function handleDelSuspend() {
  console.log("全部删除草稿");
}
function clearAllDrafts() {
  const ls = typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
  if (!ls) return;
  const keys = Object.keys(ls).filter((k) => k.startsWith(LOCAL_DRAFT_PREFIX));
  keys.forEach((k) => ls.removeItem(k));
  refreshDrafts();
}

function openDraft(draftKey) {
  if (!draftKey) return;
  key.value = draftKey;
  content.value = getLocalDraft(draftKey) || "";
  showFavorites.value = false;
  router.push({ name: "Paste", params: { id: draftKey } }).catch(() => { });
}

function deleteDraft(draftKey) {
  try {
    clearLocalDraft(draftKey);
    refreshPage();
  } catch (_) { }
}

function copyDraft(draftKey) {
  try {
    const t = getLocalDraft(draftKey) || "";
    navigator.clipboard?.writeText?.(t);
    success.value = "已复制到剪贴板";
    setTimeout(() => (success.value = ""), 2000);
  } catch (e) {
    console.error(e);
  }
}
// 使用 Naive UI Dialog 显示差异并返回用户选择（'remote'|'local'）
const dialog = useDialog();

function computeSideBySideDiffHTML(remote, local) {
  const rLines = (remote || "").split(/\r?\n/);
  const lLines = (local || "").split(/\r?\n/);
  const max = Math.max(rLines.length, lLines.length);
  // 构建表格：左列 remote（-），右列 local（+），不同行高亮
  let html = '<div style="display:flex;gap:12px;font-family:monospace;">';
  html +=
    '<div style="flex:1;overflow:auto;border:1px solid #eee;padding:8px;"><div style="font-weight:600;margin-bottom:6px;position: fixed;background-color: #a33;">远端（-）</div>';
  html += `<div style="padding:2px 4px;">&nbsp;</div>`;
  for (let i = 0; i < max; i++) {
    const rl = rLines[i] ?? "";
    const ll = lLines[i] ?? "";
    if (rl === ll) {
      html += `<div style="padding:2px 4px;"> ${escapeHtml(rl)}</div>`;
    } else {
      html += `<div style="padding:2px 4px;background:#ffecec;color:#a33;">- ${escapeHtml(
        rl
      )}</div>`;
    }
  }
  html += "</div>";
  html +=
    '<div style="flex:1;overflow:auto;border:1px solid #eee;padding:8px;"><div style="font-weight:600;margin-bottom:6px;position: fixed;background-color: #0a7a3c;"">本地（+）</div>';
  html += `<div style="padding:2px 4px;">&nbsp;</div>`;
  for (let i = 0; i < max; i++) {
    const rl = rLines[i] ?? "";
    const ll = lLines[i] ?? "";
    if (rl === ll) {
      html += `<div style="padding:2px 4px;"> ${escapeHtml(ll)}</div>`;
    } else {
      html += `<div style="padding:2px 4px;background:#ecfff0;color:#0a7a3c;">+ ${escapeHtml(
        ll
      )}</div>`;
    }
  }
  html += "</div></div>";
  return html;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function showDiffDialog(remote, local) {
  return new Promise((resolve) => {
    const html = computeSideBySideDiffHTML(remote, local);
    const inst = dialog.info({
      title: "远端与本地草稿差异",
      content: () =>
        h("div", { innerHTML: html, style: "max-height:60vh; overflow:auto;" }),
      positiveText: "使用远端覆盖本地",
      negativeText: "不读取，使用本地",
      style: { width: "80vw" },
      maskClosable: false,
      closable: true,
      onPositiveClick: () => {
        resolve("remote");
        inst.destroy();
      },
      onNegativeClick: () => {
        resolve("local");
        inst.destroy();
      },
      // 关闭（例如点击遮罩）时返回 null 并销毁实例
      onClose: () => {
        resolve(null);
        inst.destroy();
      },
    });
  });
}
// 修改 load：使用模态框展示差异
async function load() {
  error.value = "";
  success.value = "";
  if (!validKey.value) {
    error.value = "Key 无效";
    return;
  }
  loading.value = true;
  const k = key.value.trim();
  try {
    const res = await getPaste(k);
    const remote =
      res && typeof res.data === "string" ? res.data : (res && res.data) || "";
    const local = getLocalDraft(k);
    // 若存在本地草稿且与远程不同且本地草稿非空（因为我们不保存空草稿），则展示差异对话框
    if (local !== null && local !== remote) {
      const choice = await showDiffDialog(remote, local);
      if (choice === "remote") {
        content.value = remote;
        saveLocalDraft(k, remote);
      } else if (choice === "local") {
        content.value = local;
      } else {
        // 取消：保持当前编辑区（不覆盖），若当前编辑区为空则填入本地草稿优先
        if (!content.value) content.value = local || remote;
      }
    } else {
      content.value = remote;
      saveLocalDraft(k, remote);
    }
    success.value = "读取成功";
  } catch (e) {
    console.error(e);
    error.value = "读取失败：" + (e && e.message ? e.message : String(e));
  } finally {
    loading.value = false;
    setTimeout(() => (success.value = ""), 2500);
  }
}

// 修改 save 中已在之前实现时会调用 saveLocalDraft(K, txt)；无须额外改动

// 在 script 内部靠近其它 reactive 变量的声明处新增自动保存定时器引用与启动/停止函数
const autoSaveTimer = { id: null }; // 使用对象以避免在模板作用域报未使用变量

function startAutoSave(intervalMs = 3000) {
  stopAutoSave();
  autoSaveTimer.id = setInterval(() => {
    try {
      const k = (key.value || "").trim();
      // 只在有合法 key 并且用户确实编辑了内容时自动保存草稿
      if (!k || !validKey.value) return;
      if (!content.value) return;
      // 使用已有的 saveLocalDraft，避免保存空白内容（saveLocalDraft 已处理空白）
      saveLocalDraft(k, content.value || "");
      // 不重置 edited/lastLoadedContent，这里只是保存草稿
    } catch (e) {
      console.warn("autoSave error", e);
    }
  }, intervalMs);
}

function stopAutoSave() {
  if (autoSaveTimer.id !== null) {
    clearInterval(autoSaveTimer.id);
    autoSaveTimer.id = null;
  }
}
</script>

<style scoped>
.paste-page {
  max-width: 900px;
  margin: 12px auto;
  padding: 12px;
  border: 1px solid rgba(39, 39, 42, 0.06);
  border-radius: 8px;
}

.row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.row input {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 120px;
}

.row button {
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.hint {
  color: #a00;
  font-size: 13px;
  margin-bottom: 8px;
}

.status {
  margin: 6px 0;
  font-size: 13px;
}

.status.error {
  color: #b00020;
}

.status.success {
  color: #1b8f4a;
}

.editor textarea {
  width: 100%;
  min-height: 160px;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: monospace;
  resize: vertical;
}

.meta {
  margin-top: 6px;
  font-size: 13px;
  color: #666;
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 新增 intro 样式 */
.intro {
  border: 1px dashed rgba(39, 39, 42, 0.06);
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.intro h4 {
  margin: 0 0 8px 0;
}

.intro p,
.intro ul {
  margin: 6px 0;
  font-size: 14px;
  /* color: #919191; */
}

/* 标题行布局：把按钮靠右放置 */
.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
}

.title-left {
  font-size: 1em;
  font-weight: 600;
}

.title-key {
  margin-left: 8px;
  flex: 1;
  display: flex;
  justify-content: center;
}

.title-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 收藏按钮高亮样式（黄色）*/
.favorited-btn {
  color: #f5b400;
  border-color: rgba(245, 180, 0, 0.15);
  background: rgba(245, 180, 0, 0.06);
}

/* 收藏项可点击路径样式 */
.fav-path.clickable {
  cursor: pointer;
  color: #2a9464;
  font-weight: 600;
}

/* 收藏管理抽屉 */
.fav-drawer {
  max-width: 100%;
  box-sizing: border-box;
  padding: 20px;
  overflow-x: hidden;
}

.fav-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fav-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  padding-bottom: 8px;
}

.fav-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fav-created {
  font-size: 12px;
  color: #888;
  margin-left: auto;
}

/* 备注文本样式 */
.fav-note-text {
  padding: 6px 8px;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #333;
}

/* 备注 tags 区域样式 */
.fav-tags {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  padding: 4px 0;
}

.edit-note-hint {
  color: #888;
  font-size: 12px;
  margin-left: 6px;
}

/* 修复移动端横向滚动并允许按钮换行 */
.paste-page {
  overflow-x: hidden;
  box-sizing: border-box;
}

.row {
  flex-wrap: wrap;
}

/* 备注输入框透明以避免白色闪烁 */
/* 让 n-dynamic-tags 的输入背景透明，避免闪烁 */
.fav-note-input :deep(.n-input__control),
.n-dynamic-tags :deep(.n-input__control) {
  background: transparent !important;
}

/* 调整 n-checkbox 的样式适配 */
.fav-top n-checkbox {
  margin-right: 8px;
  flex-shrink: 0;
}
</style>
