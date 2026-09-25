<script setup lang="ts">
const { t, locale } = useI18n()
const page = useLegalPage('agb')
useSeoMeta({ title: t('legal.terms') })
</script>

<template>
  <div class="container-page py-f-12">
    <h1 class="text-f-6xl">{{ t('legal.termsTitle') }}</h1>
    <p v-if="locale !== 'de'" class="mt-4 max-w-[65ch] rounded-xl bg-secondary px-5 py-4 text-sm">{{ t('legal.bindingNote') }}</p>
    <!-- eslint-disable-next-line vue/no-v-html -- sanitized at build time -->
    <div class="prose-legacy mt-f-8" lang="de" v-html="page.html" />
  </div>
</template>
