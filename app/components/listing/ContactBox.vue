<script setup lang="ts">
import { Mail, Phone } from '@lucide/vue'
import type { Listing } from '~/types/content'

const props = defineProps<{ listing: Listing }>()
const company = useCompany()
const portrait = useFile(company.portrait)
const inquiry = computed(() => ({ path: '/kontakt', query: { objekt: props.listing.slug } }))
</script>

<template>
  <aside class="rounded-2xl bg-secondary p-6" aria-label="Ansprechpartner">
    <div class="flex items-center gap-4">
      <div class="size-16 shrink-0 overflow-hidden rounded-full">
        <ResponsiveImage :file="portrait" sizes="64px" alt="" />
      </div>
      <div>
        <p class="font-semibold">{{ company.owner }}</p>
        <p class="text-sm text-muted-foreground">Ihr Ansprechpartner</p>
      </div>
    </div>
    <div class="mt-6 grid gap-2">
      <Button as-child size="cta">
        <NuxtLink :to="inquiry"><Mail class="size-4" aria-hidden="true" />Objekt anfragen</NuxtLink>
      </Button>
      <Button as-child variant="outline" size="cta">
        <a :href="company.phone_href"><Phone class="size-4" aria-hidden="true" />{{ company.phone }}</a>
      </Button>
    </div>
  </aside>
</template>
