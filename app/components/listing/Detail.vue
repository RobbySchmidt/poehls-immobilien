<script setup lang="ts">
import { Download, Mail, Phone } from '@lucide/vue'
import type { Listing } from '~/types/content'

const props = defineProps<{ listing: Listing }>()
const l = computed(() => props.listing)
const archived = computed(() => l.value.availability !== 'available')
const images = computed(() => useListingImages(l.value))
const company = useCompany()
const { t } = useI18n()
const localePath = useLocalePath()
const locale = useLocaleCode()
const area = computed(() => mainArea(l.value, locale))

const keyFacts = computed(() => [
  !archived.value && priceText(l.value, locale) ? { label: priceLabel(l.value, locale), value: priceText(l.value, locale)! } : null,
  l.value.rooms ? { label: t('detail.rooms'), value: new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'de-DE').format(l.value.rooms) } : null,
  area.value,
  !archived.value && l.value.total_rent ? { label: t('detail.totalRent'), value: priceText({ ...l.value, price: l.value.total_rent, price_on_request: false }, locale)! } : null,
  !archived.value && availableFromText(l.value.available_from, new Date(), locale) ? { label: t('detail.availableFrom'), value: availableFromText(l.value.available_from, new Date(), locale)! } : null,
].filter((x): x is { label: string, value: string } => !!x))

const details = computed(() => [
  l.value.property_type ? { label: t('detail.propertyType'), value: propertyTypeLabel(l.value.property_type, locale) } : null,
  { label: t('detail.marketing'), value: marketingLabel(l.value.marketing_type, locale) },
  l.value.furnished ? { label: t('detail.equipment'), value: t('detail.furnishedValue') } : null,
  l.value.living_area && l.value.usable_area ? { label: t('detail.usableArea'), value: formatArea(l.value.usable_area, locale) } : null,
  l.value.plot_area && (l.value.living_area || l.value.usable_area) ? { label: t('detail.plot'), value: formatArea(l.value.plot_area, locale) } : null,
  ...l.value.features.map((f) => ({ label: featureLabel(f.label, locale), value: f.value })),
].filter((x): x is { label: string, value: string } => !!x))

const similar = computed(() => {
  const pool = useAvailableListings().filter((x) => x.id !== l.value.id && x.marketing_type === l.value.marketing_type)
  const same = pool.filter((x) => x.property_type === l.value.property_type)
  return [...same, ...pool.filter((x) => !same.includes(x))].slice(0, 3)
})
const address = computed(() => [l.value.street, [l.value.zip, l.value.city].filter(Boolean).join(' ')].filter(Boolean).join(', '))
const statusText = computed(() => (l.value.availability === 'sold' ? t('detail.soldText') : t('detail.rentedText')))
</script>

<template>
  <article class="pb-24 lg:pb-0">
    <div class="container-page pt-f-8">
      <nav :aria-label="t('common.breadcrumb')" class="mb-6 text-sm text-muted-foreground">
        <NuxtLink :to="localePath(archived ? 'referenzen' : 'angebote')" class="hover:text-foreground hover:underline">{{ archived ? t('references.title') : t('listings.title') }}</NuxtLink>
        <template v-if="locationText(l, locale)"><span aria-hidden="true"> / </span><span>{{ locationText(l, locale) }}</span></template>
      </nav>
      <ListingGallery :images="images" :title="l.title" eager />
    </div>

    <div class="container-page mt-f-12 grid gap-f-16 lg:grid-cols-12">
      <div class="lg:col-span-8">
        <div class="flex flex-wrap gap-2">
          <Badge variant="secondary" class="rounded-full px-3 py-1">{{ archived ? (l.availability === 'sold' ? t('common.sold') : t('common.rented')) : marketingLabel(l.marketing_type, locale) }}</Badge>
          <Badge v-if="l.property_type" variant="secondary" class="rounded-full px-3 py-1">{{ propertyTypeLabel(l.property_type, locale) }}</Badge>
          <Badge v-if="l.commission_free && !archived" variant="secondary" class="rounded-full px-3 py-1">{{ t('common.commissionFreeBadge') }}</Badge>
          <Badge v-if="l.furnished" variant="secondary" class="rounded-full px-3 py-1">{{ t('common.furnished') }}</Badge>
        </div>
        <h1 class="mt-4 text-f-4xl">{{ l.title }}</h1>
        <p v-if="address || locationText(l, locale)" class="mt-2 text-f-xl text-muted-foreground">{{ address || locationText(l, locale) }}</p>

        <dl v-if="keyFacts.length" class="mt-8 grid grid-cols-2 gap-6 border-y border-border py-6 sm:grid-cols-3 lg:grid-cols-5">
          <div v-for="f in keyFacts" :key="f.label">
            <dt class="text-sm text-muted-foreground">{{ f.label }}</dt>
            <dd class="mt-1 text-f-2xl font-semibold tabular">{{ f.value }}</dd>
          </div>
        </dl>

        <div v-if="archived" class="mt-8 rounded-2xl bg-secondary p-6">
          <p class="font-semibold">{{ statusText }}</p>
          <p class="mt-1 text-muted-foreground">{{ t('detail.ownerQuestion') }}</p>
          <Button as-child size="cta" class="mt-4"><NuxtLink :to="localePath('leistungen')">{{ t('common.viewServices') }}</NuxtLink></Button>
        </div>

        <section v-if="l.description" class="mt-f-12" aria-labelledby="desc-title">
          <h2 id="desc-title" class="text-f-2xl">{{ t('detail.description') }}</h2>
          <!-- eslint-disable-next-line vue/no-v-html -- escaped at build time -->
          <div class="prose-legacy mt-4" v-html="l.description" />
        </section>

        <section v-if="details.length" class="mt-f-12" aria-labelledby="details-title">
          <h2 id="details-title" class="text-f-2xl">{{ t('detail.data') }}</h2>
          <dl class="mt-4 divide-y divide-border border-y border-border">
            <div v-for="d in details" :key="d.label" class="grid grid-cols-2 gap-4 py-3">
              <dt class="text-muted-foreground">{{ d.label }}</dt>
              <dd class="tabular">{{ d.value }}</dd>
            </div>
          </dl>
        </section>

        <div v-if="l.expose && !archived" class="mt-f-8">
          <Button as-child variant="outline" size="cta">
            <a :href="l.expose.url" target="_blank" rel="noopener"><Download class="size-4" aria-hidden="true" />{{ t('detail.expose') }}</a>
          </Button>
        </div>
      </div>

      <div v-if="!archived" class="hidden lg:col-span-4 lg:block">
        <div class="sticky top-28"><ListingContactBox :listing="l" /></div>
      </div>
    </div>

    <section v-if="similar.length" class="container-page py-f-24" aria-labelledby="similar-title">
      <SiteSectionHeading id="similar-title" :title="t('detail.similar')" />
      <div class="grid gap-x-f-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        <ListingCard v-for="s in similar" :key="s.id" :listing="s" />
      </div>
    </section>

    <!-- Mobile action bar -->
    <div v-if="!archived" class="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background p-3 lg:hidden">
      <div class="flex gap-2">
        <Button as-child variant="outline" size="cta" class="flex-1"><a :href="company.phone_href"><Phone class="size-4" aria-hidden="true" />{{ t('common.call') }}</a></Button>
        <Button as-child size="cta" class="flex-1"><NuxtLink :to="localePath({ name: 'kontakt', query: { objekt: l.slug } })"><Mail class="size-4" aria-hidden="true" />{{ t('common.inquire') }}</NuxtLink></Button>
      </div>
    </div>
  </article>
</template>
