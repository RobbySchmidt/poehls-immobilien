<script setup lang="ts">
import { SlidersHorizontal } from '@lucide/vue'
import type { Filters, SortKey } from '~/utils/filters'
import type { MarketingType, PropertyType } from '~/types/content'

const props = defineProps<{ filters: Filters, count: number }>()
const emit = defineEmits<{ update: [patch: Partial<Filters>], reset: [] }>()
const open = ref(false)

const arts = Object.entries(PROPERTY_TYPE_LABEL) as [PropertyType, string][]
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
      <ToggleGroup :model-value="typModel" type="single" class="rounded-full bg-secondary p-1" aria-label="Vermarktungsart" @update:model-value="(v) => v && (typModel = String(v))">
        <ToggleGroupItem value="alle" class="h-10 rounded-full px-4 data-[state=on]:bg-background data-[state=on]:shadow-sm">Alle</ToggleGroupItem>
        <ToggleGroupItem value="kauf" class="h-10 rounded-full px-4 data-[state=on]:bg-background data-[state=on]:shadow-sm">Kaufen</ToggleGroupItem>
        <ToggleGroupItem value="miete" class="h-10 rounded-full px-4 data-[state=on]:bg-background data-[state=on]:shadow-sm">Mieten</ToggleGroupItem>
      </ToggleGroup>
      <Select v-model="artModel">
        <SelectTrigger class="h-12 rounded-full px-5" aria-label="Objektart"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="alle">Alle Objektarten</SelectItem>
          <SelectItem v-for="[k, label] in arts" :key="k" :value="k">{{ label }}</SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="zimmerModel">
        <SelectTrigger class="h-12 rounded-full px-5" aria-label="Zimmer"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="alle">Zimmer: alle</SelectItem>
          <SelectItem v-for="z in ROOM_STEPS" :key="z" :value="String(z)">ab {{ z }} Zimmer</SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="preisModel">
        <SelectTrigger class="h-12 rounded-full px-5" aria-label="Preis bis"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="alle">Preis: alle</SelectItem>
          <SelectItem v-for="p in priceSteps" :key="p" :value="String(p)">bis {{ formatEuro(p) }}</SelectItem>
        </SelectContent>
      </Select>
      <Button v-if="active" variant="ghost" class="h-12 rounded-full px-5" @click="emit('reset')">Filter zurücksetzen</Button>
      <div class="ml-auto">
        <Select v-model="sortModel">
          <SelectTrigger class="h-12 rounded-full px-5" aria-label="Sortierung"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="neu">Neueste zuerst</SelectItem>
            <SelectItem value="preis-auf">Preis aufsteigend</SelectItem>
            <SelectItem value="preis-ab">Preis absteigend</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Mobile -->
    <div class="flex items-center justify-between gap-3 lg:hidden">
      <Sheet v-model:open="open">
        <SheetTrigger as-child>
          <Button variant="outline" class="h-12 rounded-full px-5">
            <SlidersHorizontal class="size-4" aria-hidden="true" />Filter<span v-if="active" class="tabular"> ({{ active }})</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" class="max-h-[85dvh] overflow-y-auto rounded-t-3xl">
          <SheetHeader><SheetTitle>Filter</SheetTitle></SheetHeader>
          <div class="grid gap-5 px-4 pb-6">
            <ToggleGroup :model-value="typModel" type="single" class="w-full rounded-full bg-secondary p-1" aria-label="Vermarktungsart" @update:model-value="(v) => v && (typModel = String(v))">
              <ToggleGroupItem value="alle" class="h-11 flex-1 rounded-full data-[state=on]:bg-background">Alle</ToggleGroupItem>
              <ToggleGroupItem value="kauf" class="h-11 flex-1 rounded-full data-[state=on]:bg-background">Kaufen</ToggleGroupItem>
              <ToggleGroupItem value="miete" class="h-11 flex-1 rounded-full data-[state=on]:bg-background">Mieten</ToggleGroupItem>
            </ToggleGroup>
            <div class="grid gap-2">
              <Label for="m-art">Objektart</Label>
              <Select v-model="artModel">
                <SelectTrigger id="m-art" class="h-12 w-full rounded-full text-base"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="alle">Alle Objektarten</SelectItem><SelectItem v-for="[k, label] in arts" :key="k" :value="k">{{ label }}</SelectItem></SelectContent>
              </Select>
            </div>
            <div class="grid gap-2">
              <Label for="m-zimmer">Zimmer</Label>
              <Select v-model="zimmerModel">
                <SelectTrigger id="m-zimmer" class="h-12 w-full rounded-full text-base"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="alle">Zimmer: alle</SelectItem><SelectItem v-for="z in ROOM_STEPS" :key="z" :value="String(z)">ab {{ z }} Zimmer</SelectItem></SelectContent>
              </Select>
            </div>
            <div class="grid gap-2">
              <Label for="m-preis">Preis bis</Label>
              <Select v-model="preisModel">
                <SelectTrigger id="m-preis" class="h-12 w-full rounded-full text-base"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="alle">Preis: alle</SelectItem><SelectItem v-for="p in priceSteps" :key="p" :value="String(p)">bis {{ formatEuro(p) }}</SelectItem></SelectContent>
              </Select>
            </div>
            <div class="flex gap-3 pt-2">
              <Button variant="ghost" class="h-12 flex-1 rounded-full" @click="emit('reset')">Filter zurücksetzen</Button>
              <Button class="h-12 flex-1 rounded-full tabular" @click="open = false">{{ count }} Angebote ansehen</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <Select v-model="sortModel">
        <SelectTrigger class="h-12 rounded-full px-5" aria-label="Sortierung"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="neu">Neueste zuerst</SelectItem>
          <SelectItem value="preis-auf">Preis aufsteigend</SelectItem>
          <SelectItem value="preis-ab">Preis absteigend</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
