---
name: Miata Registry
description: Archival registry UI for limited edition Mazda Miatas
colors:
  brg: "#172E28"
  brg-dark: "#10201C"
  brg-mid: "#5D6D69"
  brg-border: "#BAC1BF"
  brg-light: "#E8EBEA"
  surface: "#FFFFFF"
  overlay: "#000000B3"
typography:
  display:
    fontFamily: "Inter, sans-serif"
    fontSize: "clamp(1.5rem, 4vw, 3.75rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "normal"
rounded:
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.brg}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  button-primary-hover:
    backgroundColor: "#172E28E6"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.brg}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
  input-default:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.brg}"
    rounded: "{rounded.lg}"
    padding: "8px"
---

# Design System: Miata Registry

## 1. Overview

**Creative North Star: "The Club Archive"**

Miata Registry looks like a careful enthusiast institution: muted British-racing-green tones, Inter at readable sizes, soft corners, and borders instead of dramatic shadows. Density is moderate — registry tables and car profiles need room for data; marketing moments on the home page still use the same vocabulary.

The system rejects startup gloss and AI-slop tells. Surfaces are flat white or `brg-light`; depth comes from borders, photography, and occasional `shadow-lg` on menus — not glass, glow, or gradient text.

**Key Characteristics:**

- Single sans family (Inter) for everything — no display/body pairing.
- `brg` token palette only for UI chrome; car paint colors live in data, not the design system.
- `rounded-lg` (8px) as the default corner language.
- Primary actions are solid `brg` fills; secondary actions are `brg-mid` fills or tertiary text links.
- Modals and dropdowns are the main elevation exceptions.

## 2. Colors

A restrained green-neutral palette inspired by British Racing Green — never generic gray Tailwind scales for UI.

### Primary

- **British Racing Green** (`#172E28`): Primary buttons, chip fills, logo mark, body text on light surfaces, theme-color meta.

### Neutral

- **Garage Dark** (`#10201C`): Deepest green — rare emphasis only.
- **Roadstone** (`#5D6D69`): Secondary text, nav default state, input focus border.
- **Chalk Border** (`#BAC1BF`): Dividers, pill borders, modal header rules.
- **Clubhouse Light** (`#E8EBEA`): Section backgrounds, hover washes, input borders, modal title bars.
- **Archive White** (`#FFFFFF`): Cards, modals, dropdown panels, table rows.

### Named Rules

**The BRG-Only Rule.** UI colors come from the `brg` token set. Do not introduce `gray-*`, `slate-*`, or purple/blue accent utilities for chrome. (Existing placeholder `#9CA3AF` on inputs is legacy — prefer `brg-mid` when touching those fields.)

**The One Accent Rule.** Green carries the brand; red appears only for destructive/remove affordances (e.g. chip dismiss hover).

## 3. Typography

**Display / Body / Label Font:** Inter (Google Fonts, `wght@100..900`)

**Character:** Neutral, highly legible, product-grade. No serif display moments. Weight contrast does the hierarchy work (medium headings, regular body).

### Hierarchy

- **Display** (500, `text-2xl` → `text-6xl` on large screens, tight leading): Page heroes — home welcome, major section titles.
- **Title** (700, `text-xl`): Modal titles, emphasized panel headers.
- **Body** (400, `text-base` / `text-md`, 1.5 leading): Paragraphs, table cells, form help. Prose blocks max ~65–75ch where long-form.
- **Label** (500, `text-sm`): Buttons, nav items, filter chips, metadata labels.

### Named Rules

**The Inter-Only Rule.** Do not add a second font family for "character." Enthusiasm comes from photography and copy, not type pairing.

**The 16px Floor Rule.** Inputs use `text-[16px]` on mobile to prevent iOS zoom; `md:text-sm` on larger breakpoints.

## 4. Elevation

Flat-by-default. Cards and tables use `border border-brg-light` on white. Depth appears only where layering is required:

- **Dropdown menus:** `shadow-lg` + `border border-brg-border` on white.
- **Modals:** `bg-black/70` scrim; white panel, no outer shadow on the panel itself.
- **Hover on edition cards:** subtle `bg-brg-light/25` wash, not lift shadows.

### Named Rules

**The Flat-By-Default Rule.** If you're reaching for a shadow, first try a border or tonal background step.

## 5. Components

Product components should feel consistent screen to screen — same button radii, same field borders, same nav behavior.

### Buttons (`Button.tsx`)

- **Shape:** `rounded-lg` (8px), `font-medium`, `text-sm lg:text-base`.
- **Primary:** `bg-brg` fill, white text, `hover:bg-brg/90`, disabled at 50% opacity.
- **Secondary:** `bg-brg-mid` fill, white text, same hover/disabled pattern.
- **Tertiary:** Text-only `text-brg`, `hover:text-brg-mid`; optional `→` arrow with `group-hover:translate-x-1`.
- **As link:** Same classes via `react-router-dom` `Link` when `href` is set.

### Chips (`Chip.tsx`, filter chips)

- **Filter chip:** `bg-brg` fill, `text-brg-light` label + value, `rounded-md`, dismiss `×` with `hover:text-red-300`.
- **Rarity chip:** See `components/rarity/Chip.tsx` — score-driven, stays on-photo in edition cards.

### Cards / Containers

- **Edition card:** White ground, `border border-brg-light`, `rounded-lg`, `hover:bg-brg-light/25`, `aspect-video` image area on `bg-brg-light`.
- **Modal:** `max-w-lg`, `rounded-lg`, title bar `bg-brg-light/70` with bottom border; body scrolls inside `max-h-[80vh]`.

### Inputs / Fields (`TextField.tsx`)

- **Style:** Full width, `border border-brg-light`, `rounded-lg`, `p-2`, `text-brg`.
- **Focus:** `focus:outline-none focus:border-brg-mid` — no ring glow.
- **Textarea:** Fixed `h-32` default height.

### Navigation (`Header.tsx`)

- **Top bar:** Fixed header, `text-sm` links, default `text-brg-mid`, active/hover `text-brg font-medium`.
- **Dropdown:** Hover-reveal panel, white, `rounded-lg`, `shadow-lg`, items `rounded-md` with `hover:bg-brg-light`.
- **Icons:** Font Awesome solid (`fa-solid`) for chevrons and close — keep icon style consistent.

### Modals (`Modal.tsx`)

- Centered overlay, primary action uses default Button; cancel is tertiary. Loading state replaces action label with "Loading...".

## 6. Do's and Don'ts

### Do:

- **Do** use `brg`, `brg-mid`, `brg-border`, `brg-light` tokens for all UI chrome.
- **Do** keep Inter as the only UI typeface.
- **Do** use `rounded-lg` for buttons, inputs, cards, and modals unless a pill (`rounded-full`) is intentional.
- **Do** let car photography and registry data dominate visual interest.
- **Do** match existing component APIs (`Button` variants, `TextField`, `Modal`) before inventing new primitives.

### Don't:

- **Don't** use purple gradients, glassmorphism, neon accents, or floating-orbit hero decorations — per PRODUCT.md anti-references.
- **Don't** use `gray-*` / `slate-*` Tailwind classes for UI surfaces (the `brg` palette exists for this).
- **Don't** add display serifs, gradient text, or oversized fluid type in app screens.
- **Don't** ship inconsistent button styles on different pages — if it submits or navigates, it should look like `Button`.
- **Don't** add decorative motion; transitions are for hover color, arrow nudge, and skeleton pulse only.
- **Don't** call registry cars "special editions" or "models" in new copy — use *limited edition* and *edition*.
