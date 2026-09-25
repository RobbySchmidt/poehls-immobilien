<script setup lang="ts">
import { Images } from '@lucide/vue'
import type { FileAsset } from '~/types/content'

const props = defineProps<{ images: FileAsset[], title: string }>()
const open = ref(false)
const index = ref(0)
const show = (i: number) => { index.value = i; open.value = true }
const tiles = computed(() => props.images.slice(1, 5))
</script>

<template>
  <div>
    <div class="grid gap-2.5 md:grid-cols-4 md:grid-rows-[14rem_14rem]">
      <div class="aspect-[3/2] md:col-span-2 md:row-span-2 md:aspect-auto">
        <ListingGalleryTile :file="images[0]" eager sizes="(min-width: 768px) 50vw, 100vw" :label="`${title} – Bild 1 von ${images.length} vergrößern`" @open="show(0)" />
      </div>
      <div v-for="(img, i) in tiles" :key="img.id" class="hidden md:block">
        <ListingGalleryTile :file="img" sizes="25vw" :label="`${title} – Bild ${i + 2} von ${images.length} vergrößern`" @open="show(i + 1)" />
      </div>
    </div>
    <Button v-if="images.length > 1" variant="outline" size="pill" class="mt-4" @click="show(0)">
      <Images class="size-4" aria-hidden="true" />Alle {{ images.length }} Fotos ansehen
    </Button>
    <ListingLightbox v-model:open="open" v-model:index="index" :images="images" :title="title" />
  </div>
</template>
