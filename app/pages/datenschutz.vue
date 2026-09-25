<script setup lang="ts">
const page = useLegalPage('datenschutz')
useSeoMeta({ title: page.title })
</script>

<template>
  <div class="container-page grid gap-f-16 py-f-12 lg:grid-cols-12">
    <div class="lg:col-span-8">
      <h1 class="text-f-6xl">{{ page.title }}</h1>
      <!-- eslint-disable-next-line vue/no-v-html -- sanitized at build time -->
      <div class="prose-legacy mt-f-8" v-html="page.html" />
    </div>
    <nav v-if="page.toc.length" aria-label="Inhaltsverzeichnis" class="hidden lg:col-span-4 lg:block">
      <div class="lg:sticky lg:top-28">
        <h2 class="text-sm font-semibold">Inhalt</h2>
        <ol class="mt-3 space-y-2 text-sm text-muted-foreground">
          <li v-for="t in page.toc" :key="t.id"><a :href="`#${t.id}`" class="hover:text-foreground hover:underline">{{ t.title }}</a></li>
        </ol>
      </div>
    </nav>
  </div>
</template>
