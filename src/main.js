import "./assets/main.css";

import { createApp } from "vue";
import Vue3Toastify from "vue3-toastify";
import App from "./App.vue";
import router from "./router";
const app = createApp(App);

app.use(router);
app.use(Vue3Toastify, {
  autoClose: 5000,
});

app.mount("#app");

if (import.meta.env.PROD) {
  const s = document.createElement("script");
  s.defer = true;
  s.src = "https://cloud.umami.is/script.js";
  s.setAttribute("data-website-id", "d22ceb62-0d16-4e74-9802-86181db5b06d");
  document.head.appendChild(s);
}
