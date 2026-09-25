<script setup lang="ts">
const page = useLegalPage('agb')
useSeoMeta({ title: 'AGB' })
</script>

<template>
  <div class="container-page py-f-12">
    <h1 class="text-f-6xl">{{ page.title }}</h1>
    <!-- eslint-disable-next-line vue/no-v-html -- sanitized at build time -->
    <div class="prose-legacy mt-f-8" v-html="page.html" />
  </div>
</template>
