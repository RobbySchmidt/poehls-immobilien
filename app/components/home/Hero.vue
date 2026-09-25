<script setup lang="ts">
const home = useHomeContent()
const mood = useHeroMood()
</script>

<template>
  <section class="container-page pb-f-16 pt-f-12" aria-labelledby="hero-title">
    <div class="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
      <h1 id="hero-title" class="max-w-[16ch] text-f-6xl">{{ home.hero.title }}</h1>
      <div class="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <p class="max-w-[48ch] text-f-xl text-muted-foreground">{{ home.hero.lead }}</p>
        <ListingQuickSearch />
      </div>
    </div>
    <div class="mt-f-8 grid grid-cols-2 gap-2.5 md:grid-cols-3 md:grid-rows-[16rem_16rem]">
      <div class="col-span-2 aspect-[3/2] overflow-hidden rounded-2xl md:row-span-2 md:aspect-auto">
        <MoodImage :day="mood.day[0]" :night="mood.night[0]" eager sizes="(min-width: 768px) 66vw, 100vw" />
      </div>
      <div class="aspect-[4/3] overflow-hidden rounded-2xl md:aspect-auto">
        <MoodImage :day="mood.day[1]" :night="mood.night[1]" sizes="(min-width: 768px) 33vw, 50vw" />
      </div>
      <div class="aspect-[4/3] overflow-hidden rounded-2xl md:aspect-auto">
        <MoodImage :day="mood.day[2]" :night="mood.night[2]" sizes="(min-width: 768px) 33vw, 50vw" />
      </div>
    </div>
  </section>
</template>
