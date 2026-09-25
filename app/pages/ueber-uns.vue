<script setup lang="ts">
const a = useAboutContent()
const company = useCompany()
const portrait = useFile(company.portrait)
useSeoMeta({ title: a.title, description: a.lead })
</script>

<template>
  <div>
    <section class="container-page grid items-end gap-f-16 py-f-12 md:grid-cols-12">
      <div class="md:col-span-7">
        <h1 class="text-f-6xl">{{ a.title }}</h1>
        <p class="mt-4 max-w-[48ch] text-f-xl text-muted-foreground">{{ a.lead }}</p>
      </div>
      <figure class="md:col-span-5">
        <div class="aspect-[4/5] overflow-hidden rounded-2xl"><ResponsiveImage :file="portrait" eager sizes="(min-width: 768px) 40vw, 100vw" /></div>
        <figcaption class="mt-3 text-sm text-muted-foreground">{{ company.owner }}, Inhaber</figcaption>
      </figure>
    </section>
    <section class="container-page pb-f-24">
      <div class="grid gap-f-12 md:grid-cols-3">
        <div v-for="sec in a.sections" :key="sec.title">
          <h2 class="text-f-2xl">{{ sec.title }}</h2>
          <p v-for="p in sec.text" :key="p" class="mt-3 text-muted-foreground">{{ p }}</p>
        </div>
      </div>
    </section>
    <HomeContactBand />
  </div>
</template>
