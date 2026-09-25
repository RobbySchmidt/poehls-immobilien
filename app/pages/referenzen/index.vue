<script setup lang="ts">
useSeoMeta({ title: 'Referenzen', description: 'Von Pöhls Immobilien verkaufte und vermietete Objekte in Frankfurt und Rhein-Main.' })
const all = sortListings(useArchivedListings(), 'neu')
const filter = ref<'alle' | 'sold' | 'rented'>('alle')
const filterOptions: { value: typeof filter.value, label: string }[] = [{ value: 'alle', label: 'Alle' }, { value: 'sold', label: 'Verkauft' }, { value: 'rented', label: 'Vermietet' }]
const shown = computed(() => (filter.value === 'alle' ? all : all.filter((l) => l.availability === filter.value)))
</script>

<template>
  <div class="container-page py-f-12">
    <h1 class="text-f-6xl">Referenzen</h1>
    <p class="mt-3 max-w-[55ch] text-f-xl text-muted-foreground">Eine Auswahl der Objekte, die wir erfolgreich verkauft und vermietet haben.</p>
    <SiteSegmented v-model="filter" :options="filterOptions" label="Referenzen filtern" class="mt-f-8" />
    <div class="mt-f-12 grid gap-x-f-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
      <ListingCard v-for="l in shown" :key="l.id" :listing="l" :heading-level="2" />
    </div>
  </div>
</template>
