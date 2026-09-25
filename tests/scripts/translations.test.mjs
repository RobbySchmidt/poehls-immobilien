import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import { translationKey, withTranslations } from '../../scripts/lib/translations.mjs'

const listing = { id: 170, legacy_id: 170, source: 'main', title: 'Gemütliche Maisonette', teaser: 'Kurz', description: '<p>Eins</p><p>Zwei</p>' }

describe('translationKey', () => {
  it('uses the legacy id, prefixed for the grand tower source', () => {
    expect(translationKey({ source: 'main', legacy_id: 170 })).toBe('170')
    expect(translationKey({ source: 'grandtower', legacy_id: 121 })).toBe('gt-121')
  })
})

describe('withTranslations', () => {
  it('builds directus-style translations with german from the record and english from the map', () => {
    const { listing: out, missing } = withTranslations(listing, { 170: { title: 'Cosy maisonette', teaser: 'Short', description: ['One & two', 'Three <b>'] } })
    expect(missing).toBe(false)
    expect(out.translations).toEqual([
      { languages_code: 'de', title: 'Gemütliche Maisonette', teaser: 'Kurz', description: '<p>Eins</p><p>Zwei</p>', machine_translated: false },
      { languages_code: 'en', title: 'Cosy maisonette', teaser: 'Short', description: '<p>One &amp; two</p><p>Three &lt;b&gt;</p>', machine_translated: true },
    ])
  })
  it('keeps only german and reports a missing english entry', () => {
    const { listing: out, missing } = withTranslations(listing, {})
    expect(missing).toBe(true)
    expect(out.translations.map((t) => t.languages_code)).toEqual(['de'])
  })
})

describe('generated content', () => {
  it('has an english translation for every listing', () => {
    const listings = JSON.parse(fs.readFileSync('content/generated/listings.json', 'utf8'))
    const without = listings.filter((l) => !l.translations?.some((t) => t.languages_code === 'en')).map((l) => l.id)
    expect(without).toEqual([])
  })
  it('has english for every hand-written content file', () => {
    for (const name of ['home', 'about', 'services', 'grand-tower']) {
      const j = JSON.parse(fs.readFileSync(`content/manual/${name}.json`, 'utf8'))
      expect(j.translations?.map((t) => t.languages_code).sort(), name).toEqual(['de', 'en'])
    }
  })
})
