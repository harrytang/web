# Design review: harrytang.xyz (web/)

**Date:** 2026-10-31 · **Target:** https://harrytang.xyz (prod) · **Mode:** design-system Visual Audit + AI-slop check, with React/frontend lenses
**Method:** static scan of `web/src`, then Playwright (Chromium) against prod: 10 pages × 3 viewports (375 / 768 / 1280) × light + dark, with computed-style probes and screenshots. No code was changed.

## Fix status (local, not deployed; this report describes prod as audited)

Fixed under TDD and verified in a browser against the dev server: **H1, H2, H3, H4, H5, M2, M3, M4, M5, M6, M7**. H6 was re-assessed (see below) and left unchanged. Still open: M1 (needs the SVGs inlined), the L items and the P items.

## Verdict

**71 / 100.** A restrained, consistent system with excellent responsive behaviour. Its weaknesses are concentrated and cheap to fix: **dark-mode contrast and one broken dark page, syntax-highlight colours, and keyboard/focus affordances**. AI-slop risk is low; the real risk is the opposite, a stock-template look with little identity.

| # | Dimension | Score | Evidence (short) |
|---|---|---|---|
| 1 | Color consistency | 7 | zinc (245 uses) + amber accent (58) is disciplined; strays: `gray` (11), `blue` (8), hardcoded hex in `custom.css`, `bg-gray-100` on `/search`, SVG icons with baked-in colour |
| 2 | Typography hierarchy | 7 | Clear h1>h2>h3 and a deliberate type scale in `tailwind.css`; system font only (`-apple-system`); `/search` has no `h1`; justified body text on Expertise |
| 3 | Spacing rhythm | 8 | Tailwind scale throughout; only 5 arbitrary values in all of `src/` |
| 4 | Component consistency | 7 | Button/Card/Container reused well; `/search` and `/expertise` diverge (gray, justify, hardcoded panel); 7 radii but role-consistent |
| 5 | Responsive behaviour | 9 | **Zero** horizontal overflow on 10 pages × 3 widths × 2 themes; mobile nav works |
| 6 | Dark mode | 6 | Chrome is complete, but `/search` is a bright panel, the light syntax palette leaks into dark code blocks, muted text is 4.35:1 |
| 7 | Animation | 7 | Subtle, purposeful transitions; but `prefers-reduced-motion` is not honoured (29 elements still transition) and the mobile gallery auto-rotates with no pause |
| 8 | Accessibility | 6 | Good bones (`lang`, `<main>`, labelled controls, native focus outlines); gaps listed below |
| 9 | Information density | 8 | Airy and scannable; the hero leaves the right half empty at 1280, which suits the layout |
| 10 | Polish | 6 | 404 page is good; `/search` empty state is a blank panel; `console.log` left in production code |

## Findings (ranked)

### High

**H1. `/search` is broken in dark mode and has no heading.**
`src/app/search/page.tsx:9` hardcodes `bg-gray-100` with no `dark:` variant, so the results area is a bright panel on a dark page (screenshot `dark-768-_search.png`). With no query, the panel shows an empty white bar. The page also has zero `h1`.
Fix: `bg-zinc-100 dark:bg-zinc-800/50`, design an intentional empty state, add an `h1` via `SimpleLayout`.

**H2. Dark-mode code blocks use the light syntax palette (2.6–3.7:1).**
Computed style on `.hljs-built_in` in dark mode is `rgb(5, 80, 174)` (`#0550ae`) on `#020913`. `src/styles/custom.css` (~54-99) defines light token colours that also apply in dark; the dark override (~101-104) only resets `.hljs` itself, despite its comment "Keep highlight.js github-dark look in dark mode". Failures: `built_in` 2.63, `string` 2.7, `number` 2.63, `variable` 2.71, `literal` 3.73.
Fix: scope the light palette to `:root:not(.dark)` (or add `.dark .mdx-code-scroll .hljs-*` rules restoring github-dark colours).

**H3. Light-mode `hljs-attr` tokens are 1.86:1.**
`custom.css` never defines `.hljs-attr`, so github-dark's pale blue (from `import "highlight.js/styles/github-dark.css"`, `src/components/mdx/index.tsx:6`) shows on the light code background. Add `.hljs-attr` to the light palette.

**H4. Muted text in dark mode is 4.35:1, just under AA (4.5:1).**
Root cause is one habit: `text-zinc-500` / `text-gray-500` on a zinc-900 surface. Affects dates, captions, pagination, Expertise copy:
`src/components/Card/CardEyebrow.tsx:19`, `src/components/ArticleList/ArticleList.tsx:22,42,53` (no `dark:` variant at all), `src/components/BlogLayout/BlogLayout.tsx:152,214`, `src/components/Pagination/Pagination.tsx:42,60,65,79,90,94,106`, `src/app/expertise/page.tsx:46`.
Fix: use `dark:text-zinc-400` wherever zinc-500 is the muted tone; ideally name it once as a token.

**H5. Light-mode link and label contrast failures.**
`src/components/BlogLayout/BMC.tsx:23`: "buy me a coffee" `text-amber-500` on white is **1.96:1**. Use `text-amber-700 dark:text-amber-500` (the site already uses amber-700 for links elsewhere). `src/app/not-found.tsx:8`: the "404" label `text-zinc-400` is **2.51:1**. Use `text-zinc-500` or darker.

**H6. Search box opens a modal the moment it receives focus (corrected, was "no focus ring").**
`src/components/AlgoliaSearch/AlgoliaSearch.tsx:124` has `focus:outline-none`, but the inline input is unmounted as soon as it is focused (`onFocus={() => setModalOpen(true)}`) and focus moves to the modal's own input, which does have a ring. Verified by tabbing through `/search`: the 9th Tab lands in the modal. So the missing ring is never seen and was **not changed**. The real issue is a context change on focus (WCAG 3.2.1): a keyboard user tabbing past the search box is forced into a modal. Fix would open it on click or Enter instead of focus, which changes behaviour and the tests that use `fireEvent.focus`, so it needs a decision.

### Medium

**M1. Home social icons are pale and their hover/dark styles are dead code.**
The SVGs served from `assets.harrytang.xyz` carry `fill="#a1a1aa"` (about 2.6:1 on white; the non-text minimum is 3:1). `src/app/page.tsx:55` and `src/components/SocialLink/SocialLink.tsx` (~26) set `fill-zinc-500 group-hover:fill-* dark:fill-*` on an `<img>`, which has no effect; only `hover:brightness-*` works. Fix: inline the SVGs as React components (or use CSS `mask`) so the fill classes apply. (Alt text is present, so the links are labelled.)

**M2. No skip link.** `src/components/Layout/Layout.tsx:18` renders `<main>` but nothing targets it. Add a visually-hidden "Skip to content" link as the first focusable element.

**M3. Reduced motion is ignored.** 29 elements keep `transition-duration > 0` under `prefers-reduced-motion: reduce`. Tailwind's `transition` is not gated; add `motion-reduce:transition-none` to the shared patterns (Button, CardLink, nav) or a global `@media (prefers-reduced-motion: reduce)` rule.

**M4. Gallery auto-rotates every 5 s with no pause control.** (Correction: it rotates whenever the viewport is narrower than the whole photo strip, about 1,600px for 5 photos, so on most laptop screens as well as phones, not only mobile.) `src/components/Gallery/Gallery.tsx` (~38-60). WCAG 2.2.2 requires a way to pause moving content that lasts more than 5 seconds. Also skip auto-rotate when reduced motion is requested, and remove the `console.log` at line 47.

**M5. Justified body text on Expertise.** `src/app/expertise/page.tsx:46` (`text-justify`) creates visible word gaps at 375px (screenshot `dark-375-_expertise.png`). Use `text-left`.

**M6. Small touch targets.** The footer hosting-logo link is 83×20px (`src/components/Footer/Footer.tsx`, ~55-72; needs ≥24px, ideally 44px). Pagination numerals are 23px wide (`Pagination.tsx:75-80`). Inline prose links (18px tall) are exempt under WCAG 2.5.8.

**M7. Button has no explicit focus-visible or disabled style.** `src/components/Button/Button.tsx` (~20) relies on the browser default outline plus `outline-offset-2`. It works today (the probe showed native outlines on nav and social links) but varies across browsers. Add `focus-visible:outline-2 focus-visible:outline-amber-600` and a `disabled:` state.

### Low

- **L1. System font only.** `-apple-system` is the computed first family on all 222 text elements on Home. Nothing is wrong; it contributes to the template look. One variable font via `next/font` would add identity at minimal cost.
- **L2. Token drift.** `gray` (11) and `blue` (8) sit alongside `zinc`; hex values in `custom.css` (scrollbar, ~12-47), and `bg-[#f8fafc]` / `dark:bg-[#020913]` on the code block. Move them into `@theme` as e.g. `--color-code-bg`.
- **L3. `ThemeWatcher`** (`src/components/ThemeWatcher/ThemeWatcher.tsx`) resets an explicit theme back to "system" whenever it equals the OS theme. Probably intended, but a user who explicitly picks the same theme as their OS will later follow the OS.

## React / performance observations (read-only, not measured)

The Chrome DevTools MCP browser was locked by another process, so no Lighthouse run was done. These come from code reading and are hypotheses to profile before acting.

| # | Observation | Location | Why it matters |
|---|---|---|---|
| P1 | The whole markdown pipeline (`react-markdown`, `remark-gfm`, `rehype-highlight`, highlight.js CSS) is a client component | `src/components/mdx/index.tsx:1` (`"use client"`) | Ships the parser and highlighter to every article reader. Only the copy-button needs client JS; render markdown on the server and keep a small client island. Verify with `@next/bundle-analyzer`. |
| P2 | Every markdown image is `priority` + `loading="eager"` with `width={0} height={0}` | `src/components/mdx/index.tsx:28-36` | Preloads every inline image, competing with the real LCP image; zero intrinsic size relies on the blur placeholder to avoid CLS. |
| P3 | `priority` set twice in the blog layout | `src/components/BlogLayout/BlogLayout.tsx:168,209` | Confirm only the true LCP image keeps it. |
| P4 | 12 `"use client"` files | e.g. `Header.tsx`, `BlogLayout.tsx`, `Gallery.tsx` | Mostly justified (state, theme). `BlogLayout` is the largest candidate for splitting server and client parts. |

Positives: per-component barrels (no mega-barrel), `sizes` on gallery and avatar images, `rel="noopener noreferrer"` on external links, `suppressHydrationWarning` with `next-themes` for no-flash theming.

## AI-slop check: low risk

| Pattern | Result |
|---|---|
| Gratuitous gradients | None found in markup (grep matched only `backdrop-blur` usage) |
| Purple-to-blue defaults | None; accent is a single amber, neutrals are zinc |
| Purposeless glassmorphism | `backdrop-blur` only on the floating nav pill and theme toggle, where it earns its place |
| Over-rounding | 7 radii, assigned by role (pills `full`, cards `2xl`, controls `md`) |
| Scroll-triggered animation | None |
| Generic centred hero | Not present; the hero is left-aligned with a tilted photo strip, the site's one memorable detail |
| Personality-free font stack | **Yes**: system sans only (L1) |

The risk here is a stock "personal site template" look, not AI-generated styling.

## Recommended order of work

1. **H1 + H2 + H3 + H5**: about an hour; fixes the one visibly broken dark-mode page and the worst contrast failures.
2. **H4**: a find-and-replace of `dark:text-zinc-500` → `dark:text-zinc-400` at about 10 sites; verify by rerunning the probe.
3. **H6 + M2 + M7**: keyboard story (search focus ring, skip link, button focus-visible).
4. **M3 + M4**: motion safety.
5. **M1 + L2**: icon fills and tokens, once the above lands.
6. **P1 / P2** only after a bundle-analyzer and Lighthouse baseline.

When implementing, follow the repo's TDD loop (`ecc:tdd-workflow`). Components already have co-located `*.test.tsx` files and Jest is configured, so write a failing assertion first (for example a `dark:` class on the search panel, or focus classes on the input), then the fix.

## Method notes and limits

- Contrast is computed from rendered colours normalised through a canvas, with ancestor backgrounds blended. My first probe silently skipped Tailwind v4's `lab()`/`oklch()` colours and was discarded; every number above comes from the corrected probe. It cannot see text over images or gradients.
- Contrast was checked at 1280px on 8 pages (home, about, blog, projects, expertise, gear, 404, one article) in both themes. Overflow and tap targets were checked on all 10 pages at all 3 widths.
- Not tested: screen-reader output, the Algolia modal's open state, cookie-consent UI, authenticated states, real-device touch.
- Screenshots and raw results: `/private/tmp/claude-501/-Users-harry-tang-learning-harrytang-harrytang-xyz/d837bd6e-8e77-4895-b9d3-c84eead64b73/scratchpad/shots/` (`results.json` plus per-page PNGs).
