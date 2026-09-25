#!/usr/bin/env node
// Minimal static server for .output/public (like Netlify: dir/index.html, 404.html).
// Replaces `serve`, which died with EMFILE under the screenshot run on Windows/OneDrive.
import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = path.resolve('.output/public')
const PORT = Number(process.env.PORT || 4173)
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2', '.xml': 'application/xml' }

async function read(file) {
  try { return (await fs.stat(file)).isFile() ? await fs.readFile(file) : null } catch { return null }
}

http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  const file = path.join(ROOT, pathname)
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return }
  for (const candidate of [file, path.join(file, 'index.html'), file + '.html']) {
    const body = await read(candidate)
    if (body) {
      res.writeHead(200, { 'content-type': TYPES[path.extname(candidate)] ?? 'application/octet-stream' }).end(body)
      return
    }
  }
  const notFound = await read(path.join(ROOT, '404.html'))
  res.writeHead(404, { 'content-type': TYPES['.html'] }).end(notFound ?? 'Not found')
}).listen(PORT, () => console.log(`serving ${ROOT} on http://localhost:${PORT}`))
