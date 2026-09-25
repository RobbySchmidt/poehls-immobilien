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
  kaufen: 'Ich möchte kaufen',
  mieten: 'Ich möchte mieten',
  verkaufen: 'Ich möchte verkaufen',
  vermieten: 'Ich möchte vermieten',
  sonstiges: 'Sonstiges',
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

// While typing: clear errors that got fixed, but never add new ones (no layout jumps under the cursor).
export function refreshErrors(
  current: Partial<Record<keyof ContactValues, string>>,
  v: ContactValues,
): Partial<Record<keyof ContactValues, string>> {
  const now = validateContact(v)
  const next: Partial<Record<keyof ContactValues, string>> = {}
  for (const k of Object.keys(current) as (keyof ContactValues)[]) {
    if (current[k] && now[k]) next[k] = now[k]
  }
  return next
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
