<script setup>
import iheader from '@/components/iheader.vue';
import myfooter from '@/components/myfooter.vue';
import pcstatus from '@/components/pcstatus.vue';
import { darkTheme, lightTheme, NConfigProvider } from 'naive-ui';
import { defineEmits, defineProps } from 'vue';
const props = defineProps({
  darktheme: Boolean
});
const emit = defineEmits(['update:darktheme']);
</script>

<template>
    <n-config-provider :theme="darktheme ? darkTheme : lightTheme">
        <iheader :darktheme="props.darktheme" @update:darktheme="value => emit('update:darktheme', value)" />
        <pcstatus />
        <myfooter />
    </n-config-provider>
</template>