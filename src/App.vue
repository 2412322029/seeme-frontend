<script setup>
import iheader from '@/components/iheader.vue';
import myfooter from '@/components/myfooter.vue';
import { darkTheme, lightTheme, NConfigProvider, NDialogProvider, NGlobalStyle, NModalProvider, NSpin } from 'naive-ui';
import { onMounted, ref, watch } from 'vue';
import { RouterView, useRoute, useRouter } from 'vue-router';
const darktheme = ref(true);
const loading = ref(false);
const router = useRouter();
const route = useRoute();
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

router.beforeEach((to, from, next) => {
  loading.value = true;
  next();
  document.title = to.meta.title +" - "+ to.meta.description || 'SeeMe';
});
router.afterEach(() => {
  loading.value = false;
});
</script>

<template>
  <n-config-provider :theme="darktheme ? darkTheme : lightTheme"
    style="display: flex; flex-direction: column;align-items: center;">
    <n-modal-provider>
    <n-dialog-provider>
    <iheader :darktheme="darktheme" @update:darktheme="value => darktheme = value" />
    <section style="max-width: 800px;min-width: 300px;min-height: 90vh; position: relative;width: 100%;">
      <Suspense>
        <n-spin size="large" v-if="loading"
          style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);" />
        <RouterView v-else />
      </Suspense>
    </section>
    <myfooter />
    </n-dialog-provider>
  </n-modal-provider>
    <n-global-style />
  </n-config-provider>
</template>

<style scoped></style>
