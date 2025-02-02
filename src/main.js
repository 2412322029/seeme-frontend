import './assets/main.css';

import { createApp } from 'vue';
import Vue3Toastify from 'vue3-toastify';
import App from './App.vue';
import router from './router';
const app = createApp(App)

app.use(router)
app.use(Vue3Toastify, {
  autoClose: 5000,
});

app.mount('#app')
