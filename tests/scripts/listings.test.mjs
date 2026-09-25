import { describe, it, expect } from 'vitest'
import { toListing, dedupeListings, assignSlugs } from '../../scripts/lib/listings.mjs'

const img = (id) => ({ id, file: `media/images/${id}.jpg`, width: 1600, height: 1067, focal_point: { x: 50, y: 50 } })

const legacy = (over = {}) => ({
  id: 170,
  title: 'Gemütliche Maisonettewohnung mitten in Fechenheim - Eigennutzung oder Kapitalanlage',
  legacy_url: 'https://www.poehlsimmobilien.de/objekte/2026/07/x/',
  published_on: '2026/07/27 15:03:42',
  status: 'active',
  categories: [{ slug: 'kauf-etw' }],
  featured: true,
  text: 'Gemütliche Maisonettewohnung (3. OG und DG) in gepflegtem Altbau im Stadtteil Fechenheim.',
  address: { street: 'Gründenseestr. 23', zip: '60386', city: 'Frankfurt' },
  facts: [
    { label: 'Zimmer', value: '3,00' },
    { label: 'Wohnfläche ca.', value: '74,00 m²' },
    { label: 'Kaufpreis', value: '249.000,00 EUR' },
  ],
  description: ['Gemütliche Maisonettewohnung (3. OG und DG) in gepflegtem Altbau im Stadtteil Fechenheim.', 'Ruhige Wohngegend.'],
  expose_urls: ['http://www.poehlsimmobilien.de/exposes/K-170093712_Frankfurt.pdf'],
  featured_image: img(2623),
  images: [img(2623), img(2624), img(2625)],
  ...over,
})

const ok = () => true

describe('toListing', () => {
  it('maps a regular purchase listing', () => {
    const l = toListing(legacy(), { source: 'main', exposeOk: ok })
    expect(l).toMatchObject({
      id: 170, legacy_id: 170, legacy_url: 'https://www.poehlsimmobilien.de/objekte/2026/07/x/', source: 'main', status: 'published', availability: 'available',
      title: 'Gemütliche Maisonettewohnung mitten in Fechenheim – Eigennutzung oder Kapitalanlage',
      marketing_type: 'kauf', property_type: 'wohnung', furnished: false, country: 'DE',
      street: 'Gründenseestr. 23', zip: '60386', city: 'Frankfurt am Main', district: 'Fechenheim',
      rooms: 3, living_area: 74, usable_area: null, plot_area: null,
      price: 249000, price_type: 'kaufpreis', total_rent: null, price_on_request: false,
      commission_free: false, available_from: null, features: [],
      cover_image: 'm-2623', project: null, featured: true, date_published: '2026-07-27',
      expose: { url: 'https://www.poehlsimmobilien.de/exposes/K-170093712_Frankfurt.pdf' },
    })
    expect(l.images).toEqual([{ sort: 1, directus_files_id: 'm-2624' }, { sort: 2, directus_files_id: 'm-2625' }])
    expect(l.description).toBe('<p>Gemütliche Maisonettewohnung (3. OG und DG) in gepflegtem Altbau im Stadtteil Fechenheim.</p><p>Ruhige Wohngegend.</p>')
    expect(l.teaser.length).toBeLessThanOrEqual(160)
  })

  it('maps rent listings with total rent, availability date and extra features', () => {
    const l = toListing(legacy({
      id: 110, categories: [{ slug: 'miete-waz' }],
      facts: [
        { label: 'Wohnart', value: 'Wohnung' },
        { label: 'Pauschalmiete', value: '2.760,00 EUR' },
        { label: 'pro', value: 'Monat' },
        { label: 'Bezugsfrei ab', value: '2020-06-01' },
        { label: 'Gesamtmiete', value: '2.900,00 EUR' },
        { label: 'Etage', value: '3. OG' },
      ],
    }), { source: 'main', exposeOk: ok })
    expect(l).toMatchObject({
      marketing_type: 'miete', furnished: true, price: 2760, price_type: 'pauschalmiete',
      total_rent: 2900, available_from: '2020-06-01', rooms: null,
    })
    expect(l.features).toEqual([{ label: 'Etage', value: '3. OG' }])
  })

  it('flags price on request and usable area for commercial', () => {
    const l = toListing(legacy({
      id: 158, categories: [{ slug: 'miete-gewerbe' }],
      facts: [
        { label: 'Gesamtfläche', value: '1.200,00 m²' },
        { label: 'Miete pro Monat', value: 'Preis auf Anfrage' },
        { label: 'Objekt-Nr.', value: 'Halle 5' },
      ],
    }), { source: 'main', exposeOk: ok })
    expect(l).toMatchObject({ price: null, price_type: 'miete_monat', price_on_request: true, usable_area: 1200, living_area: null })
    expect(l.features).toEqual([{ label: 'Objekt-Nr.', value: 'Halle 5' }])
  })

  it('handles archive status, commission-free titles, dead exposés, foreign country', () => {
    const sold = toListing(legacy({ status: 'sold' }), { source: 'main', exposeOk: () => false })
    expect(sold).toMatchObject({ status: 'archived', availability: 'sold', expose: null })
    const free = toListing(legacy({ title: 'Architektenhaus mit großem Grundstück - Provisionsfrei' }), { source: 'main', exposeOk: ok })
    expect(free).toMatchObject({ title: 'Architektenhaus mit großem Grundstück', commission_free: true })
    const fr = toListing(legacy({ id: 62, categories: [{ slug: 'kauf-ausland' }], address: { street: null, zip: '29170', city: 'Fouesnant' } }), { source: 'main', exposeOk: ok })
    expect(fr).toMatchObject({ country: 'FR', property_type: 'haus' })
  })

  it('assigns Grand Tower project and offset ids for the grandtower source', () => {
    const gt = toListing(legacy({
      id: 121, categories: [{ slug: 'deutsch-unmoebliert' }],
      address: { street: 'Europaallee 2', zip: '60327', city: 'Frankfurt' },
      facts: [{ label: 'Zimmer', value: '2,00' }, { label: 'Wohnfläche ca.', value: '58,20 m²' }, { label: 'Kaltmiete', value: '1.290,00 EUR (zzgl. Nebenkosten)' }, { label: 'Gesamtmiete', value: '1.740,00 EUR' }],
      featured_image: null, images: [img(1904), img(1896)],
    }), { source: 'grandtower', exposeOk: ok })
    expect(gt).toMatchObject({ id: 100121, legacy_id: 121, project: 'grand-tower', marketing_type: 'miete', price: 1290, total_rent: 1740, cover_image: 'gt-1904' })
    expect(gt.images).toEqual([{ sort: 1, directus_files_id: 'gt-1896' }])
    const mainGt = toListing(legacy({ address: { street: 'Europaallee 2', zip: '60327', city: 'Frankfurt' } }), { source: 'main', exposeOk: ok })
    expect(mainGt.project).toBe('grand-tower')
  })

  it('sets a district only for Frankfurt and does not match words like "Westendlage" elsewhere', () => {
    const ni = toListing(legacy({ title: 'Villa in bester Westendlage', text: '', address: { street: null, zip: '63263', city: 'Neu Isenburg' } }), { source: 'main', exposeOk: ok })
    expect(ni).toMatchObject({ city: 'Neu-Isenburg', district: null })
    const gen = toListing(legacy({ title: 'EDEN Tower', text: 'in zentraler Lage des Europaviertels' }), { source: 'main', exposeOk: ok })
    expect(gen.district).toBe('Europaviertel')
  })

  it('skips placeholders and unlisted entries', () => {
    expect(toListing(legacy({ status: 'placeholder' }), { source: 'main', exposeOk: ok })).toBeNull()
    expect(toListing(legacy({ status: 'unlisted' }), { source: 'main', exposeOk: ok })).toBeNull()
  })
})

describe('dedupeListings', () => {
  it('keeps the entry with more images when street, area and price match', () => {
    const a = { id: 123, street: 'Europaallee 2', living_area: 66.7, price: 1780, images: [1, 2], cover_image: 'x' }
    const b = { id: 100117, street: 'Europaallee 2', living_area: 66.7, price: 1780, images: [1, 2, 3], cover_image: 'y' }
    const c = { id: 1, street: 'Europaallee 2', living_area: 58.2, price: 1290, images: [], cover_image: 'z' }
    const { kept, dropped } = dedupeListings([a, b, c])
    expect(kept.map((l) => l.id)).toEqual([100117, 1])
    expect(dropped).toEqual([{ id: 123, duplicateOf: 100117 }])
  })
  it('keeps the first entry on an image-count tie', () => {
    const a = { id: 123, street: 'Europaallee 2', living_area: 66.7, price: 1780, images: [1, 2] }
    const b = { id: 100117, street: 'Europaallee 2', living_area: 66.7, price: 1780, images: [1, 2] }
    expect(dedupeListings([a, b]).dropped).toEqual([{ id: 100117, duplicateOf: 123 }])
  })
  it('never merges listings whose area or price is unknown', () => {
    const hall = { id: 158, street: 'Versbachstraße 3-7', living_area: null, price: null, images: [1] }
    const plot = { id: 157, street: 'Versbachstraße 3-7', living_area: null, price: null, images: [1, 2] }
    expect(dedupeListings([plot, hall]).kept).toHaveLength(2)
  })
  it('never merges listings without street', () => {
    const a = { id: 1, street: null, living_area: 50, price: 100, images: [] }
    const b = { id: 2, street: null, living_area: 50, price: 100, images: [] }
    expect(dedupeListings([a, b]).kept).toHaveLength(2)
  })
})

describe('assignSlugs', () => {
  it('makes slugs unique in id order', () => {
    const ls = assignSlugs([
      { id: 118, title: 'Grand Tower – L’Art de Vivre' },
      { id: 117, title: 'Grand Tower – L’Art de Vivre' },
      { id: 5, title: 'Anderes' },
    ])
    expect(ls.find((l) => l.id === 117).slug).toBe('grand-tower-lart-de-vivre')
    expect(ls.find((l) => l.id === 118).slug).toBe('grand-tower-lart-de-vivre-2')
    expect(ls.find((l) => l.id === 5).slug).toBe('anderes')
  })
})
