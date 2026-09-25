<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const home = useHomeContent()
const project = useProject('grand-tower')!
const units = useAvailableListings().filter((l) => l.project === 'grand-tower')
const rents = units.filter((l) => l.marketing_type === 'miete' && l.price != null).map((l) => l.price!)
const fromRent = rents.length ? formatEuro(Math.min(...rents), useLocaleCode()) : null
const photo = project.mood_pairs.photo
</script>

<template>
  <!-- Calm teaser: text left, photo with the card plinth ("rent from") right – no background image, no stats row. -->
  <section class="container-page grid items-center gap-f-16 py-f-24 lg:grid-cols-12" aria-labelledby="gt-title">
    <div class="lg:col-span-5">
      <p class="text-sm font-semibold text-muted-foreground">{{ home.grandTower.kicker }}</p>
      <h2 id="gt-title" class="mt-3 max-w-[18ch] text-f-4xl">{{ home.grandTower.title }}</h2>
      <p class="mt-4 max-w-[48ch] text-f-xl text-muted-foreground">{{ home.grandTower.text }}</p>
      <Button as-child size="cta" class="mt-8">
        <NuxtLink :to="localePath('grand-tower')">{{ t('gt.discover') }}</NuxtLink>
      </Button>
    </div>
    <NuxtLink :to="localePath('grand-tower')" class="group relative block aspect-4/3 overflow-hidden rounded-[14px] bg-muted lg:col-span-7" tabindex="-1" aria-hidden="true">
      <MoodImage :day="useFile(photo.day)" :night="useFile(photo.night)" sizes="(min-width: 1024px) 60vw, 100vw" alt="" />
      <span v-if="fromRent" class="plinth">
        <span class="block text-sm text-muted-foreground">{{ t('gt.rentFrom') }}</span>
        <span class="block whitespace-nowrap text-f-3xl font-semibold tracking-[-0.015em] tabular transition-colors duration-150 group-hover:text-primary motion-reduce:transition-none">
          {{ fromRent }}<span class="ml-1 text-[0.62em] font-normal tracking-normal text-muted-foreground">{{ t('common.perMonth') }}</span>
        </span>
      </span>
    </NuxtLink>
  </section>
</template>
