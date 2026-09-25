<script setup lang="ts">
import type { FileAsset } from '~/types/content'

withDefaults(defineProps<{
  day: FileAsset | null | undefined
  night: FileAsset | null | undefined
  sizes?: string
  eager?: boolean
}>(), { sizes: '100vw', eager: false })
</script>

<template>
  <div class="relative size-full">
    <ResponsiveImage :file="day" :sizes="sizes" :eager="eager" class="absolute inset-0 transition-opacity duration-300 ease-out motion-reduce:transition-none dark:opacity-0" />
    <ResponsiveImage :file="night" :sizes="sizes" class="absolute inset-0 opacity-0 transition-opacity duration-300 ease-out motion-reduce:transition-none dark:opacity-100" />
  </div>
</template>
