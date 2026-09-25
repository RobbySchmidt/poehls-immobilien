import type { Listing, MarketingType, PropertyType, PriceType } from '~/types/content'

export type Locale = 'de' | 'en'

const NB = ' '
const intlLocale: Record<Locale, string> = { de: 'de-DE', en: 'en-GB' }
const euroFmt = Object.fromEntries((['de', 'en'] as Locale[]).map((l) => [l, new Intl.NumberFormat(intlLocale[l], { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })])) as Record<Locale, Intl.NumberFormat>
const numFmt = Object.fromEntries((['de', 'en'] as Locale[]).map((l) => [l, new Intl.NumberFormat(intlLocale[l], { maximumFractionDigits: 1 })])) as Record<Locale, Intl.NumberFormat>

// Vocabulary per language. Feature labels come verbatim from the legacy data (German) → mapped for English.
const WORDS = {
  de: {
    propertyType: { wohnung: 'Wohnung', haus: 'Haus', gewerbe: 'Gewerbe', grundstueck: 'Grundstück', anlage: 'Anlageobjekt' },
    marketing: { kauf: 'Kauf', miete: 'Miete' },
    priceType: { kaufpreis: 'Kaufpreis', kaltmiete: 'Kaltmiete', pauschalmiete: 'Pauschalmiete', miete_monat: 'Miete', miete_jahr: 'Jahresmiete' },
    price: 'Preis', onRequest: 'Preis auf Anfrage', sold: 'Verkauft', rented: 'Vermietet',
    perMonth: '/ Monat', perYear: '/ Jahr', rooms: (n: string, _one: boolean) => `${n}${NB}Zi.`,
    living: 'Wohnfläche', usable: 'Nutzfläche', plot: 'Grundstück', usableSuffix: 'Nutzfläche', plotSuffix: 'Grundstück',
    immediately: 'sofort', country: { FR: 'Frankreich' } as Record<string, string>,
    features: {} as Record<string, string>,
  },
  en: {
    propertyType: { wohnung: 'Apartment', haus: 'House', gewerbe: 'Commercial', grundstueck: 'Plot', anlage: 'Investment property' },
    marketing: { kauf: 'Buy', miete: 'Rent' },
    priceType: { kaufpreis: 'Purchase price', kaltmiete: 'Net rent', pauschalmiete: 'All-inclusive rent', miete_monat: 'Rent', miete_jahr: 'Annual rent' },
    price: 'Price', onRequest: 'Price on request', sold: 'Sold', rented: 'Let',
    perMonth: '/ month', perYear: '/ year', rooms: (n: string, one: boolean) => `${n} ${one ? 'room' : 'rooms'}`,
    living: 'Living space', usable: 'Usable area', plot: 'Plot', usableSuffix: 'usable area', plotSuffix: 'plot',
    immediately: 'immediately', country: { FR: 'France' } as Record<string, string>,
    features: { 'Objekt-Nr.': 'Property no.', 'x-fache Miete': 'Rental multiplier', 'Gesamtfläche': 'Total area', 'Etage': 'Floor' } as Record<string, string>,
  },
} satisfies Record<Locale, unknown>

export const formatEuro = (n: number, locale: Locale = 'de') => euroFmt[locale].format(n).replace(/\s/g, NB)
export const formatArea = (n: number, locale: Locale = 'de') => `${numFmt[locale].format(n)}${NB}m²`
export const formatRooms = (n: number, locale: Locale = 'de') => WORDS[locale].rooms(numFmt[locale].format(n), n === 1)

export const propertyTypeLabel = (t: PropertyType, locale: Locale = 'de') => WORDS[locale].propertyType[t]
export const marketingLabel = (t: MarketingType, locale: Locale = 'de') => WORDS[locale].marketing[t]
export const featureLabel = (label: string, locale: Locale = 'de') => WORDS[locale].features[label] ?? label

/** @deprecated German-only maps – use propertyTypeLabel()/marketingLabel() with a locale. */
export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = WORDS.de.propertyType
/** @deprecated see PROPERTY_TYPE_LABEL */
export const MARKETING_LABEL: Record<MarketingType, string> = WORDS.de.marketing

export function priceText(l: Listing, locale: Locale = 'de'): string | null {
  const w = WORDS[locale]
  if (l.price_on_request) return w.onRequest
  if (l.price == null) return null
  const v = formatEuro(l.price, locale)
  if (l.marketing_type === 'kauf') return v
  return `${v} ${l.price_type === 'miete_jahr' ? w.perYear : w.perMonth}`
}

// Card price: value and (smaller) rent period separately; compact = short text instead of a number.
export function priceParts(l: Listing, locale: Locale = 'de'): { value: string, unit: string | null, compact: boolean } | null {
  const w = WORDS[locale]
  if (l.availability === 'sold') return { value: w.sold, unit: null, compact: true }
  if (l.availability === 'rented') return { value: w.rented, unit: null, compact: true }
  if (l.price_on_request) return { value: w.onRequest, unit: null, compact: true }
  if (l.price == null) return null
  const unit = l.marketing_type === 'kauf' ? null : l.price_type === 'miete_jahr' ? w.perYear : w.perMonth
  return { value: formatEuro(l.price, locale), unit, compact: false }
}

export function cardFacts(l: Listing, locale: Locale = 'de'): string {
  const w = WORDS[locale]
  if (l.living_area) return [l.rooms ? formatRooms(l.rooms, locale) : null, formatArea(l.living_area, locale)].filter(Boolean).join(' · ')
  if (l.usable_area) return `${formatArea(l.usable_area, locale)} ${w.usableSuffix}`
  if (l.plot_area) return `${formatArea(l.plot_area, locale)} ${w.plotSuffix}`
  return l.rooms ? formatRooms(l.rooms, locale) : ''
}

export function priceLabel(l: Listing, locale: Locale = 'de'): string {
  return l.price_type ? WORDS[locale].priceType[l.price_type] : WORDS[locale].price
}

export function mainArea(l: Listing, locale: Locale = 'de'): { label: string, value: string } | null {
  const w = WORDS[locale]
  if (l.living_area) return { label: w.living, value: formatArea(l.living_area, locale) }
  if (l.usable_area) return { label: w.usable, value: formatArea(l.usable_area, locale) }
  if (l.plot_area) return { label: w.plot, value: formatArea(l.plot_area, locale) }
  return null
}

export function availableFromText(v: string | null, today = new Date(), locale: Locale = 'de'): string | null {
  if (!v) return null
  const w = WORDS[locale]
  if (/^sofort$/i.test(v.trim())) return w.immediately
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return v
  const date = Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!)
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  if (date <= now) return w.immediately
  if (locale === 'de') return `${m[3]}.${m[2]}.${m[1]}`
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date)
}

export function locationText(l: Listing, locale: Locale = 'de'): string {
  const place = l.district && l.city ? `${l.city}-${l.district}` : (l.city ?? '')
  return l.country !== 'DE' ? `${place}, ${WORDS[locale].country[l.country] ?? l.country}` : place
}
