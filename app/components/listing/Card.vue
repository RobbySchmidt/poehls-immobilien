<script setup lang="ts">
import type { Listing } from '~/types/content'

const props = withDefaults(defineProps<{ listing: Listing, eager?: boolean, headingLevel?: 2 | 3 }>(), { eager: false, headingLevel: 3 })
const l = computed(() => props.listing)
const archived = computed(() => l.value.availability !== 'available')
const to = computed(() => `${archived.value ? '/referenzen/' : '/angebote/'}${l.value.slug}`)
const cover = computed(() => useFile(l.value.cover_image))
const area = computed(() => mainArea(l.value))
const meta = computed(() => [
  l.value.rooms ? formatRooms(l.value.rooms) : null,
  area.value?.value ?? null,
].filter(Boolean).join(' · '))
const badge = computed(() => (l.value.availability === 'sold' ? 'Verkauft' : l.value.availability === 'rented' ? 'Vermietet' : MARKETING_LABEL[l.value.marketing_type]))
</script>

<template>
  <article class="group relative flex flex-col">
    <div class="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
      <ResponsiveImage :file="cover" :eager="eager" sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw" alt="" />
      <div class="absolute left-3 top-3 flex gap-1.5">
        <Badge class="rounded-full border-0 bg-card px-2.5 py-1 text-xs font-semibold text-card-foreground">{{ badge }}</Badge>
        <Badge v-if="l.commission_free && !archived" class="rounded-full border-0 bg-card px-2.5 py-1 text-xs font-semibold text-card-foreground">Provisionsfrei</Badge>
      </div>
    </div>
    <p class="mt-4 text-sm text-muted-foreground">
      {{ [l.property_type ? PROPERTY_TYPE_LABEL[l.property_type] : null, locationText(l)].filter(Boolean).join(' · ') }}
    </p>
    <component :is="`h${headingLevel}`" class="mt-1 line-clamp-2 text-base font-semibold leading-snug tracking-tight">
      <NuxtLink :to="to" class="after:absolute after:inset-0 after:content-[''] group-hover:underline group-hover:underline-offset-4 focus-visible:outline-none focus-visible:after:rounded-xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50">
        {{ l.title }}
      </NuxtLink>
    </component>
    <p v-if="meta" class="mt-1.5 text-sm text-muted-foreground tabular">{{ meta }}</p>
    <p v-if="!archived && priceText(l)" class="mt-2 text-f-2xl font-semibold tabular">{{ priceText(l) }}</p>
  </article>
</template>
