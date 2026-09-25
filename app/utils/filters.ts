import type { Listing, MarketingType, PropertyType } from '~/types/content'
import { PROPERTY_TYPE_LABEL, formatEuro } from './format'

export type SortKey = 'neu' | 'preis-auf' | 'preis-ab'
export interface Filters {
  typ: MarketingType | null
  art: PropertyType | null
  zimmer: number | null
  preis: number | null
  sort: SortKey
}

export const DEFAULT_FILTERS: Filters = { typ: null, art: null, zimmer: null, preis: null, sort: 'neu' }
const TYPES: MarketingType[] = ['kauf', 'miete']
const ARTS: PropertyType[] = ['wohnung', 'haus', 'gewerbe', 'grundstueck', 'anlage']
const SORTS: SortKey[] = ['neu', 'preis-auf', 'preis-ab']
export const PRICE_STEPS: Record<MarketingType, number[]> = {
  kauf: [250000, 500000, 750000, 1000000, 1500000],
  miete: [1000, 1500, 2000, 3000, 5000],
}
export const ROOM_STEPS = [1, 2, 3, 4, 5]

function first(v: unknown): string | undefined {
  const x = Array.isArray(v) ? v[0] : v
  return typeof x === 'string' ? x : undefined
}
function positiveInt(v: string | undefined): number | null {
  if (!v || !/^\d+$/.test(v)) return null
  const n = Number(v)
  return n > 0 ? n : null
}
function oneOf<T extends string>(v: string | undefined, list: readonly T[]): T | null {
  return v && (list as readonly string[]).includes(v) ? (v as T) : null
}

export function parseFilters(q: Record<string, unknown>): Filters {
  return {
    typ: oneOf(first(q.typ), TYPES),
    art: oneOf(first(q.art), ARTS),
    zimmer: positiveInt(first(q.zimmer)),
    preis: positiveInt(first(q.preis)),
    sort: oneOf(first(q.sort), SORTS) ?? 'neu',
  }
}

export function filtersToQuery(f: Filters): Record<string, string> {
  const q: Record<string, string> = {}
  if (f.typ) q.typ = f.typ
  if (f.art) q.art = f.art
  if (f.zimmer) q.zimmer = String(f.zimmer)
  if (f.preis) q.preis = String(f.preis)
  if (f.sort !== 'neu') q.sort = f.sort
  return q
}

export function comparablePrice(l: Listing): number | null {
  if (l.price_on_request || l.price == null) return null
  return l.price_type === 'miete_jahr' ? l.price / 12 : l.price
}

export function applyFilters(ls: Listing[], f: Filters): Listing[] {
  return ls.filter((l) => {
    if (f.typ && l.marketing_type !== f.typ) return false
    if (f.art && l.property_type !== f.art) return false
    if (f.zimmer && (l.rooms ?? 0) < f.zimmer) return false
    if (f.preis) {
      const p = comparablePrice(l)
      if (p == null || p > f.preis) return false
    }
    return true
  })
}

export function sortListings(ls: Listing[], sort: SortKey): Listing[] {
  const copy = [...ls]
  if (sort === 'neu') return copy.sort((a, b) => b.date_published.localeCompare(a.date_published) || b.id - a.id)
  const dir = sort === 'preis-auf' ? 1 : -1
  return copy.sort((a, b) => {
    const pa = comparablePrice(a)
    const pb = comparablePrice(b)
    if (pa == null && pb == null) return 0
    if (pa == null) return 1
    if (pb == null) return -1
    return (pa - pb) * dir
  })
}

export function resultLabel(count: number, filtered: boolean): string {
  if (!filtered) return `${count} ${count === 1 ? 'Angebot' : 'Angebote'}`
  if (count === 0) return 'Keine passenden Angebote'
  return count === 1 ? '1 passendes Angebot' : `${count} passende Angebote`
}

export interface FilterChip { key: keyof Filters, label: string, remove: Partial<Filters> }

export function activeChips(f: Filters): FilterChip[] {
  const chips: FilterChip[] = []
  if (f.typ) chips.push({ key: 'typ', label: f.typ === 'kauf' ? 'Kaufen' : 'Mieten', remove: { typ: null, preis: null } })
  if (f.art) chips.push({ key: 'art', label: PROPERTY_TYPE_LABEL[f.art], remove: { art: null } })
  if (f.zimmer) chips.push({ key: 'zimmer', label: `ab ${f.zimmer} Zimmer`, remove: { zimmer: null } })
  if (f.preis) chips.push({ key: 'preis', label: `bis ${formatEuro(f.preis)}`, remove: { preis: null } })
  return chips
}

export function activeFilterCount(f: Filters): number {
  return [f.typ, f.art, f.zimmer, f.preis].filter((v) => v != null).length
}
