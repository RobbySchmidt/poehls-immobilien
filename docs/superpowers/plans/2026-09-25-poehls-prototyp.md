# Pöhls Immobilien – Pitch-Prototyp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Einen vollständigen, statisch generierten Website-Prototyp für Pöhls Immobilien bauen (Tag/Nacht-Design, echte Objekte aus der Legacy-Seite), bereit für Netlify.

**Architecture:** Ein Node-Build-Skript (`scripts/build-content.mjs`) wandelt die gescrapten Legacy-Daten (`data/legacy/`) in Directus-förmige JSONs (`content/generated/`) und WebP-Bildvarianten (`public/media/`) um; handgeschriebene Inhalte liegen in `content/manual/`. Nuxt 4 importiert die JSONs statisch über eine einzige Zugriffsschicht (`app/composables/useContent.ts`) und prerendert alle Seiten (`nuxt generate`). Tag/Nacht über `.dark`-Klasse + Token-Scope.

**Tech Stack:** Nuxt 4, Vue 3, Tailwind CSS v4, shadcn-vue (reka-ui), lucide (`@lucide/vue`), sharp, Vitest, puppeteer-core, Netlify CLI. Paketmanager: **yarn 1.22**.

**Spec:** `docs/superpowers/specs/2026-09-25-poehls-prototyp-design.md` (vor jeder Task lesen – die Spec ist verbindlich; bei Widerspruch gewinnt die Spec, dann nachfragen).

## Global Constraints

- Sprache der Oberfläche: Deutsch, `lang="de"`, typografische Anführungszeichen („ "), Halbgeviertstrich (–), geschütztes Leerzeichen vor Einheiten (`\u00A0m²`, `\u00A0€`).
- Keine Hex-/Arbitrary-Farben in Templates – nur Token-Klassen (`bg-background`, `text-muted-foreground`, `bg-primary` …).
- Schrift: nur Schibsted Grotesk Variable (selbst gehostet, `@fontsource-variable/schibsted-grotesk`), Gewichte **400 und 600**. Kein Request an `fonts.googleapis.com`.
- Pro Ansicht max. **ein** gefüllter Primär-Button. Haupt-CTAs `h-12 px-7 text-base`.
- Button-Beschriftungen exakt (gleiche Aktion = gleicher Name): „Angebote ansehen" (auch „Alle <n> Angebote ansehen" / „<n> Angebote ansehen"), „Objekt anfragen", „Besichtigung anfragen", „Grand Tower entdecken", „Nachricht senden", „Nachricht schreiben", „Exposé herunterladen", „Anrufen", „Leistungen ansehen", „Filter zurücksetzen", „Suchauftrag besprechen", „Zur Startseite".
- Karten: Kante **oder** Schatten, nie beides; keine Karte in Karte; kein Bild-Zoom beim Hover.
- Motion: nur Tag/Nacht-Überblendung (300 ms) + einmaliger Hero-Einstieg; Hover/Fokus 150 ms; nichts bei `prefers-reduced-motion`. Kein Autoplay, keine Scroll-Reveals.
- Grand-Tower-Bereiche und Footer tragen die Klasse `dark` (immer Nacht).
- Company-Daten (Adresse Dreieich) **nur** aus `content/manual/company.json`, nie aus der Grand-Tower-Legacy (Neu-Isenburg).
- `noindex` dreifach: `robots.txt`, `<meta name="robots" content="noindex, nofollow">`, Header `X-Robots-Tag`.
- Footer-Zeile: „Konzeptentwurf von rhowerk" → `https://rhowerk.de/`.
- Kontaktformular sendet **nichts** (nur Validierung + Erfolgsmeldung).
- Container überall: Utility `container-page` (max. 80rem, Rand 1rem / ab md 2rem).
- Nach jeder Task mit Code-Änderung: `yarn test` grün; ab Task 7 zusätzlich `yarn generate` fehlerfrei.
- Commits auf Branch `prototyp` (nie direkt auf `main`), Commit-Messages enden mit `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

## Review Focus

1. **Geteilte Filter-Links** (`/angebote?typ=miete&art=wohnung`, auch mit Müll wie `?zimmer=abc&typ=x`): Nach dem Laden zeigt die Seite genau die gefilterten Objekte, ungültige Parameter werden ignoriert, kein Hydration-Fehler. → Tests in Task 6 (`parseFilters` tolerant), Hydration-Schutz in Task 10, Browser-Check in Task 16.
2. **Preis-Sonderfälle** („Preis auf Anfrage", `price: null`, Jahresmiete, Pauschalmiete): Karte und Detailseite zeigen nie „NaN €" oder eine leere Preiszeile; Preisfilter blendet Objekte ohne Preis aus, Jahresmiete wird für den Vergleich durch 12 geteilt. → Tests in Task 5 (`priceText`) und Task 6 (`applyFilters`).
3. **Veraltetes „Bezugsfrei ab"** (`2020-06-01`): wird als „sofort" angezeigt, künftige Daten als `TT.MM.JJJJ`. → Test in Task 5 (`availableFromText`).
4. **Gespeicherter Nachtmodus / blockiertes localStorage**: erster Paint bereits dunkel (kein Aufblitzen); ohne localStorage (Privatmodus) kein JS-Fehler, Fallback Systemeinstellung. → Head-Skript in Task 7 mit try/catch, Screenshot-Check in Task 16.
5. **Kontaktlink mit unbekanntem Objekt** (`/kontakt?objekt=gibts-nicht`): Formular funktioniert normal, kein Objektbezug, kein Fehler. → Test in Task 14 (`resolveInquiry`).

---

## File Structure

```
content/
  manual/            # handgeschrieben, wird vom Build NIE überschrieben
    company.json  home.json  about.json  services.json  grand-tower.json  mood.json
  generated/         # vom Build erzeugt (in Git)
    listings.json  files.json  projects.json  legal.json  build-report.json
public/
  brand/logo.png     # vom Build erzeugt (in Git)
  media/             # vom Build erzeugt (gitignored)
  robots.txt
scripts/
  build-content.mjs          # Orchestrierung
  lib/parse.mjs              # Zahlen, Preisarten, Objektarten, Titel, Slugs
  lib/listings.mjs           # Legacy-Inserat → Listing, Dubletten, Slugs
  lib/files.mjs              # Datei-IDs, Varianten, Alt-Texte
  lib/legal.mjs              # Legacy-HTML säubern, Anker/Inhaltsverzeichnis
  lib/images.mjs             # sharp: Zuschnitt, WebP-Varianten, Logo
  qa/check-contrast.mjs  qa/check-links.mjs  qa/screenshots.mjs
tests/
  scripts/parse.test.mjs  listings.test.mjs  files.test.mjs  legal.test.mjs
  app/format.test.ts  filters.test.ts  asset.test.ts  contact.test.ts
app/
  types/content.ts
  utils/format.ts  filters.ts  asset.ts  contact.ts
  composables/useContent.ts  useTheme.ts
  components/
    ResponsiveImage.vue  MoodImage.vue
    site/Header.vue  Footer.vue  Logo.vue  ThemeToggle.vue  SectionHeading.vue
    listing/Card.vue  QuickSearch.vue  Filters.vue  Gallery.vue  Lightbox.vue  ContactBox.vue  Detail.vue
    home/Hero.vue  Latest.vue  GrandTower.vue  Owners.vue  Personal.vue  References.vue  ContactBand.vue
    contact/Form.vue
  layouts/default.vue
  pages/index.vue  angebote/index.vue  angebote/[slug].vue  referenzen/index.vue  referenzen/[slug].vue
        grand-tower.vue  leistungen.vue  ueber-uns.vue  kontakt.vue  impressum.vue  datenschutz.vue  agb.vue
  error.vue  app.vue
  assets/css/tailwind.css
nuxt.config.ts  netlify.toml  vitest.config.ts  package.json
```

Nuxt-Komponentennamen ergeben sich aus dem Pfad: `components/site/Header.vue` → `<SiteHeader>`, `components/listing/Card.vue` → `<ListingCard>`, `components/home/Hero.vue` → `<HomeHero>`. shadcn-Komponenten (Präfix leer) heißen `<Button>`, `<Badge>`, `<Select>` usw.

---

### Task 0: Branch anlegen

- [ ] **Step 1:** 
```bash
git checkout -b prototyp
```
Expected: `Switched to a new branch 'prototyp'`

---

### Task 1: Test-Setup + Parser-Grundfunktionen

**Files:**
- Create: `vitest.config.ts`, `scripts/lib/parse.mjs`, `tests/scripts/parse.test.mjs`
- Modify: `package.json` (Script `test`, devDependency `vitest`)

**Interfaces:**
- Produces (`scripts/lib/parse.mjs`):
  - `parseGermanNumber(s: string|null): number|null`
  - `PRICE_LABELS: string[]` (Priorität)
  - `mapPriceType(label: string, marketingType: 'kauf'|'miete'): PriceType|null`
  - `mapPropertyType(categorySlugs: string[]): { property_type: PropertyType|null, furnished: boolean }`
  - `cleanTitle(raw: string): { title: string, commissionFree: boolean }`
  - `isCommissionFree(text: string): boolean`
  - `normalizeCity(city: string|null): string|null`
  - `slugify(s: string): string`

- [ ] **Step 1: Vitest installieren und konfigurieren**

```bash
yarn add -D vitest
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.{ts,mjs}'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '~~': fileURLToPath(new URL('.', import.meta.url)),
      '~': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
})
```

In `package.json` bei `scripts` ergänzen:
```json
"test": "vitest run",
"content": "node scripts/build-content.mjs"
```

- [ ] **Step 2: Failing tests schreiben** – `tests/scripts/parse.test.mjs`:

```js
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
    expect(cleanTitle('Gemu\u0308tliche Wohnung').title).toBe('Gemütliche Wohnung')
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
```

- [ ] **Step 3: Test laufen lassen**

Run: `yarn test`
Expected: FAIL – `Failed to load url ../../scripts/lib/parse.mjs`

- [ ] **Step 4: Implementieren** – `scripts/lib/parse.mjs`:

```js
// Pure helpers that turn legacy Koken text into typed values.

export function parseGermanNumber(s) {
  if (!s) return null
  const m = String(s).match(/-?\d[\d.]*(?:,\d+)?/)
  if (!m) return null
  const n = Number(m[0].replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

// Order = priority when a listing has several price lines.
export const PRICE_LABELS = [
  'Kaufpreis', 'Kaltmiete', 'Pauschalmiete', 'Miete pro Monat', 'Mietpreis', 'Miet-/Kaufpreis', 'Miete pro Jahr',
]

export function mapPriceType(label, marketingType) {
  switch (label) {
    case 'Kaufpreis': return 'kaufpreis'
    case 'Kaltmiete': return 'kaltmiete'
    case 'Pauschalmiete': return 'pauschalmiete'
    case 'Miete pro Monat':
    case 'Mietpreis': return 'miete_monat'
    case 'Miete pro Jahr': return 'miete_jahr'
    case 'Miet-/Kaufpreis': return marketingType === 'kauf' ? 'kaufpreis' : 'miete_monat'
    default: return null
  }
}

const CATEGORY_MAP = {
  'kauf-etw': ['wohnung', false],
  'miete-wohnung': ['wohnung', false],
  'miete-waz': ['wohnung', true],
  'kauf-12fh': ['haus', false],
  'miete-12fh': ['haus', false],
  'kauf-gewerbe': ['gewerbe', false],
  'miete-gewerbe': ['gewerbe', false],
  'kauf-grundstueck': ['grundstueck', false],
  'kauf-rendite': ['anlage', false],
  'anlage-mfmh': ['anlage', false],
  'kauf-ausland': ['haus', false],
  'deutsch-unmoebliert': ['wohnung', false],
  'english-unfurnished': ['wohnung', false],
  'deutsch-moebliert': ['wohnung', true],
  'english-furnished': ['wohnung', true],
}

export function mapPropertyType(categorySlugs) {
  const hit = categorySlugs.map((s) => CATEGORY_MAP[s]).find(Boolean)
  return hit ? { property_type: hit[0], furnished: hit[1] } : { property_type: null, furnished: false }
}

const COMMISSION_RE = /provisionsfrei|ohne\s+käuferprovision/i

export function isCommissionFree(text) {
  return COMMISSION_RE.test(text.normalize('NFC'))
}

export function cleanTitle(raw) {
  let t = raw.normalize('NFC').replace(/\s+/g, ' ').trim()
  const commissionFree = isCommissionFree(t)
  t = t.replace(/\s*-\s*(provisionsfrei|ohne\s+käuferprovision)\s*$/i, '')
  t = t.replace(/[`´']/g, '’')
  t = t.replace(/\s+-\s*/g, ' – ')
  return { title: t.trim(), commissionFree }
}

export function normalizeCity(city) {
  if (!city) return null
  const c = city.trim()
  if (/^frankfurt(\s*\/\s*m\.?|\s+am\s+main)?$/i.test(c)) return 'Frankfurt am Main'
  return c
}

export function slugify(s) {
  const base = s
    .normalize('NFC')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (base.length <= 70) return base
  const cut = base.slice(0, 70)
  return cut.slice(0, cut.lastIndexOf('-') > 20 ? cut.lastIndexOf('-') : 70).replace(/-+$/, '')
}
```

- [ ] **Step 5: Tests grün**

Run: `yarn test`
Expected: PASS (alle `parse`-Tests)

- [ ] **Step 6: Commit**

```bash
git add package.json yarn.lock vitest.config.ts scripts/lib/parse.mjs tests/scripts/parse.test.mjs
git commit -m "feat(content): legacy parsing helpers with tests"
```

---

### Task 2: Legacy-Inserat → Listing, Dubletten, Slugs

**Files:**
- Create: `scripts/lib/listings.mjs`, `scripts/lib/files.mjs` (nur `fileId`), `tests/scripts/listings.test.mjs`

**Interfaces:**
- Consumes: alles aus `scripts/lib/parse.mjs`.
- Produces (`scripts/lib/listings.mjs`):
  - `toListing(legacy, { source: 'main'|'grandtower', exposeOk: (url) => boolean }): Listing|null` – `legacy` ist ein Eintrag aus `data/legacy/listings.json` bzw. `data/legacy/grandtower/listings.json`.
  - `dedupeListings(listings: Listing[]): { kept: Listing[], dropped: {id, duplicateOf}[] }`
  - `assignSlugs(listings: Listing[]): Listing[]` (setzt `slug` eindeutig, Reihenfolge nach `id` aufsteigend)
- Produces (`scripts/lib/files.mjs`): `fileId(source, kokenId): string` → `m-<id>` / `gt-<id>`
- Listing-Objekt (exakte Feldnamen, JSON):
  `id, legacy_id, legacy_url, source, status ('published'|'archived'), availability ('available'|'sold'|'rented'), slug, title, teaser, description (HTML), marketing_type, property_type, furnished, country, street, zip, city, district, rooms, living_area, usable_area, plot_area, price, price_type, total_rent, price_on_request, commission_free, available_from, features [{label,value}], cover_image (file-id|null), images [{sort, directus_files_id}], expose ({url}|null), project ('grand-tower'|null), featured, date_published (ISO)`

- [ ] **Step 1: Failing tests** – `tests/scripts/listings.test.mjs`:

```js
import { describe, it, expect } from 'vitest'
import { toListing, dedupeListings, assignSlugs } from '../../scripts/lib/listings.mjs'

const img = (id) => ({ id, file: `media/images/${id}.jpg`, width: 1600, height: 1067, focal_point: { x: 50, y: 50 } })

const legacy = (over = {}) => ({
  id: 170,
  title: 'Gemütliche Maisonettewohnung mitten in Fechenheim - Eigennutzung oder Kapitalanlage',
  legacy_url: undefined,
  url: 'https://www.poehlsimmobilien.de/objekte/2026/07/x/',
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
      id: 170, legacy_id: 170, source: 'main', status: 'published', availability: 'available',
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
  it("keeps the first entry on an image-count tie", () => {
    const a = { id: 123, street: "Europaallee 2", living_area: 66.7, price: 1780, images: [1, 2] }
    const b = { id: 100117, street: "Europaallee 2", living_area: 66.7, price: 1780, images: [1, 2] }
    expect(dedupeListings([a, b]).dropped).toEqual([{ id: 100117, duplicateOf: 123 }])
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
```

- [ ] **Step 2: Test laufen lassen** – Run: `yarn test` · Expected: FAIL (Modul fehlt)

- [ ] **Step 3: `scripts/lib/files.mjs` anlegen** (wird in Task 3 erweitert):

```js
export function fileId(source, kokenId) {
  return `${source === 'grandtower' ? 'gt' : 'm'}-${kokenId}`
}
```

- [ ] **Step 4: `scripts/lib/listings.mjs` implementieren**

```js
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
    if (!l.street) { byKey.set(Symbol(), l); continue }
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
```

- [ ] **Step 5: Tests grün** – Run: `yarn test` · Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/listings.mjs scripts/lib/files.mjs tests/scripts/listings.test.mjs
git commit -m "feat(content): map legacy listings to directus-shaped records"
```

---

### Task 3: Dateien (Varianten, Alt-Texte) und Rechtstexte

**Files:**
- Modify: `scripts/lib/files.mjs`
- Create: `scripts/lib/legal.mjs`, `tests/scripts/files.test.mjs`, `tests/scripts/legal.test.mjs`

**Interfaces:**
- Produces (`files.mjs`): `variantWidths(width: number): number[]`, `altText(title: string, index: number, total: number): string`
- Produces (`legal.mjs`): `cleanLegacyHtml(html: string): string`, `withAnchors(html: string): { html: string, toc: {id: string, title: string}[] }`

- [ ] **Step 1: Failing tests**

`tests/scripts/files.test.mjs`:
```js
import { describe, it, expect } from 'vitest'
import { fileId, variantWidths, altText } from '../../scripts/lib/files.mjs'

describe('fileId', () => {
  it('prefixes by source', () => {
    expect(fileId('main', 2623)).toBe('m-2623')
    expect(fileId('grandtower', 1904)).toBe('gt-1904')
  })
})

describe('variantWidths', () => {
  it('never upscales and always includes the largest usable width', () => {
    expect(variantWidths(2048)).toEqual([480, 960, 1600])
    expect(variantWidths(1600)).toEqual([480, 960, 1600])
    expect(variantWidths(1495)).toEqual([480, 960, 1495])
    expect(variantWidths(661)).toEqual([480, 661])
    expect(variantWidths(300)).toEqual([300])
  })
})

describe('altText', () => {
  it('numbers gallery images', () => {
    expect(altText('EDEN – Luxuriöses Wohnambiente', 3, 12)).toBe('EDEN – Luxuriöses Wohnambiente – Bild 3 von 12')
    expect(altText('EDEN', 1, 1)).toBe('EDEN')
  })
})
```

`tests/scripts/legal.test.mjs`:
```js
import { describe, it, expect } from 'vitest'
import { cleanLegacyHtml, withAnchors } from '../../scripts/lib/legal.mjs'

describe('cleanLegacyHtml', () => {
  it('removes koken embeds, scripts, iframes, inline styles and empty paragraphs', () => {
    const html = '<p class=""> </p><p class=""><b>AGB</b></p><figure class="k-content-embed"><koken:form id="x"></koken:form></figure><script>alert(1)</script><iframe src="https://x"></iframe><p style="color:red"><span style="font-size: 1em;">Text</span></p><p>&nbsp;</p><p><br></p>'
    expect(cleanLegacyHtml(html)).toBe('<p><b>AGB</b></p><p>Text</p>')
  })
})

describe('withAnchors', () => {
  it('promotes h4 to h2 with ids and builds a toc', () => {
    const { html, toc } = withAnchors('<h4>Datenschutz auf einen Blick</h4><p>x</p><h4>Hosting &amp; CDN</h4>')
    expect(html).toBe('<h2 id="datenschutz-auf-einen-blick">Datenschutz auf einen Blick</h2><p>x</p><h2 id="hosting-cdn">Hosting &amp; CDN</h2>')
    expect(toc).toEqual([
      { id: 'datenschutz-auf-einen-blick', title: 'Datenschutz auf einen Blick' },
      { id: 'hosting-cdn', title: 'Hosting & CDN' },
    ])
  })
  it('makes duplicate ids unique', () => {
    const { toc } = withAnchors('<h4>Hinweis</h4><h4>Hinweis</h4>')
    expect(toc.map((t) => t.id)).toEqual(['hinweis', 'hinweis-2'])
  })
})
```

- [ ] **Step 2:** Run: `yarn test` · Expected: FAIL (`variantWidths` / `legal.mjs` fehlen)

- [ ] **Step 3: Implementieren**

`scripts/lib/files.mjs` (ersetzt den Inhalt):
```js
const BASE_WIDTHS = [480, 960, 1600]

export function fileId(source, kokenId) {
  return `${source === 'grandtower' ? 'gt' : 'm'}-${kokenId}`
}

export function variantWidths(width) {
  const top = Math.min(width, 1600)
  return [...new Set([...BASE_WIDTHS.filter((w) => w < top), top])]
}

export function altText(title, index, total) {
  return total > 1 ? `${title} – Bild ${index} von ${total}` : title
}
```

`scripts/lib/legal.mjs`:
```js
import { slugify } from './parse.mjs'

export function cleanLegacyHtml(html) {
  return html
    .normalize('NFC')
    .replace(/<figure[\s\S]*?<\/figure>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<koken:[\s\S]*?<\/koken:\w+>/g, '')
    .replace(/<koken:[^>]*\/>/g, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/g, '')
    .replace(/\s(class|style)="[^"]*"/g, '')
    .replace(/<span>([\s\S]*?)<\/span>/g, '$1')
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/g, '')
    .replace(/>\s+</g, '><')
    .trim()
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '').trim()

export function withAnchors(html) {
  const toc = []
  const seen = new Map()
  const out = html.replace(/<h4>([\s\S]*?)<\/h4>/g, (_, inner) => {
    const title = decode(inner)
    const base = slugify(title) || 'abschnitt'
    const n = (seen.get(base) || 0) + 1
    seen.set(base, n)
    const id = n === 1 ? base : `${base}-${n}`
    toc.push({ id, title })
    return `<h2 id="${id}">${inner}</h2>`
  })
  return { html: out, toc }
}
```

- [ ] **Step 4:** Run: `yarn test` · Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/files.mjs scripts/lib/legal.mjs tests/scripts/files.test.mjs tests/scripts/legal.test.mjs
git commit -m "feat(content): image variants, alt texts and legal html cleanup"
```

---

### Task 4: Handgeschriebene Inhalte + Build-Skript + Bilder

**Files:**
- Create: `content/manual/company.json`, `home.json`, `about.json`, `services.json`, `grand-tower.json`, `mood.json`
- Create: `scripts/lib/images.mjs`, `scripts/build-content.mjs`
- Modify: `.gitignore` (+ `public/media/`), `data/legacy/README.md` (Logo-Quelle)
- Output: `content/generated/*.json`, `public/media/*.webp`, `public/brand/logo.png`

**Interfaces:**
- Consumes: `toListing`, `dedupeListings`, `assignSlugs`, `fileId`, `variantWidths`, `altText`, `cleanLegacyHtml`, `withAnchors`.
- Produces (JSON, von Nuxt importiert):
  - `content/generated/listings.json`: `Listing[]` (Schema Task 2)
  - `content/generated/files.json`: `{ id, title, description, width, height, focal_point, variants: number[] }[]`
  - `content/generated/projects.json`: `[{ slug, title, tagline, address, intro: string[], facts: {label,value,verify?}[], mood_day, mood_night, images: string[] }]`
  - `content/generated/legal.json`: `{ datenschutz: { title, html, toc }, agb: { title, html, toc } }`
  - `content/generated/build-report.json`: Zählwerte, Dubletten, Warnungen
  - `public/media/<fileId>-<width>.webp`, `public/brand/logo.png`

- [ ] **Step 1: Abhängigkeit + Logo-Quelle**

```bash
yarn add -D sharp
curl -sL -A "Mozilla/5.0" "https://www.poehlsimmobilien.de/storage/cache/images/000/752/Logo-ohne-Kreis-P,large.1675968992.jpg" -o data/legacy/media/brand/logo-source.jpg
```
Expected: Datei `data/legacy/media/brand/logo-source.jpg` > 20 KB.

In `data/legacy/README.md` unter „Hinweise zu den Daten" ergänzen:
```md
- Logo-Quelle (nicht vom Scraper geladen): `media/brand/logo-source.jpg` von
  `https://www.poehlsimmobilien.de/storage/cache/images/000/752/Logo-ohne-Kreis-P,large.1675968992.jpg`.
```

`.gitignore` ergänzen:
```
# Generated image variants – regenerate with: yarn content
public/media/
```

- [ ] **Step 2: `content/manual/company.json`**

```json
{
  "name": "Pöhls Immobilien",
  "owner": "Pierre Pöhls",
  "street": "Staffordstraße 28",
  "zip": "63303",
  "city": "Dreieich",
  "phone": "+49 6103 3124633",
  "phone_href": "tel:+4961033124633",
  "mobile": "+49 163 6166327",
  "mobile_href": "tel:+491636166327",
  "email": "info@poehlsimmobilien.de",
  "web": "www.poehlsimmobilien.de",
  "register_court": "Amtsgericht Offenbach am Main",
  "register_number": "HRA 42936",
  "vat_id": "DE167572686",
  "chamber": "Offenbach am Main",
  "responsible": "Pierre Pöhls",
  "portrait": "m-1987",
  "agency": { "name": "rhowerk", "url": "https://rhowerk.de/" }
}
```

- [ ] **Step 3: `content/manual/home.json`**

```json
{
  "hero": {
    "title": "Ihre Immobilie in Frankfurt und Rhein-Main.",
    "lead": "Kaufen, mieten, verkaufen – mit über 35 Jahren Markterfahrung an Ihrer Seite."
  },
  "latest": {
    "title": "Neue Angebote",
    "intro": "Eigentumswohnungen, Häuser, Gewerbe- und Anlageobjekte – frisch im Angebot."
  },
  "grandTower": {
    "kicker": "Grand Tower · Europaallee 2",
    "title": "Wohnen im höchsten Wohnturm Deutschlands.",
    "text": "Möblierte und unmöblierte Apartments zur Miete sowie ausgewählte Eigentumswohnungen – vermittelt und betreut von Pöhls Immobilien."
  },
  "owners": {
    "title": "Sie möchten verkaufen oder vermieten?",
    "text": "Wir schätzen Ihre Immobilie realistisch ein, bereiten sie professionell auf und finden passende Käufer oder Mieter – von der ersten Einschätzung bis zur Übergabe."
  },
  "personal": {
    "title": "Persönlich betreut von Pierre Pöhls",
    "text": "Seit über 35 Jahren begleitet Pierre Pöhls Eigentümer, Käufer und Mieter in Frankfurt und im Rhein-Main-Gebiet. Seine Beratung beginnt bei Ihrem Ziel – ob Anlage oder Eigennutzung – und stützt sich auf genaue Kenntnis des regionalen Marktes.",
    "facts": [
      { "value": "35+", "label": "Jahre am Frankfurter Immobilienmarkt" },
      { "value": "15+", "label": "Jahre exklusive Betreuung ausgesuchter Wohnanlagen" },
      { "value": "Rhein-Main", "label": "Frankfurt und die Region als Schwerpunkt" }
    ]
  },
  "references": {
    "title": "Erfolgreich vermittelt",
    "intro": "Eine Auswahl verkaufter und vermieteter Objekte."
  },
  "contact": {
    "title": "Sprechen Sie mit uns.",
    "text": "Ob Kauf, Miete oder Verkauf – wir beraten Sie persönlich und unverbindlich."
  }
}
```

- [ ] **Step 4: `content/manual/about.json`**

```json
{
  "title": "Über uns",
  "lead": "Seit über 35 Jahren am Frankfurter Immobilienmarkt – ortskundig, persönlich und mit klarem Blick für Chancen und Risiken.",
  "sections": [
    {
      "title": "Spezialisiert auf Frankfurt und Rhein-Main",
      "text": [
        "Pöhls Immobilien ist seit mehr als 35 Jahren mit dem Immobiliengeschehen der Finanz- und Dienstleistungsmetropole Frankfurt am Main vertraut. Deshalb konzentrieren wir uns bewusst auf diesen Standort und das Rhein-Main-Gebiet – und geben unsere Erfahrung auf aktuellem Wissensstand an unsere Kundinnen und Kunden weiter."
      ]
    },
    {
      "title": "Beratung, die bei Ihrem Ziel beginnt",
      "text": [
        "Am Anfang steht Ihr Ziel: Wir erfassen sorgfältig, was Sie erreichen möchten, analysieren Stärken und Schwächen der Immobilie und ihres Standorts – intern wie im Markt – und schätzen die Zukunftsaussichten ein.",
        "Auf dieser Grundlage beraten wir Sie mit fundierter Kenntnis des regionalen Marktes, ob bei Ihrer Anlagestrategie oder bei der geplanten Eigennutzung."
      ]
    },
    {
      "title": "Erfahrung aus dem Marktgeschehen",
      "text": [
        "Unsere Erfahrung stammt aus dem unmittelbaren Umgang mit dem Markt und aus der Zusammenarbeit mit jedem einzelnen Kunden. Ausgesuchte Wohnanlagen und Wohnungsbestände im Rhein-Main-Gebiet begleiten wir seit mehr als 15 Jahren exklusiv bei Verkauf und Vermietung."
      ]
    }
  ]
}
```

- [ ] **Step 5: `content/manual/services.json`**

```json
{
  "title": "Verkaufen und vermieten mit Erfahrung",
  "lead": "Von der Preisfindung bis zur Schlüsselübergabe – und darüber hinaus: Wir übernehmen alles, was für einen erfolgreichen Verkauf oder eine gute Vermietung nötig ist.",
  "groups": [
    {
      "title": "Verkauf",
      "items": [
        "Markteinschätzung und Preisfindung, auch als Online-Wertermittlung",
        "Erfahrung mit dem Bieterverfahren",
        "Energieausweis online",
        "Beschaffung und Aufbereitung aller notwendigen Unterlagen",
        "Ermittlung der passenden Zielgruppe",
        "Exposé mit hochwertigen Fotos und Videoclips vom Profi-Fotografen",
        "Erfahrung mit Home Staging",
        "Veröffentlichung in den relevanten Portalen und auf unserer Website",
        "Verhandlungen mit Interessenten",
        "Begleitung des notariellen Kaufvertragsabschlusses"
      ]
    },
    {
      "title": "Vermietung",
      "items": [
        "Vorauswahl der Interessenten",
        "Organisation der Besichtigungstermine",
        "Bonitätsprüfung der Interessenten",
        "Mietvertragserstellung",
        "Abnahme und Übergabe mit Protokoll und Fotodokumentation"
      ]
    },
    {
      "title": "Betreuung",
      "items": [
        "Betreuung nach Vertragsabschluss",
        "Renovierungs- und Erhaltungsservice für Eigentümer",
        "Organisation und Überwachung von Renovierungsmaßnahmen",
        "Hausverwaltungen",
        "Unterstützung bei der Klärung rechtlicher Fragen"
      ]
    }
  ],
  "steps": [
    { "title": "Bewertung", "text": "Markteinschätzung und Preisfindung – auf Wunsch als Online-Wertermittlung." },
    { "title": "Unterlagen & Exposé", "text": "Wir beschaffen alle Unterlagen, organisieren den Energieausweis und erstellen ein Exposé mit Profi-Fotos und Videoclips." },
    { "title": "Vermarktung", "text": "Passende Zielgruppe, relevante Portale und unsere Website – auf Wunsch mit Home Staging oder im Bieterverfahren." },
    { "title": "Besichtigung & Prüfung", "text": "Vorauswahl der Interessenten, Besichtigungstermine, Verhandlungen und Bonitätsprüfung." },
    { "title": "Vertrag & Übergabe", "text": "Mietvertrag oder Begleitung zum Notar, Übergabe mit Protokoll und Fotodokumentation." }
  ]
}
```

- [ ] **Step 6: `content/manual/grand-tower.json`**

Hinweis: `verify: true` = Fakt vor Versand prüfen (Task 16). `images_from` = Galerie aus der Grand-Tower-Legacy-Startseite.

```json
{
  "slug": "grand-tower",
  "title": "Grand Tower Frankfurt",
  "tagline": "Wohnen im höchsten Wohnturm Deutschlands.",
  "address": "Europaallee 2, 60327 Frankfurt am Main",
  "intro": [
    "Der Grand Tower im Frankfurter Europaviertel ist das höchste Wohnhochhaus Deutschlands. Hinter der Fassade mit den markanten, geschwungenen Balkonen liegen Apartments mit weitem Blick über die Stadt.",
    "Pöhls Immobilien vermittelt im Grand Tower möblierte und unmöblierte Wohnungen zur Miete sowie ausgewählte Eigentumswohnungen."
  ],
  "facts": [
    { "label": "Höhe", "value": "172 m", "verify": true },
    { "label": "Geschosse", "value": "47", "verify": true },
    { "label": "Fertigstellung", "value": "2020", "verify": true },
    { "label": "Lage", "value": "Europaviertel" }
  ],
  "mood_day": "m-1665",
  "mood_night": "gt-1814",
  "images_from": { "source": "grandtower", "page": "poehls-immobilien" }
}
```

- [ ] **Step 7: `content/manual/mood.json`**

`crop` = Anteil links, der abgeschnitten wird (eingebranntes Logo-Feld der Legacy-Startseiten-Slideshow).

```json
{
  "crop_left": { "source": "main", "page": "poehls-immobilien", "fraction": 0.255 },
  "hero": {
    "day": ["m-1514", "m-1665", "m-745"],
    "night": ["m-703", "gt-1814", "m-707"]
  },
  "alts": {
    "m-1514": "Frankfurter Skyline mit Hochhäusern an einem sonnigen Tag",
    "m-1665": "Geschwungene Glasbalkone des Grand Tower mit Blick auf ein benachbartes Hochhaus und die Stadt",
    "m-745": "Blick durch eine Häuserschlucht auf den Turm des Frankfurter Doms",
    "m-703": "Frankfurter Skyline bei Nacht, im Main gespiegelt, rechts die Europäische Zentralbank",
    "gt-1814": "Balkon des Grand Tower in der Abenddämmerung mit Blick über die beleuchtete Stadt",
    "m-707": "Die Europäische Zentralbank bei Nacht mit erleuchteten Fenstern",
    "m-1987": "Porträt von Pierre Pöhls vor der Frankfurter Skyline"
  }
}
```

- [ ] **Step 8: `scripts/lib/images.mjs`**

```js
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { variantWidths } from './files.mjs'

// Returns { width, height, variants } of the (cropped) master.
export async function processImage({ input, id, outDir, cropLeft = 0 }) {
  const master = await sharp(input, { failOn: 'none' }).rotate().toColourspace('srgb').toBuffer()
  let img = sharp(master)
  let { width, height } = await img.metadata()
  if (cropLeft > 0) {
    const left = Math.round(width * cropLeft)
    img = sharp(await img.extract({ left, top: 0, width: width - left, height }).toBuffer())
    width -= left
  }
  const variants = variantWidths(width)
  for (const w of variants) {
    const out = path.join(outDir, `${id}-${w}.webp`)
    if (fs.existsSync(out)) continue
    await img.clone().resize({ width: w }).webp({ quality: 78 }).toFile(out)
  }
  return { width, height, variants }
}

// Black-on-white JPG logo → black-on-transparent PNG (inverted to white in dark mode via CSS).
export async function processLogo(input, output) {
  const { data, info } = await sharp(input).greyscale().resize({ height: 256 }).raw().toBuffer({ resolveWithObject: true })
  const rgba = Buffer.alloc(info.width * info.height * 4)
  for (let i = 0; i < info.width * info.height; i++) {
    const a = 255 - data[i]
    rgba[i * 4 + 3] = a < 24 ? 0 : Math.min(255, Math.round(a * 1.15))
  }
  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).trim().png().toFile(output)
}
```

- [ ] **Step 9: `scripts/build-content.mjs`**

```js
#!/usr/bin/env node
// Legacy scrape (data/legacy) → content/generated/*.json + public/media/*.webp
import fs from 'node:fs'
import path from 'node:path'
import { toListing, dedupeListings, assignSlugs } from './lib/listings.mjs'
import { fileId, altText } from './lib/files.mjs'
import { cleanLegacyHtml, withAnchors } from './lib/legal.mjs'
import { processImage, processLogo } from './lib/images.mjs'

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
const project = { ...gtRest, images: gtPage.images.map((i) => fileId(gtManual.images_from.source, i.id)) }

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
    title: titleFor.get(id) || mood.alts[id] || '',
    description: mood.alts[id] || titleFor.get(id) || '',
    width, height,
    focal_point: rec.focal_point || null,
    variants,
  })
  if (++done % 100 === 0) console.log(`images ${done}/${needed.size}`)
}
const knownFiles = new Set(files.map((f) => f.id))
for (const l of listings) {
  if (l.cover_image && !knownFiles.has(l.cover_image)) l.cover_image = l.images[0]?.directus_files_id ?? null
  l.images = l.images.filter((i) => knownFiles.has(i.directus_files_id) && i.directus_files_id !== l.cover_image)
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

// ---- logo ----
fs.mkdirSync(path.join(ROOT, 'public', 'brand'), { recursive: true })
await processLogo(L('media/brand/logo-source.jpg'), path.join(ROOT, 'public', 'brand', 'logo.png'))

// ---- write ----
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
  duplicates_dropped: dropped,
  warnings,
})
console.log(`listings ${listings.length} (dropped ${dropped.length} duplicates), files ${files.length}, warnings ${warnings.length}`)
```

- [ ] **Step 10: Build ausführen**

Run: `yarn content`
Expected (ungefähr): `listings 72 (dropped 1 duplicates), files ~1170, warnings 3` – Warnungen nur für Mehrfachkategorien (152, 122, 172). **Jede andere Warnung untersuchen und beheben, bevor weitergemacht wird.**

Prüfen:
```bash
node -e "const r=require('./content/generated/build-report.json');console.log(r)"
```
Expected: `available` 59 (56 + 4 GT − 1 Dublette), `sold` 7, `rented` 6, `grand_tower` 5 (Main 162 + 123, GT 121, 119, 118), `duplicates_dropped: [{ id: 100117, duplicateOf: 123 }]` (Main 123 und GT 117 haben gleich viele Bilder → der zuerst verarbeitete Main-Eintrag bleibt).

- [ ] **Step 11: Sichtprüfung Bilder** – Mit dem Read-Tool ansehen: `public/media/m-1665-960.webp` (kein graues Logo-Feld links), `public/media/gt-1814-960.webp`, `public/brand/logo.png` (schwarze Linien, transparenter Grund, keine Kanten-Artefakte). Wenn das Logo ausfranst: Schwellwert in `processLogo` (`a < 24`) auf `a < 40` erhöhen und erneut `yarn content`.

- [ ] **Step 12: Commit**

```bash
git add .gitignore data/legacy/README.md content scripts/lib/images.mjs scripts/build-content.mjs public/brand/logo.png package.json yarn.lock
git commit -m "feat(content): build pipeline for listings, files, project and legal pages"
```

---

### Task 5: Typen, Datenzugriff, Formatierung

**Files:**
- Create: `app/types/content.ts`, `app/utils/format.ts`, `app/utils/asset.ts`, `app/composables/useContent.ts`, `tests/app/format.test.ts`, `tests/app/asset.test.ts`

**Interfaces:**
- Produces (`app/types/content.ts`): `MarketingType`, `PropertyType`, `PriceType`, `Availability`, `FileAsset`, `Listing`, `Project`, `Company`, `LegalPage`
- Produces (`app/utils/format.ts`): `formatEuro(n)`, `formatArea(n)`, `formatRooms(n)`, `priceText(l)`, `priceLabel(l)`, `mainArea(l)`, `availableFromText(v, today?)`, `locationText(l)`, `PROPERTY_TYPE_LABEL`, `MARKETING_LABEL`
- Produces (`app/utils/asset.ts`): `pickWidth(variants, wanted?)`, `assetUrl(file, width?)`, `assetSrcset(file)`
- Produces (`app/composables/useContent.ts`): `useListings()`, `useAvailableListings()`, `useArchivedListings()`, `useListing(slug)`, `useFile(id)`, `useListingImages(l)`, `useProject(slug)`, `useCompany()`, `useHomeContent()`, `useAboutContent()`, `useServicesContent()`, `useLegalPage(key)`, `useHeroMood()`

- [ ] **Step 1: Typen** – `app/types/content.ts`:

```ts
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
```

- [ ] **Step 2: Failing tests** – `tests/app/format.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { formatEuro, formatArea, formatRooms, priceText, priceLabel, mainArea, availableFromText, locationText } from '~/utils/format'
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
const NB = '\u00A0'

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
```

`tests/app/asset.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { pickWidth, assetUrl, assetSrcset } from '~/utils/asset'

const file = { id: 'm-1', title: '', description: '', width: 1495, height: 1000, focal_point: null, variants: [480, 960, 1495] }

describe('asset urls', () => {
  it('picks the smallest variant that covers the wanted width', () => {
    expect(pickWidth([480, 960, 1495], 500)).toBe(960)
    expect(pickWidth([480, 960, 1495], 4000)).toBe(1495)
    expect(pickWidth([480, 960, 1495])).toBe(1495)
  })
  it('builds urls and srcset', () => {
    expect(assetUrl(file, 960)).toBe('/media/m-1-960.webp')
    expect(assetSrcset(file)).toBe('/media/m-1-480.webp 480w, /media/m-1-960.webp 960w, /media/m-1-1495.webp 1495w')
  })
})
```

- [ ] **Step 3:** Run: `yarn test` · Expected: FAIL (Module fehlen)

- [ ] **Step 4: Implementieren**

`app/utils/format.ts`:
```ts
import type { Listing, MarketingType, PropertyType, PriceType } from '~/types/content'

const NB = '\u00A0'
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
```

`app/utils/asset.ts`:
```ts
import type { FileAsset } from '~/types/content'

export function pickWidth(variants: number[], wanted = Number.POSITIVE_INFINITY): number {
  const sorted = [...variants].sort((a, b) => a - b)
  return sorted.find((w) => w >= wanted) ?? sorted[sorted.length - 1]!
}

export function assetUrl(file: FileAsset, width?: number): string {
  return `/media/${file.id}-${pickWidth(file.variants, width)}.webp`
}

export function assetSrcset(file: FileAsset): string {
  return [...file.variants].sort((a, b) => a - b).map((w) => `/media/${file.id}-${w}.webp ${w}w`).join(', ')
}
```

`app/composables/useContent.ts` (einzige Stelle, die bei Directus ersetzt wird):
```ts
import type { Company, FileAsset, LegalPage, Listing, Project } from '~/types/content'
import listingsData from '~~/content/generated/listings.json'
import filesData from '~~/content/generated/files.json'
import projectsData from '~~/content/generated/projects.json'
import legalData from '~~/content/generated/legal.json'
import companyData from '~~/content/manual/company.json'
import homeData from '~~/content/manual/home.json'
import aboutData from '~~/content/manual/about.json'
import servicesData from '~~/content/manual/services.json'
import moodData from '~~/content/manual/mood.json'

const listings = listingsData as Listing[]
const files = new Map((filesData as FileAsset[]).map((f) => [f.id, f]))

export const useListings = () => listings
export const useAvailableListings = () => listings.filter((l) => l.availability === 'available')
export const useArchivedListings = () => listings.filter((l) => l.availability !== 'available')
export const useListing = (slug: string) => listings.find((l) => l.slug === slug) ?? null

export const useFile = (id: string | null | undefined): FileAsset | null => (id ? files.get(id) ?? null : null)
export const useListingImages = (l: Listing): FileAsset[] =>
  [l.cover_image, ...l.images.map((i) => i.directus_files_id)].map((id) => useFile(id)).filter((f): f is FileAsset => !!f)

export const useProject = (slug: string) => (projectsData as Project[]).find((p) => p.slug === slug) ?? null
export const useCompany = () => companyData as Company
export const useHomeContent = () => homeData
export const useAboutContent = () => aboutData
export const useServicesContent = () => servicesData
export const useLegalPage = (key: 'datenschutz' | 'agb') => (legalData as Record<string, LegalPage>)[key]!

export function useHeroMood() {
  const map = (ids: string[]) => ids.map((id) => useFile(id)).filter((f): f is FileAsset => !!f)
  return { day: map(moodData.hero.day), night: map(moodData.hero.night) }
}
```

- [ ] **Step 5:** Run: `yarn test` · Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/types app/utils/format.ts app/utils/asset.ts app/composables/useContent.ts tests/app
git commit -m "feat(app): content types, data access layer and formatters"
```

---

### Task 6: Filterlogik

**Files:**
- Create: `app/utils/filters.ts`, `tests/app/filters.test.ts`

**Interfaces:**
- Consumes: `Listing`, `MarketingType`, `PropertyType`
- Produces: `type SortKey = 'neu'|'preis-auf'|'preis-ab'`, `interface Filters { typ, art, zimmer, preis, sort }`, `DEFAULT_FILTERS`, `parseFilters(query)`, `filtersToQuery(f)`, `applyFilters(ls, f)`, `sortListings(ls, sort)`, `comparablePrice(l)`, `PRICE_STEPS`, `ROOM_STEPS`, `activeFilterCount(f)`

- [ ] **Step 1: Failing tests** – `tests/app/filters.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { parseFilters, filtersToQuery, applyFilters, sortListings, DEFAULT_FILTERS, activeFilterCount } from '~/utils/filters'
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

describe('activeFilterCount', () => {
  it('counts non-default filters except sort', () => {
    expect(activeFilterCount({ ...DEFAULT_FILTERS, typ: 'kauf', zimmer: 2, sort: 'preis-ab' })).toBe(2)
  })
})
```

- [ ] **Step 2:** Run: `yarn test` · Expected: FAIL

- [ ] **Step 3: Implementieren** – `app/utils/filters.ts`:

```ts
import type { Listing, MarketingType, PropertyType } from '~/types/content'

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
    const pa = comparablePrice(a), pb = comparablePrice(b)
    if (pa == null && pb == null) return 0
    if (pa == null) return 1
    if (pb == null) return -1
    return (pa - pb) * dir
  })
}

export function activeFilterCount(f: Filters): number {
  return [f.typ, f.art, f.zimmer, f.preis].filter((v) => v != null).length
}
```

- [ ] **Step 4:** Run: `yarn test` · Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/utils/filters.ts tests/app/filters.test.ts
git commit -m "feat(app): listing filters with url round-trip"
```

---

### Task 7: Designsystem – Tokens, Schrift, Tag/Nacht, Kontrastprüfung

**Files:**
- Modify: `app/assets/css/tailwind.css` (komplett ersetzen), `nuxt.config.ts`, `app/app.vue`
- Create: `app/composables/useTheme.ts`, `app/components/site/ThemeToggle.vue`, `scripts/qa/check-contrast.mjs`
- Modify: `package.json` (Script `qa:contrast`)

**Interfaces:**
- Produces: CSS-Utilities `container-page`, `prose-legacy`, Text `text-f-lg|xl|2xl|4xl|6xl`, Abstände `*-f-8|12|16|24`; Composable `useTheme(): { dark: Ref<boolean>, sync(): void, set(v: boolean): void, toggle(): void }`; Komponente `<SiteThemeToggle />`.

- [ ] **Step 1: Schrift installieren**

```bash
yarn add @fontsource-variable/schibsted-grotesk
```
Prüfen: `node_modules/@fontsource-variable/schibsted-grotesk/wght.css` enthält `font-family: 'Schibsted Grotesk Variable'`.

- [ ] **Step 2: `app/assets/css/tailwind.css` ersetzen**

```css
@import "@fontsource-variable/schibsted-grotesk/wght.css";
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --font-sans: 'Schibsted Grotesk Variable', ui-sans-serif, system-ui, sans-serif;
  --font-heading: var(--font-sans);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --color-foreground: var(--foreground);
  --color-background: var(--background);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

@theme {
  --text-f-lg: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --text-f-lg--line-height: 1.6;
  --text-f-xl: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
  --text-f-xl--line-height: 1.55;
  --text-f-2xl: clamp(1.125rem, 0.98rem + 0.75vw, 1.5rem);
  --text-f-2xl--line-height: 1.25;
  --text-f-4xl: clamp(1.75rem, 1.5rem + 1.25vw, 2.25rem);
  --text-f-4xl--line-height: 1.1;
  --text-f-6xl: clamp(2.4375rem, 1.8rem + 3.2vw, 3.75rem);
  --text-f-6xl--line-height: 1;
  --spacing-f-8: clamp(1.5rem, 1.25rem + 1.25vw, 2rem);
  --spacing-f-12: clamp(2rem, 1.5rem + 2.5vw, 3rem);
  --spacing-f-16: clamp(2.25rem, 1.25rem + 5vw, 4rem);
  --spacing-f-24: clamp(3rem, 1.5rem + 7.5vw, 6rem);
  --shadow-sm: 0 1px 2px oklch(0.235 0.025 250 / 0.08), 0 2px 8px oklch(0.235 0.025 250 / 0.06);
  --shadow-md: 0 2px 4px oklch(0.235 0.025 250 / 0.08), 0 12px 32px oklch(0.235 0.025 250 / 0.12);
}

:root {
  --radius: 0.75rem;
  --background: oklch(0.995 0.002 250);
  --foreground: oklch(0.235 0.025 250);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.235 0.025 250);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.235 0.025 250);
  --primary: oklch(0.4 0.08 250);
  --primary-foreground: oklch(0.99 0.003 250);
  --secondary: oklch(0.955 0.008 250);
  --secondary-foreground: oklch(0.235 0.025 250);
  --muted: oklch(0.955 0.008 250);
  --muted-foreground: oklch(0.46 0.025 250);
  --accent: oklch(0.935 0.012 250);
  --accent-foreground: oklch(0.235 0.025 250);
  --destructive: oklch(0.52 0.19 27);
  --border: oklch(0.905 0.01 250);
  --input: oklch(0.6 0.02 250);
  --ring: oklch(0.24 0.05 250);
  --chart-1: var(--primary);
  --chart-2: oklch(0.76 0.12 78);
  --chart-3: var(--muted-foreground);
  --chart-4: var(--border);
  --chart-5: var(--foreground);
  --sidebar: var(--card);
  --sidebar-foreground: var(--foreground);
  --sidebar-primary: var(--primary);
  --sidebar-primary-foreground: var(--primary-foreground);
  --sidebar-accent: var(--accent);
  --sidebar-accent-foreground: var(--accent-foreground);
  --sidebar-border: var(--border);
  --sidebar-ring: var(--ring);
}

.dark {
  --background: oklch(0.175 0.018 250);
  --foreground: oklch(0.96 0.004 250);
  --card: oklch(0.225 0.022 250);
  --card-foreground: oklch(0.96 0.004 250);
  --popover: oklch(0.225 0.022 250);
  --popover-foreground: oklch(0.96 0.004 250);
  --primary: oklch(0.76 0.12 78);
  --primary-foreground: oklch(0.2 0.03 78);
  --secondary: oklch(0.225 0.022 250);
  --secondary-foreground: oklch(0.96 0.004 250);
  --muted: oklch(0.225 0.022 250);
  --muted-foreground: oklch(0.76 0.018 250);
  --accent: oklch(0.265 0.024 250);
  --accent-foreground: oklch(0.96 0.004 250);
  --destructive: oklch(0.7 0.17 24);
  --border: oklch(0.29 0.02 250);
  --input: oklch(0.56 0.02 250);
  --ring: oklch(0.96 0.004 250);
  --sidebar: var(--card);
  --sidebar-foreground: var(--foreground);
  --sidebar-primary: var(--primary);
  --sidebar-primary-foreground: var(--primary-foreground);
  --sidebar-accent: var(--accent);
  --sidebar-accent-foreground: var(--accent-foreground);
  --sidebar-border: var(--border);
  --sidebar-ring: var(--ring);
  color-scheme: dark;
}

@utility container-page {
  margin-inline: auto;
  width: 100%;
  max-width: 80rem;
  padding-inline: 1rem;
  @media (width >= 48rem) {
    padding-inline: 2rem;
  }
}

/* Rich text from legacy/CMS (descriptions, legal pages) */
@utility prose-legacy {
  max-width: 65ch;
  font-size: var(--text-f-lg);
  line-height: 1.65;
  & p { margin-block: 0 1em; text-wrap: pretty; }
  & h2 { font-size: var(--text-f-2xl); font-weight: 600; line-height: 1.25; margin-block: 2em 0.6em; scroll-margin-top: 6rem; }
  & ul { list-style: disc; padding-left: 1.25em; margin-block: 0 1em; }
  & li { margin-block: 0.25em; }
  & a { color: var(--primary); text-decoration: underline; text-underline-offset: 3px; }
  & b, & strong { font-weight: 600; }
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  html {
    -webkit-text-size-adjust: 100%;
  }
  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-size: var(--text-f-lg);
  }
  h1, h2, h3 {
    font-weight: 600;
    text-wrap: balance;
    hyphens: auto;
  }
  h1 { letter-spacing: -0.03em; }
  h2 { letter-spacing: -0.02em; }
  h3 { letter-spacing: -0.01em; }
  p, li { text-wrap: pretty; }
  .tabular { font-variant-numeric: tabular-nums; }
}

/* Day/night cross-fade – the one orchestrated motion */
html.theme-anim,
html.theme-anim *,
html.theme-anim *::before,
html.theme-anim *::after {
  transition: background-color 300ms ease-out, color 300ms ease-out, border-color 300ms ease-out, fill 300ms ease-out !important;
}
@media (prefers-reduced-motion: reduce) {
  html.theme-anim, html.theme-anim * { transition: none !important; }
}
```

- [ ] **Step 3: `nuxt.config.ts` ersetzen**

```ts
// https://nuxt.com/docs/api/configuration/nuxt-config
import { existsSync, readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'

const listingsFile = 'content/generated/listings.json'
const listingRoutes: string[] = existsSync(listingsFile)
  ? JSON.parse(readFileSync(listingsFile, 'utf8')).map((l: { slug: string, availability: string }) =>
      `${l.availability === 'available' ? '/angebote/' : '/referenzen/'}${l.slug}`)
  : []

// Sets .dark before first paint (stored choice, else system). Must never throw.
const themeScript = `(function(){try{var s=null;try{s=localStorage.getItem('theme')}catch(e){}var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark')}catch(e){}})()`

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'de' },
      meta: [
        { name: 'robots', content: 'noindex, nofollow' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [{ rel: 'icon', type: 'image/png', href: '/brand/logo.png' }],
      script: [{ innerHTML: themeScript, tagPosition: 'head', tagPriority: 'critical' }],
    },
  },

  css: ['~/assets/css/tailwind.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ['shadcn-nuxt'],

  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      // false while pages are still being built; switched to true in Task 15
      failOnError: false,
      routes: ['/', ...listingRoutes],
    },
  },
})
```

- [ ] **Step 4: `app/composables/useTheme.ts`**

```ts
export function useTheme() {
  const dark = useState<boolean>('theme-dark', () => false)

  function sync() {
    dark.value = document.documentElement.classList.contains('dark')
  }

  function set(value: boolean) {
    const root = document.documentElement
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.add('theme-anim')
      window.setTimeout(() => root.classList.remove('theme-anim'), 350)
    }
    root.classList.toggle('dark', value)
    dark.value = value
    try {
      localStorage.setItem('theme', value ? 'dark' : 'light')
    }
    catch {
      // private mode / blocked storage: choice just isn't remembered
    }
  }

  return { dark, sync, set, toggle: () => set(!dark.value) }
}
```

- [ ] **Step 5: shadcn-Komponenten hinzufügen** (werden ab hier gebraucht)

```bash
npx shadcn-vue@latest add badge select toggle-group sheet dialog carousel input textarea label separator tooltip
```
Expected: neue Ordner unter `app/components/ui/` (badge, select, toggle-group, toggle, sheet, dialog, carousel, input, textarea, label, separator, tooltip); `embla-carousel-vue` in `package.json`. Falls der CLI nach Überschreiben von `button` fragt: **nein**.

- [ ] **Step 6: `app/components/site/ThemeToggle.vue`**

```vue
<script setup lang="ts">
import { Moon, Sun } from '@lucide/vue'

const { dark, sync, toggle } = useTheme()
onMounted(sync)
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="size-11 rounded-full"
          :aria-pressed="dark"
          aria-label="Zwischen Tag- und Nachtansicht wechseln"
          @click="toggle"
        >
          <Sun class="size-5 dark:hidden" aria-hidden="true" />
          <Moon class="hidden size-5 dark:block" aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Tag / Nacht</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
```

- [ ] **Step 7: `app/app.vue` ersetzen** (vorläufig, Layout folgt in Task 8)

```vue
<script setup lang="ts">
useHead({
  titleTemplate: (t) => (t ? `${t} · Pöhls Immobilien` : 'Pöhls Immobilien – Immobilien in Frankfurt und Rhein-Main'),
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease-out;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .page-enter-active, .page-leave-active { transition: none; }
}
</style>
```

- [ ] **Step 8: Kontrast-Skript** – `scripts/qa/check-contrast.mjs` (liest die Tokens direkt aus `tailwind.css`, damit CSS die einzige Quelle bleibt):

```js
#!/usr/bin/env node
import fs from 'node:fs'

const css = fs.readFileSync('app/assets/css/tailwind.css', 'utf8')
const block = (sel) => {
  const m = css.match(new RegExp(`${sel.replace('.', '\\.')}\\s*\\{([\\s\\S]*?)\\n\\}`))
  const vars = {}
  for (const [, k, L, C, H] of m[1].matchAll(/--([\w-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g)) vars[k] = [+L, +C, +H]
  return vars
}
const enc = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055)
const dec = (x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
const clamp = (v) => Math.min(1, Math.max(0, v))
function lin([L, C, h]) {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
}
const lum = (c) => { const [r, g, b] = lin(c).map(clamp); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
function hex2oklch(h) {
  const [r, g, b] = [1, 3, 5].map((i) => dec(parseInt(h.slice(i, i + 2), 16) / 255))
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360]
}
function mix(fg, bg, alpha) {
  const f = lin(fg).map((v) => enc(clamp(v))), g = lin(bg).map((v) => enc(clamp(v)))
  return hex2oklch('#' + f.map((v, i) => Math.round((v * alpha + g[i] * (1 - alpha)) * 255).toString(16).padStart(2, '0')).join(''))
}

let failed = 0
for (const [name, t] of [['Tag', block(':root')], ['Nacht', block('.dark')]]) {
  const surfaces = ['background', 'card', 'secondary', 'accent']
  const checks = []
  for (const s of surfaces) {
    checks.push([`foreground / ${s}`, t.foreground, t[s], 4.5])
    checks.push([`muted-foreground / ${s}`, t['muted-foreground'], t[s], 4.5])
    checks.push([`primary als Text / ${s}`, t.primary, t[s], 4.5])
    checks.push([`input / ${s}`, t.input, t[s], 3])
    checks.push([`ring 50% / ${s}`, mix(t.ring, t[s], 0.5), t[s], 3])
    checks.push([`destructive Text / ${s}`, t.destructive, t[s], 4.5])
  }
  checks.push(['primary-foreground / primary', t['primary-foreground'], t.primary, 4.5])
  checks.push(['primary-foreground / primary/90', t['primary-foreground'], mix(t.primary, t.background, 0.9), 4.5])
  checks.push(['primary (Form) / background', t.primary, t.background, 3])
  checks.push(['foreground/70 / background', mix(t.foreground, t.background, 0.7), t.background, 4.5])
  console.log(`\n== ${name}`)
  for (const [label, a, b, min] of checks) {
    const c = contrast(a, b)
    if (c < min) failed++
    console.log(`${c >= min ? 'ok  ' : 'FAIL'} ${c.toFixed(2).padStart(6)} (≥${min}) ${label}`)
  }
}
console.log(failed ? `\n${failed} FAIL` : '\nalle Paare bestanden')
process.exit(failed ? 1 : 0)
```

In `package.json` → `scripts`: `"qa:contrast": "node scripts/qa/check-contrast.mjs"`

- [ ] **Step 9: Prüfen**

Run: `yarn qa:contrast`
Expected: `alle Paare bestanden` (Exit 0). *Weiß auf destructive (Nacht) wird bewusst nicht geprüft – verbotene Kombination laut Spec 5.3.*

Run: `yarn test && yarn generate`
Expected: Tests grün, Generate ohne Fehler (Startseite ist noch leer – ok).

- [ ] **Step 10: Commit**

```bash
git add app/assets/css/tailwind.css nuxt.config.ts app/app.vue app/composables/useTheme.ts app/components/site/ThemeToggle.vue app/components/ui scripts/qa/check-contrast.mjs package.json yarn.lock
git commit -m "feat(design): day/night tokens, self-hosted font, theme toggle, contrast check"
```

---

### Task 8: Layout – Header, Footer, Logo, Bildkomponenten

**Files:**
- Create: `app/components/site/Logo.vue`, `site/Header.vue`, `site/Footer.vue`, `site/SectionHeading.vue`, `app/components/ResponsiveImage.vue`, `app/components/MoodImage.vue`, `app/layouts/default.vue`

**Interfaces:**
- Consumes: `useCompany()`, `assetUrl`, `assetSrcset`, `FileAsset`, `<SiteThemeToggle>`
- Produces:
  - `<ResponsiveImage :file="FileAsset|null" sizes="string" :eager="boolean" alt?="string" />` – füllt den Eltern-Container (`size-full object-cover`), Eltern setzt Seitenverhältnis + `overflow-hidden`.
  - `<MoodImage :day="FileAsset|null" :night="FileAsset|null" sizes eager />` – zwei Ebenen, Nacht blendet per `dark:` ein.
  - `<SiteSectionHeading :title :intro? :level?="2" />`
  - `<SiteLogo />`, `<SiteHeader />`, `<SiteFooter />`

- [ ] **Step 1: `app/components/ResponsiveImage.vue`**

```vue
<script setup lang="ts">
import type { FileAsset } from '~/types/content'

const props = withDefaults(defineProps<{
  file: FileAsset | null | undefined
  sizes?: string
  eager?: boolean
  alt?: string
}>(), { sizes: '100vw', eager: false, alt: undefined })

const position = computed(() =>
  props.file?.focal_point ? `${props.file.focal_point.x}% ${props.file.focal_point.y}%` : undefined)
</script>

<template>
  <img
    v-if="file"
    :src="assetUrl(file, 960)"
    :srcset="assetSrcset(file)"
    :sizes="sizes"
    :width="file.width"
    :height="file.height"
    :alt="alt ?? file.description"
    :loading="eager ? 'eager' : 'lazy'"
    :fetchpriority="eager ? 'high' : undefined"
    decoding="async"
    class="size-full object-cover"
    :style="{ objectPosition: position }"
  >
  <div v-else class="size-full bg-muted" aria-hidden="true" />
</template>
```

- [ ] **Step 2: `app/components/MoodImage.vue`**

```vue
<script setup lang="ts">
import type { FileAsset } from '~/types/content'

withDefaults(defineProps<{
  day: FileAsset | null | undefined
  night: FileAsset | null | undefined
  sizes?: string
  eager?: boolean
}>(), { sizes: '100vw', eager: false })
</script>

<template>
  <div class="relative size-full">
    <ResponsiveImage :file="day" :sizes="sizes" :eager="eager" class="absolute inset-0 transition-opacity duration-300 ease-out motion-reduce:transition-none dark:opacity-0" />
    <ResponsiveImage :file="night" :sizes="sizes" class="absolute inset-0 opacity-0 transition-opacity duration-300 ease-out motion-reduce:transition-none dark:opacity-100" :alt="night?.description" />
  </div>
</template>
```
Hinweis: Das Nachtbild ist `loading="lazy"` und liegt im Tag-Modus unsichtbar über dem Tagbild; Browser laden es trotzdem erst bei Bedarf nach – akzeptiert.

- [ ] **Step 3: `app/components/site/Logo.vue`**

```vue
<template>
  <span class="inline-flex items-center gap-2.5">
    <img src="/brand/logo.png" alt="" width="64" height="72" class="h-9 w-auto dark:invert">
    <span class="text-base font-semibold tracking-tight">Pöhls Immobilien</span>
  </span>
</template>
```
(Nach Task 4 die tatsächlichen Pixelmaße von `public/brand/logo.png` in `width`/`height` eintragen: `node -e "require('sharp')('public/brand/logo.png').metadata().then(m=>console.log(m.width,m.height))"`.)

- [ ] **Step 4: `app/components/site/SectionHeading.vue`**

```vue
<script setup lang="ts">
withDefaults(defineProps<{ title: string, intro?: string, level?: 2 | 3, id?: string }>(), { level: 2, intro: undefined, id: undefined })
</script>

<template>
  <div class="mb-f-12 max-w-2xl">
    <component :is="`h${level}`" :id="id" class="text-f-4xl">
      {{ title }}
    </component>
    <p v-if="intro" class="mt-3 text-f-xl text-muted-foreground">
      {{ intro }}
    </p>
  </div>
</template>
```

- [ ] **Step 5: `app/components/site/Header.vue`**

```vue
<script setup lang="ts">
import { Menu, Phone } from '@lucide/vue'

const company = useCompany()
const route = useRoute()
const open = ref(false)
const nav = [
  { to: '/angebote', label: 'Angebote' },
  { to: '/grand-tower', label: 'Grand Tower' },
  { to: '/leistungen', label: 'Leistungen' },
  { to: '/ueber-uns', label: 'Über uns' },
  { to: '/kontakt', label: 'Kontakt' },
]
const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)
watch(() => route.fullPath, () => { open.value = false })
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-border bg-background">
    <div class="container-page flex h-16 items-center justify-between gap-4 md:h-20">
      <NuxtLink to="/" class="rounded-md" aria-label="Pöhls Immobilien – Startseite">
        <SiteLogo />
      </NuxtLink>

      <nav aria-label="Hauptnavigation" class="hidden lg:block">
        <ul class="flex items-center gap-1">
          <li v-for="item in nav" :key="item.to">
            <NuxtLink
              :to="item.to"
              class="rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
              :class="{ 'bg-accent text-foreground': isActive(item.to) }"
              :aria-current="isActive(item.to) ? 'page' : undefined"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="flex items-center gap-1">
        <a :href="company.phone_href" class="hidden items-center gap-2 rounded-full px-3 py-2.5 text-sm font-semibold tabular hover:bg-accent xl:inline-flex">
          <Phone class="size-4" aria-hidden="true" />{{ company.phone }}
        </a>
        <Button as-child variant="ghost" size="icon" class="size-11 rounded-full xl:hidden">
          <a :href="company.phone_href" :aria-label="`Anrufen: ${company.phone}`"><Phone class="size-5" aria-hidden="true" /></a>
        </Button>
        <SiteThemeToggle />
        <Sheet v-model:open="open">
          <SheetTrigger as-child>
            <Button variant="ghost" size="icon" class="size-11 rounded-full lg:hidden" aria-label="Menü öffnen">
              <Menu class="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" class="w-[85vw] max-w-sm">
            <SheetHeader>
              <SheetTitle>Menü</SheetTitle>
            </SheetHeader>
            <nav aria-label="Mobile Navigation" class="px-4">
              <ul class="flex flex-col">
                <li v-for="item in nav" :key="item.to">
                  <NuxtLink :to="item.to" class="block border-b border-border py-4 text-f-2xl font-semibold" :aria-current="isActive(item.to) ? 'page' : undefined">
                    {{ item.label }}
                  </NuxtLink>
                </li>
              </ul>
              <a :href="company.phone_href" class="mt-6 inline-flex items-center gap-2 font-semibold tabular"><Phone class="size-4" aria-hidden="true" />{{ company.phone }}</a>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>
```

- [ ] **Step 6: `app/components/site/Footer.vue`** (immer Nacht)

```vue
<script setup lang="ts">
const company = useCompany()
const year = 2026
</script>

<template>
  <footer class="dark">
    <div class="bg-background py-f-16 text-foreground">
      <div class="container-page grid gap-10 md:grid-cols-12">
        <div class="md:col-span-5">
          <SiteLogo />
          <address class="mt-6 not-italic text-muted-foreground">
            {{ company.street }}<br>{{ company.zip }} {{ company.city }}
          </address>
        </div>
        <div class="text-sm md:col-span-4">
          <h2 class="mb-3 text-sm font-semibold text-foreground">Kontakt</h2>
          <ul class="space-y-2 text-muted-foreground tabular">
            <li>Telefon <a :href="company.phone_href" class="text-foreground hover:underline">{{ company.phone }}</a></li>
            <li>Mobil <a :href="company.mobile_href" class="text-foreground hover:underline">{{ company.mobile }}</a></li>
            <li><a :href="`mailto:${company.email}`" class="text-foreground hover:underline">{{ company.email }}</a></li>
          </ul>
        </div>
        <nav aria-label="Rechtliches" class="text-sm md:col-span-3">
          <h2 class="mb-3 text-sm font-semibold text-foreground">Rechtliches</h2>
          <ul class="space-y-2 text-muted-foreground">
            <li><NuxtLink to="/impressum" class="hover:text-foreground hover:underline">Impressum</NuxtLink></li>
            <li><NuxtLink to="/datenschutz" class="hover:text-foreground hover:underline">Datenschutz</NuxtLink></li>
            <li><NuxtLink to="/agb" class="hover:text-foreground hover:underline">AGB</NuxtLink></li>
            <li><NuxtLink to="/referenzen" class="hover:text-foreground hover:underline">Referenzen</NuxtLink></li>
          </ul>
        </nav>
      </div>
      <div class="container-page mt-12 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <span>© {{ year }} {{ company.name }}</span>
        <span>Konzeptentwurf von <a :href="company.agency.url" class="text-foreground hover:underline" target="_blank" rel="noopener">{{ company.agency.name }}</a></span>
      </div>
    </div>
  </footer>
</template>
```

- [ ] **Step 7: `app/layouts/default.vue`**

```vue
<template>
  <div class="flex min-h-dvh flex-col">
    <a href="#inhalt" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Zum Inhalt springen</a>
    <SiteHeader />
    <main id="inhalt" class="flex-1">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
```

- [ ] **Step 8: Prüfen**

In `app/pages/index.vue` vorübergehend:
```vue
<script setup lang="ts">
const mood = useHeroMood()
</script>
<template>
  <div class="container-page py-f-16">
    <h1 class="text-f-6xl">Test</h1>
    <div class="mt-8 aspect-[2/1] overflow-hidden rounded-2xl"><MoodImage :day="mood.day[0]" :night="mood.night[0]" eager /></div>
  </div>
</template>
```
Run: `yarn dev` → http://localhost:3000 öffnen: Header, Footer (dunkel), Bild; Tag/Nacht-Schalter tauscht Farben **und** Bild mit Überblendung; Reload im Nachtmodus blitzt nicht hell auf. Mobil (DevTools 360 px): Menü öffnet Sheet, Telefon-Icon sichtbar, kein horizontaler Scroll.
Run: `yarn test && yarn generate` · Expected: grün.

- [ ] **Step 9: Commit**

```bash
git add app/components app/layouts app/pages/index.vue
git commit -m "feat(layout): header, footer, logo, responsive and mood images"
```

---

### Task 9: Objektkarte, Schnellsuche, Startseite

**Files:**
- Create: `app/components/listing/Card.vue`, `listing/QuickSearch.vue`, `app/components/home/Hero.vue`, `home/Latest.vue`, `home/GrandTower.vue`, `home/Owners.vue`, `home/Personal.vue`, `home/References.vue`, `home/ContactBand.vue`
- Modify: `app/pages/index.vue` (ersetzen)

**Interfaces:**
- Consumes: Content-Composables, `priceText`, `mainArea`, `formatRooms`, `locationText`, `PROPERTY_TYPE_LABEL`, `MARKETING_LABEL`, `applyFilters`, `filtersToQuery`, `DEFAULT_FILTERS`
- Produces: `<ListingCard :listing="Listing" :eager?="boolean" heading-level?="3|2" />` (verlinkt auf `/angebote/<slug>` bzw. `/referenzen/<slug>`), `<ListingQuickSearch />`

- [ ] **Step 1: `app/components/listing/Card.vue`**

```vue
<script setup lang="ts">
import type { Listing } from '~/types/content'

const props = withDefaults(defineProps<{ listing: Listing, eager?: boolean, headingLevel?: 2 | 3 }>(), { eager: false, headingLevel: 3 })
const l = computed(() => props.listing)
const archived = computed(() => l.value.availability !== 'available')
const to = computed(() => `${archived.value ? '/referenzen/' : '/angebote/'}${l.value.slug}`)
const cover = computed(() => useFile(l.value.cover_image))
const area = computed(() => mainArea(l.value))
const meta = computed(() => [
  l.value.rooms ? formatRooms(l.value.rooms) : null,
  area.value?.value ?? null,
].filter(Boolean).join(' · '))
const badge = computed(() => (l.value.availability === 'sold' ? 'Verkauft' : l.value.availability === 'rented' ? 'Vermietet' : MARKETING_LABEL[l.value.marketing_type]))
</script>

<template>
  <article class="group relative flex flex-col">
    <div class="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
      <ResponsiveImage :file="cover" :eager="eager" sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw" alt="" />
      <div class="absolute left-3 top-3 flex gap-1.5">
        <Badge class="rounded-full border-0 bg-card px-2.5 py-1 text-xs font-semibold text-card-foreground">{{ badge }}</Badge>
        <Badge v-if="l.commission_free && !archived" class="rounded-full border-0 bg-card px-2.5 py-1 text-xs font-semibold text-card-foreground">Provisionsfrei</Badge>
      </div>
    </div>
    <p class="mt-4 text-sm text-muted-foreground">
      {{ [l.property_type ? PROPERTY_TYPE_LABEL[l.property_type] : null, locationText(l)].filter(Boolean).join(' · ') }}
    </p>
    <component :is="`h${headingLevel}`" class="mt-1 line-clamp-2 text-base font-semibold leading-snug tracking-tight">
      <NuxtLink :to="to" class="after:absolute after:inset-0 after:content-[''] group-hover:underline group-hover:underline-offset-4 focus-visible:outline-none focus-visible:after:rounded-xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50">
        {{ l.title }}
      </NuxtLink>
    </component>
    <p v-if="meta" class="mt-1.5 text-sm text-muted-foreground tabular">{{ meta }}</p>
    <p v-if="!archived && priceText(l)" class="mt-2 text-f-2xl font-semibold tabular">{{ priceText(l) }}</p>
  </article>
</template>
```

- [ ] **Step 2: `app/components/listing/QuickSearch.vue`**

```vue
<script setup lang="ts">
import type { MarketingType, PropertyType } from '~/types/content'

const listings = useAvailableListings()
const typ = ref<MarketingType>('kauf')
const art = ref<PropertyType | 'alle'>('alle')
const filters = computed(() => ({ ...DEFAULT_FILTERS, typ: typ.value, art: art.value === 'alle' ? null : art.value }))
const count = computed(() => applyFilters(listings, filters.value).length)
const to = computed(() => ({ path: '/angebote', query: filtersToQuery(filters.value) }))
const arts = Object.entries(PROPERTY_TYPE_LABEL) as [PropertyType, string][]
</script>

<template>
  <form class="flex flex-col gap-2 rounded-3xl bg-secondary p-2 sm:flex-row sm:items-center sm:rounded-full" role="search" aria-label="Schnellsuche" @submit.prevent="navigateTo(to)">
    <ToggleGroup :model-value="typ" type="single" class="rounded-full bg-background p-1" aria-label="Vermarktungsart" @update:model-value="(v) => v && (typ = v as MarketingType)">
      <ToggleGroupItem value="kauf" class="h-10 rounded-full px-5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Kaufen</ToggleGroupItem>
      <ToggleGroupItem value="miete" class="h-10 rounded-full px-5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">Mieten</ToggleGroupItem>
    </ToggleGroup>
    <Select v-model="art">
      <SelectTrigger class="h-12 min-w-44 rounded-full border-0 bg-background px-5 text-base" aria-label="Objektart">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="alle">Alle Objektarten</SelectItem>
        <SelectItem v-for="[key, label] in arts" :key="key" :value="key">{{ label }}</SelectItem>
      </SelectContent>
    </Select>
    <Button type="submit" class="h-12 rounded-full px-7 text-base tabular" variant="outline">
      {{ count }} {{ count === 1 ? 'Angebot' : 'Angebote' }} ansehen
    </Button>
  </form>
</template>
```
Hinweis: Der Submit ist bewusst `variant="outline"` – der Kaufen/Mieten-Umschalter trägt bereits die Aktionsfarbe (max. ein gefülltes Primär-Element im Hero).
Die ToggleGroup nutzt bewusst `:model-value` + Handler statt `v-model`: Bei `type="single"` liefert ein erneuter Klick auf das aktive Item `undefined` – das wird ignoriert.

- [ ] **Step 3: `app/components/home/Hero.vue`**

```vue
<script setup lang="ts">
const home = useHomeContent()
const mood = useHeroMood()
</script>

<template>
  <section class="container-page pb-f-16 pt-f-12" aria-labelledby="hero-title">
    <div class="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500">
      <h1 id="hero-title" class="max-w-[16ch] text-f-6xl">{{ home.hero.title }}</h1>
      <div class="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <p class="max-w-[48ch] text-f-xl text-muted-foreground">{{ home.hero.lead }}</p>
        <ListingQuickSearch />
      </div>
    </div>
    <div class="mt-f-8 grid grid-cols-2 gap-2.5 md:grid-cols-3 md:grid-rows-[16rem_16rem]">
      <div class="col-span-2 aspect-[3/2] overflow-hidden rounded-2xl md:row-span-2 md:aspect-auto">
        <MoodImage :day="mood.day[0]" :night="mood.night[0]" eager sizes="(min-width: 768px) 66vw, 100vw" />
      </div>
      <div class="aspect-[4/3] overflow-hidden rounded-2xl md:aspect-auto">
        <MoodImage :day="mood.day[1]" :night="mood.night[1]" sizes="(min-width: 768px) 33vw, 50vw" />
      </div>
      <div class="aspect-[4/3] overflow-hidden rounded-2xl md:aspect-auto">
        <MoodImage :day="mood.day[2]" :night="mood.night[2]" sizes="(min-width: 768px) 33vw, 50vw" />
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 4: `app/components/home/Latest.vue`**

```vue
<script setup lang="ts">
const home = useHomeContent()
const all = useAvailableListings()
const latest = computed(() => sortListings(all, 'neu').slice(0, 6))
</script>

<template>
  <section class="bg-secondary py-f-24" aria-labelledby="latest-title">
    <div class="container-page">
      <SiteSectionHeading id="latest-title" :title="home.latest.title" :intro="home.latest.intro" />
      <div class="grid gap-x-f-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        <ListingCard v-for="l in latest" :key="l.id" :listing="l" />
      </div>
      <div class="mt-f-12">
        <Button as-child class="h-12 rounded-full px-7 text-base">
          <NuxtLink to="/angebote">Alle {{ all.length }} Angebote ansehen</NuxtLink>
        </Button>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 5: `app/components/home/GrandTower.vue`** (immer Nacht)

```vue
<script setup lang="ts">
const home = useHomeContent()
const project = useProject('grand-tower')!
const units = useAvailableListings().filter((l) => l.project === 'grand-tower')
const rents = units.filter((l) => l.marketing_type === 'miete' && l.price != null).map((l) => l.price!)
const fromRent = rents.length ? formatEuro(Math.min(...rents)) : null
const bg = useFile(project.mood_night)
const photo = useFile(project.mood_day)
const height = project.facts.find((f) => f.label === 'Höhe')
</script>

<template>
  <section class="dark" aria-labelledby="gt-title">
    <div class="relative overflow-hidden bg-background py-f-24 text-foreground">
      <div class="absolute inset-0 opacity-35" aria-hidden="true">
        <ResponsiveImage :file="bg" sizes="100vw" alt="" />
      </div>
      <div class="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" aria-hidden="true" />
      <div class="container-page relative grid items-center gap-f-16 lg:grid-cols-12">
        <div class="lg:col-span-7">
          <p class="text-sm font-semibold text-muted-foreground">{{ home.grandTower.kicker }}</p>
          <h2 id="gt-title" class="mt-3 max-w-[18ch] text-f-4xl">{{ home.grandTower.title }}</h2>
          <p class="mt-4 max-w-[52ch] text-f-xl text-muted-foreground">{{ home.grandTower.text }}</p>
          <dl class="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            <div v-if="height"><dt class="text-sm text-muted-foreground">{{ height.label }}</dt><dd class="text-f-2xl font-semibold tabular">{{ height.value }}</dd></div>
            <div><dt class="text-sm text-muted-foreground">Verfügbare Wohnungen</dt><dd class="text-f-2xl font-semibold tabular">{{ units.length }}</dd></div>
            <div v-if="fromRent"><dt class="text-sm text-muted-foreground">Miete ab</dt><dd class="text-f-2xl font-semibold tabular">{{ fromRent }}</dd></div>
          </dl>
          <Button as-child class="mt-10 h-12 rounded-full px-7 text-base">
            <NuxtLink to="/grand-tower">Grand Tower entdecken</NuxtLink>
          </Button>
        </div>
        <div class="aspect-[4/3] overflow-hidden rounded-2xl lg:col-span-5">
          <ResponsiveImage :file="photo" sizes="(min-width: 1024px) 40vw, 100vw" />
        </div>
      </div>
    </div>
  </section>
</template>
```
Hinweis: `bg-background/85` ist Flächen-Overlay (kein Text) – Text liegt auf `background` ≥ 85 % Deckung über dem Foto; Kontrast in Task 16 im Browser prüfen.

- [ ] **Step 6: `app/components/home/Owners.vue`**

```vue
<script setup lang="ts">
import { Check } from '@lucide/vue'

const home = useHomeContent()
const services = useServicesContent()
</script>

<template>
  <section class="py-f-24" aria-labelledby="owners-title">
    <div class="container-page grid gap-f-16 lg:grid-cols-12">
      <div class="lg:col-span-5">
        <h2 id="owners-title" class="text-f-4xl">{{ home.owners.title }}</h2>
        <p class="mt-4 max-w-[48ch] text-f-xl text-muted-foreground">{{ home.owners.text }}</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <Button as-child variant="outline" class="h-12 rounded-full px-7 text-base">
            <NuxtLink to="/leistungen">Leistungen ansehen</NuxtLink>
          </Button>
        </div>
      </div>
      <div class="grid gap-10 sm:grid-cols-3 lg:col-span-7">
        <div v-for="group in services.groups" :key="group.title">
          <h3 class="border-b border-border pb-3 text-f-2xl">{{ group.title }}</h3>
          <ul class="mt-4 space-y-3 text-sm">
            <li v-for="item in group.items.slice(0, 4)" :key="item" class="flex gap-2.5">
              <Check class="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />{{ item }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 7: `app/components/home/Personal.vue`**

```vue
<script setup lang="ts">
const home = useHomeContent()
const company = useCompany()
const portrait = useFile(company.portrait)
</script>

<template>
  <section class="bg-secondary py-f-24" aria-labelledby="personal-title">
    <div class="container-page grid items-center gap-f-16 md:grid-cols-12">
      <div class="aspect-[4/5] overflow-hidden rounded-2xl md:col-span-5">
        <ResponsiveImage :file="portrait" sizes="(min-width: 768px) 40vw, 100vw" />
      </div>
      <div class="md:col-span-7">
        <h2 id="personal-title" class="text-f-4xl">{{ home.personal.title }}</h2>
        <p class="mt-4 max-w-[55ch] text-f-xl text-muted-foreground">{{ home.personal.text }}</p>
        <dl class="mt-10 grid gap-6 sm:grid-cols-3">
          <div v-for="fact in home.personal.facts" :key="fact.label" class="border-t border-border pt-4">
            <dt class="sr-only">{{ fact.label }}</dt>
            <dd class="text-f-4xl font-semibold tabular">{{ fact.value }}</dd>
            <dd class="mt-1 text-sm text-muted-foreground">{{ fact.label }}</dd>
          </div>
        </dl>
        <NuxtLink to="/ueber-uns" class="mt-8 inline-block font-semibold text-primary underline underline-offset-4">Mehr über uns</NuxtLink>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 8: `app/components/home/References.vue`**

```vue
<script setup lang="ts">
const home = useHomeContent()
const refs = sortListings(useArchivedListings(), 'neu')
</script>

<template>
  <section class="py-f-24" aria-labelledby="refs-title">
    <div class="container-page">
      <SiteSectionHeading id="refs-title" :title="home.references.title" :intro="home.references.intro" />
      <Carousel :opts="{ align: 'start' }" class="text-foreground" aria-label="Referenzobjekte">
        <CarouselContent class="-ml-5">
          <CarouselItem v-for="l in refs" :key="l.id" class="basis-4/5 pl-5 sm:basis-1/2 lg:basis-1/3">
            <ListingCard :listing="l" />
          </CarouselItem>
        </CarouselContent>
        <div class="mt-8 flex items-center gap-2">
          <CarouselPrevious class="static size-11 translate-y-0" aria-label="Vorherige Referenzen" />
          <CarouselNext class="static size-11 translate-y-0" aria-label="Nächste Referenzen" />
          <NuxtLink to="/referenzen" class="ml-4 font-semibold text-primary underline underline-offset-4">Alle Referenzen</NuxtLink>
        </div>
      </Carousel>
    </div>
  </section>
</template>
```

- [ ] **Step 9: `app/components/home/ContactBand.vue`**

```vue
<script setup lang="ts">
import { Mail, Phone } from '@lucide/vue'

const home = useHomeContent()
const company = useCompany()
</script>

<template>
  <section class="bg-secondary py-f-24" aria-labelledby="contact-title">
    <div class="container-page flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 id="contact-title" class="text-f-4xl">{{ home.contact.title }}</h2>
        <p class="mt-3 max-w-[48ch] text-f-xl text-muted-foreground">{{ home.contact.text }}</p>
      </div>
      <div class="flex flex-col gap-3 sm:flex-row">
        <Button as-child class="h-12 rounded-full px-7 text-base">
          <a :href="company.phone_href"><Phone class="size-4" aria-hidden="true" />Anrufen</a>
        </Button>
        <Button as-child variant="outline" class="h-12 rounded-full px-7 text-base">
          <NuxtLink to="/kontakt"><Mail class="size-4" aria-hidden="true" />Nachricht schreiben</NuxtLink>
        </Button>
      </div>
    </div>
  </section>
</template>
```

- [ ] **Step 10: `app/pages/index.vue` ersetzen**

```vue
<script setup lang="ts">
useSeoMeta({
  description: 'Pöhls Immobilien – Kaufen, mieten und verkaufen in Frankfurt und im Rhein-Main-Gebiet. Über 35 Jahre Markterfahrung.',
})
</script>

<template>
  <div>
    <HomeHero />
    <HomeLatest />
    <HomeGrandTower />
    <HomeOwners />
    <HomePersonal />
    <HomeReferences />
    <HomeContactBand />
  </div>
</template>
```

- [ ] **Step 11: Prüfen** – `yarn dev`, Startseite bei 360/768/1280 px, Tag und Nacht:
  - Schnellsuche: Zahl ändert sich mit Kaufen/Mieten/Objektart; Absenden führt zu `/angebote?typ=…`.
  - Grand-Tower-Band ist auch im Tag-Modus dunkel, Button in Gold.
  - Referenzen-Karussell: Pfeile innen, per Tastatur bedienbar, kein Autoplay.
  - Kein horizontaler Scroll bei 360 px.
  Run: `yarn test && yarn generate` · Expected: grün. (Bis Task 15 steht `failOnError: false` – Links auf noch fehlende Seiten erzeugen nur Warnungen.)

- [ ] **Step 12: Commit**

```bash
git add app/components/listing app/components/home app/pages/index.vue
git commit -m "feat(home): hero with quick search, latest listings, grand tower stage, owners, personal, references"
```

---

### Task 10: Angebotsseite mit Filtern

**Files:**
- Create: `app/components/listing/Filters.vue`, `app/pages/angebote/index.vue`

**Interfaces:**
- Consumes: `parseFilters`, `filtersToQuery`, `applyFilters`, `sortListings`, `activeFilterCount`, `PRICE_STEPS`, `ROOM_STEPS`, `DEFAULT_FILTERS`, `Filters`
- Produces: `<ListingFilters :filters="Filters" :count="number" @update="(patch: Partial<Filters>) => void" @reset="() => void" />`

- [ ] **Step 1: `app/components/listing/Filters.vue`**

```vue
<script setup lang="ts">
import { SlidersHorizontal } from '@lucide/vue'
import type { Filters, SortKey } from '~/utils/filters'
import type { MarketingType, PropertyType } from '~/types/content'

const props = defineProps<{ filters: Filters, count: number }>()
const emit = defineEmits<{ update: [patch: Partial<Filters>], reset: [] }>()
const open = ref(false)

const arts = Object.entries(PROPERTY_TYPE_LABEL) as [PropertyType, string][]
const priceSteps = computed(() => PRICE_STEPS[props.filters.typ ?? 'kauf'])
const active = computed(() => activeFilterCount(props.filters))

const typModel = computed({
  get: () => props.filters.typ ?? 'alle',
  set: (v: string) => emit('update', { typ: v === 'alle' ? null : (v as MarketingType), preis: null }),
})
const artModel = computed({
  get: () => props.filters.art ?? 'alle',
  set: (v: string) => emit('update', { art: v === 'alle' ? null : (v as PropertyType) }),
})
const zimmerModel = computed({
  get: () => (props.filters.zimmer ? String(props.filters.zimmer) : 'alle'),
  set: (v: string) => emit('update', { zimmer: v === 'alle' ? null : Number(v) }),
})
const preisModel = computed({
  get: () => (props.filters.preis ? String(props.filters.preis) : 'alle'),
  set: (v: string) => emit('update', { preis: v === 'alle' ? null : Number(v) }),
})
const sortModel = computed({
  get: () => props.filters.sort,
  set: (v: string) => emit('update', { sort: v as SortKey }),
})
</script>

<template>
  <div>
    <!-- Desktop -->
    <div class="hidden flex-wrap items-center gap-2 lg:flex">
      <ToggleGroup :model-value="typModel" type="single" class="rounded-full bg-secondary p-1" aria-label="Vermarktungsart" @update:model-value="(v) => v && (typModel = String(v))">
        <ToggleGroupItem value="alle" class="h-10 rounded-full px-4 data-[state=on]:bg-background data-[state=on]:shadow-sm">Alle</ToggleGroupItem>
        <ToggleGroupItem value="kauf" class="h-10 rounded-full px-4 data-[state=on]:bg-background data-[state=on]:shadow-sm">Kaufen</ToggleGroupItem>
        <ToggleGroupItem value="miete" class="h-10 rounded-full px-4 data-[state=on]:bg-background data-[state=on]:shadow-sm">Mieten</ToggleGroupItem>
      </ToggleGroup>
      <Select v-model="artModel">
        <SelectTrigger class="h-12 rounded-full px-5" aria-label="Objektart"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="alle">Alle Objektarten</SelectItem>
          <SelectItem v-for="[k, label] in arts" :key="k" :value="k">{{ label }}</SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="zimmerModel">
        <SelectTrigger class="h-12 rounded-full px-5" aria-label="Zimmer"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="alle">Zimmer: alle</SelectItem>
          <SelectItem v-for="z in ROOM_STEPS" :key="z" :value="String(z)">ab {{ z }} Zimmer</SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="preisModel">
        <SelectTrigger class="h-12 rounded-full px-5" aria-label="Preis bis"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="alle">Preis: alle</SelectItem>
          <SelectItem v-for="p in priceSteps" :key="p" :value="String(p)">bis {{ formatEuro(p) }}</SelectItem>
        </SelectContent>
      </Select>
      <Button v-if="active" variant="ghost" class="h-12 rounded-full px-5" @click="emit('reset')">Filter zurücksetzen</Button>
      <div class="ml-auto">
        <Select v-model="sortModel">
          <SelectTrigger class="h-12 rounded-full px-5" aria-label="Sortierung"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="neu">Neueste zuerst</SelectItem>
            <SelectItem value="preis-auf">Preis aufsteigend</SelectItem>
            <SelectItem value="preis-ab">Preis absteigend</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Mobile -->
    <div class="flex items-center justify-between gap-3 lg:hidden">
      <Sheet v-model:open="open">
        <SheetTrigger as-child>
          <Button variant="outline" class="h-12 rounded-full px-5">
            <SlidersHorizontal class="size-4" aria-hidden="true" />Filter<span v-if="active" class="tabular"> ({{ active }})</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" class="max-h-[85dvh] overflow-y-auto rounded-t-3xl">
          <SheetHeader><SheetTitle>Filter</SheetTitle></SheetHeader>
          <div class="grid gap-5 px-4 pb-6">
            <ToggleGroup :model-value="typModel" type="single" class="w-full rounded-full bg-secondary p-1" aria-label="Vermarktungsart" @update:model-value="(v) => v && (typModel = String(v))">
              <ToggleGroupItem value="alle" class="h-11 flex-1 rounded-full data-[state=on]:bg-background">Alle</ToggleGroupItem>
              <ToggleGroupItem value="kauf" class="h-11 flex-1 rounded-full data-[state=on]:bg-background">Kaufen</ToggleGroupItem>
              <ToggleGroupItem value="miete" class="h-11 flex-1 rounded-full data-[state=on]:bg-background">Mieten</ToggleGroupItem>
            </ToggleGroup>
            <div class="grid gap-2"><Label for="m-art">Objektart</Label>
              <Select v-model="artModel"><SelectTrigger id="m-art" class="h-12 w-full rounded-full text-base"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="alle">Alle Objektarten</SelectItem><SelectItem v-for="[k, label] in arts" :key="k" :value="k">{{ label }}</SelectItem></SelectContent>
              </Select>
            </div>
            <div class="grid gap-2"><Label for="m-zimmer">Zimmer</Label>
              <Select v-model="zimmerModel"><SelectTrigger id="m-zimmer" class="h-12 w-full rounded-full text-base"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="alle">Zimmer: alle</SelectItem><SelectItem v-for="z in ROOM_STEPS" :key="z" :value="String(z)">ab {{ z }} Zimmer</SelectItem></SelectContent>
              </Select>
            </div>
            <div class="grid gap-2"><Label for="m-preis">Preis bis</Label>
              <Select v-model="preisModel"><SelectTrigger id="m-preis" class="h-12 w-full rounded-full text-base"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="alle">Preis: alle</SelectItem><SelectItem v-for="p in priceSteps" :key="p" :value="String(p)">bis {{ formatEuro(p) }}</SelectItem></SelectContent>
              </Select>
            </div>
            <div class="flex gap-3 pt-2">
              <Button variant="ghost" class="h-12 flex-1 rounded-full" @click="emit('reset')">Filter zurücksetzen</Button>
              <Button class="h-12 flex-1 rounded-full tabular" @click="open = false">{{ count }} Angebote ansehen</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <Select v-model="sortModel">
        <SelectTrigger class="h-12 rounded-full px-5" aria-label="Sortierung"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="neu">Neueste zuerst</SelectItem>
          <SelectItem value="preis-auf">Preis aufsteigend</SelectItem>
          <SelectItem value="preis-ab">Preis absteigend</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
```

- [ ] **Step 2: `app/pages/angebote/index.vue`** (Hydration-Schutz: SSR/Prerender kennt keine Query → erst nach `onMounted` filtern)

```vue
<script setup lang="ts">
import { SearchX } from '@lucide/vue'
import type { Filters } from '~/utils/filters'

useSeoMeta({ title: 'Angebote', description: 'Aktuelle Eigentumswohnungen, Häuser, Gewerbe- und Anlageobjekte von Pöhls Immobilien in Frankfurt und Rhein-Main.' })

const route = useRoute()
const router = useRouter()
const all = useAvailableListings()
const hydrated = ref(false)
onMounted(() => { hydrated.value = true })

const filters = computed<Filters>(() => (hydrated.value ? parseFilters(route.query) : DEFAULT_FILTERS))
const results = computed(() => sortListings(applyFilters(all, filters.value), filters.value.sort))

function update(patch: Partial<Filters>) {
  router.replace({ query: filtersToQuery({ ...filters.value, ...patch }) })
}
function reset() {
  router.replace({ query: filtersToQuery({ ...DEFAULT_FILTERS, sort: filters.value.sort }) })
}
</script>

<template>
  <div>
    <div class="container-page pb-f-8 pt-f-12">
      <h1 class="text-f-6xl">Angebote</h1>
      <p class="mt-3 text-f-xl text-muted-foreground">Wohnungen, Häuser, Gewerbe- und Anlageobjekte in Frankfurt und Rhein-Main.</p>
    </div>
    <div class="sticky top-16 z-30 border-y border-border bg-background py-3 md:top-20">
      <div class="container-page">
        <ListingFilters :filters="filters" :count="results.length" @update="update" @reset="reset" />
      </div>
    </div>
    <div class="container-page py-f-12">
      <p class="mb-8 text-sm text-muted-foreground tabular" aria-live="polite">
        {{ results.length }} {{ results.length === 1 ? 'Angebot' : 'Angebote' }}
      </p>
      <div v-if="results.length" class="grid gap-x-f-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        <ListingCard v-for="(l, i) in results" :key="l.id" :listing="l" :eager="i < 3" :heading-level="2" />
      </div>
      <div v-else class="flex flex-col items-start gap-4 rounded-2xl bg-secondary p-f-12">
        <SearchX class="size-6 text-muted-foreground" aria-hidden="true" />
        <h2 class="text-f-2xl">Keine Angebote für diese Auswahl</h2>
        <p class="max-w-[48ch] text-muted-foreground">Passen Sie die Filter an oder sprechen Sie uns an – wir suchen gern gezielt für Sie.</p>
        <div class="flex flex-wrap gap-3">
          <Button class="h-12 rounded-full px-7 text-base" @click="reset">Filter zurücksetzen</Button>
          <Button as-child variant="outline" class="h-12 rounded-full px-7 text-base"><NuxtLink to="/kontakt">Suchauftrag besprechen</NuxtLink></Button>
        </div>
      </div>
    </div>
  </div>
</template>
```
Hinweis: `:heading-level="2"` mit Doppelpunkt – die Prop ist eine Zahl (`2 | 3`). Die Seite hat eine eigene `h1`, deshalb sind die Kartentitel hier `h2`.

- [ ] **Step 3: Prüfen**
  - `/angebote?typ=miete&art=wohnung` direkt laden → nur Mietwohnungen, Filter-Controls zeigen den Zustand, Konsole ohne Hydration-Warnung.
  - `/angebote?zimmer=abc&typ=x` → alle Angebote, keine Fehler.
  - Zurück-Taste nach Filteränderung: `router.replace` → verändert die History nicht (gewollt, Filter sind kein Seitenwechsel).
  - Leerer Zustand: `/angebote?typ=miete&art=grundstueck`.
  - Mobil: Filter-Sheet von unten, Button „n Angebote ansehen" schließt.
  Run: `yarn test` · Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add app/components/listing/Filters.vue app/pages/angebote/index.vue
git commit -m "feat(listings): filterable listing page with shareable urls"
```

---

### Task 11: Objekt-Detailseite, Galerie, Lightbox, Referenzen

**Files:**
- Create: `app/components/listing/Gallery.vue`, `listing/Lightbox.vue`, `listing/ContactBox.vue`, `listing/Detail.vue`, `app/pages/angebote/[slug].vue`, `app/pages/referenzen/index.vue`, `app/pages/referenzen/[slug].vue`

**Interfaces:**
- Produces: `<ListingLightbox v-model:open v-model:index :images="FileAsset[]" :title="string" />`, `<ListingGallery :images="FileAsset[]" :title="string" />`, `<ListingContactBox :listing="Listing" />`, `<ListingDetail :listing="Listing" />`

- [ ] **Step 1: `app/components/listing/Lightbox.vue`**

```vue
<script setup lang="ts">
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import type { FileAsset } from '~/types/content'

const props = defineProps<{ images: FileAsset[], title: string }>()
const open = defineModel<boolean>('open', { default: false })
const index = defineModel<number>('index', { default: 0 })
const current = computed(() => props.images[index.value] ?? null)

const go = (d: number) => { index.value = (index.value + d + props.images.length) % props.images.length }
let startX: number | null = null
const onPointerDown = (e: PointerEvent) => { startX = e.clientX }
const onPointerUp = (e: PointerEvent) => {
  if (startX == null) return
  const dx = e.clientX - startX
  if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
  startX = null
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="max-w-[min(96vw,1400px)] border-0 bg-background p-0 sm:max-w-[min(96vw,1400px)]" @keydown.left.prevent="go(-1)" @keydown.right.prevent="go(1)">
      <DialogTitle class="sr-only">{{ title }} – Bildergalerie</DialogTitle>
      <DialogDescription class="sr-only">Mit den Pfeiltasten blättern, Escape schließt.</DialogDescription>
      <div class="relative flex h-[80dvh] items-center justify-center touch-pan-y" @pointerdown="onPointerDown" @pointerup="onPointerUp">
        <img v-if="current" :src="assetUrl(current, 1600)" :alt="current.description" :width="current.width" :height="current.height" class="max-h-full max-w-full select-none object-contain" draggable="false">
        <Button variant="outline" size="icon" class="absolute left-3 top-1/2 size-11 -translate-y-1/2 rounded-full text-foreground" aria-label="Vorheriges Bild" @click="go(-1)"><ChevronLeft class="size-5" aria-hidden="true" /></Button>
        <Button variant="outline" size="icon" class="absolute right-3 top-1/2 size-11 -translate-y-1/2 rounded-full text-foreground" aria-label="Nächstes Bild" @click="go(1)"><ChevronRight class="size-5" aria-hidden="true" /></Button>
      </div>
      <p class="pb-4 text-center text-sm text-muted-foreground tabular" aria-live="polite">{{ index + 1 }} / {{ images.length }}</p>
    </DialogContent>
  </Dialog>
</template>
```

- [ ] **Step 2: `app/components/listing/Gallery.vue`**

```vue
<script setup lang="ts">
import { Images } from '@lucide/vue'
import type { FileAsset } from '~/types/content'

const props = defineProps<{ images: FileAsset[], title: string }>()
const open = ref(false)
const index = ref(0)
const show = (i: number) => { index.value = i; open.value = true }
const tiles = computed(() => props.images.slice(1, 5))
</script>

<template>
  <div>
    <div class="grid gap-2.5 md:grid-cols-4 md:grid-rows-[14rem_14rem]">
      <button type="button" class="relative aspect-[3/2] overflow-hidden rounded-2xl md:col-span-2 md:row-span-2 md:aspect-auto" :aria-label="`${title} – Bild 1 vergrößern`" @click="show(0)">
        <ResponsiveImage :file="images[0]" eager sizes="(min-width: 768px) 50vw, 100vw" />
      </button>
      <button v-for="(img, i) in tiles" :key="img.id" type="button" class="relative hidden overflow-hidden rounded-2xl md:block" :aria-label="`${title} – Bild ${i + 2} vergrößern`" @click="show(i + 1)">
        <ResponsiveImage :file="img" sizes="25vw" />
      </button>
    </div>
    <Button v-if="images.length > 1" variant="outline" class="mt-4 h-11 rounded-full px-5" @click="show(0)">
      <Images class="size-4" aria-hidden="true" />Alle {{ images.length }} Fotos
    </Button>
    <ListingLightbox v-model:open="open" v-model:index="index" :images="images" :title="title" />
  </div>
</template>
```

- [ ] **Step 3: `app/components/listing/ContactBox.vue`**

```vue
<script setup lang="ts">
import { Mail, Phone } from '@lucide/vue'
import type { Listing } from '~/types/content'

const props = defineProps<{ listing: Listing }>()
const company = useCompany()
const portrait = useFile(company.portrait)
const inquiry = computed(() => ({ path: '/kontakt', query: { objekt: props.listing.slug } }))
</script>

<template>
  <aside class="rounded-2xl bg-secondary p-6" aria-label="Ansprechpartner">
    <div class="flex items-center gap-4">
      <div class="size-16 shrink-0 overflow-hidden rounded-full">
        <ResponsiveImage :file="portrait" sizes="64px" alt="" />
      </div>
      <div>
        <p class="font-semibold">{{ company.owner }}</p>
        <p class="text-sm text-muted-foreground">Ihr Ansprechpartner</p>
      </div>
    </div>
    <div class="mt-6 grid gap-2">
      <Button as-child class="h-12 rounded-full text-base">
        <NuxtLink :to="inquiry"><Mail class="size-4" aria-hidden="true" />Objekt anfragen</NuxtLink>
      </Button>
      <Button as-child variant="outline" class="h-12 rounded-full text-base">
        <a :href="company.phone_href"><Phone class="size-4" aria-hidden="true" />{{ company.phone }}</a>
      </Button>
    </div>
  </aside>
</template>
```

- [ ] **Step 4: `app/components/listing/Detail.vue`** (für Angebote **und** Referenzen)

```vue
<script setup lang="ts">
import { Download, Mail, Phone } from '@lucide/vue'
import type { Listing } from '~/types/content'

const props = defineProps<{ listing: Listing }>()
const l = computed(() => props.listing)
const archived = computed(() => l.value.availability !== 'available')
const images = computed(() => useListingImages(l.value))
const company = useCompany()
const area = computed(() => mainArea(l.value))

const keyFacts = computed(() => [
  !archived.value && priceText(l.value) ? { label: priceLabel(l.value), value: priceText(l.value)! } : null,
  l.value.rooms ? { label: 'Zimmer', value: formatRooms(l.value.rooms).replace('\u00A0Zi.', '') } : null,
  area.value,
  !archived.value && l.value.total_rent ? { label: 'Gesamtmiete', value: `${formatEuro(l.value.total_rent)} / Monat` } : null,
  !archived.value && availableFromText(l.value.available_from) ? { label: 'Bezugsfrei ab', value: availableFromText(l.value.available_from)! } : null,
].filter((x): x is { label: string, value: string } => !!x))

const details = computed(() => [
  l.value.property_type ? { label: 'Objektart', value: PROPERTY_TYPE_LABEL[l.value.property_type] } : null,
  { label: 'Vermarktung', value: MARKETING_LABEL[l.value.marketing_type] },
  l.value.furnished ? { label: 'Ausstattung', value: 'möbliert' } : null,
  l.value.living_area && l.value.usable_area ? { label: 'Nutzfläche', value: formatArea(l.value.usable_area) } : null,
  l.value.plot_area && (l.value.living_area || l.value.usable_area) ? { label: 'Grundstück', value: formatArea(l.value.plot_area) } : null,
  ...l.value.features,
].filter((x): x is { label: string, value: string } => !!x))

const similar = computed(() => {
  const pool = useAvailableListings().filter((x) => x.id !== l.value.id && x.marketing_type === l.value.marketing_type)
  const same = pool.filter((x) => x.property_type === l.value.property_type)
  return [...same, ...pool.filter((x) => !same.includes(x))].slice(0, 3)
})
const address = computed(() => [l.value.street, [l.value.zip, l.value.city].filter(Boolean).join(' ')].filter(Boolean).join(', '))
const statusText = computed(() => (l.value.availability === 'sold' ? 'erfolgreich verkauft' : 'erfolgreich vermietet'))
</script>

<template>
  <article class="pb-24 lg:pb-0">
    <div class="container-page pt-f-8">
      <nav aria-label="Brotkrumen" class="mb-6 text-sm text-muted-foreground">
        <NuxtLink :to="archived ? '/referenzen' : '/angebote'" class="hover:text-foreground hover:underline">{{ archived ? 'Referenzen' : 'Angebote' }}</NuxtLink>
        <span aria-hidden="true"> / </span><span>{{ locationText(l) }}</span>
      </nav>
      <ListingGallery :images="images" :title="l.title" />
    </div>

    <div class="container-page mt-f-12 grid gap-f-16 lg:grid-cols-12">
      <div class="lg:col-span-8">
        <div class="flex flex-wrap gap-2">
          <Badge variant="secondary" class="rounded-full px-3 py-1">{{ archived ? (l.availability === 'sold' ? 'Verkauft' : 'Vermietet') : MARKETING_LABEL[l.marketing_type] }}</Badge>
          <Badge v-if="l.property_type" variant="secondary" class="rounded-full px-3 py-1">{{ PROPERTY_TYPE_LABEL[l.property_type] }}</Badge>
          <Badge v-if="l.commission_free && !archived" variant="secondary" class="rounded-full px-3 py-1">Provisionsfrei</Badge>
          <Badge v-if="l.furnished" variant="secondary" class="rounded-full px-3 py-1">Möbliert</Badge>
        </div>
        <h1 class="mt-4 text-f-4xl">{{ l.title }}</h1>
        <p class="mt-2 text-f-xl text-muted-foreground">{{ address || locationText(l) }}</p>

        <dl v-if="keyFacts.length" class="mt-8 grid grid-cols-2 gap-6 border-y border-border py-6 sm:grid-cols-3 lg:grid-cols-5">
          <div v-for="f in keyFacts" :key="f.label">
            <dt class="text-sm text-muted-foreground">{{ f.label }}</dt>
            <dd class="mt-1 text-f-2xl font-semibold tabular">{{ f.value }}</dd>
          </div>
        </dl>

        <div v-if="archived" class="mt-8 rounded-2xl bg-secondary p-6">
          <p class="font-semibold">Dieses Objekt wurde {{ statusText }}.</p>
          <p class="mt-1 text-muted-foreground">Sie möchten Ihre Immobilie ebenfalls verkaufen oder vermieten?</p>
          <Button as-child class="mt-4 h-12 rounded-full px-7 text-base"><NuxtLink to="/leistungen">Leistungen ansehen</NuxtLink></Button>
        </div>

        <section v-if="l.description" class="mt-f-12" aria-labelledby="desc-title">
          <h2 id="desc-title" class="text-f-2xl">Beschreibung</h2>
          <!-- eslint-disable-next-line vue/no-v-html -- escaped at build time -->
          <div class="prose-legacy mt-4" v-html="l.description" />
        </section>

        <section v-if="details.length" class="mt-f-12" aria-labelledby="details-title">
          <h2 id="details-title" class="text-f-2xl">Objektdaten</h2>
          <dl class="mt-4 divide-y divide-border border-y border-border">
            <div v-for="d in details" :key="d.label" class="grid grid-cols-2 gap-4 py-3">
              <dt class="text-muted-foreground">{{ d.label }}</dt>
              <dd class="tabular">{{ d.value }}</dd>
            </div>
          </dl>
        </section>

        <div v-if="l.expose && !archived" class="mt-f-8">
          <Button as-child variant="outline" class="h-12 rounded-full px-7 text-base">
            <a :href="l.expose.url" target="_blank" rel="noopener"><Download class="size-4" aria-hidden="true" />Exposé herunterladen</a>
          </Button>
        </div>
      </div>

      <div v-if="!archived" class="hidden lg:col-span-4 lg:block">
        <div class="sticky top-28"><ListingContactBox :listing="l" /></div>
      </div>
    </div>

    <section v-if="similar.length" class="container-page py-f-24" aria-labelledby="similar-title">
      <SiteSectionHeading id="similar-title" title="Das könnte Sie auch interessieren" />
      <div class="grid gap-x-f-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        <ListingCard v-for="s in similar" :key="s.id" :listing="s" />
      </div>
    </section>

    <!-- Mobile action bar -->
    <div v-if="!archived" class="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background p-3 lg:hidden">
      <div class="flex gap-2">
        <Button as-child variant="outline" class="h-12 flex-1 rounded-full text-base"><a :href="company.phone_href"><Phone class="size-4" aria-hidden="true" />Anrufen</a></Button>
        <Button as-child class="h-12 flex-1 rounded-full text-base"><NuxtLink :to="{ path: '/kontakt', query: { objekt: l.slug } }"><Mail class="size-4" aria-hidden="true" />Objekt anfragen</NuxtLink></Button>
      </div>
    </div>
  </article>
</template>
```
Hinweis zum Primär-Button: Auf der Detailseite ist „Objekt anfragen" die eine Primäraktion (Desktop in der Box, mobil in der Leiste – nie gleichzeitig sichtbar).

- [ ] **Step 5: Seiten**

`app/pages/angebote/[slug].vue`:
```vue
<script setup lang="ts">
const route = useRoute()
const listing = useListing(String(route.params.slug))
if (!listing || listing.availability !== 'available') {
  throw createError({ statusCode: 404, statusMessage: 'Angebot nicht gefunden', fatal: true })
}
const cover = useFile(listing.cover_image)
useSeoMeta({
  title: listing.title,
  description: listing.teaser,
  ogImage: cover ? assetUrl(cover, 1600) : undefined,
})
</script>

<template>
  <ListingDetail :listing="listing!" />
</template>
```

`app/pages/referenzen/[slug].vue`:
```vue
<script setup lang="ts">
const route = useRoute()
const listing = useListing(String(route.params.slug))
if (!listing || listing.availability === 'available') {
  throw createError({ statusCode: 404, statusMessage: 'Referenz nicht gefunden', fatal: true })
}
useSeoMeta({ title: `Referenz: ${listing.title}`, description: listing.teaser })
</script>

<template>
  <ListingDetail :listing="listing!" />
</template>
```

`app/pages/referenzen/index.vue`:
```vue
<script setup lang="ts">
useSeoMeta({ title: 'Referenzen', description: 'Von Pöhls Immobilien verkaufte und vermietete Objekte in Frankfurt und Rhein-Main.' })
const all = sortListings(useArchivedListings(), 'neu')
const filter = ref<'alle' | 'sold' | 'rented'>('alle')
const shown = computed(() => (filter.value === 'alle' ? all : all.filter((l) => l.availability === filter.value)))
</script>

<template>
  <div class="container-page py-f-12">
    <h1 class="text-f-6xl">Referenzen</h1>
    <p class="mt-3 max-w-[55ch] text-f-xl text-muted-foreground">Eine Auswahl der Objekte, die wir erfolgreich verkauft und vermietet haben.</p>
    <ToggleGroup :model-value="filter" type="single" class="mt-f-8 rounded-full bg-secondary p-1" aria-label="Referenzen filtern" @update:model-value="(v) => v && (filter = v as typeof filter)">
      <ToggleGroupItem value="alle" class="h-10 rounded-full px-4 data-[state=on]:bg-background">Alle</ToggleGroupItem>
      <ToggleGroupItem value="sold" class="h-10 rounded-full px-4 data-[state=on]:bg-background">Verkauft</ToggleGroupItem>
      <ToggleGroupItem value="rented" class="h-10 rounded-full px-4 data-[state=on]:bg-background">Vermietet</ToggleGroupItem>
    </ToggleGroup>
    <div class="mt-f-12 grid gap-x-f-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
      <ListingCard v-for="l in shown" :key="l.id" :listing="l" :heading-level="2" />
    </div>
  </div>
</template>
```

- [ ] **Step 6: Prüfen**
  - Ein Objekt mit vielen Bildern (EDEN), eins ohne Zimmer (Gewerbe), eins mit „Preis auf Anfrage", eins mit Jahresmiete, eine Pauschalmiete mit altem „Bezugsfrei ab" (zeigt „sofort"), ein Auslandsobjekt (Frankreich), eine Referenz (kein Preis, kein Anfragebutton).
  - Lightbox: Pfeiltasten, Escape, Swipe (DevTools Touch), Fokus bleibt im Dialog, „3 / 24".
  - Mobil: Aktionsleiste unten verdeckt keinen Inhalt (Seite hat `pb-24`).
  Run: `yarn test && yarn generate` · Expected: grün, alle Objekt- und Referenzseiten in `.output/public/angebote/*/index.html` bzw. `/referenzen/*/index.html`.

- [ ] **Step 7: Commit**

```bash
git add app/components/listing app/pages/angebote app/pages/referenzen
git commit -m "feat(listings): detail page with gallery, lightbox, contact box; references"
```

---

### Task 12: Grand-Tower-Seite

**Files:**
- Create: `app/pages/grand-tower.vue`

- [ ] **Step 1: Seite**

```vue
<script setup lang="ts">
const project = useProject('grand-tower')!
useSeoMeta({ title: project.title, description: project.tagline })
const hero = useFile(project.mood_night)
const photo = useFile(project.mood_day)
const units = sortListings(useAvailableListings().filter((l) => l.project === 'grand-tower'), 'preis-auf')
const rent = units.filter((l) => l.marketing_type === 'miete')
const buy = units.filter((l) => l.marketing_type === 'kauf')
const gallery = project.images.map((id) => useFile(id)).filter((f): f is NonNullable<typeof f> => !!f)
const open = ref(false)
const index = ref(0)
const facts = project.facts.map(({ label, value }) => ({ label, value }))
</script>

<template>
  <div class="dark">
    <div class="bg-background text-foreground">
      <section class="relative flex min-h-[70dvh] items-end overflow-hidden" aria-labelledby="gt-h1">
        <div class="absolute inset-0"><ResponsiveImage :file="hero" eager sizes="100vw" /></div>
        <div class="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" aria-hidden="true" />
        <div class="container-page relative pb-f-16 pt-40">
          <p class="text-sm font-semibold text-muted-foreground">{{ project.address }}</p>
          <h1 id="gt-h1" class="mt-3 text-f-6xl">{{ project.title }}</h1>
          <p class="mt-4 max-w-[40ch] text-f-xl">{{ project.tagline }}</p>
        </div>
      </section>

      <section class="container-page grid gap-f-16 py-f-24 lg:grid-cols-12" aria-label="Über den Grand Tower">
        <div class="lg:col-span-7">
          <p v-for="p in project.intro" :key="p" class="mb-4 max-w-[60ch] text-f-xl text-muted-foreground">{{ p }}</p>
          <dl class="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div v-for="f in facts" :key="f.label" class="border-t border-border pt-4">
              <dt class="text-sm text-muted-foreground">{{ f.label }}</dt>
              <dd class="mt-1 text-f-2xl font-semibold tabular">{{ f.value }}</dd>
            </div>
          </dl>
        </div>
        <div class="aspect-[4/5] overflow-hidden rounded-2xl lg:col-span-5"><ResponsiveImage :file="photo" sizes="(min-width: 1024px) 40vw, 100vw" /></div>
      </section>

      <section class="bg-secondary py-f-24" aria-labelledby="gt-units">
        <div class="container-page">
          <SiteSectionHeading id="gt-units" title="Verfügbare Wohnungen" :intro="`${units.length} Wohnungen im Grand Tower – zur Miete und zum Kauf.`" />
          <h3 v-if="rent.length" class="mb-6 text-f-2xl">Zur Miete</h3>
          <div v-if="rent.length" class="grid gap-x-f-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            <ListingCard v-for="l in rent" :key="l.id" :listing="l" />
          </div>
          <h3 v-if="buy.length" class="mb-6 mt-f-16 text-f-2xl">Zum Kauf</h3>
          <div v-if="buy.length" class="grid gap-x-f-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            <ListingCard v-for="l in buy" :key="l.id" :listing="l" />
          </div>
        </div>
      </section>

      <section v-if="gallery.length" class="container-page py-f-24" aria-labelledby="gt-gallery">
        <SiteSectionHeading id="gt-gallery" title="Eindrücke" />
        <div class="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          <button v-for="(img, i) in gallery.slice(0, 12)" :key="img.id" type="button" class="aspect-[4/3] overflow-hidden rounded-xl" :aria-label="`Bild ${i + 1} von ${gallery.length} vergrößern`" @click="index = i; open = true">
            <ResponsiveImage :file="img" sizes="(min-width: 768px) 25vw, 50vw" />
          </button>
        </div>
        <Button v-if="gallery.length > 12" variant="outline" class="mt-6 h-11 rounded-full px-5 text-foreground" @click="index = 0; open = true">Alle {{ gallery.length }} Fotos</Button>
        <ListingLightbox v-model:open="open" v-model:index="index" :images="gallery" :title="project.title" />
      </section>

      <section class="border-t border-border py-f-24" aria-labelledby="gt-contact">
        <div class="container-page flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="gt-contact" class="text-f-4xl">Interesse am Grand Tower?</h2>
            <p class="mt-3 max-w-[48ch] text-f-xl text-muted-foreground">Wir zeigen Ihnen die verfügbaren Wohnungen gern persönlich.</p>
          </div>
          <Button as-child class="h-12 rounded-full px-7 text-base"><NuxtLink :to="{ path: '/kontakt', query: { thema: 'grand-tower' } }">Besichtigung anfragen</NuxtLink></Button>
        </div>
      </section>
    </div>
  </div>
</template>
```
Hinweis: Die Lightbox (Dialog) rendert per Portal **außerhalb** des `.dark`-Wrappers → sie erscheint im aktuellen Modus. Das ist akzeptiert (Dialog ist neutral). Falls sie im Tag-Modus stört: `DialogContent` in Lightbox eine Prop `forceDark` geben, die `class="dark"` setzt.

- [ ] **Step 2: Prüfen** – Seite im Tag-Modus komplett dunkel (Header bleibt hell – gewollt), Gold-Buttons, Hero-Text lesbar über dem Foto (Verlauf), 5 Wohnungen (4 Miete, 1 Kauf), Galerie + Lightbox.
Sichtprüfung der Galerie: Enthalten Bilder ein eingebranntes Logo-Feld links (wie die Legacy-Startseite)? Falls ja: `crop_left` in `mood.json` um eine zweite Quelle erweitern (Build-Skript: `cropIds` für beide Seiten bilden) und `yarn content` neu laufen lassen.
Run: `yarn generate` · Expected: grün.

- [ ] **Step 3: Commit**

```bash
git add app/pages/grand-tower.vue
git commit -m "feat(grand-tower): project page in night look"
```

---

### Task 13: Leistungen und Über uns

**Files:**
- Create: `app/pages/leistungen.vue`, `app/pages/ueber-uns.vue`

- [ ] **Step 1: `app/pages/leistungen.vue`**

```vue
<script setup lang="ts">
import { Check } from '@lucide/vue'

const s = useServicesContent()
useSeoMeta({ title: 'Leistungen', description: s.lead })
</script>

<template>
  <div>
    <section class="container-page py-f-12">
      <h1 class="max-w-[18ch] text-f-6xl">{{ s.title }}</h1>
      <p class="mt-4 max-w-[55ch] text-f-xl text-muted-foreground">{{ s.lead }}</p>
    </section>

    <section class="container-page grid gap-f-12 pb-f-24 md:grid-cols-3" aria-label="Leistungsbereiche">
      <div v-for="g in s.groups" :key="g.title">
        <h2 class="border-b border-border pb-3 text-f-2xl">{{ g.title }}</h2>
        <ul class="mt-5 space-y-3">
          <li v-for="item in g.items" :key="item" class="flex gap-3"><Check class="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />{{ item }}</li>
        </ul>
      </div>
    </section>

    <section class="bg-secondary py-f-24" aria-labelledby="steps-title">
      <div class="container-page">
        <SiteSectionHeading id="steps-title" title="So läuft eine Vermarktung ab" />
        <ol class="grid gap-8 md:grid-cols-5">
          <li v-for="(step, i) in s.steps" :key="step.title" class="border-t-2 border-foreground pt-4">
            <span class="text-sm font-semibold text-muted-foreground tabular">Schritt {{ i + 1 }}</span>
            <h3 class="mt-1 text-f-2xl">{{ step.title }}</h3>
            <p class="mt-2 text-sm text-muted-foreground">{{ step.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <HomeContactBand />
  </div>
</template>
```
Hinweis: `HomeContactBand` hat `bg-secondary` wie die Sektion davor → Flächenregel „benachbarte Sektionen wechseln" verletzt. Deshalb im ContactBand eine Prop `surface?: 'secondary' | 'background'` (Default `'secondary'`) ergänzen und hier `surface="background"` übergeben:
```vue
<!-- ContactBand.vue: -->
const props = withDefaults(defineProps<{ surface?: 'secondary' | 'background' }>(), { surface: 'secondary' })
<section :class="props.surface === 'secondary' ? 'bg-secondary' : 'bg-background'" class="py-f-24" …>
```

- [ ] **Step 2: `app/pages/ueber-uns.vue`**

```vue
<script setup lang="ts">
const a = useAboutContent()
const company = useCompany()
const portrait = useFile(company.portrait)
useSeoMeta({ title: a.title, description: a.lead })
</script>

<template>
  <div>
    <section class="container-page grid items-end gap-f-16 py-f-12 md:grid-cols-12">
      <div class="md:col-span-7">
        <h1 class="text-f-6xl">{{ a.title }}</h1>
        <p class="mt-4 max-w-[48ch] text-f-xl text-muted-foreground">{{ a.lead }}</p>
      </div>
      <figure class="md:col-span-5">
        <div class="aspect-[4/5] overflow-hidden rounded-2xl"><ResponsiveImage :file="portrait" eager sizes="(min-width: 768px) 40vw, 100vw" /></div>
        <figcaption class="mt-3 text-sm text-muted-foreground">{{ company.owner }}, Inhaber</figcaption>
      </figure>
    </section>
    <section class="container-page pb-f-24">
      <div class="grid gap-f-12 md:grid-cols-3">
        <div v-for="sec in a.sections" :key="sec.title">
          <h2 class="text-f-2xl">{{ sec.title }}</h2>
          <p v-for="p in sec.text" :key="p" class="mt-3 text-muted-foreground">{{ p }}</p>
        </div>
      </div>
    </section>
    <HomeContactBand />
  </div>
</template>
```

- [ ] **Step 3: Prüfen** – beide Seiten bei 360/1280 px, Tag/Nacht. Run: `yarn generate` · Expected: grün.

- [ ] **Step 4: Commit**

```bash
git add app/pages/leistungen.vue app/pages/ueber-uns.vue app/components/home/ContactBand.vue
git commit -m "feat(pages): services and about"
```

---

### Task 14: Kontakt mit Formular-Validierung

**Files:**
- Create: `app/utils/contact.ts`, `tests/app/contact.test.ts`, `app/components/contact/Form.vue`, `app/pages/kontakt.vue`

**Interfaces:**
- Produces (`app/utils/contact.ts`):
  - `type Concern = 'kaufen'|'mieten'|'verkaufen'|'vermieten'|'sonstiges'`
  - `interface ContactValues { name: string, email: string, phone: string, concern: Concern, subject: string, message: string }`
  - `validateContact(v: ContactValues): Partial<Record<keyof ContactValues, string>>`
  - `resolveInquiry(query: Record<string, unknown>, listings: Listing[]): { subject: string, concern: Concern }`

- [ ] **Step 1: Failing tests** – `tests/app/contact.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { validateContact, resolveInquiry } from '~/utils/contact'
import type { Listing } from '~/types/content'

const ok = { name: 'Erika Muster', email: 'erika@example.de', phone: '', concern: 'kaufen' as const, subject: '', message: 'Ich interessiere mich für die Wohnung.' }

describe('validateContact', () => {
  it('accepts a valid message', () => {
    expect(validateContact(ok)).toEqual({})
  })
  it('requires name, e-mail and message with helpful texts', () => {
    expect(validateContact({ ...ok, name: ' ', email: '', message: '' })).toEqual({
      name: 'Bitte geben Sie Ihren Namen an.',
      email: 'Bitte geben Sie Ihre E-Mail-Adresse an.',
      message: 'Bitte schreiben Sie uns kurz, worum es geht.',
    })
  })
  it('checks e-mail format and tolerates surrounding spaces', () => {
    expect(validateContact({ ...ok, email: 'erika@' }).email).toBe('Bitte prüfen Sie die E-Mail-Adresse – sie sollte etwa so aussehen: name@beispiel.de')
    expect(validateContact({ ...ok, email: '  erika@example.de ' })).toEqual({})
  })
  it('accepts common phone formats and rejects letters', () => {
    expect(validateContact({ ...ok, phone: '+49 (0) 69 123-456' })).toEqual({})
    expect(validateContact({ ...ok, phone: 'abc' }).phone).toBe('Bitte nur Ziffern, Leerzeichen und + ( ) - / verwenden.')
  })
})

describe('resolveInquiry', () => {
  const listings = [{ slug: 'eden', title: 'EDEN – Luxuriöses Wohnambiente', marketing_type: 'kauf', availability: 'available' }] as Listing[]
  it('prefills subject and concern for a known listing', () => {
    expect(resolveInquiry({ objekt: 'eden' }, listings)).toEqual({ subject: 'Anfrage zu: EDEN – Luxuriöses Wohnambiente', concern: 'kaufen' })
  })
  it('handles grand tower topic', () => {
    expect(resolveInquiry({ thema: 'grand-tower' }, listings)).toEqual({ subject: 'Anfrage: Grand Tower', concern: 'mieten' })
  })
  it('ignores unknown or malformed params', () => {
    expect(resolveInquiry({ objekt: 'gibts-nicht' }, listings)).toEqual({ subject: '', concern: 'sonstiges' })
    expect(resolveInquiry({ objekt: ['eden', 'x'] }, listings).subject).toBe('Anfrage zu: EDEN – Luxuriöses Wohnambiente')
    expect(resolveInquiry({}, listings)).toEqual({ subject: '', concern: 'sonstiges' })
  })
})
```

- [ ] **Step 2:** Run: `yarn test` · Expected: FAIL

- [ ] **Step 3: `app/utils/contact.ts`**

```ts
import type { Listing } from '~/types/content'

export type Concern = 'kaufen' | 'mieten' | 'verkaufen' | 'vermieten' | 'sonstiges'
export interface ContactValues {
  name: string
  email: string
  phone: string
  concern: Concern
  subject: string
  message: string
}

export const CONCERN_LABEL: Record<Concern, string> = {
  kaufen: 'Ich möchte kaufen', mieten: 'Ich möchte mieten', verkaufen: 'Ich möchte verkaufen',
  vermieten: 'Ich möchte vermieten', sonstiges: 'Sonstiges',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[\d\s+()\-/]{5,}$/

export function validateContact(v: ContactValues): Partial<Record<keyof ContactValues, string>> {
  const e: Partial<Record<keyof ContactValues, string>> = {}
  if (!v.name.trim()) e.name = 'Bitte geben Sie Ihren Namen an.'
  const mail = v.email.trim()
  if (!mail) e.email = 'Bitte geben Sie Ihre E-Mail-Adresse an.'
  else if (!EMAIL_RE.test(mail)) e.email = 'Bitte prüfen Sie die E-Mail-Adresse – sie sollte etwa so aussehen: name@beispiel.de'
  if (v.phone.trim() && !PHONE_RE.test(v.phone.trim())) e.phone = 'Bitte nur Ziffern, Leerzeichen und + ( ) - / verwenden.'
  if (!v.message.trim()) e.message = 'Bitte schreiben Sie uns kurz, worum es geht.'
  return e
}

const firstString = (v: unknown) => {
  const x = Array.isArray(v) ? v[0] : v
  return typeof x === 'string' ? x : ''
}

export function resolveInquiry(query: Record<string, unknown>, listings: Listing[]): { subject: string, concern: Concern } {
  const slug = firstString(query.objekt)
  const listing = slug ? listings.find((l) => l.slug === slug && l.availability === 'available') : undefined
  if (listing) return { subject: `Anfrage zu: ${listing.title}`, concern: listing.marketing_type === 'kauf' ? 'kaufen' : 'mieten' }
  if (firstString(query.thema) === 'grand-tower') return { subject: 'Anfrage: Grand Tower', concern: 'mieten' }
  return { subject: '', concern: 'sonstiges' }
}
```

- [ ] **Step 4:** Run: `yarn test` · Expected: PASS

- [ ] **Step 5: `app/components/contact/Form.vue`**

```vue
<script setup lang="ts">
import { CircleAlert, CircleCheck } from '@lucide/vue'
import type { Concern, ContactValues } from '~/utils/contact'

// PROTOTYPE: validates and confirms, but sends nothing (spec E6).
const route = useRoute()
const values = reactive<ContactValues>({ name: '', email: '', phone: '', concern: 'sonstiges', subject: '', message: '' })
const errors = ref<Partial<Record<keyof ContactValues, string>>>({})
const touched = reactive<Partial<Record<keyof ContactValues, boolean>>>({})
const sent = ref(false)
const successEl = ref<HTMLElement | null>(null)

onMounted(() => {
  const r = resolveInquiry(route.query, useAvailableListings())
  values.subject = r.subject
  values.concern = r.concern
})

function blur(field: keyof ContactValues) {
  touched[field] = true
  errors.value = { ...errors.value, [field]: validateContact(values)[field] }
}

async function submit() {
  errors.value = validateContact(values)
  const firstError = Object.keys(errors.value)[0]
  if (firstError) {
    document.getElementById(`f-${firstError}`)?.focus()
    return
  }
  sent.value = true
  await nextTick()
  successEl.value?.focus()
}

const concerns = Object.entries(CONCERN_LABEL) as [Concern, string][]
const describedBy = (f: keyof ContactValues) => (errors.value[f] ? `e-${f}` : undefined)
</script>

<template>
  <div v-if="sent" ref="successEl" tabindex="-1" class="rounded-2xl bg-secondary p-8 outline-none" role="status">
    <CircleCheck class="size-6 text-primary" aria-hidden="true" />
    <h2 class="mt-3 text-f-2xl">Vielen Dank, {{ values.name.trim().split(' ')[0] }}!</h2>
    <p class="mt-2 text-muted-foreground">Ihre Nachricht ist angekommen. Wir melden uns innerhalb eines Werktags.</p>
  </div>

  <form v-else novalidate class="grid gap-6" @submit.prevent="submit">
    <div class="grid gap-2">
      <Label for="f-name">Name</Label>
      <Input id="f-name" v-model="values.name" autocomplete="name" class="h-12 text-base" :aria-invalid="!!errors.name" :aria-describedby="describedBy('name')" @blur="blur('name')" />
      <p v-if="errors.name" :id="'e-name'" class="flex items-center gap-1.5 text-sm text-destructive"><CircleAlert class="size-4" aria-hidden="true" />{{ errors.name }}</p>
    </div>
    <div class="grid gap-6 sm:grid-cols-2">
      <div class="grid gap-2">
        <Label for="f-email">E-Mail</Label>
        <Input id="f-email" v-model="values.email" type="email" autocomplete="email" inputmode="email" class="h-12 text-base" :aria-invalid="!!errors.email" :aria-describedby="describedBy('email')" @blur="blur('email')" />
        <p v-if="errors.email" id="e-email" class="flex items-center gap-1.5 text-sm text-destructive"><CircleAlert class="size-4 shrink-0" aria-hidden="true" />{{ errors.email }}</p>
      </div>
      <div class="grid gap-2">
        <Label for="f-phone">Telefon <span class="font-normal text-muted-foreground">(optional)</span></Label>
        <Input id="f-phone" v-model="values.phone" type="tel" autocomplete="tel" inputmode="tel" class="h-12 text-base" :aria-invalid="!!errors.phone" :aria-describedby="describedBy('phone')" @blur="blur('phone')" />
        <p v-if="errors.phone" id="e-phone" class="flex items-center gap-1.5 text-sm text-destructive"><CircleAlert class="size-4 shrink-0" aria-hidden="true" />{{ errors.phone }}</p>
      </div>
    </div>
    <div class="grid gap-2">
      <Label for="f-concern">Ihr Anliegen</Label>
      <Select v-model="values.concern">
        <SelectTrigger id="f-concern" class="h-12 w-full text-base"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem v-for="[k, label] in concerns" :key="k" :value="k">{{ label }}</SelectItem></SelectContent>
      </Select>
    </div>
    <div v-if="values.subject" class="grid gap-2">
      <Label for="f-subject">Betreff</Label>
      <Input id="f-subject" v-model="values.subject" class="h-12 text-base" />
    </div>
    <div class="grid gap-2">
      <Label for="f-message">Nachricht</Label>
      <Textarea id="f-message" v-model="values.message" rows="6" class="text-base" :aria-invalid="!!errors.message" :aria-describedby="describedBy('message')" @blur="blur('message')" />
      <p v-if="errors.message" id="e-message" class="flex items-center gap-1.5 text-sm text-destructive"><CircleAlert class="size-4" aria-hidden="true" />{{ errors.message }}</p>
    </div>
    <p class="text-sm text-muted-foreground">Mit dem Absenden stimmen Sie zu, dass wir Ihre Angaben zur Bearbeitung der Anfrage verwenden. Mehr in der <NuxtLink to="/datenschutz" class="text-primary underline underline-offset-4">Datenschutzerklärung</NuxtLink>.</p>
    <div><Button type="submit" class="h-12 rounded-full px-7 text-base">Nachricht senden</Button></div>
  </form>
</template>
```

- [ ] **Step 6: `app/pages/kontakt.vue`**

```vue
<script setup lang="ts">
import { Mail, MapPin, Phone, Smartphone } from '@lucide/vue'

const company = useCompany()
useSeoMeta({ title: 'Kontakt', description: `Kontakt zu ${company.name} in ${company.city}: Telefon ${company.phone}, E-Mail ${company.email}.` })
</script>

<template>
  <div class="container-page grid gap-f-16 py-f-12 lg:grid-cols-12">
    <div class="lg:col-span-5">
      <h1 class="text-f-6xl">Kontakt</h1>
      <p class="mt-4 max-w-[40ch] text-f-xl text-muted-foreground">Wir beraten Sie persönlich und unverbindlich – am Telefon, per E-Mail oder vor Ort.</p>
      <ul class="mt-10 space-y-5">
        <li class="flex gap-3"><Phone class="mt-1 size-5 text-muted-foreground" aria-hidden="true" /><div><span class="block text-sm text-muted-foreground">Telefon</span><a :href="company.phone_href" class="font-semibold tabular hover:underline">{{ company.phone }}</a></div></li>
        <li class="flex gap-3"><Smartphone class="mt-1 size-5 text-muted-foreground" aria-hidden="true" /><div><span class="block text-sm text-muted-foreground">Mobil</span><a :href="company.mobile_href" class="font-semibold tabular hover:underline">{{ company.mobile }}</a></div></li>
        <li class="flex gap-3"><Mail class="mt-1 size-5 text-muted-foreground" aria-hidden="true" /><div><span class="block text-sm text-muted-foreground">E-Mail</span><a :href="`mailto:${company.email}`" class="font-semibold hover:underline">{{ company.email }}</a></div></li>
        <li class="flex gap-3"><MapPin class="mt-1 size-5 text-muted-foreground" aria-hidden="true" /><div><span class="block text-sm text-muted-foreground">Adresse</span><address class="font-semibold not-italic">{{ company.street }}<br>{{ company.zip }} {{ company.city }}</address></div></li>
      </ul>
    </div>
    <div class="lg:col-span-7">
      <h2 class="mb-6 text-f-2xl">Nachricht schreiben</h2>
      <ContactForm />
    </div>
  </div>
</template>
```

- [ ] **Step 7: Prüfen** – `/kontakt?objekt=<echter-slug>` → Betreff vorausgefüllt, Anliegen passend; `/kontakt?objekt=gibts-nicht` → leer, kein Fehler; Absenden leer → Fokus auf erstes Fehlerfeld, Fehlertexte mit Icon; gültig → Erfolgsmeldung erhält Fokus. Tastatur-only durchspielen. Run: `yarn test && yarn generate` · Expected: grün.

- [ ] **Step 8: Commit**

```bash
git add app/utils/contact.ts tests/app/contact.test.ts app/components/contact app/pages/kontakt.vue
git commit -m "feat(contact): validated contact form (prototype, no sending)"
```

---

### Task 15: Rechtstexte, 404, noindex, Netlify

**Files:**
- Create: `app/pages/impressum.vue`, `app/pages/datenschutz.vue`, `app/pages/agb.vue`, `app/error.vue`, `netlify.toml`
- Modify: `public/robots.txt`

- [ ] **Step 1: `app/pages/impressum.vue`** (aus `company.json`)

```vue
<script setup lang="ts">
const c = useCompany()
useSeoMeta({ title: 'Impressum' })
</script>

<template>
  <div class="container-page py-f-12">
    <h1 class="text-f-6xl">Impressum</h1>
    <div class="prose-legacy mt-f-8">
      <p><b>{{ c.name }}</b><br>{{ c.owner }}<br>{{ c.street }}<br>{{ c.zip }} {{ c.city }}</p>
      <p>Telefon: <a :href="c.phone_href">{{ c.phone }}</a><br>Mobil: <a :href="c.mobile_href">{{ c.mobile }}</a><br>E-Mail: <a :href="`mailto:${c.email}`">{{ c.email }}</a><br>Website: {{ c.web }}</p>
      <p>Firmensitz / Registergericht: {{ c.register_court }}<br>Handelsregisternummer: {{ c.register_number }}<br>Umsatzsteuer-Identifikationsnummer: {{ c.vat_id }}<br>Berufskammer: {{ c.chamber }}</p>
      <p>Inhaltlich verantwortlich: {{ c.responsible }}</p>
    </div>
  </div>
</template>
```

- [ ] **Step 2: `app/pages/datenschutz.vue`**

```vue
<script setup lang="ts">
const page = useLegalPage('datenschutz')
useSeoMeta({ title: page.title })
</script>

<template>
  <div class="container-page grid gap-f-16 py-f-12 lg:grid-cols-12">
    <div class="lg:col-span-8">
      <h1 class="text-f-6xl">{{ page.title }}</h1>
      <!-- eslint-disable-next-line vue/no-v-html -- sanitized at build time -->
      <div class="prose-legacy mt-f-8" v-html="page.html" />
    </div>
    <nav v-if="page.toc.length" aria-label="Inhaltsverzeichnis" class="order-first lg:order-none lg:col-span-4">
      <div class="lg:sticky lg:top-28">
        <h2 class="text-sm font-semibold">Inhalt</h2>
        <ol class="mt-3 space-y-2 text-sm text-muted-foreground">
          <li v-for="t in page.toc" :key="t.id"><a :href="`#${t.id}`" class="hover:text-foreground hover:underline">{{ t.title }}</a></li>
        </ol>
      </div>
    </nav>
  </div>
</template>
```

- [ ] **Step 3: `app/pages/agb.vue`**

```vue
<script setup lang="ts">
const page = useLegalPage('agb')
useSeoMeta({ title: 'AGB' })
</script>

<template>
  <div class="container-page py-f-12">
    <h1 class="text-f-6xl">{{ page.title }}</h1>
    <!-- eslint-disable-next-line vue/no-v-html -- sanitized at build time -->
    <div class="prose-legacy mt-f-8" v-html="page.html" />
  </div>
</template>
```

- [ ] **Step 4: `app/error.vue`**

```vue
<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error.statusCode === 404)
useSeoMeta({ title: is404.value ? 'Seite nicht gefunden' : 'Fehler' })
</script>

<template>
  <NuxtLayout>
    <div class="container-page py-f-24">
      <p class="text-sm font-semibold text-muted-foreground tabular">{{ error.statusCode }}</p>
      <h1 class="mt-2 max-w-[18ch] text-f-6xl">{{ is404 ? 'Diese Seite gibt es nicht (mehr).' : 'Hier ist etwas schiefgegangen.' }}</h1>
      <p class="mt-4 max-w-[48ch] text-f-xl text-muted-foreground">
        {{ is404 ? 'Vielleicht wurde das Objekt bereits verkauft oder vermietet. Unsere aktuellen Angebote finden Sie hier:' : 'Bitte versuchen Sie es erneut oder kehren Sie zur Startseite zurück.' }}
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <Button as-child class="h-12 rounded-full px-7 text-base"><NuxtLink to="/angebote">Angebote ansehen</NuxtLink></Button>
        <Button as-child variant="outline" class="h-12 rounded-full px-7 text-base"><NuxtLink to="/">Zur Startseite</NuxtLink></Button>
      </div>
    </div>
  </NuxtLayout>
</template>
```

- [ ] **Step 5: `public/robots.txt` ersetzen**

```
User-agent: *
Disallow: /
```

- [ ] **Step 6: `netlify.toml`**

```toml
[build]
  command = "yarn generate"
  publish = ".output/public"

[[headers]]
  for = "/*"
  [headers.values]
    X-Robots-Tag = "noindex, nofollow"
    Referrer-Policy = "strict-origin-when-cross-origin"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "/media/*"
  [headers.values]
    Cache-Control = "public, max-age=604800"

[[headers]]
  for = "/_nuxt/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

- [ ] **Step 7: Prerender scharf schalten** – in `nuxt.config.ts` `failOnError: false` → `failOnError: true` und den Kommentar darüber löschen. Ab jetzt bricht jeder Link auf eine fehlende Seite den Build ab.

- [ ] **Step 8: Prüfen**

Run: `yarn test && yarn generate`
Expected: grün; `.output/public/404.html`, `impressum/index.html`, `datenschutz/index.html`, `agb/index.html` vorhanden; jede HTML-Datei enthält `noindex`:
```bash
grep -L 'noindex' $(find .output/public -name '*.html') | head
```
Expected: keine Ausgabe.

- [ ] **Step 9: Commit**

```bash
git add app/pages/impressum.vue app/pages/datenschutz.vue app/pages/agb.vue app/error.vue public/robots.txt netlify.toml nuxt.config.ts
git commit -m "feat(site): legal pages, error page, noindex and netlify config"
```

---

### Task 16: Qualitätsprüfung, Faktencheck, Deployment

**Files:**
- Create: `scripts/qa/check-links.mjs`, `scripts/qa/screenshots.mjs`
- Modify: `package.json` (Scripts `qa:links`, `qa:shots`, devDependencies `puppeteer-core`, `serve`), ggf. `content/manual/grand-tower.json`

- [ ] **Step 1: Abhängigkeiten**

```bash
yarn add -D puppeteer-core serve
```

- [ ] **Step 2: `scripts/qa/check-links.mjs`** – prüft, dass jeder interne Link und jede interne Bild-/Asset-URL in den generierten HTML-Dateien auf eine existierende Datei zeigt:

```js
#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = '.output/public'
const htmlFiles = []
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (p.endsWith('.html')) htmlFiles.push(p) } }
walk(ROOT)

const exists = (url) => {
  const clean = decodeURIComponent(url.split(/[?#]/)[0])
  const p = path.join(ROOT, clean)
  return fs.existsSync(p) && fs.statSync(p).isFile() || fs.existsSync(path.join(p, 'index.html')) || fs.existsSync(`${p}.html`)
}

const broken = new Map()
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8')
  const urls = [...html.matchAll(/(?:href|src)="(\/[^"]*)"/g)].map((m) => m[1])
  const srcsets = [...html.matchAll(/srcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(' ')[0]))
  for (const u of [...urls, ...srcsets]) {
    if (!u.startsWith('/') || u.startsWith('//')) continue
    if (!exists(u)) broken.set(u, f)
  }
}
console.log(`${htmlFiles.length} HTML-Dateien geprüft`)
for (const [u, f] of broken) console.log(`BROKEN ${u}  (in ${f})`)
process.exit(broken.size ? 1 : 0)
```

- [ ] **Step 3: `scripts/qa/screenshots.mjs`** – Screenshots + Überlauf-Check in Tag und Nacht; erwartet einen laufenden Static-Server auf Port 4173:

```js
#!/usr/bin/env node
import fs from 'node:fs'
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4173'
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const OUT = 'qa-screenshots'
const listings = JSON.parse(fs.readFileSync('content/generated/listings.json', 'utf8'))
const detail = listings.find((l) => l.availability === 'available' && l.images.length > 5)
const pages = ['/', '/angebote', '/angebote?typ=miete&art=wohnung', `/angebote/${detail.slug}`, '/grand-tower', '/referenzen', '/leistungen', '/ueber-uns', '/kontakt', '/datenschutz', '/gibt-es-nicht']
const widths = [360, 768, 1280, 1536]

fs.mkdirSync(OUT, { recursive: true })
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
let problems = 0
for (const theme of ['light', 'dark']) {
  for (const w of widths) {
    const page = await browser.newPage()
    await page.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500, deviceScaleFactor: 1 })
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }])
    for (const p of pages) {
      await page.goto(BASE + p, { waitUntil: 'networkidle0' })
      const r = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        dark: document.documentElement.classList.contains('dark'),
        h1: document.querySelectorAll('h1').length,
        googleFonts: performance.getEntriesByType('resource').some((e) => /fonts\.(googleapis|gstatic)\.com/.test(e.name)),
      }))
      const issues = [
        r.overflow && 'horizontaler Überlauf',
        r.dark !== (theme === 'dark') && 'falscher Modus beim ersten Laden',
        r.h1 !== 1 && `${r.h1}× h1`,
        r.googleFonts && 'Google-Fonts-Request',
      ].filter(Boolean)
      if (issues.length) { problems++; console.log(`PROBLEM ${theme} ${w}px ${p}: ${issues.join(', ')}`) }
      const name = `${theme}-${w}-${p.replace(/[/?&=]+/g, '_') || 'home'}.png`
      await page.screenshot({ path: `${OUT}/${name}`, fullPage: true })
    }
    await page.close()
  }
}
await browser.close()
console.log(problems ? `${problems} Probleme` : 'keine Probleme')
process.exit(problems ? 1 : 0)
```

`package.json` → `scripts`:
```json
"qa:links": "node scripts/qa/check-links.mjs",
"qa:serve": "serve .output/public -l 4173",
"qa:shots": "node scripts/qa/screenshots.mjs"
```
`.gitignore` ergänzen: `qa-screenshots/`

- [ ] **Step 4: Alles laufen lassen**

```bash
yarn test && yarn qa:contrast && yarn generate && yarn qa:links
```
Expected: alles grün, `qa:links` → `0 BROKEN`.

In einem zweiten Terminal (Hintergrund): `yarn qa:serve` · dann: `yarn qa:shots`
Expected: `keine Probleme`. Probleme beheben, bis grün.

- [ ] **Step 5: Sichtprüfung der Screenshots** (Read-Tool, mindestens: Start/Angebote/Detail/Grand Tower/Kontakt bei 360 und 1280 px, beide Modi) gegen die Checkliste `design/design-research.md` Kapitel 5. Besonders:
  - Blur-Test: pro Sektion ein dominantes Element.
  - Fokus sichtbar auf heller Fläche, Zweitfläche und in dunklen Bereichen (Grand Tower, Footer) – per Tab-Taste im Browser prüfen.
  - Text auf Fotos (Grand-Tower-Hero, Home-Band) gut lesbar.
  - Längste Wörter bei 360 px: „Eigentumswohnungen", „Käuferprovision", „Wohnhochhaus" brechen sauber.
  - Keine zwei gleichen Kompositionsmuster direkt hintereinander.

- [ ] **Step 6: Datenstichprobe** – 5 aktive Objekte (je 1 ETW, Mietwohnung, Gewerbe, Haus, Grand Tower) auf der Live-Seite (`legacy_url`) öffnen und Preis, Fläche, Zimmer mit der Detailseite vergleichen. Abweichungen → Parser in Task 2 korrigieren (mit Test), `yarn content`, neu prüfen.

- [ ] **Step 7: Grand-Tower-Faktencheck** – Höhe, Geschosse, Fertigstellung per Websuche an mindestens zwei unabhängigen Quellen prüfen (z. B. Wikipedia „Grand Tower (Frankfurt am Main)" + Projektentwickler/Presse). Bestätigte Fakten: `"verify": true` entfernen. Nicht eindeutig bestätigte Fakten: **aus `content/manual/grand-tower.json` löschen** (nicht raten). Außerdem prüfen, ob „höchstes Wohnhochhaus Deutschlands" noch stimmt; wenn nicht eindeutig → `tagline` und `home.json → grandTower.title` auf „Wohnen über den Dächern Frankfurts." ändern.
`yarn content && yarn generate`.

- [ ] **Step 8: Commit**

```bash
git add scripts/qa package.json yarn.lock .gitignore content
git commit -m "chore(qa): link check, screenshot/overflow check, verified grand tower facts"
```

- [ ] **Step 9: Deployment (mit Robby)** – einmalig `npx netlify login` (Robby im Browser), dann:

```bash
yarn generate
npx netlify deploy --dir .output/public          # Draft-URL zum Prüfen
npx netlify deploy --dir .output/public --prod   # nach Freigabe durch Robby
```
Auf der Live-URL prüfen: `curl -sI <url> | grep -i x-robots-tag` → `noindex, nofollow`; `<url>/robots.txt` → `Disallow: /`; Tag/Nacht, Kontaktformular, eine Detailseite, Exposé-Link.

---

## Self-Review (durchgeführt)

- **Spec-Abdeckung:** E1 (Task 7/15/16), E2 alle Tasks, E3 (Task 4 Texte), E4 (Task 7/8), E5 (Task 1–5), E6 (Task 14), E7 (Task 8 Footer), E8 (Task 2 `expose`), E9 (Task 7 Head-Skript). Seitenstruktur §3: Tasks 9–15. Datenmodell §4: Tasks 2–5. Designkonzept §5: Task 7 (Tokens, Typo, Motion), Task 8/9 (Flächen, Bildwelt), Komponenten durchgehend. §6 Seiten: Tasks 9–15. §7 Build: Task 4/15/16. §8 QA: Task 16. §9 Risiken: Logo (Task 4 Step 11), GT-Fakten (Task 16 Step 7), GT-Galerie-Zuschnitt (Task 12 Step 2).
- **Abweichung von der Spec (bewusst):** Mood-Set Nacht nutzt `gt-1814` (Abendaufnahme vom Grand-Tower-Balkon) statt `m-702`, Tag-Bild des Grand Tower `m-1665` (zeigt die Grand-Tower-Balkone). Spec §5.7 nannte nur die drei EZB/Main-Nachtfotos; 1814 ist beim Planen gefunden worden und passt besser.
- **Platzhalter:** keine offenen TODO/TBD; Entscheidungen im Plan (ContactBand-Fläche, ToggleGroup-Handler, kein Generate in Task 9/10) sind ausformuliert.
- **Typ-Konsistenz:** `useFile`, `useListingImages`, `useHeroMood`, `priceText`, `priceLabel`, `mainArea`, `availableFromText`, `locationText`, `assetUrl`, `assetSrcset`, `parseFilters`, `filtersToQuery`, `applyFilters`, `sortListings`, `activeFilterCount`, `PRICE_STEPS`, `ROOM_STEPS`, `resolveInquiry`, `validateContact`, `CONCERN_LABEL` – überall gleich benannt. `ListingCard`-Prop `headingLevel` wird als Zahl gebunden (`:heading-level="2"`).
