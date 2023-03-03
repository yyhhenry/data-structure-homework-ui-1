<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useDark } from '@vueuse/core';
const isSystemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
const isDark = useDark();
isDark.value = isSystemDarkMode;
</script>

<template>
  <RouterView />
</template>
