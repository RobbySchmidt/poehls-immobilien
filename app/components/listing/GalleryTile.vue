<script setup lang="ts">
import { Expand } from '@lucide/vue'
import type { FileAsset } from '~/types/content'

// Clickable gallery image: zoom cursor, slight darkening and an expand badge make the affordance obvious.
// badge "always": bottom right, always visible. "hover": top right, appears on hover/focus.
// "teach": like hover, but always visible on touch widths (the one tile that teaches the gesture).
// The default slot takes a plinth (e.g. "View all +34").
withDefaults(defineProps<{
  file: FileAsset | null | undefined
  label: string
  sizes?: string
  eager?: boolean
  badge?: 'always' | 'hover' | 'teach' | 'none'
}>(), { sizes: '50vw', eager: false, badge: 'always' })
defineEmits<{ open: [] }>()
</script>

<template>
  <button
    type="button"
    class="group relative block size-full cursor-zoom-in overflow-hidden rounded-2xl bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    :aria-label="label"
    @click="$emit('open')"
  >
    <ResponsiveImage :file="file" :sizes="sizes" :eager="eager" class="transition-[filter] duration-200 ease-out group-hover:brightness-90 group-focus-visible:brightness-90 motion-reduce:transition-none" />
    <span
      v-if="badge === 'always'"
      class="absolute bottom-3 right-3 inline-flex size-9 items-center justify-center rounded-full bg-card/90 text-card-foreground shadow-sm transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:transition-none"
      aria-hidden="true"
    >
      <Expand class="size-4" />
    </span>
    <span
      v-else-if="badge !== 'none'"
      class="absolute right-3 top-3 z-2 inline-flex size-9 scale-90 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 backdrop-blur-sm transition-[opacity,transform] duration-200 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100 motion-reduce:transition-none max-md:right-2.5 max-md:top-2.5 max-md:size-8"
      :class="badge === 'teach' && 'max-md:scale-100 max-md:opacity-100'"
      aria-hidden="true"
    >
      <Expand class="size-4" />
    </span>
    <slot />
  </button>
</template>
