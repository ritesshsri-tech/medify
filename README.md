# Medify — Atomic Migration

This folder contains the atomic rewrite of the MediFy static prototype.
Legacy files at the repo root are frozen — do not edit them.

## Folder Structure

```
Medify/
├── data/               # Copies of docs/medicines.json and docs/site-config.json
├── assets/             # Copy of root assets/ (logo, images, favicon)
├── js/                 # Shared JS modules: data.js, cart.js, utils.js, header.js
├── components/
│   ├── atoms/          # Button.html, Badge.html, Spinner.html (snippet references)
│   ├── molecules/      # Modal.js, Carousel.js, MedicineCard.js, FAQItem.js, ContactCard.js
│   └── organisms/      # FilterBar.js, ScrollSpyNav.js, QueryModal.js, etc.
├── pages/              # Thin HTML shells: category.html, medicine-detail.html, index.html, login.html
└── tests/
    ├── features/       # Gherkin .feature files (Cucumber BDD scenarios)
    └── step-definitions/ # JS step definitions wiring Gherkin to Playwright
```

## How to Run

```bash
# Start legacy site (port 8000) — for side-by-side comparison
python3 -m http.server 8000

# Start atomic site (port 8001) — from repo root
cd Medify && python3 -m http.server 8001
```

Open both in a split browser window for side-by-side parity verification.

## Data Sync Rule

`Medify/data/` and `Medify/assets/` are **copies** of `docs/` and `assets/` at the repo root.

If root data or assets are updated during migration, manually sync the changes here:

```bash
cp docs/medicines.json Medify/data/medicines.json
cp docs/site-config.json Medify/data/site-config.json
cp -r assets/* Medify/assets/
```

## Asset Path Rule

All pages inside `Medify/pages/` must reference assets as `../assets/` — never `../../assets/` or any path pointing outside the `Medify/` folder.

## Running Tests

```bash
# Gherkin functional parity (Cucumber + Playwright)
npx cucumber-js Medify/tests/features/

# Visual regression (BackstopJS)
npx backstop reference   # capture legacy baseline first
npx backstop test        # compare atomic pages against baseline
```

## Branch

All work on `feature/atomic-migration`. Legacy files never touched on this branch.
