<template>

    <div class="messages-section">
        <h3 style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;">
            <span class="nowrap">留言列表</span>
            <div style="display: flex; gap: 12px; align-items: center;">
                <div style="margin-top: 12px; display:flex; align-items:center; justify-content:flex-end; gap:12px;">
                    <n-pagination v-model:page="page" v-model:page-size="limit" :page-count="totalpages"
                        :page-sizes="[5, 10, 20, 30, 40]" size="small" show-size-picker />
                    <n-button v-if="order != 'desc'" size="small" @click="order = 'desc'; page = 1" :bordered="false">
                        最旧
                    </n-button>
                    <n-button v-else size="small" @click="order = 'asc'; page = 1" :bordered="false">
                        最新
                    </n-button>
                </div>
            </div>
        </h3>

        <div v-if="loadingMessages" class="messages-loading">加载中...</div>

        <div v-else class="messages-container">
            <div v-if="messages.length === 0" class="no-messages">暂无留言</div>

            <ul class="messages-list">
                <li v-for="(m, idx) in sortedMessages" :key="idx" class="message-item">
                    <div class="meta">
                        <div class="meta-left" style="display: flex; align-items: center; gap: 8px">
                            <div class="avatar-wrap">
                                <a v-if="m.email" :href="'mailto:' + m.email" class="avatar-link" @click.stop
                                    :title="m.email">
                                    <img :src="`https://cravatar.cn/avatar/${md5(
                                        (m.email || '').trim().toLowerCase()
                                    )}?s=80&d=identicon`" alt="avatar" class="avatar" />
                                </a>

                                <div v-else class="avatar-nolink" :title="m.name || '匿名'">
                                    <div class="avatar-letter">
                                        {{ (m.name || "匿名").trim().charAt(0).toUpperCase() }}
                                    </div>
                                </div>
                            </div>
                            <span class="name">{{ m.name || "匿名" }}</span>
                            <!-- <n-tag :bordered="false" size="small" class="ip">IP: {{ m.location || "未知" }}
                            </n-tag> -->
                        </div>

                        <div class="meta-right">
                            <n-tag :bordered="false" size="small" class="ua">{{ uaInfo(m.user_agent) }}
                            </n-tag>
                            <span class="time" :title="m.report_time">{{
                                formatReportTime(m.report_time)
                                }}</span>
                        </div>
                    </div>

                    <div class="content" :style="m._expanded
                        ? {}
                        : {
                            display: '-webkit-box',
                            WebkitLineClamp: '2',
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }
                        " @keydown.enter.prevent="m._expanded = !m._expanded" tabindex="0" role="button"
                        v-html="md.render(m.content)"></div>
                    <a style="cursor: pointer; float: right" v-if="
                        (m.content || '').length > 120 ||
                        (m.content || '').split('\n').length > 2
                    " @click.stop="m._expanded = !m._expanded">
                        {{ m._expanded ? "收起" : "展开全文" }}
                    </a>
                </li>
            </ul>
        </div>
    </div>

    <div class="recaptcha-section">
        <h3>验证 & 留言</h3>
        <div id="recaptcha-container" class="code-block"></div>
        <span id="recaptcha-status">{{ statusText }}</span> /
        <span class="status">{{ messageStatus }}</span>
        <div class="message-form">
            <div class="form-top-row" style="
              display: flex;
              gap: 10px;
              align-items: center;
              flex-wrap: wrap;
            ">
                <n-input v-model:value="msgName" id="msgName" placeholder="称呼，可选，最长100字符" style="flex: 1" />
                <n-input v-model:value="msgEmail" id="msgEmail" placeholder="邮箱，可选" style="flex: 1" />
            </div>
            <div class="md-editor" style="
              display: flex;
              gap: 10px;
              flex-wrap: wrap;
              align-items: flex-start;
            ">
                <div style="width: 100%">
                    <n-input type="textarea" v-model:value="msgContent" id="msgContent"
                        placeholder="留言内容markdown（必填，最长400字符）" rows="6"></n-input>
                </div>
                <div style="width: 100%">
                    <div class="code-block md-preview" v-show="previewVisible" v-html="mdmsgContent"></div>
                </div>
            </div>

            <div class="actions">
                <div>
                    <n-button type="button" @click="previewVisible = !previewVisible">{{ previewVisible ? "隐藏预览" :
                        "显示预览"
                        }}</n-button>
                    <n-button type="button" @click="resetRecaptcha">重置验证</n-button>
                </div>
                <n-button type="primary" :disabled="submitting" @click="submitMessage"
                    style="float: left">提交留言</n-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import md5 from "js-md5";
import markdownit from "markdown-it";
import { NButton, NInput, NPagination, NTag } from "naive-ui";
import { UAParser } from "ua-parser-js";
import { computed, onMounted, ref, watch } from "vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { getMessages, leaveMessage } from "./api";
const SITE_KEY = "6Le64PcrAAAAABE0_5Q2MC9WMNULUJcSPnnxQ_NQ";

const verified = ref(false);
const statusText = ref("未验证");
function uaInfo(ua) {
    const { browser, cpu, os } = UAParser(ua || "");
    return `${browser.name || ""} ${browser.major || ""} /
   ${os.name || "未知设备"}${os.version ? " " + os.version : ""} /${cpu.architecture || ""
        }`.trim();
}

let widget = null;
let token = null;
const md = markdownit({
    html: true,
    linkify: true,
    breaks: true,
    typographer: true,
});
function loadRecaptchaScriptWithOnload(timeout = 8000) {
    const tryLoad = (src, useOnloadCallback) => {
        return new Promise((resolve, reject) => {
            // 如果已经存在并且 grecaptcha 可用，直接 resolve
            if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
                resolve();
                return;
            }
            // 避免重复插入相同脚本
            const existing = document.querySelector(
                `script[src^="${src.split("?")[0]}"]`
            );
            if (existing) {
                // 如果已有脚本，等待 grecaptcha 就绪或超时
                let t = setTimeout(() => {
                    reject(new Error("recaptcha 加载超时（已有脚本但未就绪）"));
                }, timeout);
                const checker = () => {
                    if (
                        window.grecaptcha &&
                        typeof window.grecaptcha.render === "function"
                    ) {
                        clearTimeout(t);
                        resolve();
                    }
                };
                // 定期检查
                const iv = setInterval(() => {
                    if (
                        window.grecaptcha &&
                        typeof window.grecaptcha.render === "function"
                    ) {
                        clearInterval(iv);
                        clearTimeout(t);
                        resolve();
                    }
                }, 200);
                return;
            }

            let timer = null;
            if (useOnloadCallback) {
                // 注册全局回调，脚本会调用 window.__recaptchaOnLoad
                window.__recaptchaOnLoad = function () {
                    clearTimeout(timer);
                    // 确保 grecaptcha 可用
                    setTimeout(() => {
                        if (
                            window.grecaptcha &&
                            typeof window.grecaptcha.render === "function"
                        ) {
                            resolve();
                        } else {
                            // 小延迟后仍不可用则失败
                            reject(new Error("grecaptcha 未就绪"));
                        }
                    }, 0);
                };
                timer = setTimeout(() => {
                    try {
                        delete window.__recaptchaOnLoad;
                    } catch (_) { }
                    reject(new Error("recaptcha 加载超时"));
                }, timeout);
            }

            const s = document.createElement("script");
            s.src = src;
            s.async = true;
            s.defer = true;
            if (!useOnloadCallback) {
                s.onload = () => {
                    // 等短暂时间再尝试确认 grecaptcha 是否就绪
                    setTimeout(() => {
                        if (
                            window.grecaptcha &&
                            typeof window.grecaptcha.render === "function"
                        ) {
                            resolve();
                        } else {
                            // 仍不可用也当作失败，让上层回退
                            reject(new Error("脚本加载完成，但 grecaptcha 未就绪"));
                        }
                    }, 50);
                };
                s.onerror = () => reject(new Error("脚本加载错误"));
            }
            document.head.appendChild(s);
        });
    };

    // 先尝试 recaptcha.net（有些地域推荐使用），带 onload 回调确保就绪
    const recaptchaNet =
        "https://recaptcha.net/recaptcha/api.js?onload=__recaptchaOnLoad&render=explicit";
    const googleCom =
        "https://www.google.com/recaptcha/api.js?onload=__recaptchaOnLoad&render=explicit";

    return tryLoad(recaptchaNet, true)
        .catch((e1) => {
            console.warn("recaptcha.net 加载失败，尝试 google.com：", e1);
            return tryLoad(googleCom, true);
        })
        .catch((e2) => {
            console.warn("google.com 加载失败或 grecaptcha 未就绪：", e2);
            // 最后尝试不带 onload 的 google 脚本（某些环境下 onload 参数可能被阻断）
            const googlePlain = "https://www.google.com/recaptcha/api.js";
            return tryLoad(googlePlain, false).catch((e3) => {
                console.error("所有 recaptcha 加载方式均失败", e3);
                throw e3;
            });
        })
        .finally(() => {
            try {
                delete window.__recaptchaOnLoad;
            } catch (_) { }
        });
}

function renderWidget() {
    try {
        if (!window.grecaptcha || typeof window.grecaptcha.render !== "function") {
            console.error("grecaptcha 未加载或 render 不可用");
            return;
        }
        if (widget !== null) return;
        widget = grecaptcha.render("recaptcha-container", {
            sitekey: SITE_KEY,
            callback: function (tkn) {
                token = tkn;
                verified.value = true;
                statusText.value = "已验证";
            },
            "expired-callback": function () {
                token = null;
                verified.value = false;
                statusText.value = "验证过期，请重新验证";
            },
        });
    } catch (e) {
        console.error("renderWidget 错误", e);
    }
}

async function initRecaptcha() {
    try {
        statusText.value = "正在加载 reCAPTCHA...";
        await loadRecaptchaScriptWithOnload(8000);
        // 确认 grecaptcha 存在后再渲染
        if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
            renderWidget();
            statusText.value = "reCAPTCHA 已就绪";
        } else {
            statusText.value = "reCAPTCHA 未就绪";
            console.error("grecaptcha 已加载但 render 不可用");
        }
    } catch (e) {
        console.error("加载 recaptcha 失败：", e);
        statusText.value = "reCAPTCHA 加载失败";
    } finally {
        try {
            delete window.__recaptchaOnLoad;
        } catch (_) { }
    }
}

onMounted(() => {
    initRecaptcha();
    loadMessages();
});

/* resetRecaptcha：重置 reCAPTCHA */
function resetRecaptcha() {
    try {
        if (window.grecaptcha && widget !== null) {
            grecaptcha.reset(widget);
        }
    } catch (e) {
        console.error("resetRecaptcha 错误", e);
    }
    token = null;
    verified.value = false;
    statusText.value = "未验证";
}

/* submitMessage：调用 api.leaveMessage */
// 从 localStorage 读取，浏览器记住 name / email
const msgName = ref(localStorage.getItem("guest_name") || "");
const msgEmail = ref(localStorage.getItem("guest_email") || "");
const msgContent = ref("");
const submitting = ref(false);
const messageStatus = ref("");

const mdmsgContent = computed(() => {
    const v = msgContent.value || "";
    if (!v || !v.trim()) return "";
    return md.render(v);
});

watch(msgName, (v) => {
    try {
        localStorage.setItem("guest_name", v || "");
    } catch (_) { }
});
watch(msgEmail, (v) => {
    try {
        localStorage.setItem("guest_email", v || "");
    } catch (_) { }
});

function simpleEmailCheck(e) {
    return /^[^@]+@[^@]+\.[^@]+$/.test(e);
}

async function submitMessage() {
    if (submitting.value) return;
    // 基本校验
    const name = (msgName.value || "匿名").trim();
    const email = (msgEmail.value || "").trim();
    const content = (msgContent.value || "").trim();

    if (!content) {
        messageStatus.value = "留言内容为必填项";
        return;
    }
    if (content.length > 400) {
        messageStatus.value = "留言过长（最大400字符）";
        return;
    }
    if (name.length > 100) {
        messageStatus.value = "称呼过长（最大100字符）";
        return;
    }
    if (email && email.length > 200) {
        messageStatus.value = "邮箱过长（最大200字符）";
        return;
    }
    if (email && !simpleEmailCheck(email)) {
        messageStatus.value = "邮箱格式不正确";
        return;
    }
    if (!token) {
        messageStatus.value = "请先完成 reCAPTCHA 验证";
        return;
    }

    submitting.value = true;
    messageStatus.value = "提交中...";

    try {
        const json = await leaveMessage({
            name,
            email,
            content,
            recaptcha_token: token,
        });

        if (json && (json.status === "ok" || json.entry)) {
            messageStatus.value = "留言提交成功";
            loadMessages();
            // 保留 name/email（已保存到 localStorage），只清空留言内容
            msgContent.value = "";
            try {
                localStorage.setItem("guest_name", name);
                localStorage.setItem("guest_email", email);
            } catch (_) { }
            if (window.grecaptcha && widget !== null) {
                try {
                    grecaptcha.reset(widget);
                } catch (e) { }
                token = null;
                verified.value = false;
            }
        } else {
            messageStatus.value =
                json && json.error ? `提交失败：${JSON.stringify(json)}` : "提交失败";
            if (json && json.detail)
                messageStatus.value += "（" + JSON.stringify(json.detail) + "）";
        }
    } catch (e) {
        console.error(e);
        messageStatus.value = "提交请求出错";
    } finally {
        submitting.value = false;
    }
}

const messages = ref([]);
const loadingMessages = ref(false);
const limit = ref(5);
const order = ref("desc");
const page = ref(1);
const totalpages = ref(1);
watch([limit, order, page], () => {
    loadMessages();
});
async function loadMessages() {
    loadingMessages.value = true;
    try {
        const data = await getMessages(limit.value, order.value, page.value);
        if (data && data.error) {
            console.log("getMessages error:", data);
            try {
                toast(`${JSON.stringify(data.response.data)}`, {
                    theme: "auto",
                    type: "error",
                });
            } catch (_) { }
        }
        messages.value = data.message.slice();
        totalpages.value = data.total_pages || 1;
    } catch (e) {
        console.error("加载留言失败", e);
        messages.value = [];
    } finally {
        loadingMessages.value = false;
    }
}

const sortedMessages = computed(() => {
    return messages.value.slice().sort((a, b) => {
        const ta = a && a.report_time ? Number(a.report_time) : 0;
        const tb = b && b.report_time ? Number(b.report_time) : 0;
        const acha = ta < 1e12 ? ta * 1000 : ta;
        const bcha = tb < 1e12 ? tb * 1000 : tb;
        return bcha - acha;
    });
});

function formatReportTime(ts) {
    if (!ts) return "";
    const t = Number(ts);
    const ms = t < 1e12 ? t * 1000 : t;
    const d = new Date(ms);
    return d.toLocaleString();
}

// 新增：控制 Markdown 预览显示
const previewVisible = ref(true);
</script>

<style scoped>
.nowrap {
    word-wrap: break-word;
    word-break: break-all;
    white-space: normal;
    overflow-wrap: break-word;
    max-width: 200px;
    min-width: 70px;
}

.content img {
    max-width: 50% !important;
    height: auto;
}


h1 {
    font-size: 2em;
    margin-bottom: 10px;
}

h2 {
    font-size: 1.5em;
    margin-top: 30px;
    margin-bottom: 10px;
}

h3 {
    font-size: 1.2em;
    margin-top: 20px;
    margin-bottom: 10px;
}

p {
    line-height: 1.6;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

th,
td {
    padding: 8px;
    text-align: left;
}

.code-block {
    padding: 10px;
    padding-left: 0px;
    border-radius: 4px;
    font-family: monospace;
}

ul {
    list-style-type: disc;
    padding-left: 20px;
}

.recaptcha-section {
    margin-top: 20px;
}

.message-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 10px;
}

.message-form input,
.message-form textarea {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;
    box-sizing: border-box;
}

.message-form textarea {
    min-height: 100px;
    resize: vertical;
}

.actions {
    display: flex;
    justify-content: space-between;
    gap: 8px;
}

.actions button {
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
}

.status {
    font-size: 14px;
    margin-top: 6px;
}

.avatar-wrap img {
    border-radius: 50%;
    width: 40px;
}

.avatar-wrap a:hover {
    background-color: transparent;
}

.avatar-letter {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #ccc;
    color: #434343;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: bold;
}

.messages-section {
    margin-top: 20px;
    border-radius: 8px;
}

.messages-section h3 {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 0 8px 0;
}

.refresh-btn {
    margin-left: 12px;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
}

.messages-loading,
.no-messages {
    margin: 30px 0;
    text-align: center;
    font-size: 20px;
    padding: 8px 0;
}

.messages-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.message-item {
    border-top: 1px solid rgba(121, 121, 121, 0.961);
    padding: 10px;
    padding-left: 0px;
    padding-right: 0px;
}

.message-item .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    font-size: 13px;
}

.message-item .name {
    font-weight: 600;
    color: #2a9464;
}

.message-item .ip {
    font-size: 12px;
    color: #858585;
}

.message-item .ua {
    font-size: 12px;
    margin-right: 10px;
    color: #858585;
}

.message-item .time {
    font-size: 12px;
    color: #858585;
}

.message-item .content {
    margin-left: 10px;
    white-space: pre-wrap;
    word-break: break-word;
}

.message-item .email {
    /* margin-top: 6px; */
    font-size: 16px;
    padding: 0px;
    margin: 0px;
}

.form-top-row .mini-btn {
    padding: 6px 10px;
    font-size: 13px;
    border-radius: 6px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: #fafafa;
    cursor: pointer;
}

@media (prefers-color-scheme: dark) {
    .form-top-row .mini-btn {
        background: #111214;
        border-color: rgba(255, 255, 255, 0.06);
        color: #ddd;
    }
}

.md-preview {
    border: 1px solid rgba(39, 39, 42, 0.06);
    padding: 8px;
    border-radius: 6px;
    background: transparent;
    max-height: 380px;
    overflow: auto;
}

@media (max-width: 600px) {
    .actions {
        flex-direction: column;
        align-items: stretch;
    }

    #recaptcha-status-inline {
        margin-left: 0;
        margin-top: 6px;
    }
}

@media (max-width: 700px) {
    .messages-section h3 {
        font-size: 16px;
        gap: 8px;
    }

    .refresh-btn {
        display: inline-block;
        padding: 8px 12px;
        font-size: 14px;
        border-radius: 6px;
        background: transparent;
        border: 1px solid rgba(0, 0, 0, 0.08);
        cursor: pointer;
    }

    .messages-list {
        gap: 8px;
    }

    .message-item {
        border-top: none;
        border-bottom: 1px solid rgba(121, 121, 121, 0.08);
        display: flex;
        flex-direction: column;
        /* gap: 8px; */
    }

    .message-item .meta {
        flex-direction: column;
        align-items: flex-start;
        /* gap: 6px; */
    }

    .meta-left {
        flex-direction: row;
        align-items: center;
        gap: 8px;
    }

    .meta-right {
        width: 100%;
    }

    .avatar-wrap img,
    .avatar-letter {
        width: 36px;
        height: 36px;
        font-size: 16px;
        min-width: 36px;
    }

    .message-item .content {
        margin-left: 0;
        margin-top: 4px;
        font-size: 14px;
    }

    .message-item .name {
        text-wrap: nowrap;
    }

    /* .message-item .ua, */
    .message-item .ip,
    .message-item .time {
        font-size: 12px;
        text-wrap: nowrap;
    }

    .message-item .time {
        float: inline-end;
    }

    .form-top-row {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }

    .form-top-row n-input {
        width: 100% !important;
    }

    .md-preview {
        max-height: 240px;
    }

    .actions {
        flex-direction: column-reverse;
        align-items: stretch;
        gap: 8px;
    }

    .actions n-button[type="primary"] {
        width: 100%;
    }
}
</style>
