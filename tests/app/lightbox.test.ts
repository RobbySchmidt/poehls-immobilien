import { describe, it, expect } from 'vitest'
import { fitContain, wrapIndex } from '~/utils/lightbox'

describe('fitContain', () => {
  it('fits landscape images to the box width, portrait ones to the height', () => {
    expect(fitContain(1000, 600, 2)).toEqual({ width: 1000, height: 500 })
    expect(fitContain(1000, 600, 0.75)).toEqual({ width: 450, height: 600 })
  })
  it('rounds down to whole pixels and falls back to 3:2 for unknown ratios', () => {
    expect(fitContain(1001, 1000, 1.5)).toEqual({ width: 1001, height: 667 })
    expect(fitContain(900, 900, Number.NaN)).toEqual({ width: 900, height: 600 })
  })
  it('returns zero size for an empty box', () => {
    expect(fitContain(0, 500, 1.5)).toEqual({ width: 0, height: 0 })
  })
})

describe('wrapIndex', () => {
  it('wraps around both ends', () => {
    expect(wrapIndex(5, 5)).toBe(0)
    expect(wrapIndex(-1, 5)).toBe(4)
    expect(wrapIndex(2, 5)).toBe(2)
    expect(wrapIndex(3, 0)).toBe(0)
  })
})
