// Site-wide head: lang, hreflang/canonical, title template, Open Graph.
// Called by app.vue and error.vue (Nuxt renders error.vue instead of app.vue).
export function useSiteHead() {
  const { t, locale } = useI18n()
  const siteUrl = useRuntimeConfig().public.siteUrl as string
  const i18nHead = useLocaleHead({ seo: true })
  useHead({
    htmlAttrs: { lang: () => i18nHead.value.htmlAttrs.lang },
    link: () => i18nHead.value.link ?? [],
    titleTemplate: (title) => (title ? `${title} · Pöhls Immobilien` : t('seo.defaultTitle')),
  })
  useSeoMeta({
    ogSiteName: 'Pöhls Immobilien',
    ogLocale: () => (locale.value === 'en' ? 'en_GB' : 'de_DE'),
    ogType: 'website',
    ogTitle: () => t('seo.defaultTitle'),
    ogDescription: () => t('seo.ogDescription'),
    ogImage: absoluteUrl(siteUrl, '/og.jpg'),
    twitterCard: 'summary_large_image',
  })
}
