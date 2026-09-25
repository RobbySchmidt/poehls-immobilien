<script setup lang="ts">
import { SearchX } from '@lucide/vue'
import type { Filters } from '~/utils/filters'

useSeoMeta({ title: 'Angebote', description: 'Aktuelle Eigentumswohnungen, Häuser, Gewerbe- und Anlageobjekte von Pöhls Immobilien in Frankfurt und Rhein-Main.' })

const route = useRoute()
const router = useRouter()
const all = useAvailableListings()
// Prerendered HTML knows no query string → filter only after hydration to avoid mismatches.
const hydrated = ref(false)
onMounted(() => { hydrated.value = true })

const filters = computed<Filters>(() => (hydrated.value ? parseFilters(route.query) : DEFAULT_FILTERS))
const results = computed(() => sortListings(applyFilters(all, filters.value), filters.value.sort))

function update(patch: Partial<Filters>) {
  router.replace({ query: filtersToQuery({ ...filters.value, ...patch }) })
}
function reset() {
  router.replace({ query: filtersToQuery({ ...DEFAULT_FILTERS, sort: filters.value.sort }) })
}
</script>

<template>
  <div>
    <div class="container-page pb-f-8 pt-f-12">
      <h1 class="text-f-6xl">Angebote</h1>
      <p class="mt-3 text-f-xl text-muted-foreground">Wohnungen, Häuser, Gewerbe- und Anlageobjekte in Frankfurt und Rhein-Main.</p>
    </div>
    <div class="sticky top-16 z-30 border-y border-border bg-background py-3 md:top-20">
      <div class="container-page">
        <ListingFilters :filters="filters" :count="results.length" @update="update" @reset="reset" />
      </div>
    </div>
    <div class="container-page py-f-12">
      <p class="mb-8 text-sm text-muted-foreground tabular" aria-live="polite">
        {{ results.length }} {{ results.length === 1 ? 'Angebot' : 'Angebote' }}
      </p>
      <div v-if="results.length" class="grid gap-x-f-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        <ListingCard v-for="(l, i) in results" :key="l.id" :listing="l" :eager="i < 3" :heading-level="2" />
      </div>
      <div v-else class="flex flex-col items-start gap-4 rounded-2xl bg-secondary p-f-12">
        <SearchX class="size-6 text-muted-foreground" aria-hidden="true" />
        <h2 class="text-f-2xl">Keine Angebote für diese Auswahl</h2>
        <p class="max-w-[48ch] text-muted-foreground">Passen Sie die Filter an oder sprechen Sie uns an – wir suchen gern gezielt für Sie.</p>
        <div class="flex flex-wrap gap-3">
          <Button class="h-12 rounded-full px-7 text-base" @click="reset">Filter zurücksetzen</Button>
          <Button as-child variant="outline" class="h-12 rounded-full px-7 text-base"><NuxtLink to="/kontakt">Suchauftrag besprechen</NuxtLink></Button>
        </div>
      </div>
    </div>
  </div>
</template>
