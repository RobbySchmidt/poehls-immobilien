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
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (base.length <= 70) return base
  const cut = base.slice(0, 70)
  return cut.slice(0, cut.lastIndexOf('-') > 20 ? cut.lastIndexOf('-') : 70).replace(/-+$/, '')
}
