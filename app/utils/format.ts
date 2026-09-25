import type { Listing, MarketingType, PropertyType, PriceType } from '~/types/content'

const NB = ' '
const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 })

export const formatEuro = (n: number) => euro.format(n).replace(/\s/g, NB)
export const formatArea = (n: number) => `${num.format(n)}${NB}m²`
export const formatRooms = (n: number) => `${num.format(n)}${NB}Zi.`

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  wohnung: 'Wohnung', haus: 'Haus', gewerbe: 'Gewerbe', grundstueck: 'Grundstück', anlage: 'Anlageobjekt',
}
export const MARKETING_LABEL: Record<MarketingType, string> = { kauf: 'Kauf', miete: 'Miete' }
const PRICE_TYPE_LABEL: Record<PriceType, string> = {
  kaufpreis: 'Kaufpreis', kaltmiete: 'Kaltmiete', pauschalmiete: 'Pauschalmiete', miete_monat: 'Miete', miete_jahr: 'Jahresmiete',
}
const COUNTRY_LABEL: Record<string, string> = { FR: 'Frankreich' }

export function priceText(l: Listing): string | null {
  if (l.price_on_request) return 'Preis auf Anfrage'
  if (l.price == null) return null
  const v = formatEuro(l.price)
  if (l.marketing_type === 'kauf') return v
  return l.price_type === 'miete_jahr' ? `${v} / Jahr` : `${v} / Monat`
}

// Card price: value and (smaller) rent period separately; compact = short text instead of a number.
export function priceParts(l: Listing): { value: string, unit: string | null, compact: boolean } | null {
  if (l.availability === 'sold') return { value: 'Verkauft', unit: null, compact: true }
  if (l.availability === 'rented') return { value: 'Vermietet', unit: null, compact: true }
  if (l.price_on_request) return { value: 'Preis auf Anfrage', unit: null, compact: true }
  if (l.price == null) return null
  const unit = l.marketing_type === 'kauf' ? null : l.price_type === 'miete_jahr' ? '/ Jahr' : '/ Monat'
  return { value: formatEuro(l.price), unit, compact: false }
}

export function cardFacts(l: Listing): string {
  if (l.living_area) return [l.rooms ? formatRooms(l.rooms) : null, formatArea(l.living_area)].filter(Boolean).join(' · ')
  if (l.usable_area) return `${formatArea(l.usable_area)} Nutzfläche`
  if (l.plot_area) return `${formatArea(l.plot_area)} Grundstück`
  return l.rooms ? formatRooms(l.rooms) : ''
}

export function priceLabel(l: Listing): string {
  return l.price_type ? PRICE_TYPE_LABEL[l.price_type] : 'Preis'
}

export function mainArea(l: Listing): { label: string, value: string } | null {
  if (l.living_area) return { label: 'Wohnfläche', value: formatArea(l.living_area) }
  if (l.usable_area) return { label: 'Nutzfläche', value: formatArea(l.usable_area) }
  if (l.plot_area) return { label: 'Grundstück', value: formatArea(l.plot_area) }
  return null
}

export function availableFromText(v: string | null, today = new Date()): string | null {
  if (!v) return null
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return v
  const date = Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!)
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  return date <= now ? 'sofort' : `${m[3]}.${m[2]}.${m[1]}`
}

export function locationText(l: Listing): string {
  const place = l.district && l.city ? `${l.city}-${l.district}` : (l.city ?? '')
  return l.country !== 'DE' ? `${place}, ${COUNTRY_LABEL[l.country] ?? l.country}` : place
}
