<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error.statusCode === 404)
useSeoMeta({ title: is404.value ? 'Seite nicht gefunden' : 'Fehler' })
</script>

<template>
  <NuxtLayout>
    <div class="container-page py-f-24">
      <p class="text-sm font-semibold text-muted-foreground tabular">{{ error.statusCode }}</p>
      <h1 class="mt-2 max-w-[18ch] text-f-6xl">{{ is404 ? 'Diese Seite gibt es nicht (mehr).' : 'Hier ist etwas schiefgegangen.' }}</h1>
      <p class="mt-4 max-w-[48ch] text-f-xl text-muted-foreground">
        {{ is404 ? 'Vielleicht wurde das Objekt bereits verkauft oder vermietet. Unsere aktuellen Angebote finden Sie hier:' : 'Bitte versuchen Sie es erneut oder kehren Sie zur Startseite zurück.' }}
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <Button as-child size="cta"><NuxtLink to="/angebote">Angebote ansehen</NuxtLink></Button>
        <Button as-child variant="outline" size="cta"><NuxtLink to="/">Zur Startseite</NuxtLink></Button>
      </div>
    </div>
  </NuxtLayout>
</template>
