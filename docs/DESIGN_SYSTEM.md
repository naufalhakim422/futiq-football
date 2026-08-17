# Design System & Visual Strategy — Football Media Platform

> **VERSION**: 1.0.0  
> **DESIGN DIRECTION**: Editorial Sports Media × Modern Sports Broadcast × Premium Football Data  
> **FEEL**: High-end editorial journalism combined with real-time broadcast score telemetry.

---

## 1. Typography Direction

Primary Typefaces:
- **Headlines & Editorial Titles**: *Newsreader* or *Playfair Display* (Editorial gravitas, high editorial contrast).
- **Body & Articles**: *Inter* or *Source Serif 4* (Optimal long-form readability).
- **Match Stats & Telemetry**: *JetBrains Mono* or *Space Mono* (Numeric alignment for live scores, match minutes, heatmaps).

```css
/* Typographic Hierarchy Tokens */
--font-editorial: 'Newsreader', Georgia, serif;
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

---

## 2. Color Token Strategy

High-contrast slate tones with vibrant pitch green accents:

```css
:root {
  /* Surface & Background Tokens */
  --bg-pitch-dark: hsl(222, 47%, 9%);       /* Main Dark Background */
  --bg-slate-card: hsl(217, 33%, 14%);      /* Card Container Surface */
  --bg-slate-hover: hsl(217, 33%, 18%);     /* Interactive Hover Surface */

  /* Brand Accents */
  --accent-pitch-green: hsl(142, 71%, 45%); /* Match Live Indicator & Primary CTA */
  --accent-broadcast-red: hsl(355, 78%, 56%);/* Live Match Flash / Penalty Alert */
  --accent-gold-tier: hsl(43, 96%, 56%);    /* Expert Contributor Badge */

  /* Text Colors */
  --text-primary: hsl(210, 40%, 98%);      /* High legibility white */
  --text-secondary: hsl(215, 20%, 65%);    /* Muted metadata text */
  --text-muted: hsl(215, 16%, 47%);        /* De-emphasized timestamps */

  /* Borders */
  --border-subtle: hsl(217, 20%, 20%);
  --border-active: hsl(142, 71%, 45%);
}
```

---

## 3. Spacing, Layout Grid & Breakpoints

Using 8pt spatial grid system:

- **Breakpoints**:
  - `sm`: `640px` (Mobile)
  - `md`: `768px` (Tablet / Foldable)
  - `lg`: `1024px` (Desktop / Laptop)
  - `xl`: `1280px` (Wide Desktop)
  - `2xl`: `1536px` (Ultrawide Match Center)

- **Layout Container Max-Width**: `1320px` centered with fluid `16px` padding on mobile.

---

## 4. UI Components Specification

### Buttons
- **Primary CTA**: Solid Pitch Green (`--accent-pitch-green`), dark text, subtle 2px rounded corners, crisp focus ring.
- **Secondary**: Dark slate background with subtle border.
- **Ghost/Tertiary**: High-contrast text button with underline on hover.

### Inputs & Selects
- Dark slate inputs, subtle border, explicit focus state in pitch green. Built-in error validation label.

### Cards & Containers
- Single-level dark slate containers with 1px subtle borders. **Zero over-nested cards**. Clean spacing (`p-5`).

### Tables (Standings & Stats)
- Compact row padding, fixed column widths for numbers, sticky header row for competition tables. Alternating row shading.

---

## 5. Domain-Specific Components

### Football Data Components
- **Live Score Ticker**: Top sticky bar with horizontal scroll, live indicator pulsing dot, team TLA logos, live score numbers.
- **Match Card**: Compact card showing team crests, score breakdown, halftime status, venue.
- **League Standings Widget**: Table with Team, MP, W, D, L, GD, Pts, form guide dots (W-D-L).

### Article Components
- **Editorial Hero**: Large cover image, category pill badge, editorial headline, author avatar, read duration tag.
- **In-Article Match Embed**: Mini card showing match stats embedded within tactical analysis articles.

---

## 6. Mandatory Feedback States

Every data-fetching UI component must implement:

1. **Loading State**: Skeleton loader mimicking the exact structure of the target card/table (no generic spinning wheels).
2. **Empty State**: Clear contextual message ("No live fixtures scheduled for today") with secondary navigation options.
3. **Error State**: Non-intrusive alert box with retry button ("Unable to load live standings. [Retry]").
