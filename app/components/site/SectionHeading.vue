<script setup lang="ts">
withDefaults(defineProps<{ title: string, intro?: string, level?: 2 | 3, id?: string }>(), { level: 2, intro: undefined, id: undefined })
</script>

<template>
  <div class="mb-f-12 max-w-2xl">
    <component :is="`h${level}`" :id="id" class="text-f-4xl">
      {{ title }}
    </component>
    <p v-if="intro" class="mt-3 text-f-xl text-muted-foreground">
      {{ intro }}
    </p>
  </div>
</template>
