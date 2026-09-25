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
