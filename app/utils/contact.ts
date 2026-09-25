import type { Listing } from '~/types/content'
import type { Locale } from '~/utils/format'

export type Concern = 'kaufen' | 'mieten' | 'verkaufen' | 'vermieten' | 'sonstiges'
export interface ContactValues {
  name: string
  email: string
  phone: string
  concern: Concern
  subject: string
  message: string
}

const CONCERN_LABELS: Record<Locale, Record<Concern, string>> = {
  de: { kaufen: 'Ich möchte kaufen', mieten: 'Ich möchte mieten', verkaufen: 'Ich möchte verkaufen', vermieten: 'Ich möchte vermieten', sonstiges: 'Sonstiges' },
  en: { kaufen: 'I would like to buy', mieten: 'I would like to rent', verkaufen: 'I would like to sell', vermieten: 'I would like to let', sonstiges: 'Something else' },
}
export const concernLabels = (locale: Locale = 'de') => CONCERN_LABELS[locale]

const MESSAGES = {
  de: {
    name: 'Bitte geben Sie Ihren Namen an.',
    email: 'Bitte geben Sie Ihre E-Mail-Adresse an.',
    emailInvalid: 'Bitte prüfen Sie die E-Mail-Adresse – sie sollte etwa so aussehen: name@beispiel.de',
    phone: 'Bitte nur Ziffern, Leerzeichen und + ( ) - / verwenden.',
    message: 'Bitte schreiben Sie uns kurz, worum es geht.',
    inquiry: 'Anfrage zu: ',
    topic: 'Anfrage: ',
  },
  en: {
    name: 'Please enter your name.',
    email: 'Please enter your email address.',
    emailInvalid: 'Please check the email address – it should look like name@example.com',
    phone: 'Please use only digits, spaces and + ( ) - /.',
    message: 'Please tell us briefly what it is about.',
    inquiry: 'Enquiry: ',
    topic: 'Enquiry: ',
  },
} satisfies Record<Locale, Record<string, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^[\d\s+()\-/]{5,}$/

export function validateContact(v: ContactValues, locale: Locale = 'de'): Partial<Record<keyof ContactValues, string>> {
  const m = MESSAGES[locale]
  const e: Partial<Record<keyof ContactValues, string>> = {}
  if (!v.name.trim()) e.name = m.name
  const mail = v.email.trim()
  if (!mail) e.email = m.email
  else if (!EMAIL_RE.test(mail)) e.email = m.emailInvalid
  if (v.phone.trim() && !PHONE_RE.test(v.phone.trim())) e.phone = m.phone
  if (!v.message.trim()) e.message = m.message
  return e
}

// While typing: clear errors that got fixed, but never add new ones (no layout jumps under the cursor).
export function refreshErrors(
  current: Partial<Record<keyof ContactValues, string>>,
  v: ContactValues,
  locale: Locale = 'de',
): Partial<Record<keyof ContactValues, string>> {
  const now = validateContact(v, locale)
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

export function resolveInquiry(query: Record<string, unknown>, listings: Listing[], locale: Locale = 'de'): { subject: string, concern: Concern } {
  const m = MESSAGES[locale]
  const slug = firstString(query.objekt)
  const listing = slug ? listings.find((l) => l.slug === slug && l.availability === 'available') : undefined
  if (listing) return { subject: `${m.inquiry}${listing.title}`, concern: listing.marketing_type === 'kauf' ? 'kaufen' : 'mieten' }
  if (firstString(query.thema) === 'grand-tower') return { subject: `${m.topic}Grand Tower`, concern: 'mieten' }
  return { subject: '', concern: 'sonstiges' }
}
