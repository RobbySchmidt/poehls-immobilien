import { describe, it, expect } from 'vitest'
import { parseFilters, filtersToQuery, applyFilters, sortListings, DEFAULT_FILTERS, activeFilterCount, resultLabel, activeChips } from '~/utils/filters'
import type { Listing } from '~/types/content'

const l = (over: Partial<Listing>): Listing => ({
  id: 1, legacy_id: 1, legacy_url: '', source: 'main', status: 'published', availability: 'available',
  slug: 'x', title: 'X', teaser: '', description: '', marketing_type: 'kauf', property_type: 'wohnung',
  furnished: false, country: 'DE', street: null, zip: null, city: null, district: null, rooms: 3,
  living_area: 80, usable_area: null, plot_area: null, price: 400000, price_type: 'kaufpreis', total_rent: null,
  price_on_request: false, commission_free: false, available_from: null, features: [], cover_image: null,
  images: [], expose: null, project: null, featured: false, date_published: '2026-01-01', ...over,
})

describe('parseFilters', () => {
  it('reads valid params', () => {
    expect(parseFilters({ typ: 'miete', art: 'haus', zimmer: '3', preis: '2000', sort: 'preis-auf' }))
      .toEqual({ typ: 'miete', art: 'haus', zimmer: 3, preis: 2000, sort: 'preis-auf' })
  })
  it('ignores garbage and falls back to defaults', () => {
    expect(parseFilters({ typ: 'x', art: ['wohnung', 'haus'], zimmer: 'abc', preis: '-5', sort: 'zufall' }))
      .toEqual({ ...DEFAULT_FILTERS, art: 'wohnung' })
    expect(parseFilters({})).toEqual(DEFAULT_FILTERS)
  })
})

describe('filtersToQuery', () => {
  it('omits defaults and round-trips', () => {
    expect(filtersToQuery(DEFAULT_FILTERS)).toEqual({})
    const f = { typ: 'kauf' as const, art: null, zimmer: 2, preis: null, sort: 'preis-ab' as const }
    expect(parseFilters(filtersToQuery(f))).toEqual(f)
  })
})

describe('applyFilters', () => {
  const ls = [
    l({ id: 1, marketing_type: 'kauf', property_type: 'wohnung', rooms: 3, price: 400000 }),
    l({ id: 2, marketing_type: 'miete', property_type: 'wohnung', rooms: 2, price: 1290, price_type: 'kaltmiete' }),
    l({ id: 3, marketing_type: 'miete', property_type: 'gewerbe', rooms: null, price: null, price_on_request: true, price_type: 'miete_monat' }),
    l({ id: 4, marketing_type: 'miete', property_type: 'grundstueck', rooms: null, price: 18000, price_type: 'miete_jahr' }),
  ]
  const ids = (f: Partial<typeof DEFAULT_FILTERS>) => applyFilters(ls, { ...DEFAULT_FILTERS, ...f }).map((x) => x.id)

  it('filters by marketing and property type', () => {
    expect(ids({ typ: 'miete' })).toEqual([2, 3, 4])
    expect(ids({ typ: 'miete', art: 'gewerbe' })).toEqual([3])
  })
  it('treats missing rooms as not matching a rooms filter', () => {
    expect(ids({ zimmer: 2 })).toEqual([1, 2])
  })
  it('excludes listings without price from a price filter and compares yearly rent per month', () => {
    expect(ids({ typ: 'miete', preis: 1500 })).toEqual([2, 4])
    expect(ids({ typ: 'miete', preis: 1000 })).toEqual([])
  })
})

describe('sortListings', () => {
  const ls = [
    l({ id: 1, price: 500, date_published: '2026-01-01' }),
    l({ id: 2, price: null, price_on_request: true, date_published: '2026-03-01' }),
    l({ id: 3, price: 100, date_published: '2026-02-01' }),
  ]
  it('sorts newest first by default', () => {
    expect(sortListings(ls, 'neu').map((x) => x.id)).toEqual([2, 3, 1])
  })
  it('sorts by price with unpriced listings last in both directions', () => {
    expect(sortListings(ls, 'preis-auf').map((x) => x.id)).toEqual([3, 1, 2])
    expect(sortListings(ls, 'preis-ab').map((x) => x.id)).toEqual([1, 3, 2])
  })
})

describe('resultLabel', () => {
  it('speaks of matches when filters are active, with correct singular', () => {
    expect(resultLabel(12, true)).toBe('12 passende Angebote')
    expect(resultLabel(1, true)).toBe('1 passendes Angebot')
    expect(resultLabel(0, true)).toBe('Keine passenden Angebote')
  })
  it('is neutral without filters', () => {
    expect(resultLabel(59, false)).toBe('59 Angebote')
    expect(resultLabel(1, false)).toBe('1 Angebot')
  })
})

describe('activeChips', () => {
  it('describes each active filter with the patch that removes it', () => {
    const NB = ' '
    expect(activeChips({ typ: 'miete', art: 'wohnung', zimmer: 3, preis: 1500, sort: 'preis-ab' })).toEqual([
      { key: 'typ', label: 'Mieten', remove: { typ: null, preis: null } },
      { key: 'art', label: 'Wohnung', remove: { art: null } },
      { key: 'zimmer', label: 'ab 3 Zimmer', remove: { zimmer: null } },
      { key: 'preis', label: `bis 1.500${NB}€`, remove: { preis: null } },
    ])
    expect(activeChips(DEFAULT_FILTERS)).toEqual([])
  })
})

describe('activeFilterCount', () => {
  it('counts non-default filters except sort', () => {
    expect(activeFilterCount({ ...DEFAULT_FILTERS, typ: 'kauf', zimmer: 2, sort: 'preis-ab' })).toBe(2)
  })
})
