<script setup lang="ts">
import type { MarketingType, PropertyType } from '~/types/content'

const listings = useAvailableListings()
const typ = ref<MarketingType>('kauf')
const art = ref<PropertyType | 'alle'>('alle')
const filters = computed(() => ({ ...DEFAULT_FILTERS, typ: typ.value, art: art.value === 'alle' ? null : art.value }))
const count = computed(() => applyFilters(listings, filters.value).length)
const to = computed(() => ({ path: '/angebote', query: filtersToQuery(filters.value) }))
const typOptions: { value: MarketingType, label: string }[] = [{ value: 'kauf', label: 'Kaufen' }, { value: 'miete', label: 'Mieten' }]
const arts = Object.entries(PROPERTY_TYPE_LABEL) as [PropertyType, string][]
</script>

<template>
  <form class="flex flex-col gap-2 rounded-3xl bg-secondary p-2 sm:flex-row sm:items-center sm:rounded-full" role="search" aria-label="Schnellsuche" @submit.prevent="navigateTo(to)">
    <SiteSegmented v-model="typ" :options="typOptions" label="Vermarktungsart" tone="accent" surface="background" class="sm:w-auto" :full="true" />
    <Select v-model="art">
      <SelectTrigger size="cta" class="w-full border-0 bg-background shadow-none sm:w-auto sm:min-w-44" aria-label="Objektart">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="alle">Alle Objektarten</SelectItem>
        <SelectItem v-for="[key, label] in arts" :key="key" :value="key">{{ label }}</SelectItem>
      </SelectContent>
    </Select>
    <Button type="submit" size="cta" variant="outline">
      {{ count }} {{ count === 1 ? 'Angebot' : 'Angebote' }} ansehen
    </Button>
  </form>
</template>
