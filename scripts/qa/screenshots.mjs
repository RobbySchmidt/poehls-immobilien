#!/usr/bin/env node
// Screenshots + automatic checks in day and night at 4 widths. Needs `yarn qa:serve` running on :4173.
import fs from 'node:fs'
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4173'
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const OUT = 'qa-screenshots'
const listings = JSON.parse(fs.readFileSync('content/generated/listings.json', 'utf8'))
const detail = listings.find((l) => l.availability === 'available' && l.images.length > 5)
const pages = ['/', '/angebote', '/angebote?typ=miete&art=wohnung', `/angebote/${detail.slug}`, '/grand-tower', '/referenzen', '/leistungen', '/ueber-uns', '/kontakt', '/datenschutz', '/gibt-es-nicht']
const widths = [360, 768, 1280, 1536]

fs.mkdirSync(OUT, { recursive: true })
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true })
let problems = 0
for (const theme of ['light', 'dark']) {
  for (const w of widths) {
    const page = await browser.newPage()
    await page.setViewport({ width: w, height: 900, isMobile: w < 500, hasTouch: w < 500, deviceScaleFactor: 1 })
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }])
    for (const p of pages) {
      await page.goto(BASE + p, { waitUntil: 'networkidle0' })
      // trigger lazy images
      await page.evaluate(async () => {
        for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) }
        window.scrollTo(0, 0)
      })
      await new Promise((r) => setTimeout(r, 300))
      const r = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        dark: document.documentElement.classList.contains('dark'),
        h1: document.querySelectorAll('h1').length,
        googleFonts: performance.getEntriesByType('resource').some((e) => /fonts\.(googleapis|gstatic)\.com/.test(e.name)),
        brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
      }))
      const issues = [
        r.overflow && 'horizontaler Überlauf',
        r.dark !== (theme === 'dark') && 'falscher Modus beim ersten Laden',
        r.h1 !== 1 && `${r.h1}× h1`,
        r.googleFonts && 'Google-Fonts-Request',
        r.brokenImages.length && `defekte Bilder: ${r.brokenImages.slice(0, 3).join(', ')}`,
      ].filter(Boolean)
      if (issues.length) { problems++; console.log(`PROBLEM ${theme} ${w}px ${p}: ${issues.join(', ')}`) }
      const name = `${theme}-${w}-${p.replace(/[/?&=]+/g, '_') || 'home'}.png`
      await page.screenshot({ path: `${OUT}/${name}`, fullPage: true })
    }
    await page.close()
  }
}
await browser.close()
console.log(problems ? `${problems} Probleme` : 'keine Probleme')
process.exit(problems ? 1 : 0)
