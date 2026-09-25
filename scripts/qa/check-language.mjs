#!/usr/bin/env node
// English pages must not leak German UI words (legal texts marked lang="de" are exempt),
// and the language switch must keep slug and query. Needs `yarn qa:serve` running on :4173.
import fs from 'node:fs'
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4173'
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const GERMAN = ['Zimmer', 'Kaufpreis', 'Kaltmiete', 'Angebote', 'Anfrage', 'Wohnung', 'Miete', 'Kauf', 'Objekt', 'Schließen', 'Bild', 'passende']
const listings = JSON.parse(fs.readFileSync('content/generated/listings.json', 'utf8'))
const detail = listings.find((l) => l.availability === 'available' && l.images.length > 5)
const reference = listings.find((l) => l.availability !== 'available')
const pages = ['/en', '/en/properties', '/en/properties?typ=miete&art=wohnung', `/en/properties/${detail.slug}`, `/en/references/${reference.slug}`, '/en/grand-tower', '/en/references', '/en/services', '/en/about', '/en/contact', '/en/contact?objekt=' + detail.slug, '/en/legal-notice', '/en/privacy', '/en/terms', '/en/does-not-exist']

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 900 })
let problems = 0

for (const p of pages) {
  await page.goto(BASE + p, { waitUntil: 'networkidle0' })
  const found = await page.evaluate((words) => {
    const outsideDe = (el) => !el.closest('[lang="de"]')
    const texts = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    while (walker.nextNode()) {
      const n = walker.currentNode
      if (n.parentElement && outsideDe(n.parentElement) && !n.parentElement.closest('script,style,noscript')) texts.push(n.textContent)
    }
    for (const el of document.querySelectorAll('[aria-label],[alt],[title],[placeholder]')) {
      if (!outsideDe(el)) continue
      for (const a of ['aria-label', 'alt', 'title', 'placeholder']) if (el.getAttribute(a)) texts.push(el.getAttribute(a))
    }
    const all = texts.join(' \n ')
    return words.flatMap((w) => {
      const m = all.match(new RegExp(`(?<![\\p{L}])${w}(?![\\p{L}])`, 'u'))
      if (!m) return []
      const i = m.index
      return [`${w} („…${all.slice(Math.max(0, i - 30), i + w.length + 30).replace(/\s+/g, ' ')}…“)`]
    })
  }, GERMAN)
  if (found.length) { problems++; console.log(`PROBLEM ${p}: ${found.join('; ')}`) }
}

// language switch keeps slug and query
const switches = [
  [`/angebote/${detail.slug}`, 'en', `/en/properties/${detail.slug}`],
  ['/angebote?typ=miete', 'en', '/en/properties?typ=miete'],
  [`/en/properties/${detail.slug}`, 'de', `/angebote/${detail.slug}`],
]
for (const [from, code, expected] of switches) {
  await page.goto(BASE + from, { waitUntil: 'networkidle0' })
  await Promise.all([page.waitForFunction((prev) => location.pathname + location.search !== prev, {}, from), page.click(`header a[hreflang="${code}"]`)])
  const got = await page.evaluate(() => decodeURI(location.pathname + location.search))
  if (got !== expected) { problems++; console.log(`PROBLEM Sprachwechsel ${from} → ${got} (erwartet ${expected})`) }
}

// error pages: html lang is set, and the switch leads to the other language's home page
for (const [from, code, expected] of [['/gibt-es-nicht', 'en', '/en'], ['/en/does-not-exist', 'de', '/']]) {
  await page.goto(BASE + from, { waitUntil: 'networkidle0' })
  const lang = await page.evaluate(() => document.documentElement.lang)
  if (!lang) { problems++; console.log(`PROBLEM ${from}: <html> ohne lang`) }
  await page.click(`header a[hreflang="${code}"]`)
  await page.waitForFunction((prev) => location.pathname !== prev, { timeout: 3000 }, from).catch(() => {})
  const got = await page.evaluate(() => location.pathname)
  if (got !== expected) { problems++; console.log(`PROBLEM Sprachwechsel auf Fehlerseite ${from} → ${got} (erwartet ${expected})`) }
}

await browser.close()
console.log(problems ? `${problems} Probleme` : 'keine Probleme')
process.exit(problems ? 1 : 0)
