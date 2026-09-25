<script setup lang="ts">
const home = useHomeContent()
const all = useAvailableListings()
const latest = computed(() => sortListings(all, 'neu').slice(0, 6))
</script>

<template>
  <section class="bg-secondary py-f-24 [--surface:var(--secondary)]" aria-labelledby="latest-title">
    <div class="container-page">
      <SiteSectionHeading id="latest-title" :title="home.latest.title" :intro="home.latest.intro" />
      <div class="grid gap-x-f-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        <ListingCard v-for="l in latest" :key="l.id" :listing="l" />
      </div>
      <div class="mt-f-12">
        <Button as-child size="cta">
          <NuxtLink to="/angebote">Alle {{ all.length }} Angebote ansehen</NuxtLink>
        </Button>
      </div>
    </div>
  </section>
</template>
