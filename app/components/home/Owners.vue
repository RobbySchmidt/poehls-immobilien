<script setup lang="ts">
import { Check } from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()
const home = useHomeContent()
const services = useServicesContent()
</script>

<template>
  <section class="py-f-24" aria-labelledby="owners-title">
    <div class="container-page grid gap-f-16 lg:grid-cols-12">
      <div class="lg:col-span-5">
        <h2 id="owners-title" class="text-f-4xl">{{ home.owners.title }}</h2>
        <p class="mt-4 max-w-[48ch] text-f-xl text-muted-foreground">{{ home.owners.text }}</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <Button as-child variant="outline" size="cta">
            <NuxtLink :to="localePath('leistungen')">{{ t('common.viewServices') }}</NuxtLink>
          </Button>
        </div>
      </div>
      <div class="grid gap-10 sm:grid-cols-3 lg:col-span-7">
        <div v-for="group in services.groups" :key="group.title">
          <h3 class="border-b border-border pb-3 text-f-2xl">{{ group.title }}</h3>
          <ul class="mt-4 space-y-3 text-sm">
            <li v-for="item in group.items.slice(0, 4)" :key="item" class="flex gap-2.5">
              <Check class="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />{{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
