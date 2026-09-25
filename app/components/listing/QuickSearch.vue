<script setup lang="ts">
import type { MarketingType, PropertyType } from '~/types/content'

const { t } = useI18n()
const localePath = useLocalePath()
const locale = useLocaleCode()
const listings = useAvailableListings()
const typ = ref<MarketingType>('kauf')
const art = ref<PropertyType | 'alle'>('alle')
const filters = computed(() => ({ ...DEFAULT_FILTERS, typ: typ.value, art: art.value === 'alle' ? null : art.value }))
const count = computed(() => applyFilters(listings, filters.value).length)
const to = computed(() => localePath({ name: 'angebote', query: filtersToQuery(filters.value) }))
const typOptions = computed<{ value: MarketingType, label: string }[]>(() => [{ value: 'kauf', label: t('common.buy') }, { value: 'miete', label: t('common.rent') }])
const arts = (['wohnung', 'haus', 'gewerbe', 'grundstueck', 'anlage'] as PropertyType[]).map((k) => [k, propertyTypeLabel(k, locale)] as const)
</script>

<template>
  <form class="flex flex-col gap-2 rounded-3xl bg-secondary p-2 sm:w-max sm:flex-row sm:items-center sm:rounded-full" role="search" :aria-label="t('common.quickSearch')" @submit.prevent="navigateTo(to)">
    <SiteSegmented v-model="typ" :options="typOptions" :label="t('common.marketingAria')" tone="neutral" surface="secondary" class="sm:w-auto" :full="true" />
    <Select v-model="art">
      <SelectTrigger size="cta" class="w-full border-0 bg-background shadow-none sm:w-auto sm:min-w-44" :aria-label="t('common.typeAria')">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="alle">{{ t('common.allTypes') }}</SelectItem>
        <SelectItem v-for="[key, label] in arts" :key="key" :value="key">{{ label }}</SelectItem>
      </SelectContent>
    </Select>
    <Button type="submit" size="cta">
      {{ t('common.viewNOffers', { n: count }, count) }}
    </Button>
  </form>
</template>
