<script setup lang="ts">
import { Mail, Phone } from '@lucide/vue'

const props = withDefaults(defineProps<{ surface?: 'secondary' | 'background' }>(), { surface: 'secondary' })
const home = useHomeContent()
const company = useCompany()
</script>

<template>
  <section :class="props.surface === 'secondary' ? 'bg-secondary' : 'bg-background'" class="py-f-24" aria-labelledby="contact-title">
    <div class="container-page flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 id="contact-title" class="text-f-4xl">{{ home.contact.title }}</h2>
        <p class="mt-3 max-w-[48ch] text-f-xl text-muted-foreground">{{ home.contact.text }}</p>
      </div>
      <div class="flex flex-col gap-3 sm:flex-row">
        <Button as-child size="cta">
          <a :href="company.phone_href"><Phone class="size-4" aria-hidden="true" />Anrufen</a>
        </Button>
        <Button as-child variant="outline" size="cta">
          <NuxtLink to="/kontakt"><Mail class="size-4" aria-hidden="true" />Nachricht schreiben</NuxtLink>
        </Button>
      </div>
    </div>
  </section>
</template>
