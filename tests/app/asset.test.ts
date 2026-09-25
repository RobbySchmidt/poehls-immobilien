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
