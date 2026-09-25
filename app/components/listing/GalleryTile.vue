<script setup lang="ts">
import { Expand } from '@lucide/vue'
import type { FileAsset } from '~/types/content'

// Clickable gallery image: zoom cursor, slight darkening and an expand badge make the affordance obvious.
withDefaults(defineProps<{ file: FileAsset | null | undefined, label: string, sizes?: string, eager?: boolean }>(), { sizes: '50vw', eager: false })
defineEmits<{ open: [] }>()
</script>

<template>
  <button
    type="button"
    class="group relative block size-full cursor-zoom-in overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    :aria-label="label"
    @click="$emit('open')"
  >
    <ResponsiveImage :file="file" :sizes="sizes" :eager="eager" class="transition-[filter] duration-200 ease-out group-hover:brightness-90 group-focus-visible:brightness-90 motion-reduce:transition-none" />
    <span class="absolute bottom-3 right-3 inline-flex size-9 items-center justify-center rounded-full bg-card/90 text-card-foreground shadow-sm transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:transition-none" aria-hidden="true">
      <Expand class="size-4" />
    </span>
  </button>
</template>
