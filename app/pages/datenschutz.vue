<script setup lang="ts">
const { t, locale } = useI18n()
const page = useLegalPage('datenschutz')
useSeoMeta({ title: t('legal.privacy') })
</script>

<template>
  <div class="container-page grid gap-f-16 py-f-12 lg:grid-cols-12">
    <div class="lg:col-span-8">
      <h1 class="text-f-6xl">{{ t('legal.privacy') }}</h1>
      <p v-if="locale !== 'de'" class="mt-4 max-w-[65ch] rounded-xl bg-secondary px-5 py-4 text-sm">{{ t('legal.bindingNote') }}</p>
      <!-- eslint-disable-next-line vue/no-v-html -- sanitized at build time -->
      <div class="prose-legacy mt-f-8" lang="de" v-html="page.html" />
    </div>
    <nav v-if="page.toc.length" :aria-label="t('legal.tocAria')" class="hidden lg:col-span-4 lg:block">
      <div class="lg:sticky lg:top-28">
        <h2 class="text-sm font-semibold">{{ t('legal.toc') }}</h2>
        <ol class="mt-3 space-y-2 text-sm text-muted-foreground">
          <li v-for="entry in page.toc" :key="entry.id" lang="de"><a :href="`#${entry.id}`" class="hover:text-foreground hover:underline">{{ entry.title }}</a></li>
        </ol>
      </div>
    </nav>
  </div>
</template>
