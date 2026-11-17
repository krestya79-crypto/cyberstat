# CyberStat — Statistical Problem Solver

[Live app](https://krestya79-crypto.github.io/cyberstat/) · [Existing repository](https://github.com/krestya79-crypto/cyberstat) · [Deployment workflow](https://github.com/krestya79-crypto/cyberstat/actions/workflows/pages.yml)

CyberStat uses the existing React, TypeScript, Vite, KaTeX and jStat architecture. Its primary application is **Statistical Solver**: select a method, select a relevant formula, enter validated data, and solve with mathematical working and data-driven graphs.

The three main navigation sections are **Statistical Solver**, **Worked Examples**, and **Formula Notebook**. The preserved libraries retain all **47 original example parts/illustrations** and **49 original formulas/identities**, their layout, search, source filtering, notation and review notes. Links open the statistical workflow. Four original illustrations have no underlying calculation data; none is invented.

**Formula Derivations & Proofs**, inside Formula Notebook, follows the four original lecture PDFs. It includes six displayed derivation chains, five separately labeled worked algebraic applications, and a source/status audit for all 49 Notebook entries. Stated results and assigned-but-unsupplied proofs are explicitly identified; printed errors are preserved with separate editorial corrections. Each entry links to its original lecture page. See the [four-lecture source audit](docs/LECTURE-DERIVATIONS.md).

## Project information

- Student Name: **Ahmed Waleed Reda Gad**
- University Name: **Horus University**
- Doctor Name: **Dr. Mohamed Ibrahim Sobh**
- Subject Name: **Advanced Probability and Statistics**

## Statistical functionality

Forty formulas are grouped into Descriptive Statistics, Probability, Probability Distributions, Sampling, Confidence Intervals, Hypothesis Testing, Correlation and Regression, and Sample Size Planning.

Supported calculations include mean, sample/population variance and standard deviation, median/quartiles, classical/union/conditional/independent probabilities, total probability and Bayes rule, z-scores, normal/inverse-normal/t/chi-square/F/binomial/Poisson probabilities, sampling means/variances/proportions, standard errors, mean confidence intervals, sample-size planning, z/t/one-proportion tests, chi-square goodness of fit, Pearson correlation and least-squares regression.

Quick and Detailed solutions share one calculated result. Detailed solutions include given and required information, method, formula, variable definitions, substitutions, intermediate calculations, final answer, interpretation and assumptions. Export uses the browser print dialog: choose **Save as PDF**.

## Graphs and numerical conventions

Charts are derived from the actual inputs and results: histograms, box plots, event-probability bars/trees, continuous densities, discrete probability masses, sampling/precision curves, confidence limits, hypothesis p-value/rejection regions, scatter plots, regression lines and residuals. No random observations or jitter are added. Plotted values are available in data tables. Visually truncated distribution tails are identified; calculations use the full probability model.

Data sets support up to 2,000 finite observations per list. Quartiles use medians of halves, excluding the central observation for odd n; box-plot whiskers use actual values within 1.5×IQR. Binomial n is limited to 200 so its complete support can be plotted. Poisson rates up to 200 have an explicitly labeled plot truncation. Normal approximations for proportions require both expected counts to be at least 5. Expected chi-square counts must all be at least 5 with matching observed and expected totals. Each formula states its normality and sample-size assumptions. Failing to reject a null hypothesis does not prove it; correlation does not establish causation.

Six-decimal agreement is verified for the committed reference cases. The application does not claim arbitrary precision in extreme tails. Original example answers are preserved separately from calculated results; known discrepancies remain documented in [source review notes](docs/ACADEMIC-INVENTORY.md).

## Run and verify

Use Node.js 24 and an installed Google Chrome for browser verification:

```sh
npm ci
npm run dev
npm test
npm run build
npm run test:e2e
```

The browser suite starts and stops its own production preview on port 4173. It exercises all formulas and original examples, both solution modes, charts, navigation, search, 320–1440px layouts, PDF export, installation criteria, offline calculations and safe updates. Evidence is generated in the ignored `test-results/` directory. See [QA](docs/QA.md).

Committed SciPy/NumPy reference fixtures avoid requiring Python during normal development or CI. With those packages installed, run `python scripts/statistical-fixtures.py` to regenerate the 40-formula reference set, or `python scripts/reference-fixtures.py` for the original examples.

## PWA and GitHub Pages

The existing installable PWA and GitHub Actions deployment are preserved. After **Ready offline** is shown, calculations, graphs, examples, formulas, math fonts and original source citations are cached on this device. Clearing site data or browser cache eviction may remove them. There are no accounts or cloud synchronization. Updates prompt before reloading; formula-specific input drafts and solution preferences persist locally.

The workflow tests, builds and deploys `main`. It automatically sets `VITE_BASE_PATH` to the GitHub repository subdirectory, including manifest scope, service-worker scope, assets and source references. For another host, set the appropriate base before building. `npm run preview` serves the production build locally. Verify actual deployment using the Actions result and published URL.

## Architecture and cleanup

- `src/content/statistics.ts`: category/formula metadata, parameters, assumptions and input definitions.
- `src/math/`: the preserved calculation/distribution engine plus the added statistical methods and typed plot data.
- `src/pages/StatisticalSolver.tsx`: the four-step workflow.
- `src/pages/ReferencePages.tsx`: the preserved example and formula-library layouts.
- `src/components/`: mathematical rendering, statistical graphs, solution presentation and PWA controls.
- `public/lectures/`: original PDFs required by retained example citations, not a lecture-browsing feature.

The scientific keypad, general equation parser, lecture explanation pages, course explorer/overview, progress UI, obsolete routes and their unused implementations/styles/tests are removed. Original example/formula records, required source PDFs, app icons, configuration, package manifests, lockfile and deployment settings remain. No dependency was added.

Method references: [NIST mean intervals and one-sample t tests](https://www.itl.nist.gov/div898/handbook/eda/section3/eda352.htm), [NIST chi-square goodness of fit](https://www.itl.nist.gov/div898/handbook/eda/section3/eda35f.htm), [jStat distributions](https://jstat.github.io/distributions.html).
