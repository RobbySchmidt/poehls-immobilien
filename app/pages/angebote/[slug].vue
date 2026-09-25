<script setup lang="ts">
const route = useRoute()
const listing = useListing(String(route.params.slug))
if (!listing || listing.availability !== 'available') {
  throw createError({ statusCode: 404, statusMessage: 'Angebot nicht gefunden', fatal: true })
}
const cover = useFile(listing.cover_image)
const siteUrl = useRuntimeConfig().public.siteUrl as string
useSeoMeta({
  title: listing.title,
  description: listing.teaser,
  ogTitle: listing.title,
  ogDescription: listing.teaser,
  ogImage: cover ? absoluteUrl(siteUrl, assetUrl(cover, 1600)) : undefined,
})
</script>

<template>
  <ListingDetail :listing="listing!" />
</template>
