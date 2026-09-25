import { describe, it, expect } from 'vitest'
import { looksLikeFloorPlan, orderPhotosFirst } from '../../scripts/lib/floorplan.mjs'

// raw RGB buffer with `whiteShare` of near-white pixels, rest in `rest` colour
const pixels = (n, whiteShare, rest) => {
  const buf = Buffer.alloc(n * 3)
  for (let i = 0; i < n; i++) {
    const [r, g, b] = i < n * whiteShare ? [250, 250, 250] : rest
    buf[i * 3] = r; buf[i * 3 + 1] = g; buf[i * 3 + 2] = b
  }
  return buf
}

describe('looksLikeFloorPlan', () => {
  it('flags mostly white, greyscale line drawings', () => {
    expect(looksLikeFloorPlan(pixels(1000, 0.8, [30, 30, 30]))).toBe(true)
  })
  it('does not flag colourful photos or bright interiors with colour', () => {
    expect(looksLikeFloorPlan(pixels(1000, 0.2, [120, 90, 60]))).toBe(false)
    expect(looksLikeFloorPlan(pixels(1000, 0.5, [200, 150, 90]))).toBe(false)
  })
  it('does not flag white interiors: their greys are soft mid-tones, not line work', () => {
    expect(looksLikeFloorPlan(pixels(1000, 0.6, [150, 150, 150]))).toBe(false)
  })
})

describe('orderPhotosFirst', () => {
  it('moves floor plans behind photos, keeping relative order', () => {
    expect(orderPhotosFirst(['a', 'plan1', 'b', 'plan2', 'c'], new Set(['plan1', 'plan2']))).toEqual(['a', 'b', 'c', 'plan1', 'plan2'])
    expect(orderPhotosFirst(['plan', 'a'], new Set(['plan']))).toEqual(['a', 'plan'])
  })
  it('keeps order when everything is a plan', () => {
    expect(orderPhotosFirst(['p1', 'p2'], new Set(['p1', 'p2']))).toEqual(['p1', 'p2'])
  })
})
