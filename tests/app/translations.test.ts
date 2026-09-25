import { describe, it, expect } from 'vitest'
import { pickTranslation } from '~/utils/translations'

const list = [
  { languages_code: 'de', title: 'Hallo' },
  { languages_code: 'en', title: 'Hello' },
]

describe('pickTranslation', () => {
  it('returns the entry of the requested language', () => {
    expect(pickTranslation(list, 'en').title).toBe('Hello')
    expect(pickTranslation(list, 'de').title).toBe('Hallo')
  })
  it('falls back to german when the language is missing', () => {
    expect(pickTranslation([list[0]!], 'en').title).toBe('Hallo')
  })
  it('returns an empty object for missing translations', () => {
    expect(pickTranslation(undefined, 'en')).toEqual({})
    expect(pickTranslation([], 'de')).toEqual({})
  })
})
