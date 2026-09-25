import { describe, it, expect } from 'vitest'
import { validateContact, resolveInquiry, refreshErrors, concernLabels } from '~/utils/contact'
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

describe('refreshErrors', () => {
  it('drops errors of fields fixed while typing, keeps the rest, never adds new ones', () => {
    const current = { name: 'Bitte geben Sie Ihren Namen an.', message: 'Bitte schreiben Sie uns kurz, worum es geht.' }
    expect(refreshErrors(current, { ...ok, message: '' })).toEqual({ message: 'Bitte schreiben Sie uns kurz, worum es geht.' })
    expect(refreshErrors({}, { ...ok, email: 'kaputt' })).toEqual({})
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

describe('contact in english', () => {
  const listings = [{ slug: 'eden', title: 'EDEN – Luxurious living', marketing_type: 'miete', availability: 'available' }] as Listing[]
  it('validates with english messages', () => {
    const e = validateContact({ ...ok, name: '', email: 'kaputt', phone: 'abc', message: '' }, 'en')
    expect(e).toEqual({
      name: 'Please enter your name.',
      email: 'Please check the email address – it should look like name@example.com',
      phone: 'Please use only digits, spaces and + ( ) - /.',
      message: 'Please tell us briefly what it is about.',
    })
    expect(refreshErrors({ name: 'x' }, { ...ok, name: '' }, 'en')).toEqual({ name: 'Please enter your name.' })
  })
  it('prefills an english subject', () => {
    expect(resolveInquiry({ objekt: 'eden' }, listings, 'en')).toEqual({ subject: 'Enquiry: EDEN – Luxurious living', concern: 'mieten' })
    expect(resolveInquiry({ thema: 'grand-tower' }, listings, 'en').subject).toBe('Enquiry: Grand Tower')
  })
  it('labels concerns per locale', () => {
    expect(concernLabels('en').kaufen).toBe('I would like to buy')
    expect(concernLabels('de').sonstiges).toBe('Sonstiges')
  })
})
