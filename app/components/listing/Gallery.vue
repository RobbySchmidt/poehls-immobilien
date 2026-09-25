<script setup lang="ts">
import { Images } from '@lucide/vue'
import type { FileAsset } from '~/types/content'

// Curated mosaic: 1 large + up to 3 small images; with more photos the last tile carries a plinth
// "View all +N" and the full set opens in the lightbox. Used on listing/reference detail pages and the Grand Tower page.
const props = withDefaults(defineProps<{ images: FileAsset[], title: string, eager?: boolean }>(), { eager: false })
const { t } = useI18n()
const open = ref(false)
const index = ref(0)
const show = (i: number) => { index.value = i; open.value = true }
defineExpose({ show })

const tiles = computed(() => props.images.slice(0, 4))
const rest = computed(() => props.images.length - tiles.value.length)
const small = computed(() => tiles.value.length - 1)
const isMore = (i: number) => rest.value > 0 && i === tiles.value.length - 1

// desktop placement of tile i (grid: 7fr 2.5fr 2.5fr, two rows)
const place = (i: number) => {
  if (i === 0) return small.value ? 'md:row-span-2' : 'md:col-span-3 md:row-span-2'
  if (small.value === 1) return 'md:col-span-2 md:row-span-2'
  if (small.value === 2 || i === 1) return 'md:col-span-2'
  return ''
}
// mobile: first image 4:3 over the full width, the others share one row
const mobileCols = computed(() => ['', 'max-md:grid-cols-1', 'max-md:grid-cols-2', 'max-md:grid-cols-3'][small.value] ?? 'max-md:grid-cols-3')
const mobileAspect = computed(() => ['', 'max-md:aspect-2/1', 'max-md:aspect-4/3', 'max-md:aspect-square'][small.value] ?? 'max-md:aspect-square')
</script>

<template>
  <div v-if="images.length">
    <div
      class="grid gap-2 md:h-[clamp(420px,44vw,640px)] md:grid-cols-[7fr_2.5fr_2.5fr] md:grid-rows-[1.15fr_1fr] md:gap-3"
      :class="mobileCols"
    >
      <div
        v-for="(img, i) in tiles"
        :key="img.id"
        class="min-h-0"
        :class="[place(i), i === 0 ? 'max-md:col-span-full max-md:aspect-4/3' : mobileAspect]"
      >
        <ListingGalleryTile
          :file="img"
          :eager="eager && i === 0"
          :sizes="i === 0 ? '(min-width: 768px) 58vw, 100vw' : i === 1 ? '(min-width: 768px) 40vw, 33vw' : '(min-width: 768px) 20vw, 33vw'"
          :badge="isMore(i) ? 'none' : i === 0 ? 'teach' : 'hover'"
          :label="isMore(i) ? t('gallery.allPhotos', { n: images.length }) : t('gallery.enlarge', { title, n: i + 1, total: images.length })"
          class="max-md:rounded-xl"
          @open="show(i)"
        >
          <span v-if="isMore(i)" class="plinth min-w-0 pr-5 text-left max-md:pr-3 max-md:pt-1.5">
            <span class="block text-sm text-muted-foreground max-md:hidden">{{ t('gallery.viewAll') }}</span>
            <span class="block whitespace-nowrap text-f-3xl font-semibold tracking-[-0.015em] tabular transition-colors duration-150 group-hover:text-primary max-md:text-lg">{{ t('gallery.more', { n: rest }) }}</span>
          </span>
        </ListingGalleryTile>
      </div>
    </div>
    <div v-if="images.length > 1" class="mt-4 flex justify-end md:mt-5">
      <button type="button" class="inline-flex items-center gap-2 text-[15px] font-semibold underline underline-offset-4 hover:text-primary" @click="show(0)">
        <Images class="size-4" aria-hidden="true" />{{ t('gallery.allPhotos', { n: images.length }) }}
      </button>
    </div>
    <ListingLightbox v-model:open="open" v-model:index="index" :images="images" :title="title" />
  </div>
</template>
