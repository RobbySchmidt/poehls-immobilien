<script setup lang="ts">
const home = useHomeContent()
const mood = useHeroMood()
</script>

<template>
  <!-- Same head as the Grand Tower page: full-width photo, plinth with kicker + title; search in the row below. -->
  <section class="container-page pb-f-16 pt-8" aria-labelledby="hero-title">
    <div class="relative aspect-4/3 overflow-hidden rounded-[14px] bg-muted md:aspect-video lg:aspect-2/1">
      <MoodImage
        :day="mood.day[0]"
        :night="mood.night[0]"
        eager
        sizes="(min-width: 1280px) 1280px, 100vw"
        day-class="max-md:object-right"
        night-class="md:object-[50%_42%] max-md:object-[62%_50%]"
      />
      <div class="plinth pr-10 pt-5 max-md:right-10 max-md:min-w-0 max-md:pr-5 max-md:pt-3">
        <p class="text-sm font-semibold text-muted-foreground">{{ home.hero.kicker }}</p>
        <h1 id="hero-title" class="mt-2 text-f-6xl md:whitespace-nowrap max-md:mt-0.5 max-md:text-[2.125rem] leading-[1.1]">{{ home.hero.title }}</h1>
      </div>
    </div>
    <div class="flex flex-col gap-x-12 gap-y-5 pt-5 lg:flex-row lg:items-center lg:justify-between lg:pt-6">
      <div>
        <p class="max-w-[36ch] text-f-xl font-semibold leading-[1.45]">{{ home.hero.tagline }}</p>
        <p class="mt-1.5 text-muted-foreground max-md:text-[15px]">{{ home.hero.personal }}</p>
      </div>
      <ListingQuickSearch class="shrink-0" />
    </div>
  </section>
</template>
