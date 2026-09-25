<script setup lang="ts">
const { t } = useI18n()
const c = useCompany()
useSeoMeta({ title: t('legal.imprint') })
</script>

<template>
  <div class="container-page py-f-12">
    <h1 class="text-f-6xl">{{ t('legal.imprint') }}</h1>
    <div class="prose-legacy mt-f-8">
      <p><b>{{ c.name }}</b><br>{{ c.owner }}<br>{{ c.street }}<br>{{ c.zip }} {{ c.city }}</p>
      <p>{{ t('legal.phone') }}: <a :href="c.phone_href">{{ c.phone }}</a><br>{{ t('legal.mobile') }}: <a :href="c.mobile_href">{{ c.mobile }}</a><br>{{ t('legal.email') }}: <a :href="`mailto:${c.email}`">{{ c.email }}</a><br>{{ t('legal.website') }}: {{ c.web }}</p>
      <p>{{ t('legal.registerCourt') }}: {{ c.register_court }}<br>{{ t('legal.registerNumber') }}: {{ c.register_number }}<br>{{ t('legal.vatId') }}: {{ c.vat_id }}<br>{{ t('legal.chamber') }}: {{ c.chamber }}</p>
      <p>{{ t('legal.responsible') }}: {{ c.responsible }}</p>
    </div>
  </div>
</template>
