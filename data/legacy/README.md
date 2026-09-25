# Legacy-Inhalte www.poehlsimmobilien.de

Kompletter Abzug der alten Website (Koken CMS) als Grundlage für den Relaunch.
Erzeugt mit `node scripts/scrape-legacy.mjs` (Option `--no-media` überspringt Bilder/PDFs).
Das Skript ist idempotent: bereits geladene Dateien werden nicht erneut heruntergeladen.

## Quelle

- Die alte Seite läuft auf **Koken** mit offener JSON-API: `https://www.poehlsimmobilien.de/api.php?/…`
  (z. B. `/text`, `/albums/{id}/content`, `/categories`, `/tags`, `/site`).
- **Grand Tower Rental** (`/grandtower/`) ist eine zweite, separate Koken-Installation
  mit eigener API unter `/grandtower/api.php?/…`.
- Inserate sind Koken-„Essays“, die Bilder liegen in Alben, die im Text per `<koken:pulse>` eingebunden sind.
  Die Kategorie steht in Koken-Kategorien (z. B. `kauf-etw`, `miete-wohnung`),
  der Archivstatus in den Tags `archiv-verkauft` / `archiv-vermietet`.

## Dateien

| Datei | Inhalt |
|---|---|
| `site.json` | Titel, Tagline, SEO-Meta, Profil, komplette Navigation inkl. Zuordnung Menüpunkt → Inserate, Zählwerte |
| `listings.json` | Alle Inserate der Hauptseite (aktiv + Archiv), geparst |
| `pages.json` | Statische Seiten (Startseite, Über uns, Leistungen, Kontakt/Impressum, AGB, Datenschutz, Formulare …) als HTML + Text |
| `categories.json` | Koken-Kategorien |
| `grandtower/*.json` | Das Gleiche für die Grand-Tower-Unterseite |
| `documents.json` | Alle verlinkten Exposé-PDFs mit lokalem Pfad und Download-Status |
| `download-errors.json` | Fehlgeschlagene Downloads (aktuell: 3 tote Exposé-Links auf der Live-Seite) |
| `raw/` | Unveränderte API-Antworten und gerendertes HTML der Menüseiten (Referenz) |
| `media/images/` | Bilder in der größten verfügbaren Koken-Größe (`gt-`-Präfix = Grand Tower) |
| `media/documents/` | Exposé-PDFs |
| `media/brand/` | Favicon, Touch-Icons, altes CSS |

`media/` (~800 MB) ist per `.gitignore` ausgeschlossen und lässt sich mit dem Skript jederzeit neu laden.

## Inserat-Schema (`listings.json`)

```jsonc
{
  "id": 170, "slug": "…", "title": "…",
  "source": "main",                 // main | grandtower
  "status": "active",               // active | sold | rented | unlisted | placeholder
  "offer_type": "kauf",             // kauf | miete
  "categories": [{ "slug": "kauf-etw", "title": "Kauf-ETW" }],
  "shown_on": ["Kaufimmobilien / Eigentumswohnungen"],   // Menüseiten, auf denen es live erscheint
  "address": { "street": "Gründenseestr. 23", "zip": "60386", "city": "Frankfurt" },
  "rooms": 3, "area_m2": 74, "area_label": "Wohnfläche ca.",
  "price_eur": 249000, "price_label": "Kaufpreis", "price_on_request": false,
  "facts": [{ "label": "Zimmer", "value": "3,00" }, …],  // alle "Label: Wert"-Zeilen im Original
  "description": ["…"],             // Fließtext-Absätze
  "expose_urls": ["…pdf"],
  "images": [{ "id": 2623, "file": "media/images/2623.jpg", "width": 1495, "height": 1902,
               "preset": "huge", "focal_point": {…}, "caption": "", "remote_url": "…" }],
  "featured_image": { … },
  "html": "…", "text": "…",         // Originalinhalt ungeparst
  "legacy_url": "…", "published_on": "…", "modified_on": "…"
}
```

Status-Logik: `sold`/`rented` kommen aus den Archiv-Tags, `active` = erscheint aktuell auf einer Menüseite,
`unlisted` = veröffentlicht, aber auf keiner Menüseite verlinkt, `placeholder` = „Leider keine aktuellen Objekte …“ bzw. „Following soon“.

## Hinweise zu den Daten

- Die Beschreibungen auf der Website sind sehr kurz; die ausführlichen Objektdaten stehen in den Exposé-PDFs.
- Originalbilder sind nicht öffentlich. Für einige sehr große Originale kann Koken die Größen `huge`/`xlarge` nicht
  rendern, dort wurde automatisch auf `large` bzw. `medium_large` zurückgefallen (Feld `preset`).
- Logo-Quelle (nicht vom Scraper geladen): `media/brand/logo-source.jpg` von
  `https://www.poehlsimmobilien.de/storage/cache/images/000/752/Logo-ohne-Kreis-P,large.1675968992.jpg`.
- Tote Exposé-Links auf der Live-Seite: Inserat 147 (EDEN, aktiv) und 34 (verkauft), siehe `download-errors.json`.
