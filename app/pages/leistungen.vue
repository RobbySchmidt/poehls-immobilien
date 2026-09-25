<script setup lang="ts">
import { Check } from '@lucide/vue'

const s = useServicesContent()
useSeoMeta({ title: 'Leistungen', description: s.lead })
</script>

<template>
  <div>
    <section class="container-page py-f-12">
      <h1 class="max-w-[18ch] text-f-6xl">{{ s.title }}</h1>
      <p class="mt-4 max-w-[55ch] text-f-xl text-muted-foreground">{{ s.lead }}</p>
    </section>

    <section class="container-page grid gap-f-12 pb-f-24 md:grid-cols-3" aria-label="Leistungsbereiche">
      <div v-for="g in s.groups" :key="g.title">
        <h2 class="border-b border-border pb-3 text-f-2xl">{{ g.title }}</h2>
        <ul class="mt-5 space-y-3">
          <li v-for="item in g.items" :key="item" class="flex gap-3"><Check class="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />{{ item }}</li>
        </ul>
      </div>
    </section>

    <section class="bg-secondary py-f-24" aria-labelledby="steps-title">
      <div class="container-page">
        <SiteSectionHeading id="steps-title" title="So läuft eine Vermarktung ab" />
        <ol class="grid gap-8 md:grid-cols-5">
          <li v-for="(step, i) in s.steps" :key="step.title" class="border-t-2 border-foreground pt-4">
            <span class="text-sm font-semibold text-muted-foreground tabular">Schritt {{ i + 1 }}</span>
            <h3 class="mt-1 text-f-2xl">{{ step.title }}</h3>
            <p class="mt-2 text-sm text-muted-foreground">{{ step.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <HomeContactBand surface="background" />
  </div>
</template>
