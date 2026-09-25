<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const home = useHomeContent()
const company = useCompany()
const portrait = useFile(company.portrait)
</script>

<template>
  <section class="bg-secondary py-f-24" aria-labelledby="personal-title">
    <div class="container-page grid items-center gap-f-16 md:grid-cols-12">
      <div class="aspect-[4/5] overflow-hidden rounded-2xl md:col-span-5">
        <ResponsiveImage :file="portrait" sizes="(min-width: 768px) 40vw, 100vw" />
      </div>
      <div class="md:col-span-7">
        <h2 id="personal-title" class="text-f-4xl">{{ home.personal.title }}</h2>
        <p class="mt-4 max-w-[55ch] text-f-xl text-muted-foreground">{{ home.personal.text }}</p>
        <dl class="mt-10 grid gap-6 sm:grid-cols-3">
          <div v-for="fact in home.personal.facts" :key="fact.label" class="border-t border-border pt-4">
            <dt class="sr-only">{{ fact.label }}</dt>
            <dd class="text-f-4xl font-semibold tabular">{{ fact.value }}</dd>
            <dd class="mt-1 text-sm text-muted-foreground">{{ fact.label }}</dd>
          </div>
        </dl>
        <NuxtLink :to="localePath('ueber-uns')" class="mt-8 inline-block font-semibold text-primary underline underline-offset-4">{{ t('common.moreAbout') }}</NuxtLink>
      </div>
    </div>
  </section>
</template>
