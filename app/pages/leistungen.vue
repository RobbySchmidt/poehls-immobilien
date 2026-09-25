<script setup lang="ts">
const { t } = useI18n()
const s = useServicesContent()
useSeoMeta({ title: t('nav.services'), description: s.lead })
const kicker = s.groups.map((g) => g.title).join(' · ')
</script>

<template>
  <div>
    <!-- Same head as the Grand Tower and home pages: full-width photo, plinth with kicker + title. -->
    <section class="container-page pt-4 md:pt-8">
      <div class="relative aspect-square overflow-hidden rounded-[14px] bg-muted md:aspect-video lg:aspect-2/1">
        <MoodImage
          :day="useFile(s.photo.day)"
          :night="useFile(s.photo.night)"
          eager
          sizes="(min-width: 1280px) 1280px, 100vw"
          day-class="object-[50%_62%] max-md:object-[62%_60%]"
          night-class="object-[50%_70%] max-md:object-[22%_70%]"
        />
        <div class="plinth min-w-0 pr-10 pt-5 max-md:right-10 max-md:pr-5 max-md:pt-3">
          <p class="text-sm font-semibold text-muted-foreground max-md:text-[13px]">{{ kicker }}</p>
          <h1 class="mt-2 max-w-[12.5em] text-f-6xl max-md:mt-1 max-md:text-[1.875rem] leading-[1.1]">{{ s.title }}</h1>
        </div>
      </div>
      <p class="max-w-[52ch] pt-5 text-f-xl text-muted-foreground lg:pt-6">{{ s.lead }}</p>
    </section>

    <!-- Service areas as a register: strong rule, title left, items in two columns with hairlines. -->
    <section class="container-page py-f-24" :aria-label="t('services.areasAria')">
      <div v-for="g in s.groups" :key="g.title" class="grid gap-x-12 gap-y-4 border-t border-foreground pb-11 pt-9 last:pb-0 lg:grid-cols-[4fr_8fr] max-md:pb-8 max-md:pt-6">
        <h2 class="text-f-4xl">{{ g.title }}</h2>
        <ul class="-mt-1 gap-x-10 md:columns-2">
          <li v-for="item in g.items" :key="item" class="break-inside-avoid border-b border-border py-3 leading-[1.45]">{{ item }}</li>
        </ul>
      </div>
    </section>

    <HomeContactBand />
  </div>
</template>
