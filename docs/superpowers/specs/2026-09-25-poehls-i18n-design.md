# Pöhls Immobilien – Ergänzung: Zweisprachigkeit (DE/EN)

Stand: 2026-09-25 · Ergänzt `2026-09-25-poehls-prototyp-design.md` · Status: freigegeben (Robby, im Chat)

## Ziel

Die gesamte Seite ist auf Deutsch und Englisch verfügbar. Frankfurt ist international, die Grand-Tower-Vermietung richtet sich an internationale Mieter; im Pitch zeigt die zweite Sprache, dass die neue Seite diese Zielgruppe erreicht.

**Befund Legacy:** Die Hauptseite war nur deutsch; nur der Grand-Tower-Zweig hatte englische Menüpunkte mit veralteten bzw. Platzhalter-Inhalten. Englische Texte existieren praktisch nicht → wir übersetzen.

## Entscheidungen

| # | Entscheidung | Begründung |
|---|---|---|
| I1 | `@nuxtjs/i18n` 10.x, Strategie `prefix_except_default`: Deutsch unter `/`, Englisch unter `/en/…` | deutsche URLs bleiben unverändert |
| I2 | Englische Seitenpfade: `/en/properties`, `/en/properties/[slug]`, `/en/references`, `/en/references/[slug]`, `/en/grand-tower`, `/en/services`, `/en/about`, `/en/contact`, `/en/legal-notice`, `/en/privacy`, `/en/terms` | lesbare englische URLs |
| I3 | Objekt-Slugs sind in beiden Sprachen gleich | Directus hat ein Slug-Feld; Links funktionieren sprachübergreifend |
| I4 | Startsprache immer Deutsch, keine Browser-Umleitung (`detectBrowserLanguage: false`) | Pitch zeigt zuerst die deutsche Seite; Umleitungen sind bei statischen Seiten fehleranfällig |
| I5 | Sprachumschalter „DE \| EN“ im Header neben Tag/Nacht, wechselt auf dieselbe Seite | erwartbares Muster |
| I6 | Übersetzbare Inhalte als `translations`-Array im Directus-Format `[{ languages_code, … }]`; Zahlen, Adressen, Bilder nur einmal | 1:1 Directus-Translations-Muster |
| I7 | Oberflächentexte in `i18n/locales/de.json` / `en.json`; Fachwörterbücher (Objektarten, Preisarten, Merkmals-Labels) als reine, getestete Funktionen in `app/utils/` | Utils bleiben ohne Nuxt-Kontext testbar |
| I8 | Formatierung pro Sprache: DE „249.000 €“, „3 Zi.“, „/ Monat“ · EN „€249,000“, „3 rooms“, „/ month“ | natürliche Lesart je Sprache |
| I9 | Englische Inhalte übersetzt Claude; jede englische Übersetzung trägt `machine_translated: true` | ehrlich kennzeichnen, vor Livegang prüfen lassen |
| I10 | Datenschutz und AGB werden nicht übersetzt: EN-Seiten zeigen den deutschen Text mit Hinweis „The legally binding version of this text is German.“ Impressum wird übersetzt (reine Fakten). | keine ungeprüften Rechtsübersetzungen |
| I11 | SEO: `hreflang`-Alternates, `lang`, `og:locale` pro Sprache; weiterhin `noindex` | Standard |
| I12 | Alt-Texte der Objektbilder entstehen zur Laufzeit aus dem übersetzten Titel („– Bild n von m“ / „– image n of m“); Stimmungsbilder haben Alt-Texte pro Sprache | eine Quelle für den Titel |

## Datenmodell (Erweiterung)

**`listings`** – zusätzlich:
```json
"translations": [
  { "languages_code": "de", "title": "…", "teaser": "…", "description": "<p>…</p>", "machine_translated": false },
  { "languages_code": "en", "title": "…", "teaser": "…", "description": "<p>…</p>", "machine_translated": true }
]
```
Die Top-Level-Felder `title`, `teaser`, `description` bleiben als deutsche Werte erhalten (Rückwärtskompatibilität, Slug-Quelle). `features[].label` wird über ein Wörterbuch übersetzt, `features[].value` bleibt (Zahlen/Eigennamen).

**Quelle der englischen Objekttexte:** `content/manual/translations/listings.en.json` – Schlüssel `legacy_id` (bzw. `gt-<id>` für Grand-Tower-Objekte) → `{ title, teaser, description: string[] }`. Das Build-Skript führt sie zusammen; fehlt eine Übersetzung, bricht der Build mit Warnung nicht ab, ein Test schlägt aber fehl.

**Handgeschriebene Inhalte** (`home`, `about`, `services`, `grand-tower`, `company`-Texte, `mood`-Alt-Texte): gleiche Struktur mit `translations`-Array.

**Rechtstexte:** `legal.json` bleibt deutsch; Impressum-Beschriftungen kommen aus den Locale-Dateien.

## Datenzugriff

`useContent.ts` liest die aktuelle Sprache (`useI18n().locale`) und liefert lokalisierte Objekte (`title`, `teaser`, `description` aus der passenden Übersetzung, Fallback Deutsch). Reiner Helfer `pickTranslation(translations, locale)` ist getestet.

## Qualitätsprüfung

- Test: `de.json` und `en.json` haben identische Schlüsselmengen.
- Test: jedes Objekt und jeder handgeschriebene Inhalt hat eine englische Übersetzung.
- `qa:links` und `qa:shots` für beide Sprachen; auf `/en/…`-Seiten dürfen typische deutsche UI-Wörter („Zimmer“, „Kaufpreis“, „Kaltmiete“, „Angebote“, „Anfrage“) nur in Objektdaten vorkommen, die bewusst deutsch bleiben (Rechtstexte) – geprüft per Browser-Skript.

## Nicht Teil

Weitere Sprachen, übersetzte Slugs, automatische Spracherkennung, juristisch geprüfte Übersetzungen.
