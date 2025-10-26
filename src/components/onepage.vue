<template>
  <div class="page" v-if="result?.metadata?.content">
    <h2 style="text-align: center">
      {{ result?.metadata?.content?.title || "" }}
    </h2>
    <template v-for="i in result?.metadata?.content?.attributes">
      <a
        v-if="i?.trait_type == 'xlog_slug'"
        :href="'https://xlog.not404.cc/' + i?.value"
        target="_blank"
        >原文</a
      >
    </template>
    <div
      v-if="result?.metadata?.content?.content"
      v-html="md.render(ipfsToCrossbell(result?.metadata?.content?.content) || '')"
    ></div>
    <div v-else>
      <p>{{ result?.metadata?.content?.summary}}</p>
      <img
        :src="result?.metadata?.content?.attachments[0]?.address"
        style="width: 300px"
        alt=""
      />
      <div v-for="i in result?.metadata?.content?.external_urls" :key="i">
        <a :href="i" target="_blank">{{ i }}</a>
      </div>
    </div>

    <p style="text-align: center; color: gray; margin: 0; font-size: small">
      publishedAt: {{ formatDate(result?.publishedAt) }}
    </p>
    <p style="text-align: center; color: gray; margin: 0; font-size: small">
      updatedAt: {{ formatDate(result?.updatedAt) }}
    </p>
  </div>
  <p v-else>loading... {{ error }}</p>
</template>
<script setup>
import { imgSize } from "@mdit/plugin-img-size";
import { createIndexer } from "crossbell";
import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import powershell from "highlight.js/lib/languages/powershell";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/github-dark.css"; // 加载样式
import markdownit from "markdown-it";
import mditjs from "markdown-it-highlightjs/core";
import { ref } from "vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { formatDate } from "./api";
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("powershell", powershell);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("python", python);

const route = useRoute(); // 获取当前路由对象
const router = useRouter(); // 获取路由实例
const nodeid = ref(route.params.id || "");

const result = ref("");
const error = ref("");
const md = markdownit({
  html: true,
  linkify: true,
  breaks: true,
  typographer: true,
})
  .use(imgSize)
  .use(mditjs, {
    hljs,
  });
const indexer = createIndexer();
indexer.note
  .get("50877", nodeid.value)
  .then((res) => {
    result.value = res;
    if (res === null) {
      error.value = "note Not Found";
    }
  })
  .catch((err) => {
    error.value = err;
  });
const ipfsToCrossbell = (url) =>
  url.replace(
    /ipfs:\/\/([a-zA-Z0-9]+)/g, // 全局匹配
    "https://ipfs.crossbell.io/ipfs/$1?img-quality=75&img-format=auto&img-onerror=redirect"
  );
onBeforeRouteUpdate((to, from, next) => {
  nodeid.value = to.params.address || "";
  next();
});
// const provider = window.ethereum
// const contract = createContract(provider)
// contract.walletClient.requestAddresses().then(res => {
//     console.log(res)
// })
// contract.csb.transfer({
// 			toAddress: "0x6e6CB6B1BE5C6DeA0292f7d9121337BC1B37BEc6",
// 			amount: 0,
// }).then(res => {
//     console.log(res)
// })
</script>
<style scoped>
.page {
  /* text-align: center; */
  max-width: 800px;
  margin: 20px;
}

h1 {
  font-size: 2em;
  color: #42b983;
}

p {
  font-size: 1.2em;
}
</style>
