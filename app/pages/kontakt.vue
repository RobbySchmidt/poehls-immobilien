<script setup lang="ts">
import { Mail, MapPin, Phone, Smartphone } from '@lucide/vue'

const company = useCompany()
useSeoMeta({ title: 'Kontakt', description: `Kontakt zu ${company.name} in ${company.city}: Telefon ${company.phone}, E-Mail ${company.email}.` })
</script>

<template>
  <div class="container-page grid gap-f-16 py-f-12 lg:grid-cols-12">
    <div class="lg:col-span-5">
      <h1 class="text-f-6xl">Kontakt</h1>
      <p class="mt-4 max-w-[40ch] text-f-xl text-muted-foreground">Wir beraten Sie persönlich und unverbindlich – am Telefon, per E-Mail oder vor Ort.</p>
      <ul class="mt-10 space-y-5">
        <li class="flex gap-3"><Phone class="mt-1 size-5 text-muted-foreground" aria-hidden="true" /><div><span class="block text-sm text-muted-foreground">Telefon</span><a :href="company.phone_href" class="font-semibold tabular hover:underline">{{ company.phone }}</a></div></li>
        <li class="flex gap-3"><Smartphone class="mt-1 size-5 text-muted-foreground" aria-hidden="true" /><div><span class="block text-sm text-muted-foreground">Mobil</span><a :href="company.mobile_href" class="font-semibold tabular hover:underline">{{ company.mobile }}</a></div></li>
        <li class="flex gap-3"><Mail class="mt-1 size-5 text-muted-foreground" aria-hidden="true" /><div><span class="block text-sm text-muted-foreground">E-Mail</span><a :href="`mailto:${company.email}`" class="font-semibold hover:underline">{{ company.email }}</a></div></li>
        <li class="flex gap-3"><MapPin class="mt-1 size-5 text-muted-foreground" aria-hidden="true" /><div><span class="block text-sm text-muted-foreground">Adresse</span><address class="font-semibold not-italic">{{ company.street }}<br>{{ company.zip }} {{ company.city }}</address></div></li>
      </ul>
    </div>
    <div class="lg:col-span-7">
      <h2 class="mb-6 text-f-2xl">Nachricht schreiben</h2>
      <ContactForm />
    </div>
  </div>
</template>
