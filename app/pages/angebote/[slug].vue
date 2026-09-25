<script setup lang="ts">
const route = useRoute()
const listing = useListing(String(route.params.slug))
if (!listing || listing.availability !== 'available') {
  throw createError({ statusCode: 404, statusMessage: 'Angebot nicht gefunden', fatal: true })
}
const cover = useFile(listing.cover_image)
useSeoMeta({
  title: listing.title,
  description: listing.teaser,
  ogImage: cover ? assetUrl(cover, 1600) : undefined,
})
</script>

<template>
  <ListingDetail :listing="listing!" />
</template>
