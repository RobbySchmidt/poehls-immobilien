import { describe, it, expect } from 'vitest'
import { cleanLegacyHtml, withAnchors } from '../../scripts/lib/legal.mjs'

describe('cleanLegacyHtml', () => {
  it('removes koken embeds, scripts, iframes, inline styles and empty paragraphs', () => {
    const html = '<p class=""> </p><p class=""><b>AGB</b></p><figure class="k-content-embed"><koken:form id="x"></koken:form></figure><script>alert(1)</script><iframe src="https://x"></iframe><p style="color:red"><span style="font-size: 1em;">Text</span></p><p>&nbsp;</p><p><br></p>'
    expect(cleanLegacyHtml(html)).toBe('<p><b>AGB</b></p><p>Text</p>')
  })
})

describe('withAnchors', () => {
  it('promotes h4 to h2 with ids and builds a toc', () => {
    const { html, toc } = withAnchors('<h4>Datenschutz auf einen Blick</h4><p>x</p><h4>Hosting &amp; CDN</h4>')
    expect(html).toBe('<h2 id="datenschutz-auf-einen-blick">Datenschutz auf einen Blick</h2><p>x</p><h2 id="hosting-cdn">Hosting &amp; CDN</h2>')
    expect(toc).toEqual([
      { id: 'datenschutz-auf-einen-blick', title: 'Datenschutz auf einen Blick' },
      { id: 'hosting-cdn', title: 'Hosting & CDN' },
    ])
  })
  it('makes duplicate ids unique', () => {
    const { toc } = withAnchors('<h4>Hinweis</h4><h4>Hinweis</h4>')
    expect(toc.map((t) => t.id)).toEqual(['hinweis', 'hinweis-2'])
  })
})
