# DESIGN.md — ProShop Design System v1.0

> Single source of truth for visual language, component patterns, and interaction states.
> Format inspired by [google-labs-code/design.md](https://github.com/google-labs-code/design.md).
> Hardened against AI-slop per `homework/M4` cheatsheets.

**Magic phrase (read first, every session):**
> *"Be a human designer so it doesn't look like AI. With design taste."*

---

## 0. Design Philosophy

ProShop is an e-commerce storefront. Buyers come to **decide and check out**, not to admire UI. Great commerce interfaces earn trust through **restraint**: generous whitespace, honest hierarchy, zero ornament. The product photo and the price are the loudest things on every screen — everything else recedes.

Three principles, in priority order:

1. **Conversion before decoration.** Every screen has one primary CTA. It is visible above the fold on a 1366×768 viewport. Visual choices follow the user journey, not the other way around.
2. **Depth from contrast, not shadows.** Three background levels (`page → surface → surface-alt`). Zero `box-shadow` except focus rings.
3. **Semantic tokens only.** No hardcoded hex, no Tailwind color utilities, no `dark:` prefixes. One token = one meaning, swap by `[data-theme]` on `<html>`.

Inspiration: Linear settings, Stripe Checkout, Vercel dashboard, Aritzia PDP. Not inspiration: any default shadcn theme, any "AI-generated landing page" trend on Dribbble.

---

## 1. Color Palette (semantic tokens)

All colors live as CSS custom properties on `:root`. Dark mode is a `[data-theme="dark"]` override on `<html>`. Never use raw hex in components. Never use Bootstrap utility colors (`text-primary`, `bg-info`) — they bypass the token system.

### 1.1 Token contract

```css
:root {
  /* Surfaces — 3 elevation levels via background contrast */
  --surface-page:        #FAFAF7;   /* warm off-white, app background */
  --surface:             #FFFFFF;   /* cards, modals, inputs */
  --surface-alt:         #F2F1EC;   /* nested cards, table stripes, code */
  --surface-sunken:      #EAE8E0;   /* skeleton base, disabled wells */

  /* Text — hierarchy via weight, size, opacity, NEVER color hue */
  --fg:                  #14130F;   /* primary text */
  --fg-secondary:        #4A4842;   /* secondary text */
  --fg-muted:            #8B887F;   /* metadata, captions */
  --fg-on-accent:        #FFFFFF;   /* text on --accent fills */

  /* Accent — single brand color, used sparingly */
  --accent:              #C2410C;   /* terracotta (NOT blue, NOT purple) */
  --accent-hover:        #9A330A;
  --accent-soft:         #FBE7DA;   /* tinted backgrounds, badges */

  /* Borders — 1px hairlines, 10–15% opacity max */
  --border:              rgba(20, 19, 15, 0.08);
  --border-strong:       rgba(20, 19, 15, 0.16);
  --ring:                #C2410C;   /* focus ring color */
  --ring-alpha:          rgba(194, 65, 12, 0.32);

  /* Status — semantic, not decorative */
  --success:             #166534;
  --success-soft:        #DCFCE7;
  --warning:             #854D0E;
  --warning-soft:        #FEF3C7;
  --danger:              #991B1B;
  --danger-soft:         #FEE2E2;
  --info:                #1E3A8A;
  --info-soft:           #DBEAFE;
}

[data-theme="dark"] {
  --surface-page:        #0E0D0B;
  --surface:             #181714;
  --surface-alt:         #221F1A;
  --surface-sunken:      #2C2823;

  --fg:                  #F2F1EC;
  --fg-secondary:        #B8B5AC;
  --fg-muted:            #7A776E;
  --fg-on-accent:        #14130F;

  --accent:              #FB923C;     /* shifted lighter for dark bg contrast */
  --accent-hover:        #FDBA74;
  --accent-soft:         rgba(251, 146, 60, 0.14);

  --border:              rgba(242, 241, 236, 0.08);
  --border-strong:       rgba(242, 241, 236, 0.16);
  --ring:                #FB923C;
  --ring-alpha:          rgba(251, 146, 60, 0.40);

  --success:             #4ADE80;
  --success-soft:        rgba(74, 222, 128, 0.12);
  --warning:             #FBBF24;
  --warning-soft:        rgba(251, 191, 36, 0.12);
  --danger:              #FCA5A5;
  --danger-soft:         rgba(252, 165, 165, 0.12);
  --info:                #93C5FD;
  --info-soft:           rgba(147, 197, 253, 0.12);
}
```

### 1.2 Rules

- **Hardcoded hex in components is a build error.** Lint rule TBD (`stylelint-declaration-strict-value`).
- Body text contrast ≥ **4.5:1** against its surface (verified: `--fg` on `--surface-page` = 14.8:1 light, 13.2:1 dark).
- `--accent` only on: primary CTA, active link, focus ring, brand mark. Never on body text, never on icons that aren't part of the active path.
- Status colors **paired** (`--success` text on `--success-soft` background) for badges/alerts.
- **No gradients.** Single exception: skeleton shimmer (`linear-gradient(90deg, --surface-sunken, --surface-alt, --surface-sunken)`).

### 1.3 Bootstrap migration note

Current code uses `react-bootstrap` with `bootstrap.min.css` and ad-hoc dark-theme overrides in `frontend/src/index.css`. Migration path: keep RB markup, replace `bootstrap.min.css` import with a thin override layer that maps Bootstrap CSS vars (`--bs-body-bg`, `--bs-primary`, etc.) to ProShop tokens. **Do not** ship `dark-theme` body class as a long-term solution — switch to `[data-theme]` on `<html>`.

---

## 2. Typography

**Headings: Fraunces** (variable, modern serif with editorial confidence).
**Body + UI: Söhne** (paid) or **Geist** (free fallback).
**Mono: JetBrains Mono** (prices in admin tables, order IDs, SKUs).

> Why not Inter? Inter is the default of every shadcn tutorial — instantly reads as "AI landing page". Geist is by Vercel, similar legibility, less worn. Fraunces in the H1 / hero gives the storefront a curated retail feel (think Aritzia, Goop) instead of generic SaaS.

### 2.1 Imports

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-display: 'Fraunces', Georgia, serif;
  --font-sans:    'Geist', system-ui, -apple-system, sans-serif;
  --font-mono:    'JetBrains Mono', 'SF Mono', Menlo, monospace;
}

body { font-family: var(--font-sans); font-feature-settings: 'ss01', 'cv11'; }
h1, h2, .display { font-family: var(--font-display); }
```

### 2.2 Scale (modular, 1.25 ratio, pixel values explicit)

| Role           | Token              | Size   | Line   | Weight | Tracking | Usage                          |
| -------------- | ------------------ | ------ | ------ | ------ | -------- | ------------------------------ |
| Display        | `--text-display`   | 56px   | 1.05   | 500    | -0.03em  | Hero, marketing only           |
| H1             | `--text-h1`        | 40px   | 1.10   | 500    | -0.025em | Page title (one per screen)    |
| H2             | `--text-h2`        | 28px   | 1.20   | 600    | -0.02em  | Section title                  |
| H3             | `--text-h3`        | 20px   | 1.30   | 600    | -0.01em  | Card title, subsection         |
| Body-lg        | `--text-body-lg`   | 18px   | 1.55   | 400    | 0        | Product description, long copy |
| Body           | `--text-body`      | 16px   | 1.55   | 400    | 0        | Default UI text                |
| Body-sm        | `--text-body-sm`   | 14px   | 1.50   | 400    | 0        | Helper text, table cells       |
| Caption        | `--text-caption`   | 13px   | 1.40   | 500    | 0.02em   | Labels, metadata, badges       |
| Mono-md        | `--text-mono`      | 14px   | 1.50   | 400    | 0        | Prices admin, IDs, SKUs        |

Mobile (<640px): drop Display → 40, H1 → 32, H2 → 24, H3 → 18. Body never below 16 (a11y).

### 2.3 Rules

- **Hierarchy via size + weight + spacing — never via color hue.** "Make it gray to look secondary" is wrong; use `--fg-secondary` token consciously.
- **Skip no levels.** H1 → H2 → H3, never H1 → H4.
- **Bold is not a heading.** If it functions as a heading, mark it up as one.
- Display + H1 use Fraunces. H2+ and all body use Geist. **Never mix display fonts in the same block.**
- Prices on PDP: H2 size, mono font, weight 500 (anchors the eye, reads as "data").

---

## 3. Spacing Scale (8px grid, no exceptions)

```css
:root {
  --space-0:   0px;
  --space-1:   4px;   /* hairline gap, icon-text only */
  --space-2:   8px;   /* unit */
  --space-3:   16px;
  --space-4:   24px;  /* default card padding */
  --space-5:   32px;
  --space-6:   48px;  /* default section gap on mobile */
  --space-7:   64px;  /* default section gap on desktop */
  --space-8:   96px;  /* hero / page margins on desktop */
  --space-9:   128px; /* generous between major page regions */
}
```

> 4px exists **only** for the gap between an icon and its label. Everything else is multiples of 8.

### 3.1 Rules

- **Forbidden values:** 6, 10, 12, 14, 18, 20, 22, 36, 40 px. If the design "feels right" at 18px, it's wrong — round to 16 or 24.
- **Section padding (vertical, between major page regions):**
  - Desktop ≥1024: `--space-7` (64px) minimum, `--space-8` (96px) for hero/CTA blocks.
  - Tablet 640–1023: `--space-6` (48px).
  - Mobile <640: `--space-5` (32px).
- **Card internal padding:** `--space-4` (24px) all sides. One canonical card, applied everywhere.
- **Stack rhythm:** vertical gap inside a content stack = `--space-3` (16px). Between subsections = `--space-5` (32px).
- **Container max-width:** 1280px. Side gutters: 24px mobile, 48px tablet, 64px desktop.
- **Generous, not cramped.** If two elements feel close — they are. Add 8px until they breathe.

---

## 4. Border Radius Scale

```css
:root {
  --radius-none: 0;
  --radius-sm:   4px;   /* tight chips, badges */
  --radius-md:   8px;   /* inputs, buttons, small cards */
  --radius-lg:  12px;   /* cards, modals */
  --radius-xl:  20px;   /* hero blocks, image frames */
  --radius-pill: 999px; /* avatar, pill toggle */
}
```

### 4.1 Rules

- **One radius scale, applied consistently.** A card is `--radius-lg`. Always. Never `--radius-md` "because it looks tighter here".
- **Inputs and buttons share `--radius-md`** — visual rhyming on every form.
- **No `border-radius: 50%` on product images.** The current code does this in the carousel (`frontend/src/index.css:43`). Replace with `--radius-xl` rectangles — circular product crops obscure the product. (See § 7.1 "Common AI mistakes".)
- Avatar and brand mark only use `--radius-pill`.

---

## 5. Elevation & Shadow Approach

**Zero `box-shadow` in component styles.** Depth comes from background contrast across three surface levels.

| Level   | Token             | Where it appears                                         |
| ------- | ----------------- | -------------------------------------------------------- |
| 0 — Page  | `--surface-page`  | App background, body                                     |
| 1 — Surface | `--surface`     | Cards, modals, inputs, dropdowns, navbar                 |
| 2 — Alt | `--surface-alt`   | Nested elements: review inside product card, table stripes |
| 3 — Sunken | `--surface-sunken` | Skeleton placeholder, disabled wells                  |

### 5.1 Allowed shadow exceptions (only these)

```css
/* Focus ring — accessibility, not decoration */
--ring-shadow: 0 0 0 3px var(--ring-alpha);

/* Modal scrim — this is opacity, not a shadow */
--modal-scrim: rgba(20, 19, 15, 0.48);
```

That's it. **No `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`.** If a card "feels flat", the surrounding background is wrong, not the card.

### 5.2 Rules

- A dropdown menu floats above the page → it sits on `--surface` against `--surface-page`. The 1px `--border-strong` outline + the contrast is enough.
- "Sticky header" → solid `--surface` background, optional bottom `1px solid --border` when scrolled. No drop shadow on scroll.
- "Hovered card" → `transform: translateY(-2px)` + background tint shift, **not** a deepening shadow.

---

## 6. Component Patterns

The canonical inventory. Every screen composes from these — no one-off variants.

### 6.1 Buttons

Three intents only: **primary, secondary, ghost.** One destructive variant (deletes, cancellations).

```css
.btn {
  font: 500 14px/1 var(--font-sans);
  letter-spacing: 0.01em;
  height: 40px;          /* default; -sm = 32, -lg = 48 */
  padding: 0 16px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  display: inline-flex; align-items: center; gap: 8px;
  transition: background-color 150ms ease, color 150ms ease,
              border-color 150ms ease, transform 100ms ease;
  cursor: pointer;
}

.btn-primary   { background: var(--accent);     color: var(--fg-on-accent); }
.btn-secondary { background: var(--surface);    color: var(--fg);
                 border-color: var(--border-strong); }
.btn-ghost     { background: transparent;       color: var(--fg); }
.btn-danger    { background: var(--danger);     color: var(--fg-on-accent); }
```

Touch target ≥ 44×44 on mobile (a11y). `-sm` (32px) only allowed on desktop, never as the primary CTA.

**Labels:** purposeful verbs only. `Add to cart`, `Place order`, `Save changes`, `Sign in`. Forbidden: *Click here, Learn more, Submit, OK.*

### 6.2 Cards

```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);    /* 24px, always */
  /* NO box-shadow. */
}
.card--alt { background: var(--surface-alt); border-color: transparent; }
```

**Product card** (storefront grid): image (1:1, `--radius-md` inside the card), title (H3), rating row, price (mono, weight 500). 16px gap between rows. **No "compare" / "wishlist" overlay icons on hover** — hover-revealed actions hurt conversion and break touch.

**Order summary card** (checkout right rail): sticky on desktop ≥1024, `--radius-lg`, divider `1px solid --border` between line items, totals row in weight 600.

### 6.3 Inputs

```css
.input, .select, .textarea {
  height: 40px;            /* textarea: auto, min-height 96 */
  padding: 0 12px;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  color: var(--fg);
  font: 400 16px/1 var(--font-sans);  /* 16px on mobile prevents iOS zoom */
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.input::placeholder { color: var(--fg-muted); }
```

**Labels above inputs, never inside.** Floating-label pattern hides the label when the user needs it most (re-reading their input). Helper text below in `--text-body-sm` `--fg-muted`. Error text replaces helper, color `--danger`.

### 6.4 Badges

```css
.badge {
  font: 500 12px/1 var(--font-sans);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}
.badge--success { background: var(--success-soft); color: var(--success); }
.badge--warning { background: var(--warning-soft); color: var(--warning); }
.badge--danger  { background: var(--danger-soft);  color: var(--danger); }
.badge--info    { background: var(--info-soft);    color: var(--info); }
.badge--neutral { background: var(--surface-alt);  color: var(--fg-secondary); }
```

Use cases (mapped to ProShop screens):
- Order status: `Paid` → success, `Pending` → warning, `Cancelled` → danger, `Delivered` → info.
- Stock: `In stock` → success, `Low stock` → warning, `Out of stock` → danger.
- Admin moderation queue: `Approved` / `Pending` / `Rejected`.

### 6.5 Navigation (Header)

Replaces current `Navbar bg='dark'`:

- Background `--surface`, bottom `1px solid --border`. **Not** dark navy by default — ProShop sells across all categories, neutral surface lets product photos lead.
- Brand mark `ProShop` in **Fraunces 600 / 20px**, letter-spacing `-0.01em`.
- Search bar **center**, max-width 480px (Amazon pattern, not "wishful logo center"). Cart + account on the right.
- Cart icon shows item count badge (`--accent` fill, 16px circle, top-right of icon).
- Theme toggle is icon-only, `--space-2` padding, no label. Replace `☀️/🌙` emoji with line-icons (Lucide `sun` / `moon`) — emoji are a top-3 AI-look tell.

### 6.6 Tables (Admin lists)

- No vertical borders. Horizontal `1px solid --border` between rows only.
- Row hover: `background: --surface-alt`. No transform, no shadow.
- Column headers in `--text-caption` uppercase, `--fg-muted`.
- Numeric columns (price, qty, total) right-aligned, mono font.
- Row actions (edit / delete) are icon buttons in the last column, ghost variant, revealed on row hover **AND** focus (keyboard-accessible).

### 6.7 Modal / Sheet

- Mobile (<640): bottom sheet, drags to dismiss, max 90vh.
- Desktop: centered, max-width 480px (confirmations) / 640 (forms) / 800 (rich content).
- Scrim `--modal-scrim`. No background blur (perf-expensive on low-end devices).
- Close button top-right, ghost icon-button. Esc dismisses. Focus trapped inside.

---

## 7. Interactive States (the table that prevents AI-slop sign #10)

**Every interactive element MUST declare all six states.** Missing any is a review-blocking issue. State changes use `150ms ease` for color / border, `100ms ease` for transform.

### 7.1 The state matrix

| Element        | Default                                   | Hover                                                          | Focus (keyboard)                                       | Active / Pressed                       | Loading                                                                 | Empty                                                       | Error                                                                                          | Disabled                                              |
| -------------- | ----------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Btn primary**  | `--accent` bg                              | `--accent-hover` bg                                            | `outline: 3px var(--ring-alpha); outline-offset: 2px`  | `transform: translateY(1px)`           | spinner replaces label, label hidden via `aria-busy`, width preserved   | n/a                                                         | n/a (errors live near the form, not on the button)                                              | `opacity: 0.5; cursor: not-allowed; pointer-events: none` |
| **Btn secondary**| `--surface` bg, `--border-strong`          | `--surface-alt` bg                                             | same ring                                              | translateY(1px)                        | spinner inline                                                          | n/a                                                         | n/a                                                                                             | same disabled                                          |
| **Btn ghost**    | transparent                                 | `--surface-alt`                                                 | same ring                                              | translateY(1px)                        | spinner inline                                                          | n/a                                                         | n/a                                                                                             | opacity 0.5                                            |
| **Link**         | `--accent`, no underline                    | underline 1px, offset 3px                                       | same ring, rounded 2px                                  | `--accent-hover`                       | n/a                                                                     | n/a                                                         | n/a                                                                                             | `--fg-muted`                                           |
| **Input**        | `--border-strong`                           | `--fg-secondary` border                                          | `border-color: --ring; box-shadow: 0 0 0 3px --ring-alpha` | n/a                                  | label "Saving…" + spinner in trailing slot, value read-only             | placeholder visible                                          | `border-color: --danger; box-shadow: 0 0 0 3px color-mix(in srgb, --danger 24%, transparent)` + helper text in `--danger` | `background: --surface-sunken; cursor: not-allowed`   |
| **Select**       | same as input                               | same                                                            | same                                                    | n/a                                    | spinner in chevron slot                                                 | first option = "Select option"                              | same as input                                                                                  | same                                                  |
| **Checkbox/Radio**| 1px `--border-strong`, `--surface`          | `--accent` border                                                | ring                                                    | filled `--accent`                      | inline spinner replaces glyph                                            | n/a                                                         | red border + helper text                                                                       | opacity 0.5                                            |
| **Card (clickable)** | as defined                              | `transform: translateY(-2px); border-color: --border-strong`     | ring on the whole card                                  | translateY(0)                          | content swapped for skeleton (same dimensions)                          | empty-state slot inside card (icon 48px + title + subtitle + CTA) | red `1px solid --danger` border + inline error message                                          | opacity 0.5                                            |
| **Product card**  | as 6.2                                     | image scale 1.02 (300ms ease-out), title color shifts to `--accent` | ring on card                                           | n/a                                    | full skeleton (image block + 2 lines + price block)                     | n/a (handled by list-level empty state)                     | n/a                                                                                             | "Out of stock" badge + opacity 0.7 on image           |
| **Table row**     | default                                    | `--surface-alt` bg, action icons fade in                         | ring, action icons revealed                              | n/a                                    | row replaced by skeleton row                                             | full-table empty state (see § 7.2)                          | row tinted `--danger-soft`, error icon in first cell                                            | opacity 0.5                                            |
| **Modal**         | open                                       | n/a                                                             | focus trapped, first focusable focused                  | n/a                                    | content area shows spinner; CTA disabled with "Saving…"                | rare; show empty-state inside body                         | inline alert at top of body                                                                    | n/a                                                   |
| **Toast**         | slide-in 200ms                              | n/a                                                             | focusable, dismissable by Esc                            | n/a                                    | n/a (toasts are post-action)                                            | n/a                                                         | `--danger` left-border 3px, role="alert"                                                       | n/a                                                   |
| **Tab**           | underline transparent                      | `--fg`                                                          | ring                                                    | underline `--accent`, weight 600       | spinner in tab if its content is loading                                 | tab content = empty state                                   | red dot in tab if content errored                                                              | opacity 0.5                                            |
| **Pagination**    | `--fg-secondary`                            | `--fg`                                                          | ring                                                    | current page bg `--accent-soft`, `--accent` text | n/a                                                          | n/a                                                         | n/a                                                                                             | opacity 0.5 on edges (first/last reached)             |

### 7.2 Empty / loading / error patterns (page-level)

**Skeleton (loading):**
```
[ surface-sunken block, --radius-md, shimmer ]
```
Shimmer = single linear-gradient sweep at 1.4s ease-in-out infinite. Skeleton dimensions match the real content within ±4px (no layout shift on load).

**Empty state (no data):**
```
   [ outline icon, 48px, --fg-muted ]
   Heading           — H3, --fg
   Description       — body-sm, --fg-muted, max 2 lines, max 320px wide
   [ Primary CTA ]   — only if there's an obvious next step
```
Centered in the container. Vertical padding `--space-7` top and bottom. **Never** ship "No results" as bare text.

**Error state (failed fetch):**
- Inline (within a card / table): `--danger-soft` background, icon, message, "Try again" ghost button.
- Page-level (whole screen failed): same layout as empty state but icon in `--danger`, "Refresh" primary button + "Go home" ghost.
- Form-level: aria-live="polite" toast + per-field inline error (border + helper).

### 7.3 Accessibility floor (non-negotiable)

- **Focus visible always.** Never `outline: none` without a replacement ring. The ring uses `--ring-alpha` glow + `--ring` border, 3px total, 2px offset.
- **Keyboard:** Tab order matches visual order. Esc closes overlays. Enter activates primary button on forms.
- **ARIA:** every icon-only button has `aria-label`. `aria-busy` during loading. `role="alert"` on errors. Live region for toast.
- **Contrast 4.5:1 body, 3:1 large text + UI elements.** Verify with axe / WAVE before merge.
- **`prefers-reduced-motion: reduce`** disables transforms, scales, shimmer; keeps opacity and color transitions ≤ 100ms.
- **Touch targets ≥ 44×44 on mobile.** Includes link rows in cart, cart icon in nav, all icon buttons.

### 7.4 Mobile breakpoints (explicit)

| Range            | Behavior                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| `<640px`         | Single column. Bottom sheets replace centered modals. Sticky bottom CTA bar on PDP / Cart. Body 16px minimum. |
| `640–1023px`     | 2-col product grid. Drawer nav. Side rails collapse below content (PlaceOrder summary moves below items).     |
| `≥1024px`        | 3–4 col product grid. Persistent right-rail summary on checkout. Top-bar nav.                                 |

---

## 8. Motion

Purposeful only. No fade-in on page load, no decorative wiggle, no parallax.

| Token           | Value         | Used for                                        |
| --------------- | ------------- | ----------------------------------------------- |
| `--motion-fast` | 100ms ease    | Press / active state transforms                 |
| `--motion-base` | 150ms ease    | Color, border, opacity transitions              |
| `--motion-slow` | 300ms ease-out| Image scale on card hover, drawer slide-in      |
| `--motion-page` | 200ms ease    | Route change opacity 0 → 1 (no slide)           |

Stagger between sequential reveals (e.g. products appearing after fetch): 40ms. Cap at 8 staggered items, the rest appear together.

---

## 9. Iconography

Library: **Lucide** (line, 1.5 stroke, 24×24 default, 16 in dense UI).

**Forbidden:** Font Awesome (current code uses `fas fa-shopping-cart`, `fas fa-user` in `Header.js`), emoji as UI icons, multi-color illustrative icons inside buttons, "icon + sparkle".

Migration: replace `react-bootstrap` + Font Awesome icons with `lucide-react`. Map: `shopping-cart`, `user`, `search`, `sun`, `moon`, `chevron-down`, `x`, `check`, `plus`, `minus`, `trash-2`, `pencil-line`, `package`, `truck`, `credit-card`.

---

## 10. Screen-specific blueprints (ProShop, mapped to existing routes)

Each blueprint is the wireframe-level intent. ASCII first per `homework/M4/prompts/ascii-wireframe-lock.md` — code follows exactly, no extra sections.

### 10.1 HomeScreen `/`

```
[ HEADER: brand · search (centered) · cart · account ]

[ HERO carousel — 4:1 ratio on desktop, 16:9 mobile.
  Single image full-bleed inside container.
  Caption stack left-aligned, max-width 420px:
    eyebrow (caption uppercase) · headline (display) · subhead · primary CTA
  No circular crop, no rotating ornament.                                    ]

[ section-gap 96 ]

[ Latest Products — H1 left-aligned + small "Shop all" ghost button right ]
[ Grid 4 cols desktop / 2 tablet / 1 mobile · gap 32 · product card 6.2 ]

[ Pagination centered, gap 64 ]

[ FOOTER ]
```

Drop the current circular-crop carousel images (`frontend/src/index.css:38-48`) — they obscure product context.

### 10.2 ProductScreen `/product/:id`

```
[ Breadcrumb: Home / Category / Product name        --text-caption muted ]

[ ROW desktop ≥1024:
  COL-7  Gallery: main image 1:1 + 4 thumbnails below (12px gap), --radius-xl
  COL-5  Stack:
         H1 product name (Fraunces)
         Rating row (stars · review count link)
         Price (mono, H2 size, weight 500)
         Description (body-lg, max 60ch)
         Variant chips (size / color) — § 6.4 patterns
         Quantity stepper + Add-to-cart primary, full-width on mobile
         Stock badge inline below CTA
         Trust row: "Free returns · Ships in 2 days"  --text-body-sm muted
]

[ section-gap 64 ]

[ Reviews section
    H2 "Customer reviews" + rating summary card --surface-alt left
    Filter chips: All · 5★ · 4★ · 3★ · …
    Review cards stacked, --surface-alt, divider 1px between
    "Write a review" ghost button (auth-gated)
]
```

Mobile (<640): sticky bottom bar with price + Add-to-cart so the CTA is always reachable (per cheatsheet rule 11 "primary CTA above the fold").

### 10.3 CartScreen `/cart`

```
[ H1 "Your cart"   item count caption right ]

[ ROW desktop:
  COL-8  Line items list — each row:
    image 96² · title + variant + remove ghost · qty stepper · line total mono
    1px divider --border between rows
  COL-4  Sticky summary card --surface-alt, --radius-lg:
    Subtotal · Shipping (or "Calculated at next step") · Tax · Total
    "Proceed to checkout" primary, full-width
    "Continue shopping" ghost link
]

[ Empty state: package icon · "Cart is empty" · "Browse products" primary CTA ]
```

### 10.4 Login / Register `/login` `/register`

```
[ Centered card max-width 420, --space-7 vertical padding on viewport ]
[ FormContainer:
  H1 "Sign in" / "Create account"
  Email input · Password input (with toggle visibility ghost icon)
  Primary CTA full-width, label "Sign in" / "Create account"
  Inline error region above CTA, role="alert"
  Divider with "or"
  Switch link to opposite screen
]
```

No social-login buttons unless the backend actually supports them (no decoration).

### 10.5 Multi-step Checkout `/checkout` (when `multi_step_checkout_v2` flag on)

```
[ Stepper top — § 6.6 pattern, 3 steps: Shipping · Payment · Review ]
[ Active step content card --surface, --space-5 padding ]
[ Sticky right-rail order summary (§ 6.2) on desktop, collapsible on mobile ]
[ Footer of step: "Back" ghost left · "Continue" primary right
  Continue is disabled until step is valid; tooltip on disabled hover ]
```

Replace `CheckoutSteps.js` numbered links with the new stepper. Indicate progress via filled step circles + connecting line (filled to current).

### 10.6 OrderScreen `/order/:id`

```
[ H1 "Order #{shortId}"  status badge inline (§ 6.4) ]
[ Two-col desktop:
  COL-8: 3 cards stacked: Shipping · Payment · Items.
         Card header H3 + status meta caption right.
  COL-4: Totals card sticky (subtotal/shipping/tax/total).
         "Pay now" primary if unpaid · PayPal block lazy-loaded.
         "Mark delivered" admin-only ghost.
]
[ Empty / error: full-page state per § 7.2 ]
```

### 10.7 Admin lists (`/admin/userlist` `/admin/productlist` `/admin/orderlist`)

```
[ Page header: H1 + count caption · Search input · "New X" primary right ]
[ Filter row: status badges as toggle chips ]
[ Table § 6.6 — sticky header, row hover, last col actions ]
[ Pagination centered ]
[ Empty state: relevant icon + CTA ("Add first product") ]
```

### 10.8 FeatureFlagsScreen `/admin/featureflags`

```
[ H1 "Feature flags" + count caption ]
[ List of flag cards (§ 6.2):
    Card header: flag key (mono) + status badge
    Body: description (body-sm)
    Footer row: state segmented control (Disabled / Testing / Enabled)
                · traffic % slider (only when Testing)
                · "Updated 3m ago" caption right
]
```

Show optimistic UI on toggle, error toast + revert on failure (per § 7.1 pattern).

### 10.9 ReviewModerationScreen `/admin/reviews`

```
[ H1 "Review queue" + pending count badge ]
[ Filter tabs: Pending · Approved · Rejected (§ 6.6 tabs pattern) ]
[ Review cards stacked:
    Header: product link + reviewer + rating
    Body: review text (body-lg, max 80ch)
    Footer: "Approve" primary · "Reject" danger · "View product" ghost
]
[ Empty state: "Queue is clear" check icon + caption ]
```

---

## 11. Anti-AI-slop Guards (mandatory, non-negotiable)

> Verbatim guard block from `homework/M4/anti-slop-supplement.md` Part 4, adapted for ProShop.

### Layout & composition

- **NO 2-column comparison blocks.** Forbidden patterns: "Without us / With us", "Before / After", "Old way / New way" side-by-side. Use single-column storytelling, a 3-card grid, or a real table.
- **ASCII wireframe before code.** Before generating UI for a new screen, produce an ASCII wireframe (see § 10). Code matches the wireframe exactly. No extra sections invented.
- **Generous spacing between sections.** Min 48px desktop, 32px mobile between major regions (§ 3). Section internal padding ≥ 24px. Never 12–16px between sections.

### Visual style

- **NO gradients on backgrounds, buttons, or hero blocks.** Solid colors only — `--surface-page` / `--surface` / `--surface-alt` + `--accent`. Single exception: skeleton shimmer.
- **Cards: subtle elevation, NEVER heavy borders.** 1px `--border` (8% opacity) or `--border-strong` (16%). Forbidden: `border: 2px+`, `border: 3px solid black`, double borders, dashed.
- **No `box-shadow` outside focus rings.** Re-read § 5 before reaching for `shadow-lg`.
- **No Inter.** Geist for sans, Fraunces for display, JetBrains Mono for mono. No `font-family: 'Inter'` anywhere.
- **No `text-blue-600` (or any Tailwind/Bootstrap color utility) as brand color.** Use `--accent`. The accent is **terracotta**, not blue, not purple, not indigo.
- **No `dark:` prefixes.** Dark mode = `[data-theme="dark"]` token override. Refactor `body.dark-theme` overrides in `frontend/src/index.css` to the token system.
- **No emoji as UI icons.** Replace `☀️/🌙` in `Header.js:85` with Lucide icons.
- **No circular product image crops.** Replace carousel `border-radius: 50%` with `--radius-xl` rectangles.

### UX-first thinking

- **User journey before visual style.** Before designing any screen, answer: (1) Who is on this page? (2) What are they trying to do? (3) Where is the primary CTA? (4) What is the next logical step?
- **Primary CTA above the fold on 1366×768.** Hero ≤ 60vh on desktop. Sticky bottom CTA on mobile PDP and Cart.
- **Body contrast ≥ 4.5:1 always.** No light gray on white "because it looks aesthetic".
- **Real content in mockups.** No `Lorem ipsum`. Use real product names, real prices, real review text from the seed DB.
- **Buttons have purposeful labels.** No `Click here`, `Learn more`, `Submit`, `OK`. Every label names the action.

### Animations

- **Purposeful motion only.** Hover, focus ring, transitions, skeletons, stepper progress. No decorative fade-in on static content. No simultaneous all-elements-fade-in on mount.
- **`prefers-reduced-motion: reduce` is honored.** Transforms and shimmer disabled, opacity / color transitions ≤ 100ms.

### shadcn / library defaults

- If shadcn/ui is introduced later, theme MUST be customized via `:root` tokens (not stock slate / zinc / gray). Generate via TweakCN or hand-tune per § 1.

---

## 12. Implementation Notes (existing codebase)

- **Bootstrap migration.** Don't rip out `react-bootstrap` in one go. Phase: (1) introduce token CSS at root, (2) override `--bs-*` Bootstrap CSS variables in a thin layer, (3) replace components screen-by-screen starting with Header → Product card → Forms → Tables.
- **`frontend/src/index.css`** becomes `tokens.css` (just `:root` and `[data-theme]` blocks). Component CSS lives next to its component (`Component.module.css`) or in shared layers (`forms.css`, `tables.css`).
- **Dark mode hook.** `useDarkMode` in `frontend/src/hooks/` should toggle `data-theme` on `<html>`, persist to `localStorage`, default to `prefers-color-scheme`. Stop toggling `body.dark-theme` class — that's a hack per `homework/M4/cheatsheets/12-signs-of-ai-look.md` sign #7.
- **Feature flag for rollout.** New design ships behind `redesign_v1` flag (use existing `mcp-features` infra). Test bucket = 10% first, expand by traffic %.
- **a11y audit before flag flip to 100%.** Run axe on all 18 routes, manual keyboard pass, screen-reader pass on PDP + Checkout (the conversion funnel).
- **Visual regression.** Take Playwright screenshots of HomeScreen, ProductScreen, CartScreen, OrderScreen at desktop + mobile viewports. Diff on every PR that touches a token or component.

---

## 13. Format Declaration

- Tokens live in **CSS custom properties** on `:root` and `[data-theme="dark"]`.
- Distribute also as **`design-tokens.json`** (Style Dictionary–compatible) so Tailwind / RN / Figma can consume the same values.
- Components ship as **plain CSS modules + react-bootstrap markup** initially; long-term migration target is **shadcn/ui themed against ProShop tokens**.
- This file (`DESIGN.md`) is the single source of truth. Conflicts between this file and any code-level value: **this file wins**, code is wrong.

---

*Last updated: 2026-05-09. Hardened against AI-slop signs 1–12 per `homework/M4/cheatsheets/12-signs-of-ai-look.md`.*
