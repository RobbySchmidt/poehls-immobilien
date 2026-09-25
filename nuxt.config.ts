// https://nuxt.com/docs/api/configuration/nuxt-config
import { existsSync, readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'

const listingsFile = 'content/generated/listings.json'
const listingRoutes: string[] = existsSync(listingsFile)
  ? JSON.parse(readFileSync(listingsFile, 'utf8')).map((l: { slug: string, availability: string }) =>
      `${l.availability === 'available' ? '/angebote/' : '/referenzen/'}${l.slug}`)
  : []

// Sets .dark before first paint (stored choice, else system). Must never throw.
const themeScript = `(function(){try{var s=null;try{s=localStorage.getItem('theme')}catch(e){}var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'de' },
      meta: [
        { name: 'robots', content: 'noindex, nofollow' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [{ rel: 'icon', type: 'image/png', href: '/brand/logo.png' }],
      script: [{ innerHTML: themeScript, tagPosition: 'head', tagPriority: 'critical' }],
    },
  },

  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ['shadcn-nuxt'],

  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      // false while pages are still being built; switched to true in Task 15
      failOnError: false,
      routes: ['/', ...listingRoutes],
    },
  },
})
