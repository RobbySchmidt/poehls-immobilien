<script setup lang="ts">
import { Images } from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()
const project = useProject('grand-tower')!
useSeoMeta({ title: project.title, description: project.tagline })
const heroDay = useFile(project.mood_day)
const heroNight = useFile(project.mood_night)
const units = sortListings(useAvailableListings().filter((l) => l.project === 'grand-tower'), 'preis-auf')
const rent = units.filter((l) => l.marketing_type === 'miete')
const buy = units.filter((l) => l.marketing_type === 'kauf')
const gallery = project.images.map((id) => useFile(id)).filter((f): f is NonNullable<typeof f> => !!f)
const open = ref(false)
const index = ref(0)
const photo = project.mood_pairs.photo
const facts = project.facts.map(({ label, value }) => ({ label, value }))
</script>

<template>
  <div>
    <div>
      <section class="relative flex min-h-[70dvh] items-end overflow-hidden" aria-labelledby="gt-h1">
        <div class="absolute inset-0"><MoodImage :day="heroDay" :night="heroNight" eager sizes="100vw" /></div>
        <div class="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" aria-hidden="true" />
        <div class="container-page relative pb-f-16 pt-40">
          <p class="text-sm font-semibold text-muted-foreground">{{ project.address }}</p>
          <h1 id="gt-h1" class="mt-3 text-f-6xl">{{ project.title }}</h1>
          <p class="mt-4 max-w-[40ch] text-f-xl font-semibold">{{ project.tagline }}</p>
        </div>
      </section>

      <section class="container-page grid gap-f-16 py-f-24 lg:grid-cols-12" :aria-label="t('gt.aboutAria')">
        <div class="lg:col-span-7">
          <p v-for="p in project.intro" :key="p" class="mb-4 max-w-[60ch] text-f-xl text-muted-foreground">{{ p }}</p>
          <dl class="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div v-for="f in facts" :key="f.label" class="border-t border-border pt-4">
              <dt class="text-sm text-muted-foreground">{{ f.label }}</dt>
              <dd class="mt-1 text-f-2xl font-semibold tabular">{{ f.value }}</dd>
            </div>
          </dl>
        </div>
        <div class="aspect-[4/5] overflow-hidden rounded-2xl lg:col-span-5"><MoodImage :day="useFile(photo.day)" :night="useFile(photo.night)" sizes="(min-width: 1024px) 40vw, 100vw" alt="Grand Tower Frankfurt" /></div>
      </section>

      <section class="bg-secondary py-f-24 [--surface:var(--secondary)]" aria-labelledby="gt-units">
        <div class="container-page">
          <SiteSectionHeading id="gt-units" :title="t('gt.available')" :intro="t('gt.availableIntro', { n: units.length })" />
          <h3 v-if="rent.length" class="mb-6 text-f-2xl">{{ t('gt.forRent') }}</h3>
          <div v-if="rent.length" class="grid gap-x-f-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            <ListingCard v-for="l in rent" :key="l.id" :listing="l" :heading-level="4" />
          </div>
          <h3 v-if="buy.length" class="mb-6 mt-f-16 text-f-2xl">{{ t('gt.forSale') }}</h3>
          <div v-if="buy.length" class="grid gap-x-f-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            <ListingCard v-for="l in buy" :key="l.id" :listing="l" :heading-level="4" />
          </div>
        </div>
      </section>

      <section v-if="gallery.length" class="container-page py-f-24" aria-labelledby="gt-gallery">
        <SiteSectionHeading id="gt-gallery" :title="t('gt.impressions')" />
        <div class="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          <div v-for="(img, i) in gallery.slice(0, 12)" :key="img.id" class="aspect-[4/3]">
            <ListingGalleryTile :file="img" sizes="(min-width: 768px) 25vw, 50vw" :label="t('gallery.enlarge', { title: project.title, n: i + 1, total: gallery.length })" @open="index = i; open = true" />
          </div>
        </div>
        <Button variant="outline" size="pill" class="mt-6" @click="index = 0; open = true"><Images class="size-4" aria-hidden="true" />{{ t('gallery.allPhotos', { n: gallery.length }) }}</Button>
        <ListingLightbox v-model:open="open" v-model:index="index" :images="gallery" :title="project.title" />
      </section>

      <section class="border-t border-border py-f-24" aria-labelledby="gt-contact">
        <div class="container-page flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="gt-contact" class="text-f-4xl">{{ t('gt.interest') }}</h2>
            <p class="mt-3 max-w-[48ch] text-f-xl text-muted-foreground">{{ t('gt.interestText') }}</p>
          </div>
          <Button as-child size="cta"><NuxtLink :to="localePath({ name: 'kontakt', query: { thema: 'grand-tower' } })">{{ t('gt.viewing') }}</NuxtLink></Button>
        </div>
      </section>
    </div>
  </div>
</template>
