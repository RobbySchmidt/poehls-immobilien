# Pöhls Immobilien – Pitch-Prototyp: Design-Spec

Stand: 2026-09-25 · Autor: Claude (mit Robby Schmidt, rhowerk) · Status: **zur Abnahme**

## 1 Ziel und Rahmen

**Was:** Ein vollständiger, hochwertiger Website-Prototyp für Pöhls Immobilien (Pierre Pöhls, Dreieich / Frankfurt), gebaut auf den echten Inhalten der bestehenden Seite www.poehlsimmobilien.de.

**Wofür:** Kaltakquise durch rhowerk. Der Link geht an den Kunden mit der Botschaft „So könnte Ihre Seite aussehen". Er wird öffentlich auf Netlify gehostet, aber nicht indexiert.

**Erfolg:** Der Kunde erkennt sofort seine eigenen Objekte, Fotos und Texte – deutlich besser präsentiert – und will die Seite haben. Die Seite hält einem kritischen Blick am Handy wie am Desktop stand (beide Modi, alle Unterseiten, keine toten Links, keine falschen Fakten).

**Rahmen:**
- Zeit: 3 volle Arbeitstage.
- Stack: Nuxt 4 + Tailwind v4 + shadcn-vue (reka-ui), lucide-Icons, statisch generiert (`nuxt generate`), Deployment per Netlify-CLI.
- Kein CMS im Prototyp. Datenhaltung in Directus-förmigen JSON-Dateien, damit bei Zusage nur die Datenquelle getauscht wird (Directus).
- Out of scope: Import aus Maklersoftware/IS24, Verkäufer-Lead-Strecken (Online-Wertermittlung), echter Formularversand, Mehrsprachigkeit, Directus-Instanz.

## 2 Entscheidungen (Protokoll)

| # | Entscheidung | Begründung |
|---|---|---|
| E1 | Hosting Netlify, öffentlich, `noindex` dreifach (robots.txt, Meta, `X-Robots-Tag`) | Link soll frei teilbar sein, darf aber nicht neben der echten Seite bei Google erscheinen |
| E2 | Vollständige Seite in 3 Tagen, Qualität vor Tempo | Zielkunde mit hohem Anspruch |
| E3 | Texte behutsam überarbeiten (Fakten bleiben), Objekttexte unverändert | zeigt Mitdenken, ohne den Kunden zu übergehen |
| E4 | Designrichtung „Tag & Nacht": Formensprache „Glas & Himmel" + Nacht-Look, per Schalter umschaltbar | Kunde entscheidet selbst, Wow-Moment im Termin |
| E5 | Datenschicht: aufbereitete JSONs im Directus-Schema, statisch gebaut | schnell, kein Server, Directus-Umstieg ohne Umbau |
| E6 | Kontaktformular gestaltet + validiert, sendet nicht | echte Anfragen an einen Nicht-Kunden wären heikel |
| E7 | Footer-Hinweis „Konzeptentwurf von rhowerk" → https://rhowerk.de/ | Absender erkennbar |
| E8 | Exposés verlinken auf die Original-PDFs auf poehlsimmobilien.de | spart ~200 MB; tote Links werden ausgeblendet |
| E9 | Standardmodus = Systemeinstellung; Wahl wird gemerkt | Dark-Mode-Nutzer sehen direkt die Nacht |

## 3 Seitenstruktur

| Seite | Route | Kern |
|---|---|---|
| Start | `/` | Hero + Schnellsuche + Mosaik, neue Angebote, Grand-Tower-Bühne, Für Eigentümer, Persönlich, Referenzen, Kontakt |
| Angebote | `/angebote` | alle aktiven Objekte, Filter in der URL (`?typ=kauf&art=wohnung&zimmer=3&preis=500000&sort=neu`) |
| Objekt | `/angebote/[slug]` | Galerie + Lightbox, Eckdaten, Beschreibung, Merkmale, Exposé, Kontaktbox, ähnliche Objekte |
| Grand Tower | `/grand-tower` | Projektseite, komplett Nacht |
| Referenzen | `/referenzen` | verkaufte/vermietete Objekte; Detailseiten unter `/referenzen/[slug]` (ohne Preis/Anfrage) |
| Leistungen | `/leistungen` | Verkauf · Vermietung · Betreuung, Ablauf in 5 Schritten, CTA |
| Über uns | `/ueber-uns` | Porträt, Geschichte, Arbeitsweise |
| Kontakt | `/kontakt` | Kontaktdaten, Formular |
| Recht | `/impressum`, `/datenschutz`, `/agb` | Legacy-Texte unverändert, lesbar gesetzt |
| 404 | – | gestaltet, Wege zu Angeboten/Start |

**Header:** Logo + „Pöhls Immobilien" · Angebote · Grand Tower · Leistungen · Über uns · Kontakt · Tag/Nacht-Schalter · Telefon (`tel:`). Mobil: Menü als Sheet, Telefon-Icon immer sichtbar.
**Footer:** Adresse, Telefon, Mobil, E-Mail, Navigation, Rechtliches, „Konzeptentwurf von rhowerk".
**Entfällt:** 14 Kategorie-Menüpunkte, leere Kategorien, Seite „Formulare", leere Widerrufsbelehrung, englische Grand-Tower-Seiten.

## 4 Datenmodell (Directus-Schema)

Erzeugt von `scripts/build-content.mjs` aus `data/legacy/`, geschrieben nach `content/*.json` (in Git). Feldnamen = spätere Directus-Felder.

### `listings`
| Feld | Typ | Herkunft / Regel |
|---|---|---|
| `id` | int | Legacy-ID; Grand-Tower-Objekte mit Offset `100000 + id` |
| `status` | `published` \| `archived` | aktiv → published, Archiv → archived |
| `availability` | `available` \| `sold` \| `rented` | Tags `archiv-verkauft` / `archiv-vermietet` |
| `slug` | string | aus bereinigtem Titel, eindeutig (Suffix `-2` bei Kollision) |
| `title` | string | Titel ohne „Provisionsfrei"/„Ohne Käuferprovision"-Zusätze, NFC-normalisiert, typografische Striche |
| `teaser` | string | erster Beschreibungsabsatz, max. ~160 Zeichen am Wortende |
| `description` | HTML | Beschreibungsabsätze als `<p>` |
| `marketing_type` | `kauf` \| `miete` | Kategorie-Präfix; Grand Tower nach Preisart |
| `property_type` | `wohnung` \| `haus` \| `gewerbe` \| `grundstueck` \| `anlage` | Mapping unten |
| `furnished` | bool | Kategorie `miete-waz` bzw. GT „möbliert" |
| `country` | string | `DE`; Auslandsobjekte aus Adresse/Kategorie `kauf-ausland` |
| `street`, `zip`, `city`, `district` | string | geparste Adresse; `district` aus Titel/Text, wenn eindeutig (sonst null) |
| `rooms` | number\|null | „Zimmer" |
| `living_area` / `usable_area` / `plot_area` | number\|null | „Wohnfläche" / Büro-, Gewerbe-, Verkaufs-, Gesamtfläche / „Grundstücksfläche" |
| `price` | number\|null | erste Preisangabe |
| `price_type` | `kaufpreis` \| `kaltmiete` \| `pauschalmiete` \| `miete_monat` \| `miete_jahr` | Label-Mapping |
| `total_rent` | number\|null | „Gesamtmiete" |
| `price_on_request` | bool | „Preis auf Anfrage" |
| `commission_free` | bool | Titel/Text enthält „provisionsfrei" / „ohne Käuferprovision" |
| `available_from` | string\|null | „Bezugsfrei ab" |
| `features` | `[{label, value}]` | alle übrigen „Label: Wert"-Angaben |
| `cover_image` | file-id | Koken-`featured_image`, sonst erstes Galeriebild |
| `images` | `[{sort, directus_files_id}]` | Galerie in Koken-Reihenfolge, ohne Duplikat des Covers |
| `expose` | `{url}`\|null | nur wenn Download erfolgreich war (`documents.json`) |
| `project` | slug\|null | `grand-tower` für GT-Objekte (Adresse „Europaallee 2" oder Quelle GT) |
| `featured` | bool | Koken `featured` |
| `date_published` | ISO-Datum | Koken `published_on` |
| `legacy_id`, `legacy_url` | | Nachverfolgung |

**Kategorie-Mapping:** `kauf-etw`, `miete-wohnung`, `miete-waz` → `wohnung` · `kauf-12fh`, `miete-12fh` → `haus` · `kauf-gewerbe`, `miete-gewerbe` → `gewerbe` · `kauf-grundstueck` → `grundstueck` · `kauf-rendite`, `anlage-mfmh` → `anlage` · `kauf-ausland` → nach Objekttext, `country` ≠ DE. Objekte mit zwei Kategorien: erste Kategorie gewinnt, Abweichungen im Build-Log.

**Aufnahme:** alle `active` (Hauptseite + Grand Tower) und alle `sold`/`rented`. **Nicht:** `placeholder`, `unlisted`, englische GT-Varianten.
**Dubletten:** GT-Objekte aus beiden Installationen gleich, wenn Straße + Fläche + Preis übereinstimmen → Eintrag mit mehr Bildern gewinnt.
**Leere Werte** werden `null`; die Oberfläche zeigt `null` nie als leere Zeile.

### `projects`
`slug` (`grand-tower`), `title`, `tagline`, `intro` (HTML), `facts` (`[{label, value}]`), `images`, `mood_day`, `mood_night`, `address`. Wohnungen über `listings.project`.

### `files`
`id` (stabil aus Quelle + Koken-ID, z. B. `m-2623`, `gt-1904`), `title`, `description` (Alt-Text), `width`, `height`, `focal_point {x,y}`, `variants` (verfügbare Breiten). Bilddateien: `public/media/<id>-<breite>.webp`, Breiten 480 / 960 / 1600 (nie über Originalbreite). Helfer `assetUrl(file, { width })` wählt die passende Variante; später liefert er Directus-URLs `/assets/<id>?width=…`.
**Alt-Texte:** „<Objekttitel> – Bild <n> von <m>"; Cover: „<Objekttitel>"; Stimmungsbilder: inhaltlich beschrieben (von Hand in `mood.json`).

### Singletons / Seiten
- `company`: Name, Inhaber, Straße, PLZ, Ort, Telefon, Mobil, E-Mail, Web, Registergericht, HRA, USt-ID, Berufskammer. **Quelle: Impressum der Hauptseite (Dreieich)**, nicht die veraltete GT-Adresse (Neu-Isenburg).
- `home`, `about`, `services`: überarbeitete Texte (Abschnitt 6), als JSON mit Feldern je Sektion.
- `legal_pages`: `impressum`, `datenschutz`, `agb` mit HTML aus Legacy (Kontaktformular-Markup und Koken-Tags entfernt).
- `mood.json`: Stimmungsbilder mit Tag/Nacht-Paaren und Alt-Texten.

### Datenzugriff in Nuxt
`app/composables/useContent.ts` o. ä. mit `useListings(filter)`, `useListing(slug)`, `useProject(slug)`, `useCompany()`, `usePage(key)`; importiert die JSONs statisch. Einzige Stelle, die bei Directus ersetzt wird.

## 5 Designkonzept

### 5.1 Leitidee
*Frankfurt von Tag bis Nacht.* Die Seite zeigt die Stadt, in der Pöhls seit über 35 Jahren arbeitet – als Glas und Himmel am Tag, als Skyline im Fensterlicht bei Nacht. Die Aktionsfarbe ist in beiden Modi die jeweilige Lichtquelle: **Himmelsblau am Tag, Fensterlicht-Gold bei Nacht.**
**Signatur:** der Tag/Nacht-Wechsel – Farben und Stimmungsbilder blenden gemeinsam über. Alles andere bleibt ruhig.
**Gegenprobe:** Kein Reflex-Look (kein Creme+Serif+Terrakotta, kein Neon auf Schwarz); die Farben sind aus den Fotos gemessen, die Nachtbilder sind echte Aufnahmen des Kunden. Gold bleibt ausschließlich Aktionsfarbe der Nacht.

### 5.2 Farbableitung
| Quelle | Hex | OKLCH | Token |
|---|---|---|---|
| Himmel/Glas der Tagesfotos (Mockup-Anker) | `#1D4A73` | 0.399 0.085 249 | Tag `primary` |
| Nachtfoto, Fensterlicht / B-Akzent | `#D8A64A` | 0.754 0.123 80 | Nacht `primary` |
| Nachthimmel der Nachtfotos | `#0E131A` | 0.185 0.016 257 | Nacht `background` |
| Glasfassaden-Grau | `#EEF2F6` | 0.959 0.007 248 | Tag `secondary`/`muted` |
Neutrale Töne durchgehend im Hue 250 (blau-grau, „Glas"), Chroma 0,002–0,025.
**60-30-10:** 60 % Fläche (background/card), 30 % Zweitfläche + Fotos, 10 % Aktionsfarbe – nur Buttons, aktive Filter, Links im Fließtext, Fokus.

### 5.3 Token-Palette (in `app/assets/css/tailwind.css`)
```css
:root {
  --radius: 0.75rem;
  --background: oklch(0.995 0.002 250);          /* #fcfdff */
  --foreground: oklch(0.235 0.025 250);          /* #151f2a */
  --card: oklch(1 0 0);                          /* #ffffff */
  --card-foreground: oklch(0.235 0.025 250);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.235 0.025 250);
  --primary: oklch(0.4 0.08 250);                /* #224a71 Himmelsblau */
  --primary-foreground: oklch(0.99 0.003 250);   /* #fafcfe */
  --secondary: oklch(0.955 0.008 250);           /* #ecf1f5 */
  --secondary-foreground: oklch(0.235 0.025 250);
  --muted: oklch(0.955 0.008 250);
  --muted-foreground: oklch(0.46 0.025 250);     /* #4e5966 */
  --accent: oklch(0.935 0.012 250);              /* #e4eaf1 Hover-Tönung */
  --accent-foreground: oklch(0.235 0.025 250);
  --destructive: oklch(0.52 0.19 27);            /* #be2323 */
  --border: oklch(0.905 0.01 250);               /* #dbe0e6 */
  --input: oklch(0.6 0.02 250);                  /* #77818c */
  --ring: oklch(0.24 0.05 250);                  /* #0a2036 */
  /* chart-*/sidebar-* auf Haupttokens spiegeln */
}
.dark {
  --background: oklch(0.175 0.018 250);          /* #0a1118 Nachthimmel */
  --foreground: oklch(0.96 0.004 250);           /* #f0f2f4 */
  --card: oklch(0.225 0.022 250);                /* #141d26 */
  --card-foreground: oklch(0.96 0.004 250);
  --popover: oklch(0.225 0.022 250);
  --popover-foreground: oklch(0.96 0.004 250);
  --primary: oklch(0.76 0.12 78);                /* #dba751 Fensterlicht */
  --primary-foreground: oklch(0.2 0.03 78);      /* #1d1406 */
  --secondary: oklch(0.225 0.022 250);
  --secondary-foreground: oklch(0.96 0.004 250);
  --muted: oklch(0.225 0.022 250);
  --muted-foreground: oklch(0.76 0.018 250);     /* #a9b2bc */
  --accent: oklch(0.265 0.024 250);              /* #1c2631 */
  --accent-foreground: oklch(0.96 0.004 250);
  --destructive: oklch(0.7 0.17 24);             /* #f66c69, nur als Text */
  --border: oklch(0.29 0.02 250);                /* #242c35 */
  --input: oklch(0.56 0.02 250);                 /* #6c7680 */
  --ring: oklch(0.96 0.004 250);
}
```
Alle Werte im sRGB-Gamut (geprüft).

**Kontrastnachweis** (WCAG 2.2, gerechnet mit dem Skript aus design-research §2.3; Flächen background/card/secondary/accent):
| Paar | Tag min. | Nacht min. | Ziel |
|---|---|---|---|
| foreground auf allen Flächen | 13,77 | 13,61 | ≥ 4,5 |
| muted-foreground auf allen Flächen | 5,88 | 7,13 | ≥ 4,5 |
| primary als Text auf allen Flächen | 7,60 | 7,02 | ≥ 4,5 |
| primary-foreground auf primary | 8,93 | 8,34 | ≥ 4,5 |
| primary-foreground auf `primary/90` über background (Hover) | 6,79 | 6,90 | ≥ 4,5 |
| Button-Form primary gegen background | 9,06 | 8,71 | ≥ 3 |
| input auf allen Flächen | 3,26 | 3,29 | ≥ 3 |
| ring 50 % auf allen Flächen | 3,12 | 4,50 | ≥ 3 |
| destructive als Text auf allen Flächen | 5,02 | 5,30 | ≥ 4,5 |
| Weiß auf destructive (Button) | 6,08 | **2,88 ✗** | ≥ 4,5 |
| foreground/70 auf background | 6,11 | 8,58 | ≥ 4,5 |

**Verboten:** destruktive Buttons im Nacht-Modus (kommen nicht vor – Fehler nur als Text am Feld). Kein Opacity-Text außer `foreground/70` (geprüft). Text auf Fotos nur mit Verlauf/Scrim aus `background` (≥ 60 %) oder gar nicht.

**Grand-Tower-Bühne:** Sektion trägt die Klasse `dark` → alle Nacht-Tokens gelten dort auch im Tag-Modus (Token-Scope, kein Sonder-CSS).

### 5.4 Typografie
- **Schrift:** Schibsted Grotesk Variable (`@fontsource-variable/schibsted-grotesk`, OFL), einzige Familie. `--font-sans` und `--font-heading` zeigen darauf. Google-Fonts-Import (Inter) wird entfernt.
- **Gewichte:** 400 (Text) und 600 (Überschriften, Preise, Buttons). Keine anderen.
- **Ziffern:** `font-variant-numeric: tabular-nums` für Preise, Flächen, Zimmer.

| Rolle | Klasse | px | Gewicht | Zeilenhöhe | Laufweite |
|---|---|---|---|---|---|
| H1 | `text-f-6xl` | 39–60 | 600 | 1.0 | −0,03 em |
| H2 | `text-f-4xl` | 28–36 | 600 | 1.1 | −0,02 em |
| H3 | `text-f-2xl` | 18–24 | 600 | 1.25 | −0,01 em |
| Lead | `text-f-xl` | 16–20 | 400 | 1.55 | 0 |
| Fließtext | `text-f-lg` | 16–18 | 400 | 1.6 | 0 |
| UI/Meta | `text-sm` | 14 | 400/600 | 1.4 | 0 |
| Preis (Karte/Detail) | `text-f-2xl` | 18–24 | 600 | 1.2 | −0,01 em |

Lesebreite `max-w-[65ch]`, Lead `max-w-[48ch]`, H1 `max-w-[16ch]`. Überschriften `text-wrap: balance; hyphens: auto` (lang="de" in `nuxt.config.ts` setzen), Absätze `text-wrap: pretty`. Längste reale Wörter („Eigentumswohnungen", „Wohnhochhaus", „Käuferprovision") bei 360 px prüfen. Rich-Text-Stile (`p, h2, h3, ul, ol, a, strong`) als Basis-Stile für `.prose-legacy` (Beschreibungen, Rechtstexte).

### 5.5 Raum, Raster, Rhythmus
- Container: `mx-auto w-full max-w-7xl px-4 md:px-8` überall (Header bis Footer, gemeinsame linke Kante).
- Sektionen: `py-f-24`; Sektionskopf → Inhalt `mb-f-12`; Karten-Gap `gap-f-8`; Split-Layouts `gap-f-16`, asymmetrisch 7/5.
- Raster: Karten 1 → 2 (md) → 3 (lg). Mosaik 2:1 + zwei Kacheln (mobil: großes Bild + zwei Kacheln darunter nebeneinander).
- Breakpoints-Test: 360 / 768 / 1280 / 1536.

### 5.6 Flächen und Rhythmus Startseite
| # | Sektion | Fläche | Muster |
|---|---|---|---|
| 1 | Hero | background | Text + Suche über Mosaik |
| 2 | Neue Angebote | secondary | 3er-Kartenraster (einziges auf der Seite) |
| 3 | Grand Tower | `dark`-Scope, Nachtfoto | Split 7/5 mit Vollbild-Hintergrund |
| 4 | Für Eigentümer | background | Split: Text links, gegliederte Liste rechts |
| 5 | Persönlich | secondary | Porträt 4:5 + Text + Kennzahlen |
| 6 | Referenzen | background | horizontal wischbare Reihe (Carousel) |
| 7 | Kontakt | secondary | Band mit Kontaktdaten + Button |
| – | Footer | `dark`-Scope | – |
Im Nacht-Modus fallen background/secondary zu zwei Dunkelstufen zusammen; Rhythmus bleibt über die beiden Stufen erhalten. Footer steht nicht direkt nach Sektion 3.

### 5.7 Bildwelt
- **Stimmungsbilder** (Skyline, Architektur, Grand Tower): Startseiten-Fotos ohne das eingebrannte Logo-Feld (linke 25,5 % abschneiden). Tag-Set aus den hellen Motiven, Nacht-Set: `703` (Skyline am Main), `707`, `702` (EZB bei Nacht). Paare in `mood.json`.
- **Objektfotos:** unverändert, `object-cover` mit Fokuspunkt; Formate: Karte 4:3, Galerie-Hauptbild 3:2, Galerie-Kacheln 4:3, Lightbox `contain`.
- **Porträt** Pierre Pöhls (`1987`): 4:5-Ausschnitt.
- **Logo:** Messeturm-Signet (`Logo-ohne-Kreis-P`, JPG mit weißem Grund) → einmalig als transparente PNG/SVG-nahe PNG aufbereiten (Weiß → transparent), Tag dunkel, Nacht per `invert`/helle Variante.
- `width`/`height` immer gesetzt, Lazy Loading unterhalb des ersten Screens, `srcset` 480/960/1600.

### 5.8 Komponenten-Einsatz (shadcn-vue)
- **Button:** `default` (primary, Pille, Haupt-CTAs `h-12 px-7 text-base`), `outline` (Sekundäraktion), `ghost` (Header, Tertiäres). Pro Ansicht max. ein gefüllter Primär-Button. Beschriftungen einheitlich: „Angebote ansehen", „Objekt anfragen", „Grand Tower entdecken", „Nachricht senden", „Exposé herunterladen", „Anrufen".
- **Karten:** Objektkarte = Bild + Text ohne Rahmen/Schatten, ganze Karte klickbar, Hover: Titel unterstreichen (kein Bild-Zoom).
- **Badge:** Kauf/Miete auf dem Bild (card-Fläche), „Provisionsfrei", „Möbliert", „Verkauft"/„Vermietet".
- **Weitere:** ToggleGroup (Kaufen/Mieten), Select, Sheet (Mobilmenü, Mobilfilter), Dialog (Lightbox), Carousel (Referenzen; Pfeile innen, kein Autoplay), Input/Textarea/Label (Formular), Separator, Tooltip (Tag/Nacht-Schalter).
- **Icons:** lucide, Strich 1.5, Größen 16/20/24.
- **Schatten:** nur schwebende Ebenen (Popover, Sheet, Dialog); Tokens `--shadow-sm/md` getönt im Hue 250.

### 5.9 Motion
- **Orchestriert:** Tag/Nacht-Wechsel – Farbtokens 300 ms ease-out (`transition` auf `background-color, color, border-color`), Stimmungsbilder Crossfade 300 ms. Hero-Einstieg einmalig: `animate-in fade-in slide-in-from-bottom-2 duration-500` gestaffelt (Überschrift, Lead, Suche, Mosaik).
- **Sonst:** Hover/Fokus 150 ms. **Nicht:** Scroll-Reveals, Parallax, Bild-Zoom, Autoplay.
- `prefers-reduced-motion`: alles sofort, keine Einstiegsanimation. Inhalte ohne JS sichtbar.
- **Kein Aufblitzen:** Inline-Skript im `<head>` setzt `dark` vor dem ersten Paint (localStorage-Wahl, sonst `prefers-color-scheme`); localStorage-Zugriff in try/catch.

## 6 Seiten im Detail und Texte

**Start** – Sektionen wie 5.6. Hero-H1: „Ihre Immobilie in Frankfurt und Rhein-Main." Lead: „Kaufen, mieten, verkaufen – mit über 35 Jahren Markterfahrung an Ihrer Seite." Schnellsuche: ToggleGroup Kaufen/Mieten + Select Objektart + Button „<n> Angebote ansehen" (Zahl live). Neue Angebote: 6 neueste `available`. Grand Tower: Fakten + Anzahl verfügbarer Wohnungen + „ab"-Preis (aus Daten berechnet). Für Eigentümer: H2 „Sie möchten verkaufen oder vermieten?", drei Gruppen aus der Leistungsliste. Persönlich: „35+ Jahre am Frankfurter Markt", „Frankfurt & Rhein-Main", „15+ Jahre exklusive Betreuung ausgesuchter Wohnanlagen" (alle aus der Über-uns-Seite belegt).

**Angebote** – Filterleiste sticky unter dem Header; Filter: Kaufen/Mieten (Standard: alle), Objektart, Zimmer ab (1–5+), Preis bis (Stufen je Kauf/Miete), Sortierung (Neueste, Preis auf-/absteigend). Trefferzahl. Leerer Zustand mit „Filter zurücksetzen". Mobil: Button „Filter (n)" öffnet Sheet. Filter ↔ Query-Parameter synchron (teilbar, Zurück-Taste funktioniert).

**Objekt** – Galerie (1 groß + 4 Kacheln, „Alle <n> Fotos" → Dialog-Lightbox mit Pfeiltasten, Swipe, „3 / 24", Esc). Titel, Stadtteil/Ort, Eckdaten-Zeile, Badges, Beschreibung, Merkmale-Tabelle, Exposé-Button (falls vorhanden). Kontaktbox sticky rechts (Porträt, Telefon, E-Mail, „Objekt anfragen" → `/kontakt?objekt=<slug>` mit vorausgefülltem Betreff). Mobil: fixe Leiste unten „Anrufen" / „Objekt anfragen". Ähnliche Objekte: gleiche `marketing_type` + `property_type`, max. 3. Adresse: Straße nur anzeigen, wenn im Original vorhanden.

**Grand Tower** – komplett `dark`. Hero mit GT-Foto, H1 „Grand Tower Frankfurt", Einführung, Fakten, Galerie, Wohnungsliste (Miete + Kauf), Anfrage-Band. **Fakten (vor Versand prüfen!):** Höhe 172 m · 47 Geschosse · höchstes Wohnhochhaus Deutschlands · Fertigstellung 2020 · Europaallee 2, Europaviertel. Die Fakten stehen in `projects.json` und werden bei Unsicherheit weggelassen statt geraten.

**Referenzen** – Raster aller `sold`/`rented`, Filter Verkauft/Vermietet, Detailseite ohne Preis/Anfrage mit Hinweis „Dieses Objekt wurde erfolgreich verkauft/vermietet" + CTA „Eigene Immobilie anbieten".

**Leistungen** – H1 „Verkaufen und vermieten mit Erfahrung". Gruppen (aus der Legacy-Liste, umgruppiert, nichts erfunden):
- *Verkauf:* Markteinschätzung & Preisfindung, Bieterverfahren, Energieausweis, Unterlagen, Zielgruppe, Exposé mit Profi-Fotos/Video, Home Staging, Portale & Website, Verhandlung, Begleitung zum Notar.
- *Vermietung:* Vorauswahl, Besichtigungen, Bonitätsprüfung, Mietvertrag, Übergabe mit Protokoll & Fotodokumentation.
- *Betreuung:* Betreuung nach Vertragsabschluss, Renovierungs- & Erhaltungsservice, Organisation/Überwachung von Renovierungen, Hausverwaltungen, rechtliche Fragen.
Ablauf (5 Schritte, echte Reihenfolge): Bewertung → Unterlagen & Exposé → Vermarktung → Besichtigung & Prüfung → Vertrag & Übergabe.

**Über uns** – Porträt, überarbeiteter Text (Fakten aus Legacy: 35+ Jahre, Frankfurt/Rhein-Main, Beratung für Anlage & Eigennutzung, 15+ Jahre exklusive Betreuung von Wohnanlagen).

**Kontakt** – Daten aus `company`; Formular: Name*, E-Mail*, Telefon (optional), Anliegen (Kaufen/Mieten/Verkaufen/Vermieten/Sonstiges), Objekt (vorausgefüllt aus Query), Nachricht*, Datenschutz-Hinweis. Validierung beim Absenden + nach Verlassen des Feldes; Fehler mit Icon + Text am Feld; Erfolgsmeldung „Vielen Dank – wir melden uns innerhalb eines Werktags." (kein Versand; im Code als Prototyp gekennzeichnet).

**Recht** – Legacy-HTML, Datenschutz mit Inhaltsverzeichnis (Anker aus Zwischenüberschriften). Hinweis für nach der Zusage: Datenschutzerklärung ist veraltet (TMG-Bezüge) und muss neu erstellt werden – nicht Teil des Prototyps.

**SEO/Meta** – je Seite `title`/`description`, OG-Bild (Hero), `lang="de"`, korrekter Seitentitel „Pöhls Immobilien" (der Tippfehler „Immoblien" der alten Seite wird nicht übernommen). Plus `noindex` (E1).

## 7 Build, Bilder, Deployment

- `scripts/build-content.mjs` → `content/*.json` + `public/media/*.webp` (sharp). Logik in `scripts/lib/*.mjs` (parse, mapping, dedupe, slug, alt) mit Vitest-Unit-Tests. Deterministisch und idempotent (vorhandene Varianten überspringen).
- `public/media/` in `.gitignore`; `content/` in Git.
- Prerender: `nitro.prerender.routes` aus `content/listings.json` (alle Objekt- und Referenzseiten) + Crawler.
- `netlify.toml`: `X-Robots-Tag: noindex, nofollow`, Cache-Header für `/media/*` und `/_nuxt/*`, 404-Seite.
- `public/robots.txt`: `User-agent: * / Disallow: /`.
- Deployment: `yarn generate && netlify deploy --prod --dir .output/public` (einmalig `netlify login` durch Robby).

## 8 Qualitätsprüfung (Abnahme vor Versand)

1. Checkliste design-research Kapitel 5 vollständig.
2. Kontrast-Skript läuft grün (Tabelle 5.3), Browser-Stichproben beider Modi.
3. Screenshots 360/768/1280/1536 × Tag/Nacht für Start, Angebote, Objekt, Grand Tower, Kontakt; `scrollWidth == clientWidth`.
4. `nuxi typecheck` und `yarn generate` fehlerfrei; Vitest grün.
5. Network: keine Requests an Google Fonts; keine 404 auf Bildern/Seiten (Link-Check über alle generierten Seiten).
6. Stichprobe: 5 Objekte Preis/Fläche/Zimmer gegen Live-Seite.
7. Grand-Tower-Fakten verifiziert oder entfernt.
8. Tastatur: Header, Filter, Lightbox, Formular vollständig bedienbar, Fokus überall sichtbar.

## 9 Risiken und offene Punkte

- **Grand-Tower-Fakten** stammen aus Allgemeinwissen → vor Versand prüfen (Abschnitt 6).
- **Bilder ohne Originale:** ~180 Bilder nur in `large` (1600 px) oder kleiner verfügbar – für Web ausreichend, Lightbox bei 4K etwas weich.
- **Exposé-Links** zeigen auf den Live-Server des Kunden; beim aktiven Objekt „EDEN" (Legacy-ID 147) ist der Exposé-Link tot (Button entfällt dort).
- **Logo** liegt nur als JPG vor; transparente Aufbereitung kann an den feinen Linien leicht ausfransen → bei Zusage Vektor-Logo vom Kunden anfordern.
- **Nur drei Nachtfotos** → Nacht-Mosaik nutzt ggf. ein GT-Foto als dritte Kachel.
- **Messeturm-Deutung** des Logos ist Vermutung und wird im Text nicht behauptet.
