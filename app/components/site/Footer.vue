<script setup lang="ts">
const company = useCompany()
const year = 2026
</script>

<template>
  <footer class="dark">
    <div class="border-t border-border bg-background py-f-16 text-foreground">
      <div class="container-page grid gap-10 md:grid-cols-12">
        <div class="md:col-span-5">
          <SiteLogo />
          <address class="mt-6 not-italic text-muted-foreground">
            {{ company.street }}<br>{{ company.zip }} {{ company.city }}
          </address>
        </div>
        <div class="text-sm md:col-span-4">
          <h2 class="mb-3 text-sm font-semibold text-foreground">Kontakt</h2>
          <ul class="space-y-2 text-muted-foreground">
            <li>Telefon <a :href="company.phone_href" class="text-foreground tabular hover:underline">{{ company.phone }}</a></li>
            <li>Mobil <a :href="company.mobile_href" class="text-foreground tabular hover:underline">{{ company.mobile }}</a></li>
            <li><a :href="`mailto:${company.email}`" class="text-foreground hover:underline">{{ company.email }}</a></li>
          </ul>
        </div>
        <nav aria-label="Rechtliches" class="text-sm md:col-span-3">
          <h2 class="mb-3 text-sm font-semibold text-foreground">Rechtliches</h2>
          <ul class="space-y-2 text-muted-foreground">
            <li><NuxtLink to="/impressum" class="hover:text-foreground hover:underline">Impressum</NuxtLink></li>
            <li><NuxtLink to="/datenschutz" class="hover:text-foreground hover:underline">Datenschutz</NuxtLink></li>
            <li><NuxtLink to="/agb" class="hover:text-foreground hover:underline">AGB</NuxtLink></li>
            <li><NuxtLink to="/referenzen" class="hover:text-foreground hover:underline">Referenzen</NuxtLink></li>
          </ul>
        </nav>
      </div>
      <div class="container-page mt-12 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <span>© {{ year }} {{ company.name }}</span>
        <span>Konzeptentwurf von <a :href="company.agency.url" class="text-foreground hover:underline" target="_blank" rel="noopener">{{ company.agency.name }}</a></span>
      </div>
    </div>
  </footer>
</template>
