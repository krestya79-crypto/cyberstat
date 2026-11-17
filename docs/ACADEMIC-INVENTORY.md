# Preserved statistical example provenance

The application retains all 47 original example parts and illustrations and all 49 Formula Notebook entries. Of the examples, 43 provide sufficient numerical inputs for calculation; four remain conceptual illustrations.

The four original source PDFs remain available for citations as Source 1 through Source 4. They support provenance and answer review; the application has no lecture browsing or course-management screens. The source audit files in `docs/sources/` and `docs/source-review/` preserve evidence for the discrepancies below.

## Source issues requiring review

The app preserves source answers and labels computed results separately. No source PDF is altered.

| Source     | Printed statement/result                                        | Review finding                                                                                                  |
| ---------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| L1 p11     | φ(−a)=1−φ(−a); between expression repeats upper argument        | Apparent typographical errors. Implement φ(−a)=1−φ(a) and subtract lower CDF; disclose                          |
| L1 p17 b,c | .5987; .2426                                                    | z=−.5 upper tail is .691462; interval [−1,.5] is .532807. Printed CDF values are inconsistent                   |
| L1 p18 b   | 1000×.4706≈471                                                  | Rounded z/table method yields 471; full precision gives .471903×1000≈472. Preserve both                         |
| L1 p20 b   | k−8=2.025, k=10.025                                             | Original mean is 12; right-tail .25 gives k≈14.023469. Apparent copied mean error                               |
| L2 pp2–3   | t mean=0, variance>1                                            | Mean only exists for df>1; variance exists for df>2. Explain domains                                            |
| L2 p8      | F moments without domain restrictions                           | Mean requires d2>2, variance d2>4; normal-limit statement is qualitative                                        |
| L2 p10     | Parameter “is a random variable calculated from the population” | Preserve quote; clarify a fixed population parameter versus a random sample statistic                           |
| L2 p14     | .251                                                            | Rounded z −.67 gives .2514; full z −2/3 gives .252493                                                           |
| L2 p15     | .006                                                            | Four-decimal table gives .0062; full precision .006210                                                          |
| L2 p18     | Tubes, n=16, no normality stated                                | Normality needed for exact normal mean result; app asks/labels assumption                                       |
| L3 p4      | .84−.08=.76                                                     | Actual χ²(7) interval ≈.755430, which also rounds to .76; printed individual tail values are inaccurate         |
| L3 p5      | χ²(11)>17.1875 is .25                                           | Numerical upper tail ≈.102; preserve printed answer                                                             |
| L3 p8      | SE=.0436                                                        | Uses rounded variance .0019; full precision SE≈.043183                                                          |
| L3 p9      | z=−1.49, result .9251                                           | z is −1.5, giving .933193. Finite population correction is omitted by lecture method; flag sampling assumption  |
| L3 p11     | z=+1.22, probability .8888                                      | z≈−1.218; lower probability ≈.1116; np=5.25 and n(1−p)=9.75 meet lecture threshold, but approximation is coarse |
| L3 p12     | z in [−9.12,2.28], probability .9887                            | Actual z≈[−.912,.228], probability≈.4092; missing square-root/decimal handling suspected                        |
| L4 p9      | CI (2.5,2.7) with s=4                                           | Given values produce (1.29336,3.90664); do not silently replace s with .3                                       |
| L4 p11     | t(.025,11)=2.431; CI (6.51,8.25)                                | 95% t critical≈2.200985; CI≈(6.59214,8.16786). Printed critical is for a different tail                         |
| L4 p12     | t(.025,19)=3.031; CI (29.74,35.86)                              | 95% t critical≈2.093024; CI≈(30.68926,34.91074)                                                                 |
| L4 p14     | “standard error” = critical×s/√n                                | Preserve wording; distinguish sampling SE from confidence half-width in app                                     |
| L4 p15     | √n=11.76→n=132.3≈132                                            | 11.76²=138.2976; use ceil((z×.3/.05)²)=139 to meet error bound                                                  |

Other small differences from table rounding are displayed beside source answers; computations retain full precision until display. Original questions are available verbatim in each example's expandable source text and linked original page. App-derived exercises and algebraic illustration explanations are explicitly labeled.
