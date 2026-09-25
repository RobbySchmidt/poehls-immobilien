<script setup lang="ts">
const mood = useHeroMood()
</script>

<template>
  <div class="container-page py-f-16">
    <h1 class="text-f-6xl">Test</h1>
    <div class="mt-8 aspect-[2/1] overflow-hidden rounded-2xl">
      <MoodImage :day="mood.day[0]" :night="mood.night[0]" eager />
    </div>
  </div>
</template>
