<template>
    <div class="logs-wrap">
        <n-card title="日志列表" size="small" style="">
            <div style="display:flex;gap:8px;margin-bottom:8px;">
                <n-button size="small" @click="loadList">刷新</n-button>
                <n-button size="small" tertiary @click="clearSelection" :disabled="!selected">清除选择</n-button>
            </div>
            <n-spin :show="loadingList" style="min-height:120px">
                <n-list bordered size="small" hoverable clickable>
                    <!-- 修改：显示文件名、大小、修改时间 -->
                    <n-list-item v-for="f in files" :key="f.name" @click="selectFile(f.name)" class="log-item"
                        :class="{ active: f.name === selected }">
                        <div class="log-file-row">
                            <span class="log-filename">{{ f.name }}</span>
                            <span class="log-filesize" v-if="f.size !== undefined && f.size !== null">{{ formatSize(f.size) }}</span>
                            <span class="log-mtime" v-if="f.mtime">{{ f.mtime }}</span>
                        </div>
                    </n-list-item>
                </n-list>
            </n-spin>
        </n-card>
    </div>

    <!-- 模态弹窗：全宽展示日志，带顶部/底部滚动按钮 -->
    <n-modal v-model:show="showModal" :mask-closable="true" :closable="true"
        :style="{ width: '80vw', maxWidth: '1200px' }" :title="selected">
        <n-card width="100%" size="small">
            <div class="modal-wrapper">
                <div class="modal-controls" style="display:flex;gap:8px;margin-bottom:8px;">
                    <n-button size="small" @click="downloadFile" tertiary :disabled="!content || !selected">下载</n-button>
                    <n-select v-model:value="linesPerPage" :options="linesOptions" size="small" style="width:120px" />
                    <n-button size="small" @click="prevPage"
                        :disabled="!selected || !canPrevPage">上一页</n-button>
                    <n-button size="small" @click="nextPage"
                        :disabled="!selected || !canNextPage">下一页</n-button>
                    <!-- <n-button size="small" @click="appendNextPage"
                        :disabled="!selected || !canNextPage">加载更多（追加）</n-button> -->
                    <!-- <n-button size="small" @click="toggleTail" :secondary="!tailEnabled">{{ tailEnabled ? '停止 Tail' : '开始 Tail' }}</n-button> -->
                    <div style="margin-left:8px;font-size:12px;color:var(--n-typography-3)">
                        <span v-if="fileSize">大小: {{ fileSize }} ; </span>
                        <span v-if="startLine !== null && endLine !== null"> 行: {{ startLine }} - {{ endLine }}
                            <span v-if="returnedLines"> (共 {{ returnedLines }} 行)</span>
                        </span>
                        <span v-if="isPartial"> (已截断)</span>
                    </div>
                </div>
                <div ref="modalScroll" class="modal-log-container">
                    <!-- tail 模式下内容为空也不显示占位符，避免闪烁 -->
                    <div v-if="!content && !tailEnabled" class="empty-placeholder">暂无日志内容</div>
                    <n-log v-else class="log-full" :log="content" language="naive-log" :hljs="hljs" :rows="30"/>
                </div>
            </div>
        </n-card>
    </n-modal>
</template>

<script setup>
import { logfile, logfilelist } from "@/components/api";
import hljs from "highlight.js/lib/core";
import { NButton, NCard, NList, NListItem, NLog, NModal, NSelect, NSpin } from "naive-ui";
import { computed, nextTick, onMounted, ref, watch } from "vue";
const files = ref([]);
const loadingList = ref(false);
const selected = ref("");
const content = ref("");
const loadingFile = ref(false);
// 文件响应头/分页信息
const fileSize = ref(null);
const startLine = ref(null);
const returnedLines = ref(null);
const endLine = ref(null);
const hasMore = ref(false);
const returnedBytes = ref(null);
const isPartial = ref(false);

// 模态相关
const showModal = ref(false);
const modalScroll = ref(null);
const autoFollow = ref(true); // 是否打开自动跟随到底部
hljs.registerLanguage('naive-log', () => {
    return {
        name: 'naive-log',
        // 优先匹配长模式，按顺序检查
        contains: [
            // 时间戳，例如 [2025-11-18 11:18:29 +0000]
            {
                className: 'meta',
                begin: /\[\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+\+\d{4}\]/,
                relevance: 10
            },
            // 日志级别 INFO/WARN/ERROR/DEBUG
            {
                className: 'keyword',
                begin: /\b(INFO|WARN|WARNING|ERROR|DEBUG|TRACE)\b/,
                relevance: 5
            },
            // 进程 id 或中括号内数字 [412075]
            {
                className: 'number',
                begin: /\[\d+\]/,
                relevance: 1
            },
            // IPv4 地址
            {
                className: 'built_in',
                begin: /\b\d{1,3}(?:\.\d{1,3}){3}\b/,
                relevance: 2
            },
            // HTTP 方法（GET/POST/...）
            {
                className: 'keyword',
                begin: /\b(GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)\b/,
                relevance: 3
            },
            // 引号内的请求行："GET /api/... HTTP/1.1"
            {
                className: 'string',
                begin: /"(?:GET|POST|PUT|DELETE|HEAD|OPTIONS|PATCH)[^"]*"/,
                relevance: 4
            },
            // URL 路径（以 / 开头的段）
            {
                className: 'link',
                begin: /\/[A-Za-z0-9_\/\-\.\?\=\&%]*/,
                relevance: 1
            },
            // HTTP 状态码或其它数字
            {
                className: 'number',
                begin: /\b\d{2,5}\b/,
                relevance: 0
            },
            // 默认单词高亮（保底）
            {
                className: 'text',
                begin: /[^\s]+/,
                relevance: 0
            }
        ]
    };
});
async function loadList() {
    loadingList.value = true;
    try {
        const res = await logfilelist();
        // 适配后端返回的对象数组
        files.value = res.files || (res && res.data) || [];
    } catch (e) {
        files.value = [];
        console.error("load logfile list error", e);
    } finally {
        loadingList.value = false;
    }
}

async function loadFile(opts = {}) {
    if (!selected.value) return;
    loadingFile.value = true;
    const append = opts.append === true;
    if (!append) content.value = "";
    try {
        // 请求文件
        const res = await logfile(selected.value, opts);
        let text = "";
        let headers = {};
        if (res && typeof res === "object" && res.data !== undefined) {
            text = res.data;
            headers = res.headers || {};
        } else if (typeof res === "string") {
            text = res;
        } else {
            text = JSON.stringify(res, null, 2);
        }

        // 判断是否为非分页响应（无 x-has-more/x-start-line 等）
        const isNonPaged = headers["x-start-line"] === undefined && headers["x-has-more"] === undefined;
        // 如果是首次加载且未分页，自动切换为分页模式重新加载
        if (isNonPaged && !opts._forcePaged) {
            // 避免死循环：加 _forcePaged 标记
            await loadFile({ ...opts, lines: linesPerPage.value, _forcePaged: true });
            return;
        }

        if (append && text) {
            content.value = content.value + (content.value ? "\n" : "") + text;
        } else {
            content.value = text;
        }

        // 解析 header
        fileSize.value = formatSize(headers["x-file-size"]) ?? null;
        startLine.value = headers["x-start-line"] ?? null;
        returnedLines.value = headers["x-returned-lines"] ?? null;
        endLine.value = headers["x-end-line"] ?? null;
        hasMore.value = headers["x-has-more"] === "true";
        returnedBytes.value = headers["x-returned-bytes"] ?? null;
        isPartial.value = headers["x-partial"] === "true";
    } catch (e) {
        content.value = `读取失败: ${e?.message || String(e)}`;
    } finally {
        loadingFile.value = false;
    }
}   
async function selectFile(name) {
    if (selected.value === name) {
        // 若再次点击已选项，则切换模态显示（若已有内容）
        if (content.value) {
            showModal.value = true;
            await nextTick();
            if (autoFollow.value) await ensureScrollBottom();
        }
        return;
    }
    selected.value = name;
    await loadFile();
    // 加载成功后打开模态并尝试滚动到底部（若开启）
    if (content.value) {
        showModal.value = true;
        await nextTick();
        if (autoFollow.value) await ensureScrollBottom();
    }
}

// 通用滚动函数：支持 top、position、silent
function scrollTo(options = {}) {
    const el = modalScroll.value;
    if (!el) return;
    const behavior = options.silent ? "auto" : "smooth";
    if (typeof options.top === "number") {
        el.scrollTo({ top: options.top, behavior });
        return;
    }
    if (options.position === "bottom") {
        el.scrollTo({ top: el.scrollHeight, behavior });
        return;
    }
    // 默认 top
    el.scrollTo({ top: 0, behavior });
}

// 让现有 ensureScrollBottom/Top 调用新的 scrollTo
async function ensureScrollBottom(maxTries = 8, delay = 100) {
    for (let i = 0; i < maxTries; i++) {
        await nextTick();
        await new Promise((r) => setTimeout(r, delay));
        const el = modalScroll.value;
        if (el) {
            if (el.scrollHeight > el.clientHeight) {
                scrollTo({ position: "bottom", silent: true });
                return true;
            } else {
                scrollTo({ position: "bottom", silent: true });
            }
        }
    }
    return false;
}
async function ensureScrollTop(maxTries = 4, delay = 50) {
    for (let i = 0; i < maxTries; i++) {
        await nextTick();
        await new Promise((r) => setTimeout(r, delay));
        const el = modalScroll.value;
        if (el) {
            scrollTo({ position: "top", silent: true });
            return true;
        }
    }
    return false;
}

// 按钮绑定使用 scrollTo(...)
// （保留现有顶部/底部快捷函数，模板改为直接调用这些函数）
function scrollToBottom() {
    scrollTo({ position: "bottom" });
}
function scrollToTop() {
    scrollTo({ position: "top" });
}

// 新增：切换自动跟随开关
function toggleAutoFollow() {
    autoFollow.value = !autoFollow.value;
    // 如果打开跟随并且模态已显示，尝试滚到底部
    if (autoFollow.value && showModal.value) {
        nextTick().then(() => ensureScrollBottom());
    }
}

onMounted(() => {
    loadList();
});

// 打开模态并在打开后尝试滚到底部（若 autoFollow 开启）
async function openModal() {
    if (!content.value) return;
    showModal.value = true;
    // 等待 modal 打开与 n-log 渲染完成后再滚动（重试）
    await nextTick();
    await ensureScrollBottom();
}

// 当 content 更新且模态打开时自动滚动到底（若开启）
watch([content, showModal], async ([c, shown]) => {
    if (shown && autoFollow.value) {
        await ensureScrollBottom();
    }
});

function clearSelection() {
    selected.value = "";
    content.value = "";
}

function downloadFile() {
    if (!content.value || !selected.value) return;
    const blob = new Blob([content.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selected.value;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 文件大小格式化
function formatSize(size) {
    if (size === null || size === undefined) return "";
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + " MB";
    return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

// 新增：分页相关变量
const linesPerPage = ref(200);
const linesOptions = [
    { label: "100 行", value: 100 },
    { label: "200 行", value: 200 },
    { label: "500 行", value: 500 },
    { label: "1000 行", value: 1000 },
    { label: "2000 行", value: 2000 },  
    { label: "5000 行", value: 5000 }
];

// 新增：tail 功能相关变量和方法
const tailEnabled = ref(false);
let tailTimer = null;

function toggleTail() {
    tailEnabled.value = !tailEnabled.value;
    if (tailEnabled.value) {
        startTail();
    } else {
        stopTail();
    }
}

function startTail() {
    stopTail();
    tailTimer = setInterval(async () => {
        if (selected.value) {
            // tail 模式下始终分页加载，且不闪烁
            const prev = content.value;
            await loadFile({ append: false, lines: linesPerPage.value });
            // 保持内容区域不闪烁
            if (!content.value && prev) {
                content.value = prev;
            }
            if (showModal.value && autoFollow.value) await ensureScrollBottom();
        }
    }, 2000);
}

function stopTail() {
    if (tailTimer) {
        clearInterval(tailTimer);
        tailTimer = null;
    }
}

// 监听模态关闭时自动停止 tail
watch(showModal, (shown) => {
    if (!shown) {
        stopTail();
        tailEnabled.value = false;
    }
});

// 新增：上一页、下一页、追加加载
const canPrevPage = computed(() => {
    // startLine 可能为字符串或 null
    const s = parseInt(startLine.value ?? 0);
    return !isNaN(s) && s > 0;
});
const canNextPage = computed(() => {
    return hasMore.value === true || hasMore.value === "true";
});

function prevPage() {
    if (!selected.value || !canPrevPage.value) return;
    let start = parseInt(startLine.value || 0);
    let lines = parseInt(linesPerPage.value);
    let newStart = Math.max(0, start - lines);
    loadFile({ start_line: newStart, lines });
}
function nextPage() {
    if (!selected.value || !canNextPage.value) return;
    let end = parseInt(endLine.value || 0);
    let lines = parseInt(linesPerPage.value);
    loadFile({ start_line: end + 1, lines });
}
function appendNextPage() {
    if (!selected.value || !canNextPage.value) return;
    let end = parseInt(endLine.value || 0);
    let lines = parseInt(linesPerPage.value);
    loadFile({ start_line: end + 1, lines, append: true });
}
</script>

<style scoped>
.logs-wrap {
    display: flex;
    align-items: flex-start;
    width: 100%;
    gap: 12px;
}

.modal-wrapper {
    /* 使 modal 内部为列布局，日志容器可伸缩以填满剩余空间 */
    display: flex;
    flex-direction: column;
    /* 与 .modal-log-container 的 height 保持一致以用于计算，可根据需要调整 */
    max-height: 80vh;
}

/* 日志容器可伸缩，min-height:0 避免 flex 项目内容溢出导致的额外空白 */
.modal-log-container {
    /* ...existing code... (保留原有背景/颜色/内边距等) */
    /* 覆盖/扩展为伸缩布局 */
    flex: 1 1 auto;
    min-height: 0;
    /* 保证内部滚动正常 */
    overflow: auto;
}

/* 让 n-log 占满容器并保持预格式化换行、等宽字体 */
.log-full {
    width: 100%;
    height: 100%;
    white-space: pre-wrap;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Helvetica Neue", monospace;
    font-size: 13px;
    line-height: 1.5;
    box-sizing: border-box;
}

/* 当没有内容时的占位样式，居中显示 */
.empty-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #9ca3af;
    font-size: 14px;
    background: transparent;
}

.log-item {
    cursor: pointer;
    padding: 6px 8px;
}

.log-item.active {
    background: rgba(42, 148, 125, 0.08);
}


/* 文件行：默认水平排列 */
.log-file-row {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 14px;
}
.log-filename {
    flex: 1 1 0;
    font-weight: 500;
    word-break: break-all;
}
.log-filesize {
    font-size: 13px;
    min-width: 60px;
    color: var(--n-text-color);
}
.log-mtime {
    color: var(--n-text-color);
    font-size: 12px;
    min-width: 120px;
    text-align: right;
}

/* modal-controls 已有响应式规则，这里补充 modal 在移动端的高度与间距 */
@media (max-width: 900px) {
    /* 主容器在窄屏下竖排，确保卡片与列表占满宽度 */
    .logs-wrap {
        flex-direction: column;
        align-items: stretch;
    }
    /* 使列表卡片占满宽度并减少左右内边距（避免太窄） */
    .logs-wrap > .n-card,
    .logs-wrap .n-card {
        width: 100%;
        min-width: 0;
    }

    /* 文件行改为竖直显示，文件名在上，meta 在下 */
    .log-file-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        font-size: 13px;
    }
    .log-filename {
        font-size: 14px;
        word-break: break-word;
        width: 100%;
    }
    .log-filesize,
    .log-mtime {
        min-width: 0;
        font-size: 12px;
        color: var(--n-typography-3);
    }
    .log-mtime {
        text-align: left;
    }

    /* modal 的最大高度更适合移动端，内容区更容易滚动 */
    .modal-wrapper {
        max-height: 70vh;
    }
    .modal-log-container {
        /* 保证日志容器尽量使用剩余高度并可滚动 */
        flex: 1 1 auto;
        min-height: 120px;
        overflow: auto;
    }

    /* 确保 modal 控件垂直排列（已有规则，加固） */
    .modal-controls {
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
    }
    .modal-controls > * {
        width: 100%;
        box-sizing: border-box;
        min-width: 0;
    }
}
</style>
