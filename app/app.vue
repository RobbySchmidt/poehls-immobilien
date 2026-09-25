<script setup lang="ts">
const siteUrl = useRuntimeConfig().public.siteUrl as string
useHead({
  titleTemplate: (t) => (t ? `${t} · Pöhls Immobilien` : 'Pöhls Immobilien – Immobilien in Frankfurt und Rhein-Main'),
})
useSeoMeta({
  ogSiteName: 'Pöhls Immobilien',
  ogLocale: 'de_DE',
  ogType: 'website',
  ogTitle: 'Pöhls Immobilien – Immobilien in Frankfurt und Rhein-Main',
  ogDescription: 'Kaufen, mieten, verkaufen – mit über 35 Jahren Markterfahrung an Ihrer Seite.',
  ogImage: absoluteUrl(siteUrl, '/og.jpg'),
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease-out;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .page-enter-active, .page-leave-active { transition: none; }
}
</style>
