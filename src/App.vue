<script setup>
import { NConfigProvider, darkTheme, lightTheme, } from 'naive-ui';
import { onMounted, ref } from 'vue';
import { RouterView } from 'vue-router';
const darktheme = ref(true)
onMounted(() => {
  const darkthemeValue = localStorage.getItem('darktheme');
  if (darkthemeValue !== null) {
    darktheme.value = JSON.parse(darkthemeValue)
  } else {
    darktheme.value = true
  }
});
</script>

<template>
  <n-config-provider :theme="darktheme ? darkTheme : lightTheme">
    <RouterView></RouterView>
  </n-config-provider>
</template>

<style scoped></style>
