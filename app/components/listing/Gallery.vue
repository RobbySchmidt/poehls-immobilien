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
      <button type="button" class="relative aspect-[3/2] overflow-hidden rounded-2xl md:col-span-2 md:row-span-2 md:aspect-auto" :aria-label="`${title} – Bild 1 vergrößern`" @click="show(0)">
        <ResponsiveImage :file="images[0]" eager sizes="(min-width: 768px) 50vw, 100vw" />
      </button>
      <button v-for="(img, i) in tiles" :key="img.id" type="button" class="relative hidden overflow-hidden rounded-2xl md:block" :aria-label="`${title} – Bild ${i + 2} vergrößern`" @click="show(i + 1)">
        <ResponsiveImage :file="img" sizes="25vw" />
      </button>
    </div>
    <Button v-if="images.length > 1" variant="outline" class="mt-4 h-11 rounded-full px-5" @click="show(0)">
      <Images class="size-4" aria-hidden="true" />Alle {{ images.length }} Fotos
    </Button>
    <ListingLightbox v-model:open="open" v-model:index="index" :images="images" :title="title" />
  </div>
</template>
