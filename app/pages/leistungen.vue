<script setup lang="ts">
import { Check } from '@lucide/vue'

const { t } = useI18n()
const s = useServicesContent()
useSeoMeta({ title: t('nav.services'), description: s.lead })
const kicker = s.groups.map((g) => g.title).join(' · ')
const groups = s.groups.map((g, i) => ({ ...g, photo: s.group_photos[i] }))
const [sale, ...rest] = groups
</script>

<template>
  <div>
    <!-- Same head as the Grand Tower and home pages: full-width photo, plinth with kicker + title. -->
    <section class="container-page pt-4 md:pt-8">
      <div class="relative">
        <div class="relative aspect-square overflow-hidden rounded-[14px] bg-muted md:aspect-video md:rounded-bl-none lg:aspect-2/1">
          <MoodImage
            :day="useFile(s.photo.day)"
            :night="useFile(s.photo.night)"
            eager
            sizes="(min-width: 1280px) 1280px, 100vw"
            day-class="object-[50%_62%] max-md:object-[62%_60%]"
            night-class="object-[50%_70%] max-md:object-[22%_70%]"
          />
        </div>
        <div class="plinth plinth-stack min-w-0 pr-10 pt-5">
          <p class="text-sm font-semibold text-muted-foreground max-md:text-[13px]">{{ kicker }}</p>
          <h1 class="mt-2 max-w-[12.5em] text-f-6xl max-md:mt-1 max-md:text-[1.875rem] leading-[1.1]">{{ s.title }}</h1>
        </div>
      </div>
      <p class="max-w-[52ch] pt-5 text-f-xl text-muted-foreground lg:pt-6">{{ s.lead }}</p>
    </section>

    <!-- Service areas as photo tiles with the card plinth (title cut into the photo) and a check list.
         Sale is the largest area: tall photo beside its list; letting and management follow as a pair. -->
    <section class="container-page py-f-24" :aria-label="t('services.areasAria')">
      <div v-if="sale" class="grid items-center gap-x-14 gap-y-8 lg:grid-cols-[5fr_7fr]">
        <div class="relative aspect-4/3 overflow-hidden rounded-[14px] bg-muted lg:aspect-4/5">
          <ResponsiveImage :file="useFile(sale.photo)" alt="" sizes="(min-width: 1024px) 520px, 100vw" />
          <div class="plinth min-w-0 pr-6">
            <p class="text-[13px] font-semibold text-muted-foreground">{{ sale.kicker }}</p>
            <h2 class="mt-0.5 text-f-4xl">{{ sale.title }}</h2>
          </div>
        </div>
        <ul class="space-y-4 text-f-lg">
          <li v-for="item in sale.items" :key="item" class="flex gap-3 leading-[1.45]">
            <Check class="mt-1 size-[18px] shrink-0 text-link" aria-hidden="true" />{{ item }}
          </li>
        </ul>
      </div>
      <div class="mt-f-24 grid gap-x-14 gap-y-16 md:grid-cols-2">
        <div v-for="g in rest" :key="g.title">
          <div class="relative aspect-3/2 overflow-hidden rounded-[14px] bg-muted">
            <ResponsiveImage :file="useFile(g.photo)" alt="" sizes="(min-width: 768px) 50vw, 100vw" />
            <div class="plinth min-w-0 pr-6">
              <p class="text-[13px] font-semibold text-muted-foreground">{{ g.kicker }}</p>
              <h2 class="mt-0.5 text-f-4xl">{{ g.title }}</h2>
            </div>
          </div>
          <ul class="mt-8 space-y-4 text-f-lg">
            <li v-for="item in g.items" :key="item" class="flex gap-3 leading-[1.45]">
              <Check class="mt-1 size-[18px] shrink-0 text-link" aria-hidden="true" />{{ item }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <HomeContactBand />
  </div>
</template>
