import { slugify } from './parse.mjs'

export function cleanLegacyHtml(html) {
  return html
    .normalize('NFC')
    .replace(/<figure[\s\S]*?<\/figure>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<koken:[\s\S]*?<\/koken:\w+>/g, '')
    .replace(/<koken:[^>]*\/>/g, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/g, '')
    .replace(/\s(class|style)="[^"]*"/g, '')
    .replace(/<span>([\s\S]*?)<\/span>/g, '$1')
    .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/g, '')
    .replace(/>\s+</g, '><')
    .trim()
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '').trim()

export function withAnchors(html) {
  const toc = []
  const seen = new Map()
  const out = html.replace(/<h4>([\s\S]*?)<\/h4>/g, (_, inner) => {
    const title = decode(inner)
    const base = slugify(title) || 'abschnitt'
    const n = (seen.get(base) || 0) + 1
    seen.set(base, n)
    const id = n === 1 ? base : `${base}-${n}`
    toc.push({ id, title })
    return `<h2 id="${id}">${inner}</h2>`
  })
  return { html: out, toc }
}
