export type MarketingType = 'kauf' | 'miete'
export type PropertyType = 'wohnung' | 'haus' | 'gewerbe' | 'grundstueck' | 'anlage'
export type PriceType = 'kaufpreis' | 'kaltmiete' | 'pauschalmiete' | 'miete_monat' | 'miete_jahr'
export type Availability = 'available' | 'sold' | 'rented'

export interface FileAsset {
  id: string
  title: string
  description: string
  width: number
  height: number
  focal_point: { x: number, y: number } | null
  variants: number[]
}

export interface Listing {
  id: number
  legacy_id: number
  legacy_url: string
  source: 'main' | 'grandtower'
  status: 'published' | 'archived'
  availability: Availability
  slug: string
  title: string
  teaser: string
  description: string
  marketing_type: MarketingType
  property_type: PropertyType | null
  furnished: boolean
  country: string
  street: string | null
  zip: string | null
  city: string | null
  district: string | null
  rooms: number | null
  living_area: number | null
  usable_area: number | null
  plot_area: number | null
  price: number | null
  price_type: PriceType | null
  total_rent: number | null
  price_on_request: boolean
  commission_free: boolean
  available_from: string | null
  features: { label: string, value: string }[]
  cover_image: string | null
  images: { sort: number, directus_files_id: string }[]
  expose: { url: string } | null
  project: string | null
  featured: boolean
  date_published: string
  translations?: ListingTranslation[]
}

export interface ListingTranslation {
  languages_code: string
  title: string
  teaser: string
  description: string
  machine_translated: boolean
}

export interface Project {
  slug: string
  title: string
  tagline: string
  address: string
  intro: string[]
  facts: { label: string, value: string, verify?: boolean }[]
  mood_day: string
  mood_night: string
  /** day/night image pairs for secondary placements (home band background, side photo) */
  mood_pairs: Record<'photo' | 'band', { day: string, night: string }>
  images: string[]
}

export interface Company {
  name: string
  owner: string
  street: string
  zip: string
  city: string
  phone: string
  phone_href: string
  mobile: string
  mobile_href: string
  email: string
  web: string
  register_court: string
  register_number: string
  vat_id: string
  chamber: string
  responsible: string
  portrait: string
  agency: { name: string, url: string }
}

export interface LegalPage {
  title: string
  html: string
  toc: { id: string, title: string }[]
}
