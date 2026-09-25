<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()
const localePath = useLocalePath()
const is404 = computed(() => props.error.statusCode === 404)
useSeoMeta({ title: is404.value ? t('error.notFound') : t('error.error') })
</script>

<template>
  <NuxtLayout>
    <div class="container-page py-f-24">
      <p class="text-sm font-semibold text-muted-foreground tabular">{{ error.statusCode }}</p>
      <h1 class="mt-2 max-w-[18ch] text-f-6xl">{{ is404 ? t('error.title404') : t('error.titleError') }}</h1>
      <p class="mt-4 max-w-[48ch] text-f-xl text-muted-foreground">
        {{ is404 ? t('error.text404') : t('error.textError') }}
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <Button as-child size="cta"><NuxtLink :to="localePath('angebote')">{{ t('common.viewOffers') }}</NuxtLink></Button>
        <Button as-child variant="outline" size="cta"><NuxtLink :to="localePath('index')">{{ t('error.toHome') }}</NuxtLink></Button>
      </div>
    </div>
  </NuxtLayout>
</template>
