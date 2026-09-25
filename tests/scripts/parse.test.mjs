import { describe, it, expect } from 'vitest'
import {
  parseGermanNumber, mapPriceType, mapPropertyType, cleanTitle,
  isCommissionFree, normalizeCity, slugify,
} from '../../scripts/lib/parse.mjs'

describe('parseGermanNumber', () => {
  it('parses prices with thousands dots and decimal comma', () => {
    expect(parseGermanNumber('1.290.000,00 EUR')).toBe(1290000)
    expect(parseGermanNumber('89,30 m²')).toBe(89.3)
    expect(parseGermanNumber('3,00')).toBe(3)
    expect(parseGermanNumber('3.690,00 EUR pro Monat')).toBe(3690)
  })
  it('returns null without digits', () => {
    expect(parseGermanNumber('Preis auf Anfrage.')).toBeNull()
    expect(parseGermanNumber(null)).toBeNull()
    expect(parseGermanNumber('')).toBeNull()
  })
})

describe('mapPriceType', () => {
  it('maps legacy labels', () => {
    expect(mapPriceType('Kaufpreis', 'kauf')).toBe('kaufpreis')
    expect(mapPriceType('Kaltmiete', 'miete')).toBe('kaltmiete')
    expect(mapPriceType('Pauschalmiete', 'miete')).toBe('pauschalmiete')
    expect(mapPriceType('Miete pro Monat', 'miete')).toBe('miete_monat')
    expect(mapPriceType('Mietpreis', 'miete')).toBe('miete_monat')
    expect(mapPriceType('Miete pro Jahr', 'miete')).toBe('miete_jahr')
  })
  it('resolves the ambiguous Miet-/Kaufpreis by marketing type', () => {
    expect(mapPriceType('Miet-/Kaufpreis', 'miete')).toBe('miete_monat')
    expect(mapPriceType('Miet-/Kaufpreis', 'kauf')).toBe('kaufpreis')
  })
  it('returns null for unknown labels', () => {
    expect(mapPriceType('Zimmer', 'kauf')).toBeNull()
  })
})

describe('mapPropertyType', () => {
  it('uses the first category', () => {
    expect(mapPropertyType(['kauf-etw'])).toEqual({ property_type: 'wohnung', furnished: false })
    expect(mapPropertyType(['miete-waz', 'miete-wohnung'])).toEqual({ property_type: 'wohnung', furnished: true })
    expect(mapPropertyType(['kauf-12fh', 'kauf-rendite'])).toEqual({ property_type: 'haus', furnished: false })
    expect(mapPropertyType(['anlage-mfmh', 'kauf-rendite'])).toEqual({ property_type: 'anlage', furnished: false })
    expect(mapPropertyType(['miete-gewerbe'])).toEqual({ property_type: 'gewerbe', furnished: false })
    expect(mapPropertyType(['kauf-grundstueck'])).toEqual({ property_type: 'grundstueck', furnished: false })
    expect(mapPropertyType(['kauf-ausland'])).toEqual({ property_type: 'haus', furnished: false })
  })
  it('maps Grand Tower categories', () => {
    expect(mapPropertyType(['deutsch-unmoebliert'])).toEqual({ property_type: 'wohnung', furnished: false })
    expect(mapPropertyType(['deutsch-moebliert'])).toEqual({ property_type: 'wohnung', furnished: true })
  })
  it('returns null type for no categories', () => {
    expect(mapPropertyType([])).toEqual({ property_type: null, furnished: false })
  })
})

describe('cleanTitle', () => {
  it('strips commission suffixes and flags them', () => {
    expect(cleanTitle('Beste Adresse -1A Citylage - Provisionsfrei'))
      .toEqual({ title: 'Beste Adresse – 1A Citylage', commissionFree: true })
    expect(cleanTitle('Exklusives Quartier Prädium - Urbanes Wohnen im Europaviertel - Ohne Käuferprovision'))
      .toEqual({ title: 'Exklusives Quartier Prädium – Urbanes Wohnen im Europaviertel', commissionFree: true })
  })
  it('normalizes dashes, apostrophes, whitespace and decomposed umlauts', () => {
    expect(cleanTitle('Grand Tower - L`Art de Vivre').title).toBe('Grand Tower – L’Art de Vivre')
    expect(cleanTitle('Grand Tower - L´Art de Vivre').title).toBe('Grand Tower – L’Art de Vivre')
    expect(cleanTitle('Modernes\nHaus in Yerres').title).toBe('Modernes Haus in Yerres')
    expect(cleanTitle('Gemütliche Wohnung').title).toBe('Gemütliche Wohnung')
    expect(cleanTitle('Gemütlich').commissionFree).toBe(false)
  })
})

describe('isCommissionFree', () => {
  it('detects commission-free wording', () => {
    expect(isCommissionFree('… provisionsfrei für Käufer')).toBe(true)
    expect(isCommissionFree('ohne Käuferprovision')).toBe(true)
    expect(isCommissionFree('zzgl. Provision')).toBe(false)
  })
})

describe('normalizeCity', () => {
  it('unifies Frankfurt spellings', () => {
    expect(normalizeCity('Frankfurt/M.')).toBe('Frankfurt am Main')
    expect(normalizeCity('Frankfurt/M')).toBe('Frankfurt am Main')
    expect(normalizeCity('Frankfurt')).toBe('Frankfurt am Main')
    expect(normalizeCity('Frankfurt am Main')).toBe('Frankfurt am Main')
    expect(normalizeCity('Kelkheim-Eppenhain')).toBe('Kelkheim-Eppenhain')
    expect(normalizeCity(null)).toBeNull()
  })
})

describe('slugify', () => {
  it('builds ascii slugs', () => {
    expect(slugify('Grand Tower – L’Art de Vivre')).toBe('grand-tower-lart-de-vivre')
    expect(slugify('Gemütliche Maisonette in Fechenheim')).toBe('gemuetliche-maisonette-in-fechenheim')
    expect(slugify('Große Straße 5')).toBe('grosse-strasse-5')
  })
  it('caps length at a word boundary', () => {
    const s = slugify('a'.repeat(30) + ' ' + 'b'.repeat(30) + ' ' + 'c'.repeat(30))
    expect(s.length).toBeLessThanOrEqual(70)
    expect(s.endsWith('-')).toBe(false)
  })
})
