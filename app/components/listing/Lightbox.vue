<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import type { FileAsset } from '~/types/content'

const props = defineProps<{ images: FileAsset[], title: string }>()
const open = defineModel<boolean>('open', { default: false })
const index = defineModel<number>('index', { default: 0 })
const current = computed(() => props.images[index.value] ?? null)

const go = (d: number) => { index.value = (index.value + d + props.images.length) % props.images.length }
let startX: number | null = null
const onPointerDown = (e: PointerEvent) => { startX = e.clientX }
const onPointerUp = (e: PointerEvent) => {
  if (startX == null) return
  const dx = e.clientX - startX
  if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
  startX = null
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-[min(96vw,1400px)] border-0 bg-background p-0 sm:max-w-[min(96vw,1400px)]" @keydown.left.prevent="go(-1)" @keydown.right.prevent="go(1)">
      <DialogTitle class="sr-only">{{ title }} – Bildergalerie</DialogTitle>
      <DialogDescription class="sr-only">Mit den Pfeiltasten blättern, Escape schließt.</DialogDescription>
      <div class="relative flex h-[80dvh] touch-pan-y items-center justify-center" @pointerdown="onPointerDown" @pointerup="onPointerUp">
        <img v-if="current" :src="assetUrl(current, 1600)" :alt="current.description" :width="current.width" :height="current.height" class="max-h-full max-w-full select-none object-contain" draggable="false">
        <Button variant="outline" size="icon-pill" class="absolute left-3 top-1/2 -translate-y-1/2 text-foreground" aria-label="Vorheriges Bild" @click="go(-1)"><ChevronLeft class="size-5" aria-hidden="true" /></Button>
        <Button variant="outline" size="icon-pill" class="absolute right-3 top-1/2 -translate-y-1/2 text-foreground" aria-label="Nächstes Bild" @click="go(1)"><ChevronRight class="size-5" aria-hidden="true" /></Button>
      </div>
      <p class="pb-4 text-center text-sm text-muted-foreground tabular" aria-live="polite">{{ index + 1 }} / {{ images.length }}</p>
    </DialogContent>
  </Dialog>
</template>
