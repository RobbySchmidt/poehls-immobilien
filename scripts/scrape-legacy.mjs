#!/usr/bin/env node
// Scrapes the legacy Koken site www.poehlsimmobilien.de (+ the separate /grandtower/ install)
// via its public Koken JSON API and stores everything under data/legacy/.
//
// Usage: node scripts/scrape-legacy.mjs [--no-media]

import fs from 'node:fs';
import path from 'node:path';

const ORIGIN = 'https://www.poehlsimmobilien.de';
const OUT = path.resolve(import.meta.dirname, '..', 'data', 'legacy');
const WITH_MEDIA = !process.argv.includes('--no-media');
// Largest preset first (originals are not public); fallbacks for images Koken fails to render.
const IMAGE_PRESETS = ['huge', 'xlarge', 'large', 'medium_large'];

const SOURCES = {
  main: { base: `${ORIGIN}`, api: `${ORIGIN}/api.php?` },
  grandtower: { base: `${ORIGIN}/grandtower`, api: `${ORIGIN}/grandtower/api.php?` },
};

// Navigation pages of the main site -> which listings they show (scraped from rendered HTML).
const NAV_PAGES = {
  main: [
    ['Kaufimmobilien', 'Eigentumswohnungen', '/eigentumswohnungen/'],
    ['Kaufimmobilien', '1- und 2-Familien-Häuser', '/1--und-2-familien-haeuser/'],
    ['Kaufimmobilien', 'Gewerbeobjekte', '/gewerbeobjekte-1/'],
    ['Kaufimmobilien', 'Grundstücke', '/grundstuecke/'],
    ['Kaufimmobilien', 'Renditeobjekte', '/renditeobjekte/'],
    ['Kaufimmobilien', 'Auslandsimmobilien', '/auslandsimmobilien/'],
    ['Kaufimmobilien', 'Archiv (verkauft)', '/archiv-verkauft/'],
    ['Mietobjekte', 'Mietwohnungen', '/mietwohnungen/'],
    ['Mietobjekte', '1- und 2-Familien-Häuser', '/1--und-2-familien-haeuser-1/'],
    ['Mietobjekte', 'Gewerbeobjekte', '/gewerbeobjekte-3/'],
    ['Mietobjekte', 'Wohnen auf Zeit / möbliert', '/wohnen-auf-zeit--moebliert/'],
    ['Mietobjekte', 'Auslandsimmobilien', '/auslandsimmobilien-1/'],
    ['Mietobjekte', 'Archiv (vermietet)', '/archiv-vermietet/'],
    ['Mietobjekte', 'Grand Tower Rental', '/grandtower/'],
  ],
  grandtower: [
    ['Grand Tower', 'Möblierte Wohnungen', '/moeblierte-wohnungen-3/'],
    ['Grand Tower', 'Unmöblierte Wohnungen', '/unmoeblierte-wohnungen-3/'],
    ['Grand Tower', 'Furnished Apartments', '/furnished-apartments/'],
    ['Grand Tower', 'Unfurnished Flats', '/unfurnished-flats/'],
  ],
};

const UA = { 'User-Agent': 'Mozilla/5.0 (poehls-immobilien relaunch scraper)' };

async function fetchRetry(url, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (!r.ok) throw Object.assign(new Error(`${r.status} ${url}`), { status: r.status });
      return r;
    } catch (e) {
      if (i >= tries || e.status === 404) throw e;
      await new Promise((res) => setTimeout(res, 500 * i));
    }
  }
}
const getJson = async (url) => (await fetchRetry(url)).json();
const getText = async (url) => (await fetchRetry(url)).text();

async function getAll(api, p, key) {
  const items = [];
  for (let page = 1; ; page++) {
    const j = await getJson(`${api}${p}/limit:100/page:${page}`);
    items.push(...(j[key] || []));
    if (page >= (j.pages || 1)) return items;
  }
}

async function pool(items, n, fn) {
  const results = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) {
        const idx = i++;
        results[idx] = await fn(items[idx], idx);
      }
    }),
  );
  return results;
}

const write = (rel, data) => {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, typeof data === 'string' ? data : JSON.stringify(data, null, 2) + '\n');
};

// ---------- text helpers ----------

const decode = (s) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&euro;/g, '€');

// Koken content uses decomposed umlauts (u + U+0308) in places – normalize to NFC.
const clean = (s) => decode(s).normalize('NFC').replace(/[ \t ]+/g, ' ').replace(/ *\n */g, '\n').trim();

function htmlToText(html) {
  return clean(
    html
      .replace(/<koken:[\s\S]*?<\/koken:\w+>|<koken:[^>]*\/>/g, '')
      .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h\d|li|figure|tr)>/gi, '\n')
      .replace(/<hr\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Top-level blocks (paragraphs/headings/list items) as plain text, embeds removed.
function blocks(html) {
  const stripped = html.replace(/<figure[\s\S]*?<\/figure>/g, '\n<p>[[MEDIA]]</p>\n');
  const out = [];
  for (const m of stripped.matchAll(/<(p|h\d|li)[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const t = htmlToText(m[2]).replace(/\n+/g, '\n');
    if (t) out.push(t);
  }
  return out;
}

function parseNumber(s) {
  if (!s) return null;
  const m = s.match(/-?\d[\d.]*(,\d+)?/);
  if (!m) return null;
  const n = Number(m[0].replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

const PRICE_LABELS = [
  'Kaufpreis', 'Miet-/Kaufpreis', 'Kaltmiete', 'Gesamtmiete', 'Pauschalmiete',
  'Miete pro Monat', 'Miete pro Jahr', 'Mietpreis',
];

function parseListing(html) {
  const bl = blocks(html);
  const facts = {};
  const factOrder = [];
  const lines = [];
  for (const b of bl) for (const l of b.split('\n')) lines.push(l.trim());

  for (const l of lines) {
    const m = l.match(/^([A-Za-zÄÖÜäöüß0-9 .\/()\-]{2,40}?)\s*:\s*(.+)$/);
    if (m && !/^https?$/i.test(m[1])) {
      const k = m[1].trim();
      if (!(k in facts)) factOrder.push(k);
      facts[k] = m[2].trim();
    }
  }

  // Address: lines before the first fact that contain a German/other postcode, plus a street line right before it.
  let address = null;
  const firstFactIdx = lines.findIndex((l) => /^[^:]{2,40}:\s*\S/.test(l));
  const head = lines.slice(1, firstFactIdx < 0 ? 6 : firstFactIdx);
  const zipIdx = head.findIndex((l) => /\b\d{5}\b/.test(l));
  if (zipIdx >= 0) {
    const zipLine = head[zipIdx];
    const zm = zipLine.match(/^(.*?)\s*\b(\d{5})\s+(.+)$/);
    let street = zm && zm[1] ? zm[1].replace(/[,\s]+$/, '') : null;
    if (!street && zipIdx > 0 && /\d|str|weg|ring|platz|allee|gasse/i.test(head[zipIdx - 1])) street = head[zipIdx - 1];
    address = { street: street || null, zip: zm ? zm[2] : zipLine.match(/\d{5}/)[0], city: zm ? zm[3].trim() : null };
  }

  const priceLabel = PRICE_LABELS.find((k) => k in facts) || null;
  const areaLabel = Object.keys(facts).find((k) => /fläche/i.test(k)) || null;

  // Description = blocks after the gallery that are not facts / exposé links.
  const mediaIdx = bl.indexOf('[[MEDIA]]');
  const description = bl
    .slice(mediaIdx >= 0 ? mediaIdx + 1 : Math.max(1, bl.findIndex((b) => b.includes(':')) + 1))
    .filter((b) => b !== '[[MEDIA]]' && !/^Exposé$/i.test(b) && !/^[^:\n]{2,40}:\s*\S+$/.test(b))
    // source text is hard-wrapped; unwrap to flowing paragraphs
    .map((b) => b.replace(/\n/g, ' '));

  return {
    subtitle: bl[0] || null,
    address,
    rooms: parseNumber(facts['Zimmer']),
    area_m2: areaLabel ? parseNumber(facts[areaLabel]) : null,
    area_label: areaLabel,
    price_eur: priceLabel ? parseNumber(facts[priceLabel]) : null,
    price_label: priceLabel,
    price_on_request: priceLabel ? /anfrage/i.test(facts[priceLabel]) : false,
    facts: factOrder.map((k) => ({ label: k, value: facts[k] })),
    description,
  };
}

function findLinks(html) {
  return [...html.matchAll(/href="([^"]+)"/g)].map((m) => decode(m[1]));
}

// ---------- main ----------

async function scrapeSource(name) {
  const { base, api } = SOURCES[name];
  console.log(`\n== ${name} (${base})`);

  const site = await getJson(`${api}/site`);
  const [text, albums, content, categories, tags] = await Promise.all([
    getAll(api, '/text', 'text'),
    getAll(api, '/albums', 'albums'),
    getAll(api, '/content', 'content'),
    getAll(api, '/categories', 'categories'),
    getAll(api, '/tags', 'tags'),
  ]);
  console.log(`text ${text.length}, albums ${albums.length}, content ${content.length}, categories ${categories.length}`);
  for (const [k, v] of Object.entries({ site, text, albums, content, categories, tags })) write(`raw/${name}/${k}.json`, v);

  const contentById = new Map(content.map((c) => [c.id, c]));
  const albumCache = new Map();
  async function albumContent(id) {
    if (!albumCache.has(id)) albumCache.set(id, getAll(api, `/albums/${id}/content`, 'content').catch(() => []));
    return albumCache.get(id);
  }

  // categories per text item
  const textCats = new Map();
  await pool(text, 6, async (t) => {
    if (!t.categories?.count) return textCats.set(t.id, []);
    const j = await getJson(`${api}/text/${t.id}/categories`);
    textCats.set(t.id, (j.categories || []).map((c) => ({ id: c.id, slug: c.slug, title: c.title })));
  });

  // rendered nav pages -> listing slugs they show
  const navigation = [];
  for (const [group, label, p] of NAV_PAGES[name]) {
    const html = await getText(`${base}${p}`).catch(() => null);
    if (html) write(`raw/${name}/html${p.replace(/\/$/, '') || '/index'}.html`, html);
    const slugs = html ? [...new Set([...html.matchAll(/href="[^"]*\/objekte\/([^"/]+)\/"/g)].map((m) => m[1]))] : [];
    const cat = html?.match(/href="\/kategorie\/([^/]+)\//)?.[1] || html?.match(/href="\/status\/([^/]+)\//)?.[1] || null;
    navigation.push({ group, label, legacy_path: p, filter: cat, listing_slugs: slugs });
  }
  for (const p of ['/', '/pages/poehls-immobilien/']) {
    const html = await getText(`${base}${p}`).catch(() => null);
    if (html) write(`raw/${name}/html${p === '/' ? '/index' : p.replace(/\/$/, '')}.html`, html);
  }

  const imageRefs = new Map(); // content id -> content object

  async function resolveMedia(html) {
    const galleries = [];
    for (const m of html.matchAll(/<koken:pulse[^>]*data_from_url="([^"]+)"/g)) {
      const src = m[1];
      let items = [];
      const am = src.match(/\/albums\/(\d+)\/content/);
      const cm = src.match(/\/content\/([\d,]+)/);
      if (am) items = await albumContent(Number(am[1]));
      else if (cm) items = cm[1].split(',').map((id) => contentById.get(Number(id))).filter(Boolean);
      galleries.push({ source: src, album_id: am ? Number(am[1]) : null, image_ids: items.map((c) => c.id) });
      for (const c of items) imageRefs.set(c.id, c);
    }
    const images = [];
    for (const m of html.matchAll(/<koken:load[^>]*filter:(id|custom)="([^"]+)"/g)) {
      const c = m[1] === 'id' ? contentById.get(Number(m[2])) : content.find((x) => x.filename === m[2]);
      if (c) {
        imageRefs.set(c.id, c);
        images.push(c.id);
      }
    }
    return { galleries, inline_image_ids: images };
  }

  const docs = new Set();
  const pages = [];
  const listings = [];
  for (const t of text) {
    const media = await resolveMedia(t.content);
    const links = findLinks(t.content);
    for (const l of links) if (/poehlsimmobilien\.de\/.+\.(pdf|docx?|xlsx?)$/i.test(l) || /^\/.+\.(pdf|docx?)$/i.test(l)) docs.add(l);
    if (t.featured_image) imageRefs.set(t.featured_image.id, t.featured_image);

    const common = {
      id: t.id,
      slug: t.slug,
      title: clean(t.title),
      legacy_url: t.url,
      published_on: t.published_on?.datetime,
      modified_on: t.modified_on?.datetime,
      html: t.content,
      text: htmlToText(t.content),
    };

    if (t.page_type === 'page') {
      pages.push({ ...common, ...media, links: links.filter((l) => !l.startsWith('#')) });
      continue;
    }

    const cats = textCats.get(t.id) || [];
    const tagSlugs = (t.tags || []).map((g) => g.slug || g.title || g);
    const shownOn = navigation.filter((n) => n.listing_slugs.includes(t.slug)).map((n) => `${n.group} / ${n.label}`);
    const placeholder = /^leider keine aktuellen objekte/i.test(t.title) || /^following soon/i.test(t.title);
    let status = 'unlisted';
    if (placeholder) status = 'placeholder';
    else if (tagSlugs.includes('archiv-verkauft')) status = 'sold';
    else if (tagSlugs.includes('archiv-vermietet')) status = 'rented';
    else if (shownOn.length) status = 'active';

    const catSlugs = cats.map((c) => c.slug);
    const offer = catSlugs.some((s) => s.startsWith('kauf') || s.startsWith('anlage'))
      ? 'kauf'
      : catSlugs.some((s) => s.startsWith('miete')) || name === 'grandtower'
        ? 'miete'
        : null;

    const allImageIds = [...new Set([...media.galleries.flatMap((g) => g.image_ids), ...media.inline_image_ids])];
    listings.push({
      ...common,
      source: name,
      status,
      offer_type: offer,
      categories: cats,
      tags: tagSlugs,
      shown_on: shownOn,
      featured: !!t.featured,
      ...parseListing(t.content),
      expose_urls: links.filter((l) => /\.pdf$/i.test(l)),
      external_links: links.filter((l) => /^https?:/.test(l) && !/\.pdf$/i.test(l)),
      featured_image_id: t.featured_image?.id ?? null,
      image_ids: allImageIds,
      galleries: media.galleries,
    });
  }

  // navigation entries: map slugs to ids
  const idBySlug = new Map(listings.map((l) => [l.slug, l.id]));
  for (const n of navigation) {
    n.listing_ids = n.listing_slugs.map((s) => idBySlug.get(s) ?? null);
  }

  return { site, pages, listings, navigation, imageRefs, docs, categories, albums };
}

function imageRecord(c, prefix) {
  const preset = c.presets?.[IMAGE_PRESETS[0]];
  const ext = (c.filename.match(/\.(\w+)$/)?.[1] || 'jpg').toLowerCase().replace('jpeg', 'jpg');
  const rec = {
    id: c.id,
    file: `media/images/${prefix}${c.id}.${ext}`,
    filename_original: c.filename,
    title: clean(c.title || ''),
    caption: clean(c.caption || ''),
    preset: IMAGE_PRESETS[0],
    width: preset?.width ?? c.width,
    height: preset?.height ?? c.height,
    original_width: c.width,
    original_height: c.height,
    focal_point: c.focal_point,
    remote_url: preset?.url,
  };
  // fallback candidates, not serialized
  Object.defineProperty(rec, 'candidates', {
    value: IMAGE_PRESETS.map((p) => [p, c.presets?.[p]]).filter(([, v]) => v?.url),
  });
  return rec;
}

// Koken fails to render huge/xlarge for very large originals (404) – fall back to smaller presets.
async function downloadImage(img) {
  const f = path.join(OUT, img.file);
  let lastErr;
  for (const [name, p] of img.candidates) {
    try {
      if (!(fs.existsSync(f) && fs.statSync(f).size > 0 && img.preset === name)) {
        const r = await fetchRetry(p.url);
        fs.mkdirSync(path.dirname(f), { recursive: true });
        fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
      }
      Object.assign(img, { preset: name, width: p.width, height: p.height, remote_url: p.url });
      return;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

async function download(url, rel) {
  const f = path.join(OUT, rel);
  if (fs.existsSync(f) && fs.statSync(f).size > 0) return 'cached';
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const r = await fetchRetry(url);
  // dead links are answered with the HTML site instead of a 404
  if (/\.pdf$/i.test(url) && !/pdf/i.test(r.headers.get('content-type') || '')) throw new Error(`not a PDF (${r.headers.get('content-type')}) ${url}`);
  fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
  return 'ok';
}

const main = await scrapeSource('main');
const gt = await scrapeSource('grandtower');

// ---------- images ----------
const images = {};
for (const [src, res, prefix] of [['main', main, ''], ['grandtower', gt, 'gt-']]) {
  images[src] = {};
  for (const c of res.imageRefs.values()) images[src][c.id] = imageRecord(c, prefix);
}

function attachImages(listings, imgs) {
  for (const l of listings) {
    l.images = l.image_ids.map((id) => imgs[id]).filter(Boolean);
    l.featured_image = l.featured_image_id ? imgs[l.featured_image_id] || null : null;
    delete l.image_ids;
    delete l.featured_image_id;
  }
}
attachImages(main.listings, images.main);
attachImages(gt.listings, images.grandtower);
for (const [res, imgs] of [[main, images.main], [gt, images.grandtower]]) {
  for (const p of res.pages) {
    p.images = [...new Set([...p.galleries.flatMap((g) => g.image_ids), ...p.inline_image_ids])].map((id) => imgs[id]).filter(Boolean);
  }
}

// ---------- documents (exposés, forms) ----------
const documents = [];
for (const d of new Set([...main.docs, ...gt.docs])) {
  const url = d.startsWith('/') ? ORIGIN + d : d.replace(/^http:/, 'https:');
  documents.push({ url_original: d, url, file: `media/documents/${decodeURIComponent(url.split('/').pop())}` });
}

// ---------- media download ----------
let mediaSummary = 'media skipped (--no-media)';
if (WITH_MEDIA) {
  const all = [...Object.values(images.main), ...Object.values(images.grandtower)];
  let done = 0, failed = [];
  await pool(all, 8, async (img) => {
    try {
      await downloadImage(img);
    } catch (e) {
      failed.push({ id: img.id, url: img.remote_url, error: String(e.message) });
    }
    if (++done % 100 === 0) console.log(`images ${done}/${all.length}`);
  });
  await pool(documents, 4, async (d) => {
    try {
      await download(d.url, d.file);
      d.downloaded = true;
    } catch (e) {
      d.downloaded = false;
      failed.push({ url: d.url, error: String(e.message) });
    }
  });

  // brand assets / legacy styling for reference
  const brand = [
    '/favicon.ico',
    '/apple-touch-icon-120x120-precomposed.png',
    '/apple-touch-icon-152x152-precomposed.png',
    '/settings.css.lens',
    '/storage/themes/repertoire-fa8a5d39-01a5-dfd6-92ff-65a22af5d5ac/css/skeleton.css',
  ];
  for (const b of brand) {
    try {
      await download(ORIGIN + b, `media/brand/${b.split('/').pop().replace('.lens', '')}`);
    } catch (e) {
      failed.push({ url: ORIGIN + b, error: String(e.message) });
    }
  }
  write('download-errors.json', failed);
  mediaSummary = `media done: ${all.length} images, ${documents.length} documents, ${failed.length} failures`;
}

// ---------- write structured output ----------
const status = (ls) => ls.reduce((a, l) => ((a[l.status] = (a[l.status] || 0) + 1), a), {});
const siteInfo = (s) => ({
  title: s.title,
  page_title: s.page_title,
  tagline: s.tagline,
  description: s.description,
  keywords: s.keywords,
  copyright: s.copyright,
  profile: s.profile,
  url: s.url,
});

write('site.json', {
  scraped_at: new Date().toISOString(),
  origin: ORIGIN,
  cms: 'Koken (legacy); separate Koken install under /grandtower/',
  main: siteInfo(main.site),
  grandtower: siteInfo(gt.site),
  navigation: {
    Informationen: main.pages
      .filter((p) => ['poehls-immobilien', 'ueber-uns', 'unsere-leistungen', 'kontakt-impressum', 'agb', 'disclaimer-datenschutz', 'formulare'].includes(p.slug))
      .map((p) => ({ label: p.title, page_slug: p.slug, legacy_path: `/pages/${p.slug}/` })),
    listings: main.navigation,
    grandtower: gt.navigation,
  },
  counts: {
    main: { pages: main.pages.length, listings: main.listings.length, by_status: status(main.listings) },
    grandtower: { pages: gt.pages.length, listings: gt.listings.length, by_status: status(gt.listings) },
    images: Object.keys(images.main).length + Object.keys(images.grandtower).length,
    documents: documents.length,
  },
});
write('pages.json', main.pages);
write('listings.json', main.listings);
write('categories.json', main.categories.map((c) => ({ id: c.id, slug: c.slug, title: c.title, counts: c.counts })));
write('grandtower/pages.json', gt.pages);
write('grandtower/listings.json', gt.listings);
write('grandtower/categories.json', gt.categories.map((c) => ({ id: c.id, slug: c.slug, title: c.title, counts: c.counts })));
write('documents.json', documents);

console.log('\nlistings main:', status(main.listings), ' grandtower:', status(gt.listings));
console.log(mediaSummary);
