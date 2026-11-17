# CyberStat design and information architecture

Design direction: an editorial study desk. Ivory canvas, white paper surfaces, muted academic blue, sage for completed study, amber for source-review notes. Statistics are teaching material, never decoration. The landing illustration is a labeled, numerically generated standard-normal density with its actual central 95% region.

Tokens: canvas #f7f8fa; paper #ffffff; ink #22324a; secondary ink #59677b; blue #3766a4; pale blue #edf3fa; sage #426955; pale sage #edf5ef; warning #805616; borders #dfe5ed. Display headings use Georgia, interface uses a local system sans-serif stack, mathematics use bundled KaTeX. No remote fonts. Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px. Surfaces have 12–20px corners and restrained shadows. Controls have a minimum 44px touch target; keyboard focus has a visible blue outline. Reduced-motion preferences suppress transitions.

Desktop: fixed course sidebar, slim contextual header, generous workspace; calculator inputs and solutions sit alongside one another. Tablet: compact sidebar. Mobile below 760px: dedicated bottom navigation, horizontal lecture filters, single-column calculations and locally scrollable formulas/tables; safe-area padding. No page-level horizontal scrolling.

Routes use hashes for static GitHub Pages compatibility: welcome, dashboard, course, examples, formulas, topic/:id, about. A topic is the source of truth for its explanation, conditions, notation, formulas, related concepts, calculator and lecture-page references. Search covers topic titles, formula names, explanations and all original example questions. Lecture filters apply to course, formula and example collections.

Progress is explicit: a student marks a topic studied. Opening a topic updates recent history, but does not assert mastery. Preferences and calculator drafts persist locally, with a graceful storage-unavailable state. No accounts or cloud synchronization are claimed.

Calculations produce a structured solution once. Exactly two presentation modes select from that structure: Quick Solution and Detailed Step-by-Step. Charts, result summaries and print/PDF exports use the same result. Source answers and review notes remain separate from computed answers. Invalid or inapplicable methods never silently calculate.

States: empty search has clear reset; form errors identify the field and condition; offline status distinguishes the cached app from external links; update banner waits for an explicit reload; export invokes a print stylesheet with Save as PDF guidance. Install guidance adapts to whether the browser supplies an installation prompt.
