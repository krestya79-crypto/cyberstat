# Verification record

Verification date: 17 November 2026 (Africa/Cairo).

## Mathematics and source review

- All four PDFs were extracted page by page and visually reviewed: 21 + 19 + 14 + 16 = 70 pages.
- The application catalog contains 21 dedicated topic pages, 43 calculation problem parts and four conceptual source illustrations.
- 105 unit checks pass, including all 43 problems against independent SciPy normal, t, chi-square and planning references, plus 81 additional t/chi-square/F distribution reference points. Numeric comparisons require agreement to six decimal places; additional analytic identities and strict KaTeX rendering are checked separately.
- SciPy fixtures are committed to `tests/scipy-reference.json` so normal development and CI do not require Python. The generator is `scripts/reference-fixtures.py`; source-derived answers remain separately preserved in `src/content/examples.ts`.
- Discrepancies are documented in the academic inventory and shown beside the original examples in the app.
- No implemented lesson is claimed for the outline-only topics lacking teaching material.

## Production and browser verification

The production build succeeds and includes a manifest and generated service worker with 61 precache entries, including all four PDFs and math fonts. Build output is deliberately not committed.

Seven Chrome browser checks pass: navigation/search/progress; both solution modes, validation/reset and print-to-PDF; all 43 calculation routes plus formula rendering; layout checks at 320, 375, 768, 1024 and 1440px across eight page types; normal-profile installability criteria and offline reload/PDF access; real service worker update prompting and draft retention; keyboard skip navigation, accessible form names, reduced motion and study-text contrast. Representative screenshots and the generated three-page cotton-thread solution PDF are in `docs/qa/`.

All checks run against the production build. Installability is verified through Chromium's reported installation criteria in a normal persistent profile, not by asserting that a manifest alone is sufficient. Offline tests disconnect the browser network, reload the application, recalculate, and fetch all four PDFs from the service-worker cache. The update test changes the served service-worker bytes, verifies an explicit update prompt, then reloads and checks a saved draft.

The desktop and mobile screenshots were visually inspected. A generated solution PDF was opened and text-extracted to confirm branding, original problem, math, interpretation, source note and credits. Chart text has responsive sizing so it remains legible on narrow screens. Seven automated browser tests do not substitute for testing every OS-specific install dialog; physical iOS/Android device installation and assistive-technology user testing were not performed.

Dependency installation and the production dependency audit report zero known advisories. Patched major KaTeX/Vitest versions and patched glob/minimatch overrides are locked and tested. Six-decimal numerical agreement is the tested target, not an arbitrary-precision guarantee for extreme tails or very large distribution parameters.

## Original source checksums (SHA-256)

```text
lecture-1.pdf 1199cb72756b7ae7c1669e55117836084e958ed82fbe62b208c5a7647a6d282a
lecture-2.pdf b564fdf71b6de86cd4ce815d0bd91d9a5edbe306c7ed57a069c8fdff78ac452b
lecture-3.pdf bac665bb0bffbe4c817eaf4fe568f8faf7a4ab008d7844765621d41682ba187c
lecture-4.pdf 2124d445c19b16522fb71be49f49b19577814fdc3edee91506402eb56b86ac8c
```
