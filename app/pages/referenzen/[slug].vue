<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const listing = useListing(String(route.params.slug))
if (!listing || listing.availability === 'available') {
  throw createError({ statusCode: 404, statusMessage: 'Not found', fatal: true })
}
useSeoMeta({ title: t('detail.referenceTitle', { title: listing.title }), description: listing.teaser })
</script>

<template>
  <ListingDetail :listing="listing!" />
</template>
