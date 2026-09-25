<script setup lang="ts">
const home = useHomeContent()
const refs = sortListings(useArchivedListings(), 'neu')
</script>

<template>
  <section class="py-f-24" aria-labelledby="refs-title">
    <div class="container-page">
      <SiteSectionHeading id="refs-title" :title="home.references.title" :intro="home.references.intro" />
      <Carousel :opts="{ align: 'start' }" class="text-foreground" aria-label="Referenzobjekte">
        <CarouselContent class="-ml-5">
          <CarouselItem v-for="l in refs" :key="l.id" class="basis-4/5 pl-5 sm:basis-1/2 lg:basis-1/3">
            <ListingCard :listing="l" />
          </CarouselItem>
        </CarouselContent>
        <div class="mt-8 flex items-center gap-2">
          <CarouselPrevious class="static size-11 translate-y-0" aria-label="Vorherige Referenzen" />
          <CarouselNext class="static size-11 translate-y-0" aria-label="Nächste Referenzen" />
          <NuxtLink to="/referenzen" class="ml-4 font-semibold text-primary underline underline-offset-4">Alle Referenzen</NuxtLink>
        </div>
      </Carousel>
    </div>
  </section>
</template>
