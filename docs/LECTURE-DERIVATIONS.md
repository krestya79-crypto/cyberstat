# Formula derivation source audit

The primary references are the four unchanged original PDFs already tracked under `public/lectures/`. Each matches the corresponding lecture file originally supplied from Downloads byte for byte (verified by SHA-256). All 70 pages were extracted directly with PyMuPDF and visually reviewed as rendered slides before the content was implemented. Key algebra pages were additionally inspected at higher resolution. The previous text extracts were checked as an aid; rendered formulas take precedence where extraction loses fractions, hats, roots or subscripts.

| Source    | PDF pages reviewed | SHA-256                                                            |
| --------- | ------------------ | ------------------------------------------------------------------ |
| Lecture 1 | 1–21               | `1199cb72756b7ae7c1669e55117836084e958ed82fbe62b208c5a7647a6d282a` |
| Lecture 2 | 1–19               | `b564fdf71b6de86cd4ce815d0bd91d9a5edbe306c7ed57a069c8fdff78ac452b` |
| Lecture 3 | 1–14               | `bac665bb0bffbe4c817eaf4fe568f8faf7a4ab008d7844765621d41682ba187c` |
| Lecture 4 | 1–16               | `2124d445c19b16522fb71be49f49b19577814fdc3edee91506402eb56b86ac8c` |

## Findings by lecture

Lecture 1: pages 1–4 contain introductory/course material, not proofs. Pages 5–10 state the normal density, characteristics, empirical rule and standardization law. Page 11 supplies three general event-transformation chains (lower tail, upper tail and between bounds); symmetry and center probabilities are stated without proof. Pages 12–13 are tables. Pages 14–20 apply the rules in examples. Page 19 gives symbolic cancellation of σ in two intervals, and page 20 solves two unknown bounds. Page 21 is the closing slide. The standardization distribution theorem and the density are not proved.

Lecture 2: pages 2–3 describe Student distribution; pages 4–5 give a table and applications. Page 6 defines chi-square and states its moments; page 7 is its table. Page 8 defines F and states moments; page 9 is an F table. Page 10 gives sampling notation. Pages 11–13 state sampling moments, SE, the normal-population theorem, CLT and the known/unknown-variance rules. Pages 14–17 are applications; page 18 is an exercise without a supplied solution. Pages 1 and 19 are title/closing slides. **No displayed general derivation or theorem proof is supplied in Lecture 2.** No CLT, t, chi-square or F proof has been invented to fill this group.

Lecture 3: page 2 states the chi-square sampling law, then derives E(s²) and V(s²) by scaling the stated chi-square moments. Its complementary and interval tail identities are stated without a displayed proof. Pages 3–5 are numerical variance applications. Pages 6–7 define the proportion and state its moments, standardization, approximation conditions and SE. Pages 8–12 apply them; page 13 is an unsolved exercise. Pages 1 and 14 are title/closing slides. There is no supplied proof of the variance sampling law or of the proportion moments/normal approximation.

Lecture 4: pages 2–3 give estimation/coverage definitions and illustrations. Pages 4–5 derive the known-variance mean interval by substituting the normal pivot, multiplying, subtracting X̄, negating/reversing inequalities, then ordering the endpoints. Page 5 assigns the unknown-variance interval derivations; page 6 only states the resulting formulas. Pages 7–12 apply intervals and confidence-level calculations; page 10 applies mean/variance identities to summary statistics without deriving those identities. Page 13 is an unsolved exercise. Page 14 states three confidence half-width expressions using the terminology “standard error”. Page 15 rearranges an error bound numerically. Pages 1 and 16 are title/closing slides.

## Implemented scope and attribution

Six displayed derivation chains: three normal event transformations (L1 p11), two sample-variance moment derivations (L3 p2), one known-variance interval derivation (L4 pp4–5). These are scoped to the lecturer's starting results; they are not presented as independent proofs of the underlying distribution theorems.

Five separately labeled worked applications: lower-bound inversion (L1 p20a), right-tail inversion (L1 p20b), two symbolic interval calculations grouped together (L1 p19), summary estimates/interval (L4 p10), and sample-size rearrangement (L4 p15). Ordinary numerical substitution examples remain in Worked Examples rather than being relabeled as formula proofs.

All 49 preserved Notebook entries have explicit per-formula references and one of four statuses: lecture derivation provided, no lecture derivation provided, worked application without general proof, or derivation assigned but not provided. Existing Notebook formulas and examples are unchanged. Some Notebook notation is a summary or application convention (inverse-function notation, estimated-SE notation, moment existence restrictions, ceiling for integer sample size); the audit distinguishes this from printed lecture notation.

Explanations are editorial annotations of the lecturer’s mathematics. Additional intermediate algebra lines are marked as expansions. No external reference is used as proof content. The original PDF page is linked for every chain and every audited formula.

## Source errors preserved separately from corrections

- L1 p11(iii) repeats the upper argument in the subtracted CDF. The printed line is preserved and flagged. The corrected lower argument is an editorial note, with p15(b) confirming the intended table subtraction.
- L1 p11(iv) prints φ(−a)=1−φ(−a). The no-proof audit flags this and points to the correctly used symmetry identity on p16.
- L1 p20(b) changes k−12 to k−8. The printed line remains visible. The editorial result uses k−12=2.025 and k=14.025 with the lecture’s rounded table argument.
- L4 p15 prints √n=11.76 followed by n=132.3≈132. The source line is preserved. A separate editorial correction squares 11.76 to 138.2976 and rounds up to 139 to meet the error bound.
- L4 p14's “standard error” terminology is retained and distinguished from sampling SE. The σ in p15's general expression and the substitution of the supplied s=0.3 are explicitly identified.

## Implementation and verification

`src/content/derivations.ts` holds the reviewed content and complete Notebook coverage mapping. `src/pages/FormulaDerivations.tsx` renders it as a section within Formula Notebook (`#/formulas?view=proofs`). The existing three-item sidebar is preserved. Each formula links to its derivation/status, and source records link back to the exact original Notebook entry. The PDF files are reused and remain cached by the existing PWA.

Tests pin the reviewed PDF hashes, check all 49 audit records and source page ranges, distinguish stated/assigned results from proofs, render all transcribed mathematics with strict KaTeX, and preserve known source errors alongside separate corrections. Browser tests exercise all 49 links and return targets, all 11 chains, lecture filtering, PDF links, responsive layouts and offline availability.
