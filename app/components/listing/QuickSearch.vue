<script setup lang="ts">
import type { MarketingType, PropertyType } from '~/types/content'

const listings = useAvailableListings()
const typ = ref<MarketingType>('kauf')
const art = ref<PropertyType | 'alle'>('alle')
const filters = computed(() => ({ ...DEFAULT_FILTERS, typ: typ.value, art: art.value === 'alle' ? null : art.value }))
const count = computed(() => applyFilters(listings, filters.value).length)
const to = computed(() => ({ path: '/angebote', query: filtersToQuery(filters.value) }))
const arts = Object.entries(PROPERTY_TYPE_LABEL) as [PropertyType, string][]
</script>

<template>
  <form class="flex flex-col gap-2 rounded-3xl bg-secondary p-2 sm:flex-row sm:items-center sm:rounded-full" role="search" aria-label="Schnellsuche" @submit.prevent="navigateTo(to)">
    <ToggleGroup :model-value="typ" type="single" class="w-full rounded-full bg-background p-1 sm:w-auto" aria-label="Vermarktungsart" @update:model-value="(v) => v && (typ = v as MarketingType)">
      <ToggleGroupItem value="kauf" class="h-10 flex-1 rounded-full px-5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Kaufen</ToggleGroupItem>
      <ToggleGroupItem value="miete" class="h-10 flex-1 rounded-full px-5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Mieten</ToggleGroupItem>
    </ToggleGroup>
    <Select v-model="art">
      <SelectTrigger class="h-12 w-full rounded-full border-0 bg-background px-5 text-base sm:w-auto sm:min-w-44" aria-label="Objektart">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="alle">Alle Objektarten</SelectItem>
        <SelectItem v-for="[key, label] in arts" :key="key" :value="key">{{ label }}</SelectItem>
      </SelectContent>
    </Select>
    <Button type="submit" class="h-12 rounded-full px-7 text-base tabular" variant="outline">
      {{ count }} {{ count === 1 ? 'Angebot' : 'Angebote' }} ansehen
    </Button>
  </form>
</template>
