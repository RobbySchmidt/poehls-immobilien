<script setup lang="ts">
const route = useRoute()
const listing = useListing(String(route.params.slug))
if (!listing || listing.availability === 'available') {
  throw createError({ statusCode: 404, statusMessage: 'Referenz nicht gefunden', fatal: true })
}
useSeoMeta({ title: `Referenz: ${listing.title}`, description: listing.teaser })
</script>

<template>
  <ListingDetail :listing="listing!" />
</template>
