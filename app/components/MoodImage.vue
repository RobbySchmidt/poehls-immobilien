<script setup lang="ts">
import type { FileAsset } from '~/types/content'

withDefaults(defineProps<{
  day: FileAsset | null | undefined
  night: FileAsset | null | undefined
  sizes?: string
  eager?: boolean
  /** pass '' for purely decorative use */
  alt?: string
}>(), { sizes: '100vw', eager: false, alt: undefined })
</script>

<template>
  <div class="relative size-full">
    <ResponsiveImage :file="day" :sizes="sizes" :eager="eager" :alt="alt" class="absolute inset-0 transition-opacity duration-300 ease-out motion-reduce:transition-none dark:opacity-0" />
    <ResponsiveImage :file="night" :sizes="sizes" :alt="alt" class="absolute inset-0 opacity-0 transition-opacity duration-300 ease-out motion-reduce:transition-none dark:opacity-100" />
  </div>
</template>
