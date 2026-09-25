<script setup lang="ts">
import { SearchX, X } from '@lucide/vue'
import type { Filters } from '~/utils/filters'

const { t } = useI18n()
const localePath = useLocalePath()
const locale = useLocaleCode()
useSeoMeta({ title: t('listings.title'), description: t('listings.seoDescription') })

const route = useRoute()
const router = useRouter()
const all = useAvailableListings()
// Prerendered HTML knows no query string → filter only after hydration to avoid mismatches.
const hydrated = ref(false)
onMounted(() => { hydrated.value = true })

const filters = computed<Filters>(() => (hydrated.value ? parseFilters(route.query) : DEFAULT_FILTERS))
const results = computed(() => sortListings(applyFilters(all, filters.value), filters.value.sort))
const chips = computed(() => activeChips(filters.value, locale))
const resultKey = computed(() => JSON.stringify(filtersToQuery(filters.value)))

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
      <h1 class="text-f-6xl">{{ t('listings.title') }}</h1>
      <p class="mt-3 text-f-xl text-muted-foreground">{{ t('listings.intro') }}</p>
    </div>
    <div class="sticky top-16 z-30 border-y border-border bg-background py-3 md:top-20">
      <div class="container-page">
        <ListingFilters :filters="filters" :count="results.length" @update="update" @reset="reset" />
      </div>
    </div>
    <div class="container-page py-f-12">
      <!-- Feedback: count re-pops and results fade in on every filter change -->
      <div class="mb-8 flex min-h-11 flex-wrap items-center gap-2">
        <p class="mr-2 text-f-xl font-semibold" role="status" aria-live="polite">
          <span :key="resultKey" class="inline-block motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300">{{ resultLabel(results.length, chips.length > 0, locale) }}</span>
        </p>
        <button
          v-for="c in chips"
          :key="c.key"
          type="button"
          class="inline-flex h-9 items-center gap-1.5 rounded-full bg-secondary pl-3.5 pr-2.5 text-sm font-semibold transition-colors duration-150 hover:bg-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          :aria-label="t('listings.removeChip', { label: c.label })"
          @click="update(c.remove)"
        >
          {{ c.label }}<X class="size-3.5 text-muted-foreground" aria-hidden="true" />
        </button>
      </div>
      <div v-if="results.length" :key="resultKey" class="grid gap-x-f-8 gap-y-12 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 motion-safe:duration-300 md:grid-cols-2 lg:grid-cols-3">
        <ListingCard v-for="(l, i) in results" :key="l.id" :listing="l" :eager="i < 3" :heading-level="2" />
      </div>
      <div v-else class="flex flex-col items-start gap-4 rounded-2xl bg-secondary p-f-12">
        <SearchX class="size-6 text-muted-foreground" aria-hidden="true" />
        <h2 class="text-f-2xl">{{ t('listings.emptyTitle') }}</h2>
        <p class="max-w-[48ch] text-muted-foreground">{{ t('listings.emptyText') }}</p>
        <div class="flex flex-wrap gap-3">
          <Button size="cta" @click="reset">{{ t('listings.resetFilters') }}</Button>
          <Button as-child variant="outline" size="cta"><NuxtLink :to="localePath('kontakt')">{{ t('listings.searchOrder') }}</NuxtLink></Button>
        </div>
      </div>
    </div>
  </div>
</template>
