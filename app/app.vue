<script setup lang="ts">
const { t, locale } = useI18n()
const siteUrl = useRuntimeConfig().public.siteUrl as string
const i18nHead = useLocaleHead({ seo: true })
useHead({
  htmlAttrs: { lang: () => i18nHead.value.htmlAttrs.lang },
  link: () => i18nHead.value.link ?? [],
  titleTemplate: (title) => (title ? `${title} · Pöhls Immobilien` : t('seo.defaultTitle')),
})
useSeoMeta({
  ogSiteName: 'Pöhls Immobilien',
  ogLocale: () => (locale.value === 'en' ? 'en_GB' : 'de_DE'),
  ogType: 'website',
  ogTitle: () => t('seo.defaultTitle'),
  ogDescription: () => t('seo.ogDescription'),
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
