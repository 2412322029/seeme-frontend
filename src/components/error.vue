<template>
    <div class="not-found">
        <h1>出错了!</h1>
        <h3> {{ title }}</h3>
        <p v-if="msg.error">{{ msg.error }}</p>
        <p v-else>{{ msg }}</p>
        <router-link to="/">返回首页</router-link>
    </div>
</template>
<script setup>
import { RouterLink } from 'vue-router';
const props = defineProps({
  title: String,
  msg: String | Object
});

</script>
<style scoped>
.not-found {
    text-align: center;
    margin-top: 50px;
}
h1 {
    font-size: 3em;
}
</style>