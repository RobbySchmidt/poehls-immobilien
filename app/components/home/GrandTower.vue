<script setup lang="ts">
const home = useHomeContent()
const project = useProject('grand-tower')!
const units = useAvailableListings().filter((l) => l.project === 'grand-tower')
const rents = units.filter((l) => l.marketing_type === 'miete' && l.price != null).map((l) => l.price!)
const fromRent = rents.length ? formatEuro(Math.min(...rents)) : null
const bg = useFile(project.mood_night)
const photo = useFile(project.mood_day)
const height = project.facts.find((f) => f.label === 'Höhe')
</script>

<template>
  <section class="dark" aria-labelledby="gt-title">
    <div class="relative overflow-hidden bg-background py-f-24 text-foreground">
      <div class="absolute inset-0 opacity-35" aria-hidden="true">
        <ResponsiveImage :file="bg" sizes="100vw" alt="" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" aria-hidden="true" />
      <div class="container-page relative grid items-center gap-f-16 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <p class="text-sm font-semibold text-muted-foreground">{{ home.grandTower.kicker }}</p>
          <h2 id="gt-title" class="mt-3 max-w-[18ch] text-f-4xl">{{ home.grandTower.title }}</h2>
          <p class="mt-4 max-w-[52ch] text-f-xl text-muted-foreground">{{ home.grandTower.text }}</p>
          <dl class="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            <div v-if="height"><dt class="text-sm text-muted-foreground">{{ height.label }}</dt><dd class="text-f-2xl font-semibold tabular">{{ height.value }}</dd></div>
            <div><dt class="text-sm text-muted-foreground">Verfügbare Wohnungen</dt><dd class="text-f-2xl font-semibold tabular">{{ units.length }}</dd></div>
            <div v-if="fromRent"><dt class="text-sm text-muted-foreground">Miete ab</dt><dd class="text-f-2xl font-semibold tabular">{{ fromRent }}</dd></div>
          </dl>
          <Button as-child class="mt-10 h-12 rounded-full px-7 text-base">
            <NuxtLink to="/grand-tower">Grand Tower entdecken</NuxtLink>
          </Button>
        </div>
        <div class="aspect-[4/3] overflow-hidden rounded-2xl lg:col-span-5">
          <ResponsiveImage :file="photo" sizes="(min-width: 1024px) 40vw, 100vw" />
        </div>
      </div>
    </div>
  </section>
</template>
