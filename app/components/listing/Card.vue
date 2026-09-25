<script setup lang="ts">
import type { Listing } from '~/types/content'

// Card "Sockel": price in a notch cut out of the photo (colour from --surface), location as headline,
// status via the price label instead of badges. Sections on bg-secondary set [--surface:var(--secondary)].
const props = withDefaults(defineProps<{ listing: Listing, eager?: boolean, headingLevel?: 2 | 3 | 4 }>(), { eager: false, headingLevel: 3 })
const { t } = useI18n()
const localePath = useLocalePath()
const locale = useLocaleCode()
const l = computed(() => props.listing)
const archived = computed(() => l.value.availability !== 'available')
const to = computed(() => localePath({ name: archived.value ? 'referenzen-slug' : 'angebote-slug', params: { slug: l.value.slug } }))
const cover = computed(() => useFile(l.value.cover_image))
const price = computed(() => priceParts(l.value, locale))
const label = computed(() => (archived.value ? t('common.reference') : priceLabel(l.value, locale)))
const facts = computed(() => cardFacts(l.value, locale))
const place = computed(() => (l.value.project === 'grand-tower' ? 'Grand Tower' : l.value.district ?? l.value.city ?? ''))
const sub = computed(() => {
  const type = l.value.property_type ? propertyTypeLabel(l.value.property_type, locale) : null
  const where = l.value.country !== 'DE' ? locationText(l.value, locale) : place.value === l.value.city ? null : l.value.city
  return [type, where].filter(Boolean).join(' · ')
})
</script>

<template>
  <article class="group relative flex flex-col rounded-[18px] outline-offset-8 focus-within:outline-2 focus-within:outline-ring">
    <div class="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-muted">
      <ResponsiveImage
        :file="cover"
        :eager="eager"
        sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
        alt=""
        :class="archived ? 'saturate-[.45]' : 'dark:brightness-[.94]'"
      />
      <div v-if="price" class="plinth">
        <span class="block text-sm text-muted-foreground">
          {{ label }}<template v-if="l.commission_free && !archived"> · <span class="font-semibold text-primary">{{ t('common.commissionFree') }}</span></template>
        </span>
        <span
          class="block whitespace-nowrap font-semibold tabular transition-colors duration-150 group-hover:text-primary motion-reduce:transition-none"
          :class="price.compact ? 'text-xl leading-relaxed' : 'text-f-3xl tracking-[-0.015em]'"
        >
          {{ price.value }}<span v-if="price.unit" class="ml-1 text-[0.62em] font-normal tracking-normal text-muted-foreground">{{ price.unit }}</span>
        </span>
      </div>
    </div>
    <div class="pt-4">
      <div class="flex items-baseline justify-between gap-4">
        <p class="text-lg font-semibold leading-tight tracking-tight">{{ place }}</p>
        <p v-if="facts" class="shrink-0 whitespace-nowrap text-sm tabular">{{ facts }}</p>
      </div>
      <p v-if="sub" class="mt-1 text-sm text-muted-foreground">{{ sub }}</p>
      <component :is="`h${headingLevel}`" class="mt-2 line-clamp-2 text-sm font-normal leading-snug tracking-normal text-muted-foreground">
        <NuxtLink
          :to="to"
          class="underline decoration-transparent underline-offset-4 transition-colors duration-150 after:absolute after:inset-0 after:content-[''] group-hover:text-foreground group-hover:decoration-current focus-visible:outline-none motion-reduce:transition-none"
        >
          {{ l.title }}
        </NuxtLink>
      </component>
    </div>
  </article>
</template>
