<script setup lang="ts">
import { Images } from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()
const project = useProject('grand-tower')!
useSeoMeta({ title: project.title, description: project.tagline })
const units = sortListings(useAvailableListings().filter((l) => l.project === 'grand-tower'), 'preis-auf')
const rentCount = units.filter((l) => l.marketing_type === 'miete').length
const buyCount = units.filter((l) => l.marketing_type === 'kauf').length
const vacancy = units.length
  ? t('gt.vacancy', {
      list: [rentCount && t('gt.vacancyRent', { n: rentCount }, rentCount), buyCount && t('gt.vacancyBuy', { n: buyCount }, buyCount)]
        .filter(Boolean)
        .join(` ${t('gt.and')} `),
    })
  : t('gt.noVacancy')
// curated images first, so mosaic tile i opens the lightbox at index i
const featured = project.gallery_featured ?? []
const gallery = [...featured, ...project.images.filter((id) => !featured.includes(id))]
  .map((id) => useFile(id))
  .filter((f): f is NonNullable<typeof f> => !!f)
  .map((f, i, list) => ({ ...f, description: `${project.title} – ${t('gallery.imageOf', { n: i + 1, total: list.length })}` }))
const open = ref(false)
const index = ref(0)
const photo = project.mood_pairs.photo
const mosaic = gallery.slice(0, 4)
const mosaicClass = ['max-md:col-span-3 max-md:aspect-4/3 md:row-span-2', 'max-md:aspect-square md:col-span-2', 'max-md:aspect-square', 'max-md:aspect-square']
const openAt = (i: number) => { index.value = i; open.value = true }
</script>

<template>
  <div>
    <!-- Title tile: same photo + plinth language as the listing cards, across the full width. -->
    <section class="container-page pb-f-24 pt-8" :aria-label="t('gt.unitsAria')">
      <div class="grid gap-x-f-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        <div class="md:col-span-2 lg:col-span-3 lg:mb-f-8">
          <div class="relative aspect-4/3 overflow-hidden rounded-[14px] bg-muted md:aspect-video lg:aspect-2/1">
            <MoodImage :day="useFile(photo.day)" :night="useFile(photo.night)" eager sizes="(min-width: 1280px) 1280px, 100vw" alt="" />
            <div class="plinth pr-10 pt-5 max-md:right-10 max-md:min-w-0 max-md:pr-5 max-md:pt-3">
              <p class="text-sm font-semibold text-muted-foreground">{{ project.address }}</p>
              <h1 class="mt-1.5 text-f-6xl max-md:text-[2.125rem] max-md:leading-[1.02]">{{ project.title }}</h1>
              <p class="mt-2.5 text-f-xl font-semibold max-md:hidden">{{ project.tagline }}</p>
            </div>
          </div>
          <div class="flex flex-col items-start justify-between gap-x-10 gap-y-6 pt-3 md:flex-row md:items-end md:pt-5">
            <div>
              <p class="mb-2 text-f-xl font-semibold md:hidden">{{ project.tagline }}</p>
              <p class="max-w-[60ch] text-f-xl text-muted-foreground">{{ project.summary }} {{ vacancy }}</p>
              <button v-if="gallery.length" type="button" class="mt-3.5 inline-flex items-center gap-2 text-[15px] font-semibold underline underline-offset-4 hover:text-primary" @click="openAt(0)">
                <Images class="size-4" aria-hidden="true" />{{ t('gallery.allPhotos', { n: gallery.length }) }}
              </button>
            </div>
            <Button as-child size="cta" class="shrink-0"><NuxtLink :to="localePath({ name: 'kontakt', query: { thema: 'grand-tower' } })">{{ t('gt.viewing') }}</NuxtLink></Button>
          </div>
        </div>
        <ListingCard v-for="(l, i) in units" :key="l.id" :listing="l" :eager="i < 2" :heading-level="2" />
      </div>
    </section>

    <section v-if="gallery.length" class="bg-secondary py-f-24 [--surface:var(--secondary)]" aria-labelledby="gt-gallery">
      <div class="container-page">
        <div class="mb-6 grid gap-x-16 gap-y-3 md:mb-f-12 md:grid-cols-[5fr_7fr]">
          <h2 id="gt-gallery" class="text-f-4xl">{{ t('gt.impressions') }}</h2>
          <div><p v-for="p in project.intro" :key="p" class="mb-3 max-w-[60ch] text-muted-foreground last:mb-0 md:text-f-xl">{{ p }}</p></div>
        </div>
        <!-- Curated mosaic: 1 large + 3 small; the last tile opens the rest in the lightbox. -->
        <div class="grid grid-cols-3 gap-2 md:h-[clamp(520px,44vw,640px)] md:grid-cols-[7fr_2.5fr_2.5fr] md:grid-rows-[1.15fr_1fr] md:gap-3">
          <div v-for="(img, i) in mosaic" :key="img.id" class="min-h-0" :class="mosaicClass[i]">
            <ListingGalleryTile
              :file="img"
              :sizes="i === 0 ? '(min-width: 768px) 58vw, 100vw' : i === 1 ? '(min-width: 768px) 40vw, 33vw' : '(min-width: 768px) 20vw, 33vw'"
              :badge="i === 0 ? 'teach' : i === mosaic.length - 1 && gallery.length > mosaic.length ? 'none' : 'hover'"
              :label="i === mosaic.length - 1 && gallery.length > mosaic.length ? t('gallery.allPhotos', { n: gallery.length }) : t('gallery.enlarge', { title: project.title, n: i + 1, total: gallery.length })"
              class="max-md:rounded-xl"
              @open="openAt(i)"
            >
              <span v-if="i === mosaic.length - 1 && gallery.length > mosaic.length" class="plinth min-w-0 pr-5 text-left max-md:pr-3 max-md:pt-1.5">
                <span class="block text-sm text-muted-foreground max-md:hidden">{{ t('gallery.viewAll') }}</span>
                <span class="block whitespace-nowrap text-f-3xl font-semibold tracking-[-0.015em] tabular transition-colors duration-150 group-hover:text-primary max-md:text-lg">{{ t('gallery.more', { n: gallery.length - mosaic.length }) }}</span>
              </span>
            </ListingGalleryTile>
          </div>
        </div>
        <div class="mt-4 flex justify-end md:mt-5">
          <button type="button" class="inline-flex items-center gap-2 text-[15px] font-semibold underline underline-offset-4 hover:text-primary" @click="openAt(0)">
            <Images class="size-4" aria-hidden="true" />{{ t('gallery.allPhotos', { n: gallery.length }) }}
          </button>
        </div>
      </div>
    </section>
    <ListingLightbox v-model:open="open" v-model:index="index" :images="gallery" :title="project.title" />

    <section class="py-f-24" aria-labelledby="gt-contact">
      <div class="container-page flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="gt-contact" class="text-f-4xl">{{ t('gt.interest') }}</h2>
          <p class="mt-3 max-w-[48ch] text-f-xl text-muted-foreground">{{ t('gt.interestText') }}</p>
        </div>
        <Button as-child size="cta"><NuxtLink :to="localePath({ name: 'kontakt', query: { thema: 'grand-tower' } })">{{ t('gt.viewing') }}</NuxtLink></Button>
      </div>
    </section>
  </div>
</template>
