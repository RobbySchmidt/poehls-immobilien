<script setup lang="ts">
import { ArrowDown } from '@lucide/vue'

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
          <h1 class="mt-2 max-w-[12.5em] text-f-6xl max-md:mt-1 max-md:text-[1.875rem] max-md:leading-[1.05]">{{ s.title }}</h1>
        </div>
      </div>
      <div class="flex flex-col items-start justify-between gap-x-12 gap-y-5 pt-5 lg:flex-row lg:items-end lg:pt-6">
        <p class="max-w-[52ch] text-f-xl text-muted-foreground">{{ s.lead }}</p>
        <a href="#steps-title" class="inline-flex shrink-0 items-center gap-1.5 font-semibold underline decoration-input underline-offset-4 hover:decoration-current">
          <ArrowDown class="size-4" aria-hidden="true" />{{ t('services.steps') }}
        </a>
      </div>
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

    <!-- Process as a timeline: horizontal from lg, vertical below. -->
    <section class="bg-secondary py-f-24" aria-labelledby="steps-title">
      <div class="container-page">
        <h2 id="steps-title" class="scroll-mt-28 text-f-4xl">{{ t('services.steps') }}</h2>
        <ol class="relative mt-f-12 grid gap-8 pl-8 before:absolute before:bottom-2 before:left-1.5 before:top-2 before:w-px before:bg-input lg:grid-cols-5 lg:pl-0 lg:before:bottom-auto lg:before:left-0 lg:before:right-0 lg:before:top-1.5 lg:before:h-px lg:before:w-auto">
          <li
            v-for="(step, i) in s.steps"
            :key="step.title"
            class="relative before:absolute before:-left-8 before:top-1.5 before:size-[13px] before:rounded-full before:border-[1.5px] before:border-foreground before:bg-secondary lg:pt-8 lg:before:left-0 lg:before:top-0"
          >
            <span class="text-sm font-semibold text-muted-foreground tabular">{{ t('services.step', { n: i + 1 }) }}</span>
            <h3 class="mt-1 text-f-2xl">{{ step.title }}</h3>
            <p class="mt-2 text-muted-foreground">{{ step.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <HomeContactBand surface="background" />
  </div>
</template>
