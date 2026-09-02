# SEO + GEO Audit & Implementation — akkerman-stroy.de
**Datum:** 2026-09-01 · **Geschäftstyp:** Local Business (Handwerksbetrieb, DE)
**Markt:** Neubrandenburg / Mecklenburg-Vorpommern + Berlin
**Money Keywords:** „Badrenovierung Neubrandenburg", „Trockenbau MV", „Sanierung Berlin Altbau", „Handwerker [Stadt]"

---

## Composite score

| Kategorie | Gewicht | Vorher | Nachher | Δ |
|---|---|---|---|---|
| AI Citability & Visibility | 25% | 32 | 84 | +52 |
| Brand Authority (off-site) | 20% | 22 | 26 | +4 |
| Content E-E-A-T | 20% | 42 | 70 | +28 |
| Technical Foundations | 15% | 58 | 86 | +28 |
| Structured Data | 10% | 48 | 88 | +40 |
| Platform Optimization | 10% | 22 | 70 | +48 |
| **Composite** | | **35.1 (Critical)** | **68.3 (Fair)** | **+33.2** |

Brand Authority starts higher than the other two sites because a real Google Business Profile already
exists (Place ID `ChIJpZuk7XXDq0cRdCa6ejXgLYg`, badge shows 4.8 / 124 Bewertungen). That is the single
most valuable asset this business has and it was not referenced anywhere in the structured data.

---

## Findings

### Critical
1. **Falsche Adresse in den strukturierten Daten.** The `HandymanService` schema declared
   `addressLocality: "Berlin"` with Berlin's city-centre coordinates (52.52, 13.405). The actual
   registered business address, per the Impressum, is **Phillip-Müller-Straße 4, 17033 Neubrandenburg** —
   roughly 130 km away. NAP (name/address/phone) consistency is the strongest single local-ranking
   signal, and the site was telling Google and every AI system the wrong city and the wrong coordinates.
   → **Fixed** on all 11 content pages: correct street, postcode, locality, region, and Neubrandenburg
   coordinates.

### High
2. **The 5 city pages were the homepage with the city name swapped** (122 diff lines on a ~1,900-line
   page, almost all of it metadata). Doorway-page pattern. → **Fixed:** each city page now carries
   ~280 words of genuinely unique local content plus two city-specific FAQs. See "Local content" below.
3. **No question-headed content anywhere on the site** — no FAQ, no answer blocks, on any of 13 pages.
   → **Fixed:** 8 shared FAQs on the homepage and every service page, 10 per city page (2 unique + 8 shared).
4. **Every canonical URL 307-redirected** (`akkerman-stroy.de` → `www.akkerman-stroy.de`, but canonicals,
   OG URLs, the sitemap and robots.txt all pointed at the apex). → **Fixed:** 101 URL references across
   14 files switched to `www`.
5. **No `llms.txt`.** → **Fixed.**
6. **No security headers.** `vercel.json` contained only a legacy `routes` entry. Note: Vercel does not
   allow `routes` alongside `headers`, so the route was converted to a `rewrites` entry. → **Fixed.**
7. **The Google Business Profile was invisible to structured data** — zero `sameAs` links, despite a real
   GBP existing and being linked from the page body. → **Fixed:** both the share link and the canonical
   `maps/place/?q=place_id:` URL added to `sameAs`.

### Medium
8. Organization schema had no `@id`, so nothing could cross-reference it; no `vatID`, no chamber-of-trades
   identifier, no `knowsAbout`, no `hasOfferCatalog`, no structured `openingHoursSpecification`
   (only the legacy `openingHours` string), and the founder was a bare name. → **Fixed.**
9. No `WebPage`, no `speakable`, no `BreadcrumbList` on homepage or city pages; legal pages had no schema
   at all. → **Fixed.**
10. Service pages were 363–382 words against a 500-word service-page floor. → **Fixed:** now 961–981 words.
11. Titles led with the brand rather than the service + city. → **Fixed.**
12. `sitemap.xml` `lastmod` was 2026-05-09 on pages changed since. → **Updated to 2026-09-01.**

### Low — flagged, not changed
13. **`aggregateRating` — still not added, and the reason is now confirmed (see the reviews section below).** The site
    displays "4.8 · 124 Bewertungen · Verifiziert durch Google Maps", but that badge is hardcoded in
    `index.html` (lines ~1333–1344) rather than read live from the Places API. Publishing a rating in
    structured data that does not match the live profile risks a manual action. **Confirm the current
    figure on the Google profile, then add it** — the snippet is at the bottom of this file.
14. **Google Fonts and GLightbox load from third-party CDNs** (`fonts.googleapis.com`,
    `cdn.jsdelivr.net`). Two consequences: render-blocking third-party requests on the critical path,
    and a DSGVO exposure that the Datenschutzerklärung currently has to cover. Self-hosting the four
    font families and the GLightbox bundle would remove both. Not done here because it touches the
    build and the privacy policy together.
15. Exact `geo` coordinates are Neubrandenburg city-centre, not the Phillip-Müller-Straße address.
    Copy the precise lat/long from the Google Business Profile listing when convenient.

---

## Changes made

| Datei(en) | Änderung |
|---|---|
| `robots.txt` | Neu geschrieben: explizites `Allow` für 9 Tier-1- und 7 Tier-2-KI-Crawler, `Disallow: /` für Bytespider und CCBot, `Disallow` für `/admin/` und `/api/`, IETF-`Content-Signal`-Zeile, `www`-Sitemap. |
| `vercel.json` | Legacy `routes` → `rewrites` (Pflicht, damit `headers` überhaupt greifen), plus vollständiger Security-Header-Satz und Cache-Header für `/assets/*`, `/styles/*`, `/js/*` und HTML. |
| `llms.txt` | **Neu.** 45 Zeilen: Beschreibung, Leistungen (5), Einsatzgebiete (5 Städte mit dem jeweiligen baulichen Schwerpunkt), Rechtliches, 12 Key Facts inkl. Betriebsnummer, USt-IdNr., § 634a BGB und § 35a EStG. |
| Alle 13 HTML-Dateien + `sitemap.xml` + `js/*.js` | Host auf `https://www.akkerman-stroy.de` kanonisiert (101 Referenzen). |
| `index.html` | Titel/Description auf Leistung + Ort umgestellt. Schema komplett neu als 5-Knoten-`@graph`: `GeneralContractor`+`HandymanService` (`@id`, **korrekte Neubrandenburger Adresse und Geokoordinaten**, `vatID`, Betriebsnummer der HWK Ostmecklenburg-Vorpommern als `identifier`, `memberOf` HWK, `sameAs` mit beiden Google-Profil-URLs, strukturierte `openingHoursSpecification`, 9 `knowsAbout`-Themen, 24 `areaServed`-Einträge, `hasOfferCatalog` mit 5 Services), `Person` (Ruslan Nazarchuk), `WebSite`, `WebPage` mit `speakable`, `FAQPage`. **Neuer FAQ-Abschnitt mit 8 Frage-Antwort-Blöcken.** |
| 5 Leistungsseiten | Titel/Descriptions neu. 7-Knoten-`@graph`: Organization, Person, WebSite, WebPage (`speakable`), `Service` mit vollem `areaServed` und `availableChannel`, `BreadcrumbList`, `FAQPage`. **8 FAQs je Seite.** Wortzahl **363–382 → 961–981**. |
| 5 Stadtseiten | Titel/Descriptions neu. Schema wie oben, plus stadtspezifischer `Service` mit eigenen `GeoCoordinates` und `containedInPlace`. **Neuer `.local`-Abschnitt mit 3 Absätzen einzigartigem Inhalt je Stadt** und **2 stadtspezifischen FAQs + 8 gemeinsamen**. Wortzahl **1044 → 1892–1934**, davon ~280 Wörter pro Seite exklusiv. |
| `impressum.html`, `datenschutzerklaerung.html` | `WebPage` + `BreadcrumbList` ergänzt (vorher gar kein Schema). |
| `styles/components.css` | `.faq` (natives `<details>`/`<summary>` — kein JS, tastaturbedienbar, Antworten immer im DOM) und `.local` ergänzt, mit den vorhandenen Design-Tokens, Breakpoint bei 48rem und `prefers-reduced-motion`-Guard. |

### Local content — what makes each city page genuinely different now

| Stadt | Inhaltlicher Kern (real, überprüfbar) |
|---|---|
| Neubrandenburg | Firmensitz; Plattenbaubestand Datzeberg / Oststadt / Reitbahnviertel — einheitliche Grundrisse, enge Sanitärschächte, fehlende Verbundabdichtung; Altbau/Nachkriegsbestand in der Innenstadt mit uneinheitlichen Aufbauhöhen |
| Berlin | Gründerzeit-Altbau vor 1918, Dielenböden auf Holzbalkendecken (Fliesen reißen ohne Unterbau), Denkmalschutz und Milieuschutz-Erhaltungssatzungsgebiete |
| Rostock | Plattenbau Lütten Klein / Evershagen / Schmarl / Toitenwinkel; Küstennähe → Abdichtung und Lüftung entscheidend |
| Schwerin | Residenzensemble seit Juli 2024 UNESCO-Welterbe → Denkmalschutz prägt den Altstadtbestand; Kontrast Altstadt/Schelfstadt vs. Großer Dreesch |
| Stralsund | Historische Altstadt seit 2002 UNESCO-Welterbe, Backsteingotik, dichte Denkmalschutzlage; Plattenbau Knieper West / Grünhufe außerhalb |

### FAQ content — the citability layer

Die 8 gemeinsamen FAQs sind bewusst faktendicht und auf Suchanfragen ausgelegt, die Handwerkskunden
tatsächlich stellen — inklusive zweier Punkte, zu denen es im Netz kaum gute deutschsprachige
Kurzantworten gibt:

- **Gewährleistung:** 5 Jahre ab Abnahme bei Bauwerken (§ 634a Abs. 1 Nr. 2 BGB), 2 Jahre sonst,
  4 Jahre bei vereinbarter VOB/B.
- **Steuer:** 20 % der Lohnkosten, max. 1.200 € pro Jahr (§ 35a Abs. 3 EStG), nur Lohn-/Fahrt-/
  Maschinenkosten, Rechnung mit getrenntem Lohnanteil und unbare Zahlung zwingend.
- **Trockenbau Q1–Q4:** was die vier Qualitätsstufen bedeuten und warum die Stufe ins Angebot gehört.
- Dazu: Festpreis vs. Aufwand, Dauer einer Badrenovierung, kleine Aufträge, Genehmigungspflichten
  (Denkmalschutz / Milieuschutz / WEG), Startzeitpunkt.

**Verifikation:** alle 13 Seiten liefern gültiges JSON-LD (0 Fehler). Layout per CDP bei 375 / 600 /
1280 px geprüft: `scrollWidth === innerWidth` überall, keine neuen Overflow-Verursacher; neue Abschnitte
bei 375 und 1280 px visuell kontrolliert.

---

## Nächste Schritte — höchster verbleibender Hebel

**Off-site (nicht im Repo lösbar):**
1. **Google-Unternehmensprofil vollständig pflegen** — Leistungen, Fotos je Gewerk, Öffnungszeiten,
   Einsatzgebiet. Es existiert bereits und ist der stärkste Aktivposten des Betriebs.
2. **Aktuelle Bewertungszahl bestätigen**, dann `aggregateRating` ergänzen (Snippet unten).
3. **Google Search Console + Bing Webmaster Tools**: `https://www.akkerman-stroy.de/sitemap.xml`
   einreichen, `www` als bevorzugte Property setzen (passend zur hier vorgenommenen Umstellung).
4. **IndexNow** einrichten — ChatGPT Search und Copilot laufen beide über den Bing-Index.
5. **Profile bei MyHammer / Das Örtliche / Gelbe Seiten / Handwerkskammer-Verzeichnis** mit exakt
   identischen NAP-Daten. Entity-Konsistenz ist genau der Punkt, an dem die falsche Berliner Adresse
   bisher geschadet hat.

**In-repo:**
6. Google Fonts und GLightbox selbst hosten (siehe Finding 14).
7. Referenzprojekte als eigene Unterseiten mit Vorher/Nachher, Ort, Gewerk und Dauer — das ist für
   einen Handwerksbetrieb der stärkste E-E-A-T-Inhalt, den es gibt, und derzeit liegt alles in einer
   Galerie ohne eigene URL.
8. Sichtbares „Zuletzt aktualisiert"-Datum auf Leistungs- und Stadtseiten.

---

## Snippet für `aggregateRating` (erst nach Prüfung der aktuellen Zahl einsetzen)

In den Organization-Knoten (`@id` endet auf `#organization`) auf jeder Seite einfügen:

```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "reviewCount": "124",
  "bestRating": "5",
  "worstRating": "1"
}
```

Die Werte müssen der Google-Profilanzeige entsprechen und bei größeren Abweichungen nachgeführt werden.


---

# Nachtrag 2026-09-02 — Google-Rezensionen laden nicht mehr

## Root cause (bestätigt, nicht vermutet)

Die Live-Seite wurde im Browser geladen und Konsole plus Netzwerkverkehr mitgeschnitten. Der Aufruf
`PlaceService.GetPlaceDetails` erreicht Google korrekt — richtige Place ID, richtige Felder — und
antwortet mit:

```
Places API error: BillingNotEnabledMapError
"You must enable Billing on the Google Cloud Project at
 https://console.cloud.google.com/project/_/billing/enable"
```

`AuthenticationService.Authenticate` antwortet dagegen erfolgreich. **Der API-Key ist also gültig und
die Referrer-Beschränkung greift korrekt — blockiert wird ausschließlich die Abrechnung.** Im
Google-Cloud-Projekt hinter dem Key ist die Abrechnung deaktiviert (Karte abgelaufen, Guthaben
aufgebraucht oder Projekt-Billing entkoppelt). Genau das erklärt „hat funktioniert, jetzt nicht mehr":
weder Code noch Key wurden geändert.

**Das ist kein Code-Fehler und lässt sich nicht im Repository beheben.** Abrechnung im Cloud-Projekt
reaktivieren → die echten Rezensionen erscheinen wieder ohne weitere Änderung.

Zusätzlich protokolliert die Maps-API eine Deprecation-Warnung: `google.maps.places.PlacesService` ist
seit dem 1. März 2025 für Neukunden nicht mehr verfügbar. Für dieses bestehende Projekt funktioniert es
weiter und ist nicht abgekündigt, aber ein Wechsel auf `google.maps.places.Place` ist die
zukunftssichere Variante.

## Was am Code trotzdem falsch war — behoben

Der eigentliche Defekt im Repository war nicht der fehlgeschlagene Aufruf, sondern **wie er behandelt
wurde**: der Fehler wurde still verschluckt und durch Platzhalter ersetzt, die von echten Rezensionen
nicht zu unterscheiden waren. Deshalb war der Ausfall monatelang unsichtbar.

| Änderung | Datei |
|---|---|
| **Jeder Fehlerpfad protokolliert jetzt den Grund** — Places-Status, Zeitüberschreitung oder Skript-Ladefehler — mit dem Hinweis, Abrechnung und aktivierte APIs im Cloud-Projekt zu prüfen. Vorher: völlig still. | `js/main.js` |
| **Fail-closed statt fail-quiet.** Ohne Live-Daten werden Score-/Anzahl-Badge und die Zeile „Verifiziert durch Google Maps" ausgeblendet — beide behaupten geprüfte Google-Daten, die ohne die API nicht belegbar sind — und der Rezensionsabschnitt samt zugehörigem Navigationslink verschwindet, statt Platzhalter als Kundenstimmen auszugeben. | `js/main.js` |
| **Neuer Schalter `REVIEWS_ALLOW_PLACEHOLDER`** (Standard `false`) für den Fall, dass die Platzhalterkarten bewusst gezeigt werden sollen. Das Google-Badge bleibt auch dann ausgeblendet. | `js/main.js` |
| **Timeout- und `onerror`-Behandlung.** Bisher konnte der Callback ausbleiben (Content-Blocker, offline, DNS) und der Abschnitt blieb dauerhaft leer — ohne jede Meldung. Jetzt greift nach 10 s bzw. bei Ladefehler derselbe Fehlerpfad. | `js/main.js` |
| **`loading=async`** an die Maps-URL ergänzt; beseitigt die Performance-Warnung, die Google bei jedem Seitenaufruf protokolliert hat. | `js/main.js` |
| **Toter Platzhalter-Block entfernt** (7.897 Zeichen je Seite, 6 Seiten). Siehe unten. | 6 HTML-Dateien |

### Der tote Platzhalter-Block

In `index.html` und den fünf Stadtseiten stand ein `<div class="reviews__grid"
id="reviews-grid-placeholder" hidden>` mit drei erfundenen Kundenstimmen („Sarah Jenkins",
„Michael Chen", „David Roberts"), laut Kommentar „kept so old structure doesn't ghost". Weder JS noch
CSS referenzierten ihn — verifiziert per Grep über `js/` und `styles/`. Sichtbar war er nie.

Im **ausgelieferten HTML-Quelltext** stand er allerdings sehr wohl, auf sechs Seiten. KI-Crawler lesen
Rohtext und führen kein JavaScript aus; für sie waren das schlicht Kundenstimmen dieses Betriebs.
Nach einem Arbeitstag, an dem die strukturierten Daten auf Korrektheit gebracht wurden, wäre es
widersinnig, erfundene Testimonials im crawlbaren Quelltext stehen zu lassen. Der Block ist entfernt.

## Verifikation

Alle drei Pfade deterministisch getestet (Maps-Skript per Request-Interception gestubbt):

| Szenario | Abschnitt | Badge | Nav-Link | Karten | Konsole |
|---|---|---|---|---|---|
| Places liefert `OK` | sichtbar | sichtbar, **4,7 / 131** aus Live-Daten | sichtbar | 2 echte | — |
| `REQUEST_DENIED` (aktueller Live-Zustand) | ausgeblendet | ausgeblendet | ausgeblendet | 0 | `[reviews] … Places-API-Status REQUEST_DENIED: Prüfen Sie Abrechnung und aktivierte APIs …` |
| Maps-Skript blockiert | ausgeblendet | ausgeblendet | ausgeblendet | 0 | Fehlerpfad greift |

Der Erfolgsfall überschreibt die fest hinterlegten 4,8 / 124 korrekt mit den Live-Werten — d. h. sobald
die Abrechnung wieder aktiv ist, stimmt das Badge automatisch. Layout nach der Markup-Entfernung bei
375 und 1280 px geprüft: kein horizontaler Überlauf, keine neuen Verursacher.

## Was Sie tun müssen

1. **Abrechnung im Google-Cloud-Projekt reaktivieren** (Projekt des Keys `AIzaSyAndo…`) unter
   https://console.cloud.google.com/project/_/billing/enable — danach erscheinen die echten
   Rezensionen und das echte Badge wieder von selbst.
2. **Budget-Alarm setzen**, damit der nächste Ausfall auffällt, bevor die Seite ihn schluckt.
3. Danach ist auch `aggregateRating` im Schema belegbar — die Live-Werte stehen dann im DOM
   (Finding 13, Snippet oben).
4. Mittelfristig: Migration von `PlacesService` auf `google.maps.places.Place`.
