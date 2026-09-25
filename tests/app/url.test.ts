import { describe, it, expect } from 'vitest'
import { absoluteUrl } from '~/utils/url'

describe('absoluteUrl', () => {
  it('joins site url and path for crawlers (og:image must be absolute)', () => {
    expect(absoluteUrl('https://poehls.netlify.app', '/og.jpg')).toBe('https://poehls.netlify.app/og.jpg')
    expect(absoluteUrl('https://poehls.netlify.app/', '/media/m-1-1600.webp')).toBe('https://poehls.netlify.app/media/m-1-1600.webp')
  })
  it('returns undefined without a site url instead of emitting a relative og:image', () => {
    expect(absoluteUrl('', '/og.jpg')).toBeUndefined()
    expect(absoluteUrl(undefined, '/og.jpg')).toBeUndefined()
  })
})
