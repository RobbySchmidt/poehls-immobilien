<script setup lang="ts">
import { Menu, Phone } from '@lucide/vue'

const company = useCompany()
const route = useRoute()
const open = ref(false)
const nav = [
  { to: '/angebote', label: 'Angebote' },
  { to: '/grand-tower', label: 'Grand Tower' },
  { to: '/leistungen', label: 'Leistungen' },
  { to: '/ueber-uns', label: 'Über uns' },
  { to: '/kontakt', label: 'Kontakt' },
]
const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)
watch(() => route.fullPath, () => { open.value = false })
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-border bg-background">
    <div class="container-page flex h-16 items-center justify-between gap-4 md:h-20">
      <NuxtLink to="/" class="rounded-md" aria-label="Pöhls Immobilien – Startseite">
        <SiteLogo />
      </NuxtLink>

      <nav aria-label="Hauptnavigation" class="hidden lg:block">
        <ul class="flex items-center gap-1">
          <li v-for="item in nav" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
              :class="{ 'bg-accent text-foreground': isActive(item.to) }"
              :aria-current="isActive(item.to) ? 'page' : undefined"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-1">
        <a :href="company.phone_href" class="hidden items-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold tabular hover:bg-accent xl:inline-flex">
          <Phone class="size-4" aria-hidden="true" />{{ company.phone }}
        </a>
        <Button as-child variant="ghost" size="icon-pill" class="xl:hidden">
          <a :href="company.phone_href" :aria-label="`Anrufen: ${company.phone}`"><Phone class="size-5" aria-hidden="true" /></a>
        </Button>
        <SiteThemeToggle />
        <Sheet v-model:open="open">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon-pill" class="lg:hidden" aria-label="Menü öffnen">
              <Menu class="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="w-[85vw] max-w-sm">
            <SheetHeader>
              <SheetTitle>Menü</SheetTitle>
            </SheetHeader>
            <nav aria-label="Mobile Navigation" class="px-4">
              <ul class="flex flex-col">
                <li v-for="item in nav" :key="item.to">
                  <NuxtLink :to="item.to" class="block border-b border-border py-4 text-f-2xl font-semibold" :aria-current="isActive(item.to) ? 'page' : undefined">
                    {{ item.label }}
                  </NuxtLink>
                </li>
              </ul>
              <a :href="company.phone_href" class="mt-6 inline-flex items-center gap-2 font-semibold tabular"><Phone class="size-4" aria-hidden="true" />{{ company.phone }}</a>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>
