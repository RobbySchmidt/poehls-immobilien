<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({ title: t('references.title'), description: t('references.seoDescription') })
const all = sortListings(useArchivedListings(), 'neu')
const filter = ref<'alle' | 'sold' | 'rented'>('alle')
const filterOptions = computed<{ value: typeof filter.value, label: string }[]>(() => [{ value: 'alle', label: t('common.all') }, { value: 'sold', label: t('common.sold') }, { value: 'rented', label: t('common.rented') }])
const shown = computed(() => (filter.value === 'alle' ? all : all.filter((l) => l.availability === filter.value)))
</script>

<template>
  <div class="container-page py-f-12">
    <h1 class="text-f-6xl">{{ t('references.title') }}</h1>
    <p class="mt-3 max-w-[55ch] text-f-xl text-muted-foreground">{{ t('references.intro') }}</p>
    <SiteSegmented v-model="filter" :options="filterOptions" :label="t('references.filterAria')" class="mt-f-8" />
    <div class="mt-f-12 grid gap-x-f-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
      <ListingCard v-for="l in shown" :key="l.id" :listing="l" :heading-level="2" />
    </div>
  </div>
</template>
