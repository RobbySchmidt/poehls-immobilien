<script setup lang="ts">
// "DE | EN" – switches to the same page in the other language (keeps slug and query).
const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()
const items = computed(() => (locales.value as { code: 'de' | 'en' }[]).map((l) => ({
  code: l.code,
  to: { path: switchLocalePath(l.code), query: route.query },
})))
</script>

<template>
  <nav :aria-label="t('lang.switchAria')" class="flex items-center">
    <template v-for="(item, i) in items" :key="item.code">
      <span v-if="i > 0" class="text-border" aria-hidden="true">|</span>
      <NuxtLink
        :to="item.to"
        :lang="item.code"
        :hreflang="item.code"
        :aria-label="t(`lang.${item.code}`)"
        :aria-current="locale === item.code ? 'true' : undefined"
        class="inline-flex h-11 min-w-9 items-center justify-center rounded-full px-2 text-sm font-semibold uppercase text-muted-foreground transition-colors duration-150 hover:text-foreground aria-[current=true]:text-foreground"
      >
        {{ item.code }}
      </NuxtLink>
    </template>
  </nav>
</template>
