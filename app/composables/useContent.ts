// Single data-access layer. With Directus, only this file changes.
// All texts are returned in the current UI language (Directus-style `translations`, German fallback).
import type { Company, FileAsset, LegalPage, Listing, Project } from '~/types/content'
import type { Locale } from '~/utils/format'
import listingsData from '~~/content/generated/listings.json'
import filesData from '~~/content/generated/files.json'
import projectsData from '~~/content/generated/projects.json'
import legalData from '~~/content/generated/legal.json'
import companyData from '~~/content/manual/company.json'
import homeData from '~~/content/manual/home.json'
import aboutData from '~~/content/manual/about.json'
import servicesData from '~~/content/manual/services.json'
import moodData from '~~/content/manual/mood.json'

const rawListings = listingsData as Listing[]
const files = new Map((filesData as FileAsset[]).map((f) => [f.id, f]))
const moodAlts = moodData.alts as Record<Locale, Record<string, string>>

/** Current UI language (outside components too, e.g. in computed getters). */
export function useLocaleCode(): Locale {
  return (useNuxtApp().$i18n.locale.value as Locale) ?? 'de'
}

function localizeListing(l: Listing, locale: Locale): Listing {
  const t = pickTranslation(l.translations, locale)
  return { ...l, title: t.title ?? l.title, teaser: t.teaser ?? l.teaser, description: t.description ?? l.description }
}

export const useListings = () => { const loc = useLocaleCode(); return rawListings.map((l) => localizeListing(l, loc)) }
export const useAvailableListings = () => useListings().filter((l) => l.availability === 'available')
export const useArchivedListings = () => useListings().filter((l) => l.availability !== 'available')
export const useListing = (slug: string) => useListings().find((l) => l.slug === slug) ?? null

/** Files with alt texts in the current language (mood images have hand-written alts per language). */
export function useFile(id: string | null | undefined): FileAsset | null {
  const f = id ? files.get(id) : undefined
  if (!f) return null
  const alt = moodAlts[useLocaleCode()]?.[f.id]
  return alt ? { ...f, description: alt } : f
}

/** Cover + gallery with alt texts derived from the (translated) title: "Title – image 3 of 12". */
export function useListingImages(l: Listing): FileAsset[] {
  const { $i18n } = useNuxtApp()
  const list = [l.cover_image, ...l.images.map((i) => i.directus_files_id)].map((id) => useFile(id)).filter((f): f is FileAsset => !!f)
  return list.map((f, i) => ({
    ...f,
    description: list.length > 1 ? `${l.title} – ${$i18n.t('gallery.imageOf', { n: i + 1, total: list.length })}` : l.title,
  }))
}

export function useProject(slug: string): Project | null {
  const p = (projectsData as unknown as (Project & { translations: Record<string, unknown>[] })[]).find((x) => x.slug === slug)
  if (!p) return null
  const t = pickTranslation(p.translations as { languages_code: string }[], useLocaleCode()) as Partial<Project>
  return { ...p, ...t } as Project
}

export const useCompany = () => companyData as Company

type Localized<T> = { translations: (T & { languages_code: string })[] }
const localized = <T>(data: Localized<T>): T => pickTranslation(data.translations, useLocaleCode()) as T

export const useHomeContent = () => localized(homeData as unknown as Localized<Omit<(typeof homeData)['translations'][number], 'languages_code'>>)
export const useAboutContent = () => localized(aboutData as unknown as Localized<Omit<(typeof aboutData)['translations'][number], 'languages_code'>>)
export const useServicesContent = () => localized(servicesData as unknown as Localized<Omit<(typeof servicesData)['translations'][number], 'languages_code'>>)
export const useLegalPage = (key: 'datenschutz' | 'agb') => (legalData as Record<string, LegalPage>)[key]!

export function useHeroMood() {
  const map = (ids: string[]) => ids.map((id) => useFile(id)).filter((f): f is FileAsset => !!f)
  return { day: map(moodData.hero.day), night: map(moodData.hero.night) }
}
