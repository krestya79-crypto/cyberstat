# CyberStat

Probability & Statistics Interactive Learning Platform. Developed by **Ahmed Waleed Gad**, under the supervision of **Dr. Mohamed Ibrahim**, Faculty of Artificial Intelligence and Informatics, Intelligent Cyber-Security Program, Horus University – Egypt.

CyberStat is a static, browser-local React + TypeScript application built from the four supplied lecture PDFs. It includes an introductory page, a study overview, searchable course explorer, dedicated topic workspaces, worked-example library, formula notebook, original PDF references, and project credits.

## Run locally

Install Node.js 24 LTS, then:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. For the installable production version:

```sh
npm run build
npm run preview
```

Development mode intentionally does not register a service worker. PWA verification uses the production preview over localhost, or deployment over HTTPS.

## Verification

```sh
npm test
npm run build
npm run test:e2e
npm audit
```

The browser suite uses locally installed Google Chrome in headless mode. On a machine without Chrome, install Chrome or configure Playwright to use an installed Chromium browser. The tests launch and stop their own preview server on port 4173. Keep that port free.

Unit tests cover distribution reference identities, all 43 calculation problems, independent SciPy reference fixtures, validation, approximation conditions, sample-size rounding, and strict KaTeX rendering. The four extra source illustrations do not supply data for dynamic calculation. Browser tests cover navigation, search, progress persistence, solutions, all example routes, mobile/tablet/desktop overflow, print-to-PDF, PWA installability criteria, offline reloads, all cached source PDFs, and update prompting with draft retention. See [QA notes](docs/QA.md) for observed results and verification limits.

## Academic sources and fidelity

See [the full inventory and discrepancy register](docs/ACADEMIC-INVENTORY.md). All 70 PDF pages were extracted and visually inspected, including image-only statistical tables. Original PDFs are bundled in `public/lectures/`. The source PDFs credit Mohamed Ebrahim Sobh / Dr. Mohamed E. Sobh as lecture author; this is distinct from the project supervision credit.

The application preserves original given values and stated answers while identifying arithmetic, table, sign, and notation discrepancies. It does not force computed answers to match an erroneous slide. Computations use jStat plus analytic special cases; results are compared against independent SciPy fixtures. Numbers retain full precision until display. Standard normal table rounding can differ from full-precision computations. App-derived exercise answers and additional normality assumptions are labeled.

The lecture’s large-sample unknown-σ method uses z with s for n≥30. Small approximately normal samples with unknown σ use t and n−1 degrees of freedom. Sampling-proportion probabilities require np≥5 and n(1−p)≥5 and use the lecture’s uncorrected normal approximation. Expected counts use the computed probability, then round for a whole-person interpretation. Sample-size requirements round up, with a strict-bound option.

Hypothesis testing, fitting straight lines, ANOVA, stochastic models, and Poisson processes occur only in the full-course outline on Lecture 1 p2. Their actual teaching material is absent from these four PDFs. They are explicitly identified as awaiting additional sources; no invented lessons or calculators are presented for them.

## PWA, privacy and PDF export

The manifest has standalone display, relative icons and the configured deployment scope. The service worker precaches the app, bundled math fonts, images and four original lecture PDFs (approximately 8 MB total). Wait for “Ready for offline study” after the first successful online visit. Offline calculations, lecture reading and progress work on this device. External links outside CyberStat require internet. Cache eviction, private browsing restrictions, or clearing site data can remove offline resources and progress.

Install with the browser prompt where available; otherwise use Chrome/Edge’s Install app menu, or Safari’s Share → Add to Home Screen. Meeting Chromium installation criteria is automatically tested; the operating-system installation UI is browser controlled. Updates prompt before reloading. Draft inputs and preferences are stored as they change. Progress is explicitly marked by the student; opening a page records recent history without claiming mastery. There are no accounts or cloud synchronization.

Export invokes the browser print dialog. Choose **Save as PDF**. The print layout includes CyberStat identity, topic, problem, given values, formula, the selected Quick or Detailed working, interpretation, chart, source answer/review notes, and credits. Export is local; it does not contact a PDF service.

## GitHub Pages

The included GitHub Actions workflow tests, builds, and deploys the static application. Hash routing works without a server rewrite. The workflow automatically sets Vite’s base to `/<repository-name>/` (or `/` for an account root `username.github.io` repository). This also controls the manifest scope, service worker scope, assets and PDF paths.

1. Push the project to the `main` branch of a GitHub repository.
2. In Settings → Pages, set the source to **GitHub Actions**.
3. Run the **Verify and deploy CyberStat** workflow, or push a change to `main`.
4. Verify the successful deploy job and open the returned Pages URL.

For a custom domain or a different host, set `VITE_BASE_PATH=/` before `npm run build`. For a manual project-path build in PowerShell:

```powershell
$env:VITE_BASE_PATH='/cyberstat/'
npm run build
```

Do not upload a root-path build to a project subdirectory. Every public source PDF must be permitted to be served alongside the application. No secrets, tokens, backend services, or paid infrastructure are required.

## Structure

```text
src/content/     Lecture topics, formulas, methods, examples, source text
src/math/        Numerical distributions, calculation engine, validation
src/components/ Math rendering, charts, calculator workspace, PWA controls
src/pages/      Learning pages and dedicated topic layout
src/lib/        Local persistence
public/         App icons and original lecture PDFs
tests/          Mathematical, source-fixture and browser tests
docs/           Inventory, design system, source review and QA evidence
```

The engine returns one structured solution consumed by both presentation modes, charts and print export. It is independent of React and can later be used by an actual backend. The initial release deliberately has no backend.

Implementation references: [Vite static deployment](https://vite.dev/guide/static-deploy), [Vite PWA service worker behavior](https://vite-pwa-org.netlify.app/guide/service-worker-strategies-and-behaviors), [Vite PWA update prompts](https://vite-pwa-org.netlify.app/guide/prompt-for-update), [jStat project](https://github.com/jstat/jstat), [KaTeX](https://katex.org/docs/api).
