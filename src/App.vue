<script setup>
import { darkTheme, lightTheme, NConfigProvider, NGlobalStyle } from 'naive-ui';
import { onMounted, ref, watch } from 'vue';
import { RouterView } from 'vue-router';

const darktheme = ref(true);

onMounted(() => {
  const darkthemeValue = localStorage.getItem('darktheme');
  if (darkthemeValue !== null) {
    darktheme.value = JSON.parse(darkthemeValue);
  } else {
    darktheme.value = true;
  }
});

watch(darktheme, (newValue) => {
  localStorage.setItem('darktheme', JSON.stringify(newValue));
});
</script>

<template>
  <n-config-provider :theme="darktheme ? darkTheme : lightTheme">
    <RouterView :darktheme="darktheme" @update:darktheme="value => darktheme = value" />
      <n-global-style />
  </n-config-provider>
</template>

<style scoped></style>
