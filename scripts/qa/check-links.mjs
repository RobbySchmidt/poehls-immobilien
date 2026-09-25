#!/usr/bin/env node
// Every internal href/src/srcset in the generated HTML must point to an existing file.
import fs from 'node:fs'
import path from 'node:path'

const ROOT = '.output/public'
const htmlFiles = []
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (p.endsWith('.html')) htmlFiles.push(p)
  }
}
walk(ROOT)

const exists = (url) => {
  const clean = decodeURIComponent(url.split(/[?#]/)[0])
  const p = path.join(ROOT, clean)
  return (fs.existsSync(p) && fs.statSync(p).isFile()) || fs.existsSync(path.join(p, 'index.html')) || fs.existsSync(`${p}.html`)
}

const broken = new Map()
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8')
  const urls = [...html.matchAll(/(?:href|src)="(\/[^"]*)"/g)].map((m) => m[1])
  const srcsets = [...html.matchAll(/srcset="([^"]+)"/g)].flatMap((m) => m[1].split(',').map((s) => s.trim().split(' ')[0]))
  for (const u of [...urls, ...srcsets]) {
    if (!u.startsWith('/') || u.startsWith('//')) continue
    if (!exists(u)) broken.set(u, f)
  }
}
console.log(`${htmlFiles.length} HTML-Dateien geprüft`)
for (const [u, f] of broken) console.log(`BROKEN ${u}  (in ${f})`)
console.log(`${broken.size} BROKEN`)
process.exit(broken.size ? 1 : 0)
