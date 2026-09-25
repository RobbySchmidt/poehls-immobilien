import {
  parseGermanNumber, PRICE_LABELS, mapPriceType, mapPropertyType,
  cleanTitle, isCommissionFree, normalizeCity, slugify,
} from './parse.mjs'
import { fileId } from './files.mjs'

const COUNTRY_BY_LEGACY_ID = { 61: 'FR', 62: 'FR' } // kauf-ausland listings (Yerres, Fouesnant)
const NOISE_LABELS = new Set(['Wohnart', 'pro', 'Miet-/Kaufobjekt', 'Vermarktungsart'])
const DISTRICTS = [
  'Fechenheim', 'Niederrad', 'Europaviertel', 'Sachsenhausen', 'Westend', 'Nordend', 'Bornheim', 'Bockenheim',
  'Riederwald', 'Seckbach', 'Oberrad', 'Museumsufer', 'Ostend', 'Gallus', 'Rödelheim', 'Höchst', 'Bergen-Enkheim',
  'Innenstadt', 'Waldfried', 'Goldstein', 'Schwanheim', 'Preungesheim', 'Eckenheim', 'Ginnheim', 'Praunheim',
]
const USABLE_RE = /Büro|Praxis|Vermietbare|Gesamtfläche|Verkaufsfläche|Produktion/
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function teaserOf(text) {
  const t = text.replace(/\s+/g, ' ').trim()
  if (t.length <= 160) return t
  const cut = t.slice(0, 159)
  return cut.slice(0, cut.lastIndexOf(' ')) + '…'
}

export function toListing(legacy, { source, exposeOk }) {
  const availability = { active: 'available', sold: 'sold', rented: 'rented' }[legacy.status]
  if (!availability) return null

  const categorySlugs = (legacy.categories || []).map((c) => c.slug)
  const facts = new Map(legacy.facts.map((f) => [f.label, f.value]))
  const priceLabel = PRICE_LABELS.find((l) => facts.has(l)) || null

  let marketing_type = categorySlugs.some((s) => s.startsWith('kauf') || s.startsWith('anlage')) ? 'kauf'
    : categorySlugs.some((s) => s.startsWith('miete')) ? 'miete' : null
  if (!marketing_type) marketing_type = priceLabel === 'Kaufpreis' ? 'kauf' : 'miete'

  const { property_type, furnished } = mapPropertyType(categorySlugs)
  const { title, commissionFree } = cleanTitle(legacy.title)
  const descParas = (legacy.description || []).map((p) => p.normalize('NFC').replace(/\s+/g, ' ').trim()).filter(Boolean)

  const labels = [...facts.keys()]
  const livingLabel = labels.find((l) => /^Wohnfläche/.test(l)) || null
  const plotLabel = labels.find((l) => /^Grundstücksfläche/.test(l)) || null
  const usableLabel = labels.find((l) => USABLE_RE.test(l)) || null
  const used = new Set(['Zimmer', 'Gesamtmiete', 'Bezugsfrei ab', livingLabel, plotLabel, usableLabel, priceLabel])
  const features = legacy.facts
    .filter((f) => !used.has(f.label) && !NOISE_LABELS.has(f.label))
    .map((f) => ({ label: f.label, value: f.value.normalize('NFC') }))

  const priceRaw = priceLabel ? facts.get(priceLabel) : null
  const street = legacy.address?.street || null
  const haystack = `${legacy.title} ${legacy.text || ''}`.normalize('NFC')

  const imgs = legacy.images || []
  const coverId = legacy.featured_image?.id ?? imgs[0]?.id ?? null
  const gallery = imgs.filter((i) => i.id !== coverId)

  const expUrl = (legacy.expose_urls || []).find((u) => exposeOk(u))

  return {
    id: source === 'grandtower' ? 100000 + legacy.id : legacy.id,
    legacy_id: legacy.id,
    legacy_url: legacy.url,
    source,
    status: availability === 'available' ? 'published' : 'archived',
    availability,
    slug: null,
    title,
    teaser: teaserOf(descParas[0] || title),
    description: descParas.map((p) => `<p>${esc(p)}</p>`).join(''),
    marketing_type,
    property_type,
    furnished,
    country: COUNTRY_BY_LEGACY_ID[legacy.id] || 'DE',
    street,
    zip: legacy.address?.zip || null,
    city: normalizeCity(legacy.address?.city?.replace(/\s+/g, ' ') || null),
    district: DISTRICTS.find((d) => haystack.includes(d)) || null,
    rooms: parseGermanNumber(facts.get('Zimmer')),
    living_area: livingLabel ? parseGermanNumber(facts.get(livingLabel)) : null,
    usable_area: usableLabel ? parseGermanNumber(facts.get(usableLabel)) : null,
    plot_area: plotLabel ? parseGermanNumber(facts.get(plotLabel)) : null,
    price: /anfrage/i.test(priceRaw || '') ? null : parseGermanNumber(priceRaw),
    price_type: priceLabel ? mapPriceType(priceLabel, marketing_type) : null,
    total_rent: parseGermanNumber(facts.get('Gesamtmiete')),
    price_on_request: /anfrage/i.test(priceRaw || ''),
    commission_free: commissionFree || isCommissionFree(legacy.text || ''),
    available_from: facts.get('Bezugsfrei ab') || null,
    features,
    cover_image: coverId ? fileId(source, coverId) : null,
    images: gallery.map((i, n) => ({ sort: n + 1, directus_files_id: fileId(source, i.id) })),
    expose: expUrl ? { url: expUrl.replace(/^http:/, 'https:') } : null,
    project: source === 'grandtower' || /^europaallee 2$/i.test(street || '') ? 'grand-tower' : null,
    featured: !!legacy.featured,
    date_published: (legacy.published_on || '').slice(0, 10).replace(/\//g, '-'),
  }
}

export function dedupeListings(listings) {
  const byKey = new Map()
  const dropped = []
  for (const l of listings) {
    if (!l.street || l.living_area == null || l.price == null) { byKey.set(Symbol('not-comparable'), l); continue }
    const key = `${l.street.toLowerCase()}|${l.living_area}|${l.price}`
    const prev = byKey.get(key)
    if (!prev) { byKey.set(key, l); continue }
    const [win, lose] = l.images.length > prev.images.length ? [l, prev] : [prev, l]
    byKey.set(key, win)
    dropped.push({ id: lose.id, duplicateOf: win.id })
  }
  const keptSet = new Set(byKey.values())
  return { kept: listings.filter((l) => keptSet.has(l)), dropped }
}

export function assignSlugs(listings) {
  const seen = new Map()
  for (const l of [...listings].sort((a, b) => a.id - b.id)) {
    const base = slugify(l.title)
    const n = (seen.get(base) || 0) + 1
    seen.set(base, n)
    l.slug = n === 1 ? base : `${base}-${n}`
  }
  return listings
}
