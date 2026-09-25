<script setup lang="ts">
const c = useCompany()
useSeoMeta({ title: 'Impressum' })
</script>

<template>
  <div class="container-page py-f-12">
    <h1 class="text-f-6xl">Impressum</h1>
    <div class="prose-legacy mt-f-8">
      <p><b>{{ c.name }}</b><br>{{ c.owner }}<br>{{ c.street }}<br>{{ c.zip }} {{ c.city }}</p>
      <p>Telefon: <a :href="c.phone_href">{{ c.phone }}</a><br>Mobil: <a :href="c.mobile_href">{{ c.mobile }}</a><br>E-Mail: <a :href="`mailto:${c.email}`">{{ c.email }}</a><br>Website: {{ c.web }}</p>
      <p>Firmensitz / Registergericht: {{ c.register_court }}<br>Handelsregisternummer: {{ c.register_number }}<br>Umsatzsteuer-Identifikationsnummer: {{ c.vat_id }}<br>Berufskammer: {{ c.chamber }}</p>
      <p>Inhaltlich verantwortlich: {{ c.responsible }}</p>
    </div>
  </div>
</template>
