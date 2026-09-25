<script setup lang="ts">
const { t } = useI18n()
const a = useAboutContent()
const company = useCompany()
const portrait = useFile(company.portrait)
const market = useFile(a.market_photo)
useSeoMeta({ title: a.title, description: a.lead })
</script>

<template>
  <div>
    <!-- Portrait (sticky while reading) left, text as one reading column right. -->
    <div class="container-page grid items-start gap-x-f-16 gap-y-8 pb-f-24 pt-4 md:pt-8 lg:grid-cols-[5fr_7fr]">
      <figure class="max-w-136 lg:sticky lg:top-28 lg:max-w-none">
        <div class="relative aspect-4/5 overflow-hidden rounded-[14px] bg-muted">
          <ResponsiveImage :file="portrait" eager sizes="(min-width: 1024px) 40vw, 100vw" class="object-[57%_30%]" />
          <!-- Same plinth language as the cards and the Grand Tower title: name cut into the photo. -->
          <figcaption class="plinth min-w-0 pr-8 pt-4 max-md:right-14 max-md:pr-5 max-md:pt-3">
            <span class="block text-sm text-muted-foreground">{{ t('about.owner') }}</span>
            <span class="block text-f-3xl font-semibold tracking-[-0.015em]">{{ company.owner }}</span>
          </figcaption>
        </div>
      </figure>
      <div class="lg:pt-f-8">
        <h1 class="max-w-[12ch] text-f-6xl">{{ a.title }}</h1>
        <p class="mt-5 max-w-[30ch] text-xl font-medium leading-[1.4] tracking-[-0.01em] md:text-f-2xl">{{ a.lead }}</p>
        <section v-for="sec in a.sections" :key="sec.title" class="mt-f-12 border-t border-border pt-6">
          <h2 class="text-f-2xl">{{ sec.title }}</h2>
          <p v-for="p in sec.text" :key="p" class="mt-3 max-w-[58ch] leading-[1.7] text-muted-foreground">{{ p }}</p>
        </section>
      </div>
    </div>

    <!-- Atmosphere before the contact band. Source is only 373 px high – hidden on phones.
         Scaled from the top-right corner so the small watermark bottom left leaves the frame. -->
    <div v-if="market" class="container-page pb-f-24 max-md:hidden">
      <div class="relative aspect-1600/373 overflow-hidden rounded-[14px] bg-muted">
        <ResponsiveImage :file="market" sizes="(min-width: 1280px) 1216px, 100vw" alt="" class="origin-top-right scale-[1.16]" />
        <div class="plinth min-w-0 pr-8 pt-3.5">
          <span class="block text-sm text-muted-foreground">{{ a.market_label }}</span>
          <span class="block text-f-3xl font-semibold tracking-[-0.015em]">{{ a.market_title }}</span>
        </div>
      </div>
    </div>

    <HomeContactBand />
  </div>
</template>
