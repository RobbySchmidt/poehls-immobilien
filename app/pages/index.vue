<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({
  description: t('seo.homeDescription'),
})
</script>

<template>
  <div>
    <HomeHero />
    <HomeLatest />
    <HomeGrandTower />
    <HomeOwners />
    <HomePersonal />
    <HomeReferences />
    <HomeContactBand />
  </div>
</template>
