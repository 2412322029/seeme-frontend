<script setup>
import iheader from '@/components/iheader.vue';
import myfooter from '@/components/myfooter.vue';
import steaminfo from '@/components/steaminfo.vue';
import { defineEmits, defineProps } from 'vue';

const props = defineProps({
  darktheme: Boolean
});

const emit = defineEmits(['update:darktheme']);
</script>

<template>
  <iheader :darktheme="props.darktheme" @update:darktheme="value => emit('update:darktheme', value)" />
  <steaminfo />
  <myfooter />
</template>