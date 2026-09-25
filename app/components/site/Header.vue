<script setup lang="ts">
import { Menu, Phone } from '@lucide/vue'

const { t } = useI18n()
const localePath = useLocalePath()
const getRouteBaseName = useRouteBaseName()
const company = useCompany()
const route = useRoute()
const open = ref(false)
const nav = computed(() => [
  { name: 'angebote', label: t('nav.offers') },
  { name: 'grand-tower', label: t('nav.grandTower') },
  { name: 'leistungen', label: t('nav.services') },
  { name: 'ueber-uns', label: t('nav.about') },
  { name: 'kontakt', label: t('nav.contact') },
])
// base names: "angebote", "angebote-slug", … – a detail page keeps its section active
const isActive = (name: string) => (getRouteBaseName(route) ?? '').startsWith(name)
watch(() => route.fullPath, () => { open.value = false })
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-border bg-background">
    <div class="container-page flex h-16 items-center justify-between gap-4 md:h-20">
      <NuxtLink :to="localePath('index')" class="rounded-md" :aria-label="t('nav.homeAria')">
        <SiteLogo />
      </NuxtLink>

      <nav :aria-label="t('nav.mainAria')" class="hidden lg:block">
        <ul class="flex items-center gap-1">
          <li v-for="item in nav" :key="item.name">
            <NuxtLink
              :to="localePath(item.name)"
              class="rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
              :class="{ 'bg-accent text-foreground': isActive(item.name) }"
              :aria-current="isActive(item.name) ? 'page' : undefined"
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
          <a :href="company.phone_href" :aria-label="t('nav.callAria', { phone: company.phone })"><Phone class="size-5" aria-hidden="true" /></a>
        </Button>
        <SiteLanguageSwitch class="hidden sm:flex" />
        <SiteThemeToggle />
        <Sheet v-model:open="open">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon-pill" class="lg:hidden" :aria-label="t('nav.openMenu')">
              <Menu class="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="w-[85vw] max-w-sm">
            <SheetHeader>
              <SheetTitle>{{ t('nav.menu') }}</SheetTitle>
            </SheetHeader>
            <nav :aria-label="t('nav.mobileAria')" class="px-4">
              <ul class="flex flex-col">
                <li v-for="item in nav" :key="item.name">
                  <NuxtLink :to="localePath(item.name)" class="block border-b border-border py-4 text-f-2xl font-semibold" :aria-current="isActive(item.name) ? 'page' : undefined">
                    {{ item.label }}
                  </NuxtLink>
                </li>
              </ul>
              <a :href="company.phone_href" class="mt-6 inline-flex items-center gap-2 font-semibold tabular"><Phone class="size-4" aria-hidden="true" />{{ company.phone }}</a>
              <SiteLanguageSwitch class="mt-4 -ml-2" />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>
