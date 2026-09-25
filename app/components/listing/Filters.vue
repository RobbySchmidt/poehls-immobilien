<script setup lang="ts">
import { SlidersHorizontal } from '@lucide/vue'
import type { Filters, SortKey } from '~/utils/filters'
import type { MarketingType, PropertyType } from '~/types/content'

const props = defineProps<{ filters: Filters, count: number }>()
const emit = defineEmits<{ update: [patch: Partial<Filters>], reset: [] }>()
const open = ref(false)

const { t } = useI18n()
const locale = useLocaleCode()
const typOptions = computed(() => [{ value: 'alle', label: t('common.all') }, { value: 'kauf', label: t('common.buy') }, { value: 'miete', label: t('common.rent') }])
const arts = computed(() => (['wohnung', 'haus', 'gewerbe', 'grundstueck', 'anlage'] as PropertyType[]).map((k) => [k, propertyTypeLabel(k, locale)] as const))
const priceSteps = computed(() => PRICE_STEPS[props.filters.typ ?? 'kauf'])
const active = computed(() => activeFilterCount(props.filters))

const typModel = computed({
  get: () => props.filters.typ ?? 'alle',
  set: (v: string) => emit('update', { typ: v === 'alle' ? null : (v as MarketingType), preis: null }),
})
const artModel = computed({
  get: () => props.filters.art ?? 'alle',
  set: (v: string) => emit('update', { art: v === 'alle' ? null : (v as PropertyType) }),
})
const zimmerModel = computed({
  get: () => (props.filters.zimmer ? String(props.filters.zimmer) : 'alle'),
  set: (v: string) => emit('update', { zimmer: v === 'alle' ? null : Number(v) }),
})
const preisModel = computed({
  get: () => (props.filters.preis ? String(props.filters.preis) : 'alle'),
  set: (v: string) => emit('update', { preis: v === 'alle' ? null : Number(v) }),
})
const sortModel = computed({
  get: () => props.filters.sort,
  set: (v: string) => emit('update', { sort: v as SortKey }),
})
</script>

<template>
  <div>
    <!-- Desktop -->
    <div class="hidden flex-wrap items-center gap-2 lg:flex">
      <SiteSegmented v-model="typModel" :options="typOptions" :label="t('common.marketingAria')" />
      <Select v-model="artModel">
        <SelectTrigger size="cta" :aria-label="t('common.typeAria')"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="alle">{{ t('common.allTypes') }}</SelectItem>
          <SelectItem v-for="[k, label] in arts" :key="k" :value="k">{{ label }}</SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="zimmerModel">
        <SelectTrigger size="cta" :aria-label="t('filters.rooms')"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="alle">{{ t('filters.roomsAll') }}</SelectItem>
          <SelectItem v-for="z in ROOM_STEPS" :key="z" :value="String(z)">{{ t('filters.roomsFrom', { n: z }) }}</SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="preisModel">
        <SelectTrigger size="cta" :aria-label="t('filters.priceUpTo')"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="alle">{{ t('filters.priceAll') }}</SelectItem>
          <SelectItem v-for="p in priceSteps" :key="p" :value="String(p)">{{ t('filters.priceUpToValue', { price: formatEuro(p, locale) }) }}</SelectItem>
        </SelectContent>
      </Select>
      <Button v-if="active" variant="ghost" size="cta" @click="emit('reset')">{{ t('listings.resetFilters') }}</Button>
      <div class="ml-auto">
        <Select v-model="sortModel">
          <SelectTrigger size="cta" :aria-label="t('filters.sort')"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="neu">{{ t('filters.sortNew') }}</SelectItem>
            <SelectItem value="preis-auf">{{ t('filters.sortPriceAsc') }}</SelectItem>
            <SelectItem value="preis-ab">{{ t('filters.sortPriceDesc') }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Mobile -->
    <div class="flex items-center justify-between gap-3 lg:hidden">
      <Sheet v-model:open="open">
        <SheetTrigger as-child>
          <Button variant="outline" size="cta">
            <SlidersHorizontal class="size-4" aria-hidden="true" />{{ t('filters.filter') }}<span v-if="active" class="tabular"> ({{ active }})</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" class="max-h-[85dvh] overflow-y-auto rounded-t-3xl">
          <SheetHeader><SheetTitle>{{ t('filters.filter') }}</SheetTitle></SheetHeader>
          <div class="grid gap-5 px-4 pb-6">
            <SiteSegmented v-model="typModel" :options="typOptions" :label="t('common.marketingAria')" full />
            <div class="grid gap-2">
              <Label for="m-art">{{ t('common.typeAria') }}</Label>
              <Select v-model="artModel">
                <SelectTrigger id="m-art" size="cta" class="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="alle">{{ t('common.allTypes') }}</SelectItem><SelectItem v-for="[k, label] in arts" :key="k" :value="k">{{ label }}</SelectItem></SelectContent>
              </Select>
            </div>
            <div class="grid gap-2">
              <Label for="m-zimmer">{{ t('filters.rooms') }}</Label>
              <Select v-model="zimmerModel">
                <SelectTrigger id="m-zimmer" size="cta" class="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="alle">{{ t('filters.roomsAll') }}</SelectItem><SelectItem v-for="z in ROOM_STEPS" :key="z" :value="String(z)">{{ t('filters.roomsFrom', { n: z }) }}</SelectItem></SelectContent>
              </Select>
            </div>
            <div class="grid gap-2">
              <Label for="m-preis">{{ t('filters.priceUpTo') }}</Label>
              <Select v-model="preisModel">
                <SelectTrigger id="m-preis" size="cta" class="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="alle">{{ t('filters.priceAll') }}</SelectItem><SelectItem v-for="p in priceSteps" :key="p" :value="String(p)">{{ t('filters.priceUpToValue', { price: formatEuro(p, locale) }) }}</SelectItem></SelectContent>
              </Select>
            </div>
            <div class="flex gap-3 pt-2">
              <Button variant="ghost" size="cta" class="flex-1" @click="emit('reset')">{{ t('listings.resetFilters') }}</Button>
              <Button size="cta" class="flex-1" @click="open = false">{{ t('common.viewNOffers', { n: count }, count) }}</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <Select v-model="sortModel">
        <SelectTrigger size="cta" :aria-label="t('filters.sort')"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="neu">{{ t('filters.sortNew') }}</SelectItem>
          <SelectItem value="preis-auf">{{ t('filters.sortPriceAsc') }}</SelectItem>
          <SelectItem value="preis-ab">{{ t('filters.sortPriceDesc') }}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
