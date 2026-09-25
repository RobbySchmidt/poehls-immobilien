<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const home = useHomeContent()
const refs = sortListings(useArchivedListings(), 'neu')
</script>

<template>
  <section class="py-f-24" aria-labelledby="refs-title">
    <div class="container-page">
      <SiteSectionHeading id="refs-title" :title="home.references.title" :intro="home.references.intro" />
      <Carousel :opts="{ align: 'start' }" class="text-foreground" :aria-label="t('references.carouselAria')">
        <CarouselContent class="-ml-5">
          <CarouselItem v-for="l in refs" :key="l.id" class="basis-4/5 pl-5 sm:basis-1/2 lg:basis-1/3">
            <ListingCard :listing="l" />
          </CarouselItem>
        </CarouselContent>
        <div class="mt-8 flex items-center gap-2">
          <CarouselPrevious class="static size-11 translate-y-0" :aria-label="t('references.prev')" />
          <CarouselNext class="static size-11 translate-y-0" :aria-label="t('references.next')" />
          <NuxtLink :to="localePath('referenzen')" class="ml-4 font-semibold text-primary underline underline-offset-4">{{ t('common.allReferences') }}</NuxtLink>
        </div>
      </Carousel>
    </div>
  </section>
</template>
