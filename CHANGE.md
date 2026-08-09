# CHANGE.md — Migration Roadmap

This file tracks the phased plan to migrate the MediFy static HTML prototype into a production-grade atomic + Next.js application. The original prototype lives in `Legacy pages/` at the repo root (`category.html`, `medicine-detail.html`, `login.html`) — that folder is the extraction source and visual baseline for Phase 1. It is backed up separately, so it can be edited or updated during migration if needed; it isn't a frozen, hands-off reference.

---

## Phase 1 — Atomic Decomposition (Plain HTML + Vanilla JS Modules)

All work lives at the repo root. No framework, no build step — same Tailwind CDN + vanilla JS as today, but split into proper component files.

Branch: `feature/atomic-migration`

---

### Step 1 — Scaffold folder structure

- Create directory tree: `data/`, `assets/`, `js/`, `components/atoms/`, `components/molecules/`, `components/organisms/`, `pages/`, `tests/features/`, `tests/step-definitions/`
- Add `.gitignore` covering `.next/`, `node_modules/`, `.env.local`
- Add `README.md` explaining how to run the dev server and the data sync rule
- Create and checkout branch `feature/atomic-migration`
- **Commit:** `chore: scaffold folder structure`

### Step 1a — Assets

- All UI images (logo, favicon, hero images, product images) live in root `assets/`
- All pages inside `pages/` reference assets as `../assets/`
- **Commit:** `chore: add assets`

---

### Step 2 — Data layer

- `data/medicines.json`, `data/site-config.json`, `data/manufacturers.json` — source data
- Write `js/data.js` — `fetchMedicines()` + `fetchSiteConfig()` with module-level cache so multiple callers don't re-fetch
- Write `js/utils.js` — `paise(n)` (paise → ₹ INR), `sub(text, brandName)` ([BRAND_NAME] substitution), `truncate(str, n)`
- Write `js/cart.js` — `getCart()`, `addToCart(medicine)`, `updateQty(id, delta)`, `removeFromCart(id)` — all write to `localStorage.cart`
- `js/header.js` — shared header logic
- **Commit:** `feat: data service, cart manager, and shared utils`

---

### Step 3 — Atoms (HTML snippet references)

- `components/atoms/Button.html` — all 4 button variants: primary (blue), ghost, saffron, danger
  - **Responsive:** Include padding/font-size/height variants for mobile (sm) and desktop (md+)
  - **Test:** Render each variant at 375px (mobile) and 1280px (desktop); verify tap target ≥ 44px on mobile
- `components/atoms/Badge.html` — all pill/badge variants (primary, success, amber, danger)
  - **Responsive:** Font-size scales; padding adapts to breakpoint
  - **Test:** Readable on both mobile and desktop
- `components/atoms/Spinner.html` — loading spinner
  - **Responsive:** Size scales (smaller on mobile, larger on desktop if needed)
- These are HTML snippet reference files — used as copy-paste guides when building page shells, not imported as JS
- **Commit:** `feat: atom component reference snippets`

---

### Step 4 — Shared molecules

| File | Extracted From | What It Contains |
| --- | --- | --- |
| `components/molecules/Modal.js` | All 4 modals (`Legacy pages/category.html` + `Legacy pages/medicine-detail.html`) | `openModal(id)`, `closeModal(id)`, body scroll lock, single Escape key listener |
| `components/molecules/Carousel.js` | 4 carousel copies (both legacy pages) | `Carousel(images, el)` class with `goTo()`, `prev()`, `next()`, `renderDots()` |
| `components/molecules/MedicineCard.js` | `Legacy pages/category.html` lines 534–625 | `buildCard(m)` → HTML string, carousel state, all card buttons |
| `components/molecules/FAQItem.js` | `Legacy pages/medicine-detail.html` | `toggleFaq()`, `faqAnswerHtml()` |
| `components/molecules/ContactCard.js` | `Legacy pages/medicine-detail.html` | `sideContactHtml()` for office contact cards |

**Responsiveness for molecules:**

- **Modal.js:** Full viewport modal on mobile (width: 100%), constrained width on desktop (md: max-w-2xl)
- **Carousel.js:** Arrow buttons hide on mobile, show on desktop (md+); dot size adjusts per breakpoint
- **MedicineCard.js:** Image aspect-ratio responsive; price/rating font-size scales; button padding/gap adaptive
- **FAQItem.js:** Full-width question on mobile, side-by-side layout on desktop
- **ContactCard.js:** Stacked on mobile, grid layout on desktop (md+)
- **Test each at 375px, 768px, 1280px:** Verify layout shifts, no overflow, text readable

**Commit:** `feat: shared molecule components`

---

### Step 5 — Organisms

| File | Extracted From | What It Contains |
| --- | --- | --- |
| `components/organisms/FilterBar.js` | `Legacy pages/category.html` lines 369–503 | `init()`, `applyFilters()` (pure — returns array), `setSort()`, `clearFilters()` |
| `components/organisms/InfiniteScroll.js` | `Legacy pages/category.html` lines 505–649 | `setup(sentinel, onLoad)`, `loadNextBatch()` |
| `components/organisms/QueryModal.js` | Both legacy pages (duplicated) | Single shared `openQueryModal(medicine)`, `closeQueryModal()`, `submitQuery()` |
| `components/organisms/CallModal.js` | `Legacy pages/medicine-detail.html` | `openCallModal()`, `submitCallRequest()` |
| `components/organisms/SaltModal.js` | `Legacy pages/medicine-detail.html` | `openSaltModal()`, `renderSaltList()`, `setSaltSort()` |
| `components/organisms/MfrModal.js` | `Legacy pages/medicine-detail.html` | `openMfrModal()`, `renderMfrList()`, `setMfrSort()` |
| `components/organisms/SubstitutesPanel.js` | `Legacy pages/medicine-detail.html` | `renderSubstitutes()`, `loadMoreSubs()`, `renderMobileInlineBlocks()` |
| `components/organisms/ScrollSpyNav.js` | `Legacy pages/medicine-detail.html` lines 1784–1821 | `setupScrollSpy(sectionIds, desktopNav, mobileNav)` |

**Responsiveness for organisms:**

- **FilterBar.js:** Dropdowns stack vertically on mobile (full-width), horizontal grid on tablet/desktop (md+)
- **InfiniteScroll.js:** Sentinel detection works same across all breakpoints; card grid responsive via parent
- **QueryModal.js:** Full-width form on mobile, constrained width on desktop; input fields stack mobile, side-by-side desktop
- **CallModal.js:** Phone input responsive (full-width mobile, auto desktop); button spans full-width on mobile
- **SaltModal.js & MfrModal.js:** Table stacks vertically on mobile, horizontal grid on desktop (md+)
- **SubstitutesPanel.js:** Single column on mobile, multi-column grid on desktop (md+); `renderMobileInlineBlocks()` must display only on mobile
- **ScrollSpyNav.js:** Sticky nav hides/shows based on breakpoint; desktop sidebar layout vs. mobile bottom tabs
- **Test each at 375px, 768px, 1280px:** Verify dropdown behavior, modal sizing, table readability, sticky nav positioning

**Commit:** `feat: organism components`

---

### Step 6 — Category page

- `pages/category.html` — thin HTML shell
- Imports `FilterBar`, `InfiniteScroll`, `MedicineCard`, `QueryModal`, `Modal`, `Carousel` via `<script type="module">`
- Inline script reduced to wiring only: call `init()`, pass callbacks, set up observer

**Responsiveness:**

- **Mobile (375px):** Single-column medicine card grid; FilterBar dropdown stacked; sticky cart bar at bottom; no sidebar
- **Tablet (768px):** 2-column card grid; FilterBar inline dropdowns; sidebar appears on right (if present); sticky cart bar adjusts
- **Desktop (1280px):** 3-column card grid; FilterBar sidebar on left with persistent dropdowns; main content center; sticky cart bar top-right
- **Test:** Navigate with filters at each breakpoint; verify card count per row, filter visibility, sticky cart positioning, infinite scroll continues to load

**Commit:** `feat: category page — atomic assembly`

---

### Step 7 — Medicine detail page

- `pages/medicine-detail.html` — thin HTML shell
- Imports all relevant organisms: `Carousel`, `SubstitutesPanel`, `ScrollSpyNav`, `SaltModal`, `MfrModal`, `QueryModal`, `CallModal`, `FAQItem`, `ContactCard`

**Responsiveness:**

- **Mobile (375px):** Carousel full-width; details stacked vertically; sticky cart bar at bottom; ScrollSpyNav as bottom tabs; FAQ full-width; Substitutes single-column
- **Tablet (768px):** Carousel + details side-by-side (or stacked if narrow); ScrollSpyNav horizontal tabs or sidebar; Substitutes 2-column grid
- **Desktop (1280px):** 3-section layout (main carousel left, details center, sidebar right); ScrollSpyNav sticky left sidebar; Substitutes 3+ column grid; all modals centered with max-width
- **Test:** Open medicine detail at each breakpoint; scroll through all sections; verify ScrollSpyNav active link updates; open modals (salt, mfr, query, call) at each size; check cart badge sync

**Commit:** `feat: medicine-detail page — atomic assembly`

---

### Step 8 — Homepage

- `index.html` at the **repo root** (not `pages/`) — the homepage is the site's entry point, and static hosts serve root-level `index.html` automatically for the bare domain with no rewrite/redirect needed. This also previews Phase 2, where `app/page.tsx` is inherently the root route in Next.js's own routing convention.
- Full mobile-first atomic port of `Legacy pages/index.html` (2420 lines — own custom header/nav/hero/stats-strip/category grid/breakthrough-drugs/certificates/services/partners/trust-band/testimonials/footer, not a placeholder). An earlier placeholder homepage existed only to give Vercel something to deploy during setup and was replaced by this port.
- Keeps its own header/nav markup and styles rather than the shared `js/header.js` — verified the two are genuinely different designs (this page's topbar+logo+search+nav-with-CTA-buttons layout vs. `js/header.js`'s fixed 76px bar with an auth dropdown), so sharing would have been a real design change
- CSS rewritten mobile-first: base styles render the legacy ≤720px layout directly, with `min-width: 721px` / `min-width: 1025px` tiers layering on tablet/desktop, verified to match the legacy breakpoints exactly at 375/768/1280px
- References assets/scripts as `./assets/`, `./components/...` (root-relative), matching this file's root-level depth
- Auth guard ported, redirecting to `pages/login.html`
- Hero "Request a Call to Order" button wired to the shared `components/organisms/CallModal.js` organism (already built in Step 5, also used by `pages/medicine-detail.html`)

**Responsiveness:**

- **Mobile (375px):** Nav collapses behind a hamburger toggle; search bar full-width, wraps to its own row; hero single-column; category/drug/cert grids at 2 columns; stats strip at 3 columns; footer at 2 columns
- **Tablet (768px, ≥721px tier):** Full nav visible, hamburger hidden; search bar returns to inline max-width; category/drug/cert grids at 3 columns; hero stays single-column until the desktop tier
- **Desktop (1280px, ≥1025px tier):** Hero becomes 2-column; category grid at 5 columns; stats strip at 6 columns with dividers; footer at 5 columns; trust-band and testimonials expand to multi-column
- **Test:** Load homepage at each breakpoint; verify hamburger toggle open/close, search input layout, category/stats/footer grid column counts, no unexpected horizontal scroll (see the item 21 exception note below for the one known ~4px overflow carried over from legacy)

**Commit:** `feat: homepage — atomic assembly`

---

### Step 9 — Login page

- Port `Legacy pages/login.html` → `pages/login.html` — same PIN logic, redirect paths adjusted for `pages/` depth
- **Commit:** `feat: login page`

---

### Step 10 — Parity sign-off + PR

- Run all 3 pages through the 26-item functional checklist (see below) at **375px (mobile), 768px (tablet), and 1280px (desktop)**
- Verify responsiveness: no layout breaks, text readable, buttons tappable (≥44px), sticky elements position correctly at each breakpoint
- Open PR: `feature/atomic-migration` → `main` with checklist evidence + responsive design verification screenshots
- Merge only after full sign-off against `Legacy pages/`

---

### Step 10a — Gherkin Test Suite (runs before sign-off)

**Purpose:** Each checklist item maps to one or more `.feature` files written in Gherkin (Given/When/Then). This ensures positive, negative, and edge cases are explicitly defined and executed — not just manually eyeballed.

**Tooling:**

- **Cucumber** — reads `.feature` files and maps each step to code
- **Playwright** — controls the browser (navigate, click, type, assert)

**Folder structure:**

```text
tests/
├── features/
│   ├── category-page.feature       # Items 1–9, 21–26
│   ├── medicine-detail.feature     # Items 10–17, 21–26
│   ├── auth.feature                # Items 18–20
│   └── cart.feature                # Items 7, 11
└── step-definitions/
    ├── category.steps.js
    ├── medicine-detail.steps.js
    ├── auth.steps.js
    └── cart.steps.js
```

**Coverage per `.feature` file:**

- Each checklist item gets at least 3 scenarios: **positive** (happy path), **negative** (invalid input / missing data), **edge case** (boundary values, empty states, large datasets)
- Both legacy (`Legacy pages/`, served at `localhost:8000`) and atomic (`pages/`, served at `localhost:8001`) must pass the same `.feature` files — parity is proven when both pass identically

**Run command:**

```bash
npx cucumber-js tests/features/
```

**When to write `.feature` files:**

- Written **alongside** each page step (Steps 6–9), not after
- Step 6 (category page) → write `category-page.feature` + `cart.feature`
- Step 7 (detail page) → write `medicine-detail.feature`
- Step 8 (homepage) → extend existing features with homepage scenarios
- Step 9 (login) → write `auth.feature`

**Commit per feature file:** `test: add Gherkin scenarios for category page`

---

### Step 10b — Visual Regression Testing with BackstopJS (runs before sign-off)

**Purpose:** Gherkin verifies behavior; BackstopJS verifies appearance. Together they give functional + visual parity against `Legacy pages/` before any atomic page is merged.

**How it works:**

1. Capture baseline screenshots from **legacy pages** (`Legacy pages/`, `localhost:8000`) at all 3 breakpoints
2. Capture test screenshots from **atomic pages** (`pages/`, `localhost:8001`) at same breakpoints
3. BackstopJS diffs both sets pixel-by-pixel — atomic must match legacy exactly
4. Any visual difference (layout shift, font change, color drift, spacing) flagged as failure with a red highlight overlay

**Viewports tested:**

- 375px (mobile)
- 768px (tablet)
- 1280px (desktop)

**Pages covered:**

- `category.html` — filter bar, card grid, sticky cart bar, modals
- `medicine-detail.html` — carousel, sidebar, scroll-spy nav, substitutes panel, modals
- `index.html` — hero, marquee, sections
- `login.html` — PIN form, layout

**Run commands:**

```bash
# Install
npm install --save-dev backstopjs

# Step 1: Capture legacy baseline (run once against localhost:8000, serving Legacy pages/)
npx backstop reference

# Step 2: Run atomic pages and compare (against localhost:8001, serving pages/)
npx backstop test

# Step 3: If a difference is intentional (e.g. responsiveness improvement), approve it
npx backstop approve
```

**When to run:**

- After each page is assembled (Steps 6–9), run BackstopJS for that page before moving to next
- Full suite run again at Step 10 (final sign-off) across all pages

**Pass criteria:** Zero unapproved visual diffs across all pages at all 3 breakpoints

**Commit:** `test: add BackstopJS visual regression config`

---

## Phase 1 — Functional Parity Checklist (must pass before merge)

| # | Check | How to verify |
| --- | --- | --- |
| 1 | All medicines load | Card count matches `Legacy pages/category.html` |
| 2 | Search filters | Results match legacy exactly |
| 3 | Category / indication / manufacturer dropdowns | Same options, same order as legacy |
| 4 | All 5 sort modes | First + last item matches legacy per sort |
| 5 | Infinite scroll | Next batch loads on scroll; no duplicates |
| 6 | Medicine card carousel | Prev/next cycles images correctly |
| 7 | Add to cart | Badge increments; `localStorage.cart` correct |
| 8 | Open popup (category) | Correct name, price, category shown |
| 9 | Navigate to detail | Correct `?id=` in URL |
| 10 | Medicine detail loads | Brand, salt, price, images match legacy |
| 11 | Qty change | Syncs between desktop and mobile cart bar |
| 12 | Salt modal | Populates, search filters, sort works |
| 13 | Manufacturer modal | Same as salt modal |
| 14 | Query form | Submit shows success; no page reload |
| 15 | Call modal | Submit shows success |
| 16 | FAQ accordion | Expands/collapses; one open at a time |
| 17 | Scroll spy | Active nav link updates on scroll |
| 18 | Auth guard | No `currentUser` → redirected to login |
| 19 | Login PIN | 0000 or 4321 → lands on intended page |
| 20 | Sign out | Redirected to login; `currentUser` cleared |
| 21 | Mobile layout (375px) | Sticky cart bar, mobile tabs, inline blocks; no sidebars; no horizontal scroll; text readable |
| 22 | Tablet layout (768px) | 2-column grids; filter bar adjusts; modals centered; spacing consistent |
| 23 | Desktop layout (1280px) | 3-column layout; sidebars visible; mobile elements hidden; all spacing per design tokens |
| 24 | Responsive text & buttons | Font sizes scale per breakpoint; buttons ≥44px touch target on mobile; no text overflow |
| 25 | Sticky elements | Cart bar, nav, scroll-spy position correctly at all breakpoints; no overlap |
| 26 | Modal responsiveness | Full-width on mobile; constrained width on desktop; form inputs stack mobile, side-by-side desktop |

**Known Phase 1 exception — item 24:** `Legacy pages/category.html`'s medicine-card action buttons (Send Query, WhatsApp, + Add) render at ~28px tall on mobile, below the 44px target. This is a direct conflict with the "pixel-identical to legacy" ground rule, which item 24 itself cannot satisfy without a design change. Left at legacy size for Phase 1; tests assert the actual ~28px height rather than a false 44px pass. Revisit sizing in the Phase 2 redesign, where "no design changes" no longer applies.

**Known Phase 1 deviation — item 16:** `Legacy pages/medicine-detail.html`'s `toggleFaq()` only toggled the clicked FAQ and never closed the others, so legacy actually allowed multiple FAQs open at once despite the checklist requiring "one open at a time." Unlike item 24, this was fixed rather than left pixel-identical — `components/molecules/FAQItem.js`'s `toggleFaq()` now closes all other open FAQs before opening the clicked one, satisfying checklist item 16 exactly. This is a deliberate, small behavior deviation from legacy.

**Known Phase 1 deviation — item 19:** `Legacy pages/login.html`'s 4th-digit `input` handler called `submitPin()` (which sets the wrong-PIN error text) and then unconditionally called `clearError()` immediately after, wiping the error out before it was ever visible — so wrong-PIN feedback silently never worked in legacy (only the shake animation + red border showed). Fixed in `pages/login.html` by moving `clearError()` to the top of the handler so it only clears *stale* errors from a prior attempt, not the one `submitPin()` just set. Deliberate deviation from legacy, same treatment as item 16.

**Known Phase 1 exception — item 21 (homepage):** `Legacy pages/index.html`'s `.stats-strip .container` grid (`grid-template-columns: repeat(3, 1fr)` at ≤720px) produces ~4px of horizontal overflow at 375px viewport width — the six `.stat-item` cells don't shrink below their content's intrinsic min-width (icon + unbreakable label text like "Pan India" / "Fast & Safe"), so the grid tracks overflow their container slightly. Confirmed present in `Legacy pages/index.html` itself (not introduced by the port) by testing both files head-to-head at 375px. Left pixel-identical in `index.html` per the "no design changes" ground rule; `tests/features/homepage.feature` asserts the overflow stays within the known ~4px rather than asserting zero. Revisit in the Phase 2 redesign.

**Known Phase 1 deviation — item 8 (homepage):** `Legacy pages/index.html`'s hero "Request a Call to Order" button called `onclick="openCallModal()"`, but no such function existed anywhere in the file — clicking it would throw a ReferenceError and do nothing. Fixed by wiring it to the shared `components/organisms/CallModal.js` organism (the same one `pages/medicine-detail.html` already uses), consistent with the project's practice of sharing organisms across pages. Deliberate deviation from legacy, same treatment as items 16 and 19.

---

## Phase 2 — Next.js + Supabase (starts after Phase 1 merges)

---

### Step 1 — Next.js project init

- `npx create-next-app@latest` at the repo root — App Router, Tailwind CSS (npm, not CDN), TypeScript optional
- Configure `next.config.js`, update `.gitignore`
- **Commit:** `chore: init Next.js app`

---

### Step 2 — Supabase setup

- Create Supabase project
- Design schema: `medicines`, `manufacturers`, `orders`, `prescriptions`, `users` tables
- Import `medicines.json` data via migration script
- `.env.local` — Supabase URL + anon key (never committed)
- Commit `.env.example` with placeholder variable names
- **Commit:** `chore: Supabase schema and seed migration`

---

### Step 3 — Auth (replace PIN with Supabase Auth)

- Replace `localStorage` PIN check with Supabase Auth session
- Login page → email OTP or phone OTP (no stored password)
- Next.js middleware replaces the JS auth guard on every page (server-side, not client-side)
- **Commit:** `feat: Supabase Auth replacing PIN login`

---

### Step 4 — React atom components

- Convert each `atoms/` HTML snippet into a React component with typed props + variant system
- `Button`, `Badge`, `Spinner`
- **Commit:** `feat: React atom components`

---

### Step 5 — React molecule components

- `MedicineCard`, `Carousel`, `Modal`, `FAQItem`, `ContactCard`
- Props-driven, no global state
- **Commit:** `feat: React molecule components`

---

### Step 6 — React organism components with Supabase data

- `FilterBar` — Supabase query with server-side filtering
- `InfiniteScroll` — replaced with Supabase paginated query (`range()`)
- `SubstitutesPanel`, `SaltModal`, `MfrModal` — fetch from Supabase instead of JSON
- `QueryModal`, `CallModal` — submit to Supabase `orders` table
- `ScrollSpyNav` — port `IntersectionObserver` logic to `useEffect`
- **Commit per organism**

---

### Step 7 — Next.js pages

| Route | Page |
| --- | --- |
| `app/page.tsx` | Homepage |
| `app/category/page.tsx` | Catalogue — server-side filters |
| `app/medicine/[id]/page.tsx` | Detail — `generateStaticParams` for SEO |
| `app/login/page.tsx` | Auth page |

- **Commit per page**

---

### Step 8 — Prescription upload

- Supabase Storage bucket for Rx files
- Upload component wired to detail/category pages
- File reference stored in `prescriptions` table linked to order
- **Commit:** `feat: prescription upload via Supabase Storage`

---

### Step 9 — Performance + SEO

- `generateMetadata()` per page — brand name, salt, category in `<title>` and OG tags
- `next/image` replacing raw `<img>` tags
- Static generation for medicine detail pages (`generateStaticParams`)
- **Commit:** `feat: SEO metadata and static generation`

---

### Step 10 — Cutover

- Full parity checklist repeated + stakeholder sign-off
- Remove `Legacy pages/` in a **single dedicated commit** — rollback = revert that one commit (a separate backup of `Legacy pages/` is also kept outside the repo)
- Tag release `v1.0-nextjs-launch`
- Deploy to Vercel production

---

## Ground Rules (applies to both phases)

- **`Legacy pages/` is the extraction source and visual baseline for Phase 1** — it can be edited/updated if needed (it's backed up separately), but avoid mixing legacy edits into atomic-work commits so history stays easy to follow
- **No design changes** in Phase 1 — pixel-identical to `Legacy pages/`
- **No new features** until Phase 2 is complete
- **One PR per page** — not one giant PR for everything

---

*Last updated: 2026-08-06*
