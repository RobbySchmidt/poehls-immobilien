<script setup lang="ts">
import type { FileAsset } from '~/types/content'

const props = withDefaults(defineProps<{
  file: FileAsset | null | undefined
  sizes?: string
  eager?: boolean
  alt?: string
}>(), { sizes: '100vw', eager: false, alt: undefined })

const position = computed(() =>
  props.file?.focal_point ? `${props.file.focal_point.x}% ${props.file.focal_point.y}%` : undefined)
</script>

<template>
  <img
    v-if="file"
    :src="assetUrl(file, 960)"
    :srcset="assetSrcset(file)"
    :sizes="sizes"
    :width="file.width"
    :height="file.height"
    :alt="alt ?? file.description"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="eager ? 'high' : undefined"
    decoding="async"
    class="size-full object-cover"
    :style="{ objectPosition: position }"
  >
  <div v-else class="size-full bg-muted" aria-hidden="true" />
</template>
