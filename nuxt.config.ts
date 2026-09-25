// https://nuxt.com/docs/api/configuration/nuxt-config
import { existsSync, readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'

const listingsFile = 'content/generated/listings.json'
const listingRoutes: string[] = existsSync(listingsFile)
  ? JSON.parse(readFileSync(listingsFile, 'utf8')).flatMap((l: { slug: string, availability: string }) =>
      l.availability === 'available'
        ? [`/angebote/${l.slug}`, `/en/properties/${l.slug}`]
        : [`/referenzen/${l.slug}`, `/en/references/${l.slug}`])
  : []

// Sets .dark before first paint (stored choice, else system). Must never throw.
const themeScript = `(function(){try{var s=null;try{s=localStorage.getItem('theme')}catch(e){}var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      meta: [
        { name: 'robots', content: 'noindex, nofollow' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [{ rel: 'icon', type: 'image/png', href: '/brand/logo.png' }],
      script: [{ innerHTML: themeScript, tagPosition: 'head', tagPriority: 'critical' }],
    },
  },

  // Absolute URLs for social previews: NUXT_PUBLIC_SITE_URL=https://… yarn generate
  runtimeConfig: {
    public: { siteUrl: process.env.NUXT_PUBLIC_SITE_URL || '' },
  },

  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ['shadcn-nuxt', '@nuxtjs/i18n'],

  i18n: {
    locales: [
      { code: 'de', language: 'de-DE', name: 'Deutsch', file: 'de.json' },
      { code: 'en', language: 'en-GB', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'de',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    customRoutes: 'config',
    pages: {
      'angebote': { en: '/properties' },
      'angebote-slug': { en: '/properties/[slug]' },
      'referenzen': { en: '/references' },
      'referenzen-slug': { en: '/references/[slug]' },
      'leistungen': { en: '/services' },
      'ueber-uns': { en: '/about' },
      'kontakt': { en: '/contact' },
      'impressum': { en: '/legal-notice' },
      'datenschutz': { en: '/privacy' },
      'agb': { en: '/terms' },
    },
  },

  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: true,
      routes: ['/', '/en', ...listingRoutes],
    },
  },
})
