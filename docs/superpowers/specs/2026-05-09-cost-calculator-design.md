# Cost Calculator (Kostenrechner) — Design

**Project:** Akkermann Stroy website
**Status:** Approved design, ready for implementation planning
**Date:** 2026-05-09

---

## 1. Goal

Add an on-site cost calculator that gives potential customers an instant, unverbindliche (non-binding) price range for one of the company's five services. The result acts as a lead-generation funnel: the customer can hand off to the existing contact form with all calculator inputs and the estimated range pre-filled.

## 2. Scope

**In scope**

- A new dedicated page `kostenrechner.html` linked from the main nav of every existing page.
- One unified calculator covering all five services (Badrenovierung, Bodenarbeiten, Fenster & Türen, Innenausbau, Komplettsanierung).
- A single config object (in `js/cost-calculator.js`) holding every coefficient, so the company can adjust pricing in one place.
- Handoff to the existing contact form on `index.html` via URL params, with the service dropdown extended to include all five services.

**Out of scope**

- Wiring the contact form's `action` attribute to a real backend / mail service. The user has confirmed this will be addressed soon, separately. The calculator's CTA assumes the form will deliver leads when it lands.
- A persistent backend, lead database, or analytics events.
- Multi-step wizard / progress bar UI.
- A teaser block on the homepage (can be added later).

## 3. Inputs

### 3.1 Customer-facing variables (six fields)

| Field | Type | Options / bounds |
|---|---|---|
| Leistung | `<select>` | Badrenovierung, Bodenarbeiten, Fenster & Türen, Innenausbau, Komplettsanierung |
| Fläche / Anzahl | numeric input | unit + bounds depend on service (see §3.3) |
| Ausstattung | radio (3) | Einfach / Standard / Hochwertig |
| Zustand | radio (3) | Neubau / Renovierung / Kernsanierung |
| Region | radio (2) | Berlin / Mecklenburg-Vorpommern |
| Demontage erforderlich? | radio (2) | Ja / Nein |

All six fields are required. Submit button is disabled until all are valid.

### 3.2 Company-fixed coefficients (single config block)

Stored at the top of `js/cost-calculator.js`:

```js
const CONFIG = {
  baseRates:        { bad: 1800, boden: 80, fenster: 950, innen: 550, komplett: 1400 },
  qualityFactors:   { basic: 0.85, standard: 1.00, premium: 1.40 },
  conditionFactors: { neubau: 0.90, renovierung: 1.00, kern: 1.25 },
  regionFactors:    { berlin: 1.10, mv: 1.00 },
  demolitionPerUnit:{ bad: 120, boden: 120, fenster: 150, innen: 120, komplett: 120 },
  overhead:         { bad: 800, boden: 400, fenster: 300, innen: 600, komplett: 2500 },
  minimums:         { bad: 8000, boden: 1500, fenster: 1200, innen: 5000, komplett: 25000 },
  rangeWidth:       0.15,   // ±15 %
  roundTo:          100     // round result to nearest 100 €
};
```

After a customer call, every value above can be edited in this single block and the page reloaded — no other code changes required.

### 3.3 Per-service quantity bounds

| Service | Unit | Min | Max |
|---|---|---|---|
| Badrenovierung | m² | 2 | 50 |
| Bodenarbeiten | m² | 5 | 500 |
| Fenster & Türen | Stück | 1 | 30 |
| Innenausbau | m² | 5 | 300 |
| Komplettsanierung | m² | 30 | 500 |

Above max → the result panel is replaced with a "Großprojekt erkannt" message and a CTA to the contact form. Below min → blocked at validation; helper text shows the minimum.

## 4. Formula

```
Estimate = BaseRate[service]
         × Quantity
         × QualityFactor[quality]
         × ConditionFactor[condition]
         × RegionFactor[region]
         + (demolition === 'ja' ? DemolitionPerUnit[service] × Quantity : 0)
         + Overhead[service]

Estimate   = max(Estimate, Minimums[service])

Range_low  = roundTo100( Estimate × (1 − rangeWidth) )
Range_high = roundTo100( Estimate × (1 + rangeWidth) )
```

### 4.1 Worked example

Badrenovierung, 8 m², Standard, Renovierung, MV, mit Demontage:

```
1800 × 8 × 1.00 × 1.00 × 1.00 = 14 400
+ 120 × 8                      =  +960
+ overhead bad                 =  +800
                               -------
                                16 160 €

max(16 160, 8 000) = 16 160 €
Range_low  = round(16 160 × 0.85, 100) = 13 700 €
Range_high = round(16 160 × 1.15, 100) = 18 600 €

Result text: "Ihre Schätzung: 13.700 € – 18.600 €"
```

### 4.2 Display formatting

- German number format: `13.700 €` (period thousands separator, no decimals, currency symbol after with non-breaking space).
- Always rounded to the nearest €100 — feels like an estimate, not a quote.

## 5. Page UX

### 5.1 Page structure (`kostenrechner.html`)

Reuses existing site chrome (topbar, navbar, footer). New content sections:

1. **Hero (compact, ~40 dvh)** — H1 "Kostenrechner — Ihre Schätzung in 30 Sekunden" + sub.
2. **Calculator section** — `.container` with the form (`max-width: 50rem`, single column).
3. **Trust strip** — three short lines (`Festpreisangebot · 25 Jahre Erfahrung · MV & Berlin`).
4. **Footer** — existing component.

### 5.2 Form layout

Single-column, six fields in the order listed in §3.1. Radio groups (Ausstattung, Zustand, Region, Demontage) shown as inline button-style radios (mobile: wrap to two rows). The quantity input's unit suffix ("m²" / "Stück") swaps based on the selected Leistung. Min/max bounds also update with the service.

### 5.3 Validation

- Real-time on blur. Red border + helper text on invalid.
- Submit button disabled until all six fields valid.
- Numeric input rejects non-numeric characters; comma accepted as decimal separator and normalized to `.` internally.

### 5.4 Result display

Revealed inline below the form on submit, smooth-scrolled into view. Card contains:

- "Ihre unverbindliche Schätzung"
- Large range: `13.700 € – 18.600 €` (brand color)
- Subtle line: "Basierend auf: …" echoing the customer's inputs
- Primary CTA: **Unverbindliches Angebot anfordern**
- Secondary CTA: **Werte anpassen** (collapses result, scrolls to top of form)
- Disclaimer (always shown):
  > *Diese Schätzung ist unverbindlich und ersetzt kein individuelles Angebot. Der tatsächliche Preis kann je nach Objektzustand, Materialauswahl und örtlichen Gegebenheiten abweichen.*

### 5.5 Oversize message

If quantity > max for the selected service:

> **Großprojekt erkannt.**
> Bei Projekten über [max] [unit] berechnen wir individuell. Bitte kontaktieren Sie uns für ein persönliches Angebot.
> [ Kontakt aufnehmen ]

The CTA links to `index.html?service=<slug>&oversize=1#contact`.

### 5.6 Styling

- Reuse `tokens.css` for colors, spacing, typography. No new tokens.
- Reuse existing `.form-group`, input styles, and button styles from `components.css`.
- New file `styles/calculator.css` holds only calculator-specific layout (form grid, result card, oversize message).
- All sizing in `rem`. Container pattern (`.container` inner `<div>`) per CLAUDE.md.
- Responsive breakpoints follow the project's four tiers (≤ 64 / 48 / 37.5 / 30 rem).

## 6. Lead Handoff

### 6.1 Mechanism — URL params on the existing contact form

On clicking **"Unverbindliches Angebot anfordern"**, navigate to:

```
index.html?service=<slug>&qty=<n>&qual=<v>&cond=<v>&region=<v>&demo=<ja|nein>&estLow=<n>&estHigh=<n>#contact
```

`js/main.js` reads these params on `DOMContentLoaded` (new function, kept self-contained at the bottom of the file). If `service` is present:

1. Pre-select the matching option in `#service-select`.
2. Pre-fill `#contact-message` with a structured German summary (see §6.3).
3. Smooth-scroll to `#contact`.
4. Focus the Name field (next field requiring user input).

If no params are present, the form behaves normally (no-op).

### 6.2 Extending the contact-form dropdown

The existing `#service-select` has historical entries (`sanierung, fliesen, boden, maler, badrenovierung, aussen, other`). It will be **replaced** with the calculator's five services plus "Sonstiges" as a catch-all:

| `data-value` | Label |
|---|---|
| `bad` | Badrenovierung |
| `boden` | Bodenarbeiten |
| `fenster` | Fenster & Türen |
| `innen` | Innenausbau |
| `komplett` | Komplettsanierung |
| `other` | Sonstiges |

This change must be applied to **every HTML page that contains the contact form** (`index.html` and any service page that embeds it) in lockstep, so the calculator's pre-selection always finds a match.

### 6.3 Pre-filled message body

```
Anfrage über den Kostenrechner:

Leistung:        Badrenovierung
Fläche/Anzahl:   8 m²
Ausstattung:     Standard
Zustand:         Renovierung
Region:          Mecklenburg-Vorpommern
Demontage:       Ja

Geschätzte Spanne: 13.700 € – 18.600 €

—
Bitte senden Sie mir ein unverbindliches Angebot.
```

### 6.4 Oversize handoff

If the customer arrived from the oversize path (`?oversize=1`), pre-fill only the service dropdown and a shorter message:

```
Anfrage über den Kostenrechner (Großprojekt):

Leistung: Komplettsanierung
Umfang:   600 m² (über Standard-Rechnerbereich)

Bitte kontaktieren Sie mich für ein persönliches Angebot.
```

## 7. Files Touched

**New**

- `kostenrechner.html`
- `styles/calculator.css`
- `js/cost-calculator.js`

**Modified**

- `index.html` — extend `#service-select` options.
- `js/main.js` — add the calculator-handoff pre-fill handler (reads URL params, fills form, scrolls).
- Every other HTML page that embeds the contact form — extend `#service-select` options to match `index.html`.
- All existing HTML pages — add `Kostenrechner` link to the main navbar (between Leistungen and Kontakt).
- `sitemap.xml` — add `kostenrechner.html`.

## 8. Non-Goals / Deferred

- Backend submission for the contact form (`action="#"` will be addressed separately).
- A/B testing different ranges or coefficients.
- Persisting calculator state across sessions.
- Analytics event tracking on submit/CTA click.
- Localization (German only for now, matching the rest of the site).

## 9. Open Questions

None blocking. Coefficient values in §3.2 are placeholders pending the user's customer call; they live in one config block and can be updated without code changes.
