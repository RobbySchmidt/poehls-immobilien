import { describe, it, expect } from 'vitest'
import { formatEuro, formatArea, formatRooms, priceText, priceLabel, priceParts, cardFacts, mainArea, availableFromText, locationText } from '~/utils/format'
import type { Listing } from '~/types/content'

const base = (over: Partial<Listing> = {}): Listing => ({
  id: 1, legacy_id: 1, legacy_url: '', source: 'main', status: 'published', availability: 'available',
  slug: 'x', title: 'X', teaser: '', description: '', marketing_type: 'kauf', property_type: 'wohnung',
  furnished: false, country: 'DE', street: null, zip: null, city: 'Frankfurt am Main', district: null,
  rooms: 3, living_area: 89.3, usable_area: null, plot_area: null, price: 845000, price_type: 'kaufpreis',
  total_rent: null, price_on_request: false, commission_free: false, available_from: null, features: [],
  cover_image: null, images: [], expose: null, project: null, featured: false, date_published: '2026-01-01',
  ...over,
})
const NB = ' '

describe('number formats', () => {
  it('formats euro, area and rooms the German way', () => {
    expect(formatEuro(1290000)).toBe(`1.290.000${NB}€`)
    expect(formatArea(89.3)).toBe(`89,3${NB}m²`)
    expect(formatArea(1200)).toBe(`1.200${NB}m²`)
    expect(formatRooms(3)).toBe(`3${NB}Zi.`)
    expect(formatRooms(2.5)).toBe(`2,5${NB}Zi.`)
  })
})

describe('priceText', () => {
  it('shows purchase prices plain', () => {
    expect(priceText(base())).toBe(`845.000${NB}€`)
  })
  it('adds the period for rents', () => {
    expect(priceText(base({ marketing_type: 'miete', price: 1290, price_type: 'kaltmiete' }))).toBe(`1.290${NB}€ / Monat`)
    expect(priceText(base({ marketing_type: 'miete', price: 18500, price_type: 'miete_jahr' }))).toBe(`18.500${NB}€ / Jahr`)
  })
  it('never renders NaN or empty prices', () => {
    expect(priceText(base({ price: null, price_on_request: true }))).toBe('Preis auf Anfrage')
    expect(priceText(base({ price: null, price_type: null }))).toBeNull()
  })
  it('labels price types', () => {
    expect(priceLabel(base())).toBe('Kaufpreis')
    expect(priceLabel(base({ marketing_type: 'miete', price_type: 'pauschalmiete' }))).toBe('Pauschalmiete')
    expect(priceLabel(base({ marketing_type: 'miete', price_type: 'miete_monat' }))).toBe('Miete')
    expect(priceLabel(base({ price_type: null }))).toBe('Preis')
  })
})

describe('priceParts', () => {
  it('splits the rent period off so it can be set smaller', () => {
    expect(priceParts(base())).toEqual({ value: `845.000${NB}€`, unit: null, compact: false })
    expect(priceParts(base({ marketing_type: 'miete', price: 1290, price_type: 'kaltmiete' }))).toEqual({ value: `1.290${NB}€`, unit: '/ Monat', compact: false })
    expect(priceParts(base({ marketing_type: 'miete', price: 18500, price_type: 'miete_jahr' }))).toEqual({ value: `18.500${NB}€`, unit: '/ Jahr', compact: false })
  })
  it('uses compact text for "on request", sold and rented', () => {
    expect(priceParts(base({ price: null, price_on_request: true }))).toEqual({ value: 'Preis auf Anfrage', unit: null, compact: true })
    expect(priceParts(base({ availability: 'sold' }))).toEqual({ value: 'Verkauft', unit: null, compact: true })
    expect(priceParts(base({ availability: 'rented' }))).toEqual({ value: 'Vermietet', unit: null, compact: true })
    expect(priceParts(base({ price: null, price_type: null }))).toBeNull()
  })
})

describe('cardFacts', () => {
  it('shows rooms and living area, or names the kind of area when it is not living space', () => {
    expect(cardFacts(base())).toBe(`3${NB}Zi. · 89,3${NB}m²`)
    expect(cardFacts(base({ rooms: null, living_area: null, usable_area: 1200 }))).toBe(`1.200${NB}m² Nutzfläche`)
    expect(cardFacts(base({ rooms: null, living_area: null, plot_area: 736 }))).toBe(`736${NB}m² Grundstück`)
    expect(cardFacts(base({ rooms: null, living_area: null }))).toBe('')
  })
})

describe('mainArea', () => {
  it('prefers living, then usable, then plot area', () => {
    expect(mainArea(base())).toEqual({ label: 'Wohnfläche', value: `89,3${NB}m²` })
    expect(mainArea(base({ living_area: null, usable_area: 186 }))).toEqual({ label: 'Nutzfläche', value: `186${NB}m²` })
    expect(mainArea(base({ living_area: null, plot_area: 736 }))).toEqual({ label: 'Grundstück', value: `736${NB}m²` })
    expect(mainArea(base({ living_area: null }))).toBeNull()
  })
})

describe('availableFromText', () => {
  const today = new Date(2026, 8, 25)
  it('turns past dates into "sofort"', () => {
    expect(availableFromText('2020-06-01', today)).toBe('sofort')
    expect(availableFromText('2026-09-25', today)).toBe('sofort')
  })
  it('formats future dates German style and passes free text through', () => {
    expect(availableFromText('2026-11-01', today)).toBe('01.11.2026')
    expect(availableFromText('sofort', today)).toBe('sofort')
    expect(availableFromText(null, today)).toBeNull()
  })
})

describe('locationText', () => {
  it('joins district and city', () => {
    expect(locationText(base({ district: 'Fechenheim' }))).toBe('Frankfurt am Main-Fechenheim')
    expect(locationText(base())).toBe('Frankfurt am Main')
    expect(locationText(base({ city: 'Fouesnant', country: 'FR' }))).toBe('Fouesnant, Frankreich')
  })
})
