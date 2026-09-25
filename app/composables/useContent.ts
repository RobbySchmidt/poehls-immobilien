// Single data-access layer. With Directus, only this file changes.
import type { Company, FileAsset, LegalPage, Listing, Project } from '~/types/content'
import listingsData from '~~/content/generated/listings.json'
import filesData from '~~/content/generated/files.json'
import projectsData from '~~/content/generated/projects.json'
import legalData from '~~/content/generated/legal.json'
import companyData from '~~/content/manual/company.json'
import homeData from '~~/content/manual/home.json'
import aboutData from '~~/content/manual/about.json'
import servicesData from '~~/content/manual/services.json'
import moodData from '~~/content/manual/mood.json'

const listings = listingsData as Listing[]
const files = new Map((filesData as FileAsset[]).map((f) => [f.id, f]))

export const useListings = () => listings
export const useAvailableListings = () => listings.filter((l) => l.availability === 'available')
export const useArchivedListings = () => listings.filter((l) => l.availability !== 'available')
export const useListing = (slug: string) => listings.find((l) => l.slug === slug) ?? null

export const useFile = (id: string | null | undefined): FileAsset | null => (id ? files.get(id) ?? null : null)
export const useListingImages = (l: Listing): FileAsset[] =>
  [l.cover_image, ...l.images.map((i) => i.directus_files_id)].map((id) => useFile(id)).filter((f): f is FileAsset => !!f)

export const useProject = (slug: string) => (projectsData as Project[]).find((p) => p.slug === slug) ?? null
export const useCompany = () => companyData as Company
export const useHomeContent = () => homeData
export const useAboutContent = () => aboutData
export const useServicesContent = () => servicesData
export const useLegalPage = (key: 'datenschutz' | 'agb') => (legalData as Record<string, LegalPage>)[key]!

export function useHeroMood() {
  const map = (ids: string[]) => ids.map((id) => useFile(id)).filter((f): f is FileAsset => !!f)
  return { day: map(moodData.hero.day), night: map(moodData.hero.night) }
}
