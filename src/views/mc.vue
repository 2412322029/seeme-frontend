<script setup>
import iheader from '@/components/iheader.vue';
import mcstatus from '@/components/mcstatus.vue';
import myfooter from '@/components/myfooter.vue';
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  darktheme: Boolean
});

const emit = defineEmits(['update:darktheme']);
</script>

<template>
  <iheader :darktheme="props.darktheme" @update:darktheme="value => emit('update:darktheme', value)" />
  <mcstatus />
  <myfooter />
</template>