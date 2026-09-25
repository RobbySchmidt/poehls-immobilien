#!/usr/bin/env node
// Reads the day/night tokens from tailwind.css and checks the WCAG pairs from the spec (§5.3).
import fs from 'node:fs'

const css = fs.readFileSync('app/assets/css/tailwind.css', 'utf8')
const block = (sel) => {
  const m = css.match(new RegExp(`^${sel.replace('.', '\\.')}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm'))
  const vars = {}
  for (const [, k, L, C, H] of m[1].matchAll(/--([\w-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g)) vars[k] = [+L, +C, +H]
  return vars
}
const enc = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055)
const dec = (x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
const clamp = (v) => Math.min(1, Math.max(0, v))
function lin([L, C, h]) {
  const a = C * Math.cos((h * Math.PI) / 180), b = C * Math.sin((h * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
}
const lum = (c) => { const [r, g, b] = lin(c).map(clamp); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
function hex2oklch(h) {
  const [r, g, b] = [1, 3, 5].map((i) => dec(parseInt(h.slice(i, i + 2), 16) / 255))
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360]
}
function mix(fg, bg, alpha) {
  const f = lin(fg).map((v) => enc(clamp(v))), g = lin(bg).map((v) => enc(clamp(v)))
  return hex2oklch('#' + f.map((v, i) => Math.round((v * alpha + g[i] * (1 - alpha)) * 255).toString(16).padStart(2, '0')).join(''))
}

let failed = 0
for (const [name, t] of [['Tag', block(':root')], ['Nacht', block('.dark')]]) {
  const surfaces = ['background', 'card', 'secondary', 'accent']
  const checks = []
  for (const s of surfaces) {
    checks.push([`foreground / ${s}`, t.foreground, t[s], 4.5])
    checks.push([`muted-foreground / ${s}`, t['muted-foreground'], t[s], 4.5])
    checks.push([`primary als Text / ${s}`, t.primary, t[s], 4.5])
    checks.push([`input / ${s}`, t.input, t[s], 3])
    checks.push([`ring 50% / ${s}`, mix(t.ring, t[s], 0.5), t[s], 3])
    checks.push([`destructive Text / ${s}`, t.destructive, t[s], 4.5])
  }
  checks.push(['primary-foreground / primary', t['primary-foreground'], t.primary, 4.5])
  checks.push(['primary-foreground / primary/90', t['primary-foreground'], mix(t.primary, t.background, 0.9), 4.5])
  checks.push(['primary (Form) / background', t.primary, t.background, 3])
  checks.push(['foreground/70 / background', mix(t.foreground, t.background, 0.7), t.background, 4.5])
  console.log(`\n== ${name}`)
  for (const [label, a, b, min] of checks) {
    const c = contrast(a, b)
    if (c < min) failed++
    console.log(`${c >= min ? 'ok  ' : 'FAIL'} ${c.toFixed(2).padStart(6)} (≥${min}) ${label}`)
  }
}
console.log(failed ? `\n${failed} FAIL` : '\nalle Paare bestanden')
process.exit(failed ? 1 : 0)
