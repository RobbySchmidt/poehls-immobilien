<script setup lang="ts">
const home = useHomeContent()
const mood = useHeroMood()
</script>

<template>
  <!-- Same head as the Grand Tower page: full-width photo, plinth with title – here it also carries the quick search. -->
  <section class="container-page pb-f-16 pt-8" aria-labelledby="hero-title">
    <div class="relative aspect-4/3 overflow-hidden rounded-[14px] bg-muted md:aspect-video lg:aspect-2/1">
      <MoodImage :day="mood.day[0]" :night="mood.night[0]" eager sizes="(min-width: 1280px) 1280px, 100vw" alt="" class="[&_img]:object-[50%_36%]" />
      <div class="plinth pr-10 pt-5 max-md:right-10 max-md:min-w-0 max-md:pr-5 max-md:pt-3">
        <p class="text-sm font-semibold text-muted-foreground">{{ home.hero.kicker }}</p>
        <h1 id="hero-title" class="mt-1.5 text-f-6xl max-md:text-[2.125rem] max-md:leading-[1.02]">{{ home.hero.title }}</h1>
        <ListingQuickSearch class="mt-6 max-lg:hidden" />
      </div>
    </div>
    <ListingQuickSearch class="mt-4 lg:hidden" />
    <p class="mt-5 max-w-[48ch] text-f-xl text-muted-foreground">{{ home.hero.lead }}</p>
  </section>
</template>
