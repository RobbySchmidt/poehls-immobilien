#!/usr/bin/env node
// Legacy scrape (data/legacy) → content/generated/*.json + public/media/*.webp
import fs from 'node:fs'
import path from 'node:path'
import { toListing, dedupeListings, assignSlugs } from './lib/listings.mjs'
import { fileId, altText } from './lib/files.mjs'
import { cleanLegacyHtml, withAnchors } from './lib/legal.mjs'
import { processImage, processLogo } from './lib/images.mjs'
import { looksLikeFloorPlan, orderPhotosFirst } from './lib/floorplan.mjs'
import { withTranslations } from './lib/translations.mjs'
import sharp from 'sharp'

const ROOT = path.resolve(import.meta.dirname, '..')
const L = (p) => path.join(ROOT, 'data', 'legacy', p)
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const write = (rel, data) => {
  const f = path.join(ROOT, rel)
  fs.mkdirSync(path.dirname(f), { recursive: true })
  fs.writeFileSync(f, JSON.stringify(data, null, 2) + '\n')
}
const MEDIA = path.join(ROOT, 'public', 'media')
fs.mkdirSync(MEDIA, { recursive: true })

const manual = (n) => read(path.join(ROOT, 'content', 'manual', `${n}.json`))
const mood = manual('mood')
const gtManual = manual('grand-tower')
const company = manual('company')

const legacy = {
  main: { listings: read(L('listings.json')), pages: read(L('pages.json')) },
  grandtower: { listings: read(L('grandtower/listings.json')), pages: read(L('grandtower/pages.json')) },
}
const exposeOkUrls = new Set(read(L('documents.json')).filter((d) => d.downloaded).map((d) => d.url_original))
const exposeOk = (u) => exposeOkUrls.has(u)

// ---- image registry: fileId -> legacy image record ----
const registry = new Map()
for (const source of ['main', 'grandtower']) {
  for (const l of legacy[source].listings) for (const img of [l.featured_image, ...l.images].filter(Boolean)) registry.set(fileId(source, img.id), { ...img, source })
  for (const p of legacy[source].pages) for (const img of p.images) registry.set(fileId(source, img.id), { ...img, source })
}
const cropIds = new Set(legacy[mood.crop_left.source].pages.find((p) => p.slug === mood.crop_left.page).images.map((i) => fileId(mood.crop_left.source, i.id)))

// ---- listings ----
const warnings = []
let listings = []
for (const source of ['main', 'grandtower']) {
  for (const l of legacy[source].listings) {
    const rec = toListing(l, { source, exposeOk })
    if (!rec) continue
    if (!rec.property_type) warnings.push(`listing ${rec.id}: no property_type (categories: ${l.categories.map((c) => c.slug)})`)
    if (l.categories.length > 1) warnings.push(`listing ${rec.id}: multiple categories ${l.categories.map((c) => c.slug)} → ${rec.property_type}`)
    listings.push(rec)
  }
}
const { kept, dropped } = dedupeListings(listings)
listings = assignSlugs(kept).sort((a, b) => b.date_published.localeCompare(a.date_published) || b.id - a.id)

// ---- project ----
const gtPage = legacy[gtManual.images_from.source].pages.find((p) => p.slug === gtManual.images_from.page)
const { images_from, ...gtRest } = gtManual
const project = { ...gtRest, images: gtPage.images.map((i) => fileId(images_from.source, i.id)) }

// ---- files ----
const titleFor = new Map()
for (const l of listings) {
  const all = [l.cover_image, ...l.images.map((i) => i.directus_files_id)].filter(Boolean)
  all.forEach((id, n) => titleFor.set(id, altText(l.title, n + 1, all.length)))
}
project.images.forEach((id, n) => { if (!titleFor.has(id)) titleFor.set(id, altText('Grand Tower Frankfurt', n + 1, project.images.length)) })

const needed = new Set([
  ...listings.flatMap((l) => [l.cover_image, ...l.images.map((i) => i.directus_files_id)]).filter(Boolean),
  ...project.images, project.mood_day, project.mood_night,
  ...mood.hero.day, ...mood.hero.night, company.portrait,
])

const files = []
let done = 0
for (const id of needed) {
  const rec = registry.get(id)
  if (!rec) { warnings.push(`file ${id}: not found in legacy registry`); continue }
  const input = L(rec.file)
  if (!fs.existsSync(input)) { warnings.push(`file ${id}: missing ${rec.file} (run scrape-legacy.mjs)`); continue }
  const { width, height, variants } = await processImage({ input, id, outDir: MEDIA, cropLeft: cropIds.has(id) ? mood.crop_left.fraction : 0 })
  files.push({
    id,
    title: titleFor.get(id) || mood.alts.de[id] || '',
    description: mood.alts.de[id] || titleFor.get(id) || '',
    width, height,
    focal_point: rec.focal_point || null,
    variants,
  })
  if (++done % 100 === 0) console.log(`images ${done}/${needed.size}`)
}
const knownFiles = new Set(files.map((f) => f.id))

// Floor plans make poor covers → photos first, plans at the end of the gallery.
const plans = new Set(manual('floor-plans').ids)
for (const f of files) {
  const thumb = path.join(MEDIA, `${f.id}-${Math.min(...f.variants)}.webp`)
  const { data } = await sharp(thumb).resize(64, 64, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  if (looksLikeFloorPlan(data)) plans.add(f.id)
}
const reordered = []
for (const l of listings) {
  const ids = [l.cover_image, ...l.images.map((i) => i.directus_files_id)].filter((id) => id && knownFiles.has(id))
  const ordered = orderPhotosFirst(ids, plans)
  if (ordered[0] !== ids[0]) reordered.push(l.id)
  l.cover_image = ordered[0] ?? null
  l.images = ordered.slice(1).map((id, n) => ({ sort: n + 1, directus_files_id: id }))
}

// ---- legal ----
const legalPage = (slug, title) => {
  const p = legacy.main.pages.find((x) => x.slug === slug)
  return { title, ...withAnchors(cleanLegacyHtml(p.html)) }
}
const legal = {
  datenschutz: legalPage('disclaimer-datenschutz', 'Datenschutz'),
  agb: legalPage('agb', 'Allgemeine Geschäftsbedingungen'),
}

// ---- social preview image (1200×630 JPEG, widest support in messengers) ----
{
  const heroId = mood.hero.day[0]
  const rec = registry.get(heroId)
  const master = await sharp(L(rec.file)).rotate().toBuffer()
  const { width, height } = await sharp(master).metadata()
  const left = cropIds.has(heroId) ? Math.round(width * mood.crop_left.fraction) : 0
  await sharp(master).extract({ left, top: 0, width: width - left, height })
    .resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 82 }).toFile(path.join(ROOT, 'public', 'og.jpg'))
}

// ---- logo ----
fs.mkdirSync(path.join(ROOT, 'public', 'brand'), { recursive: true })
await processLogo(L('media/brand/logo-source.jpg'), path.join(ROOT, 'public', 'brand', 'logo.png'))

// ---- write ----
// ---- translations (directus style) ----
const enListings = read(path.join(ROOT, 'content', 'manual', 'translations', 'listings.en.json'))
const missingTranslations = []
listings = listings.map((l) => {
  const { listing, missing } = withTranslations(l, enListings)
  if (missing) missingTranslations.push(l.id)
  return listing
})
if (missingTranslations.length) warnings.push(`missing english translation: ${missingTranslations.join(', ')}`)

write('content/generated/listings.json', listings)
write('content/generated/files.json', files.sort((a, b) => a.id.localeCompare(b.id)))
write('content/generated/projects.json', [project])
write('content/generated/legal.json', legal)
const count = (f) => listings.filter(f).length
write('content/generated/build-report.json', {
  listings: listings.length,
  available: count((l) => l.availability === 'available'),
  sold: count((l) => l.availability === 'sold'),
  rented: count((l) => l.availability === 'rented'),
  grand_tower: count((l) => l.project === 'grand-tower'),
  files: files.length,
  floor_plans: plans.size,
  covers_replaced_by_photo: reordered,
  duplicates_dropped: dropped,
  missing_translations: missingTranslations,
  warnings,
})
console.log(`listings ${listings.length} (dropped ${dropped.length} duplicates), files ${files.length}, warnings ${warnings.length}`)
