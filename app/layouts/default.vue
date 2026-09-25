<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <a href="#inhalt" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">{{ t('nav.skip') }}</a>
    <SiteHeader />
    <main id="inhalt" class="flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
