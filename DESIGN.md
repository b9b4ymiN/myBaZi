# Design

## Source of truth
- Status: Draft
- Last refreshed: 2026-07-05
- Primary product surfaces: BaZi analysis, Tong Shu calendar, Qi Men chart, Tianji AI, profile management, settings, app shell/navigation, PWA install/offline surfaces.
- Evidence reviewed: `README.md`, `PLAN.md`, `docs/validation.md`, `docs/audit-report-1993.md`, `package.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `src/config/nav.ts`, `src/components/layout/*`, `src/app/*/page.tsx`, `src/components/bazi/*`, `src/components/tongshu/*`, `src/components/qimen/*`, `src/components/profile/*`, `src/components/ui/*`, `public/*`, Next 16 docs in `node_modules/next/dist/docs/01-app/02-guides/progressive-web-apps.md`, project structure docs, layouts/pages docs, and CSS docs.
- Visual north star: `docs/assets/mybazi-pwa-reference-v1.png`

## Brand
- Personality: warm, cute, calm, trustworthy, mystical-but-practical, Thai-first with Chinese classical depth.
- Trust signals: precise calculations, visible Chinese terms, Thai explanations, clear profile context, consistent auspicious/inauspicious indicators, readable data hierarchy.
- Avoid: generic SaaS grayscale, horoscope gimmick visuals, noisy gradients, decorative blobs, unclear fortune claims, hidden AI assumptions, tiny dense text on mobile.

## Product goals
- Goals: turn myBaZi into a production-quality PWA that feels app-like, polished, lovable, and useful daily; preserve calculation correctness; make complex Chinese metaphysics scannable and less intimidating.
- Non-goals: changing BaZi/Tong Shu/Qi Men algorithms, adding new external dependencies without explicit need, moving private profile data to a backend, building a marketing landing page instead of the app.
- Landing/loading decision: this is a tool-first PWA, so `/` should stay an app entry/smart redirect or first-run welcome only when no profile exists. Do not build a marketing landing page as the primary first screen. Loading screens are required as app shell/skeleton states, not decorative splash-only pages.
- Success signals: installable PWA, coherent visual system, responsive screens, accessible controls, meaningful empty/loading/error/offline states, verified lint/typecheck/build, and visual QA screenshots for key routes.

## Personas and jobs
- Primary personas: Thai users learning Chinese astrology, advanced users checking daily auspicious timing, practitioners comparing BaZi/Tong Shu/Qi Men, and users who want AI interpretation after calculation.
- User jobs: create/select a birth profile, inspect destiny chart, find favorable days/hours, inspect Qi Men chart for a time, configure AI safely, and return daily from mobile home screen.
- Key contexts of use: mobile-first repeated use, desktop analysis sessions, dark/light mode, offline or unstable network for previously loaded app shell, private local profile data.

## Information architecture
- Primary navigation: persistent app shell with BaZi, Tong Shu, Qi Men, Tianji, profile selector, theme toggle, and settings.
- Core routes/screens: `/bazi`, `/tongshu`, `/qimen`, `/tianji`, `/profiles`, `/settings`, `/manifest`.
- Content hierarchy: selected profile context first; then primary calculation result; then explanatory cards; then detailed secondary panels/reference content.

## Design principles
- Principle 1: Make dense metaphysical data feel friendly through grouping, rhythm, clear labels, and gentle illustration, not through hiding important data.
- Principle 2: Preserve trust by keeping source calculation outputs visible and separating facts from interpretation.
- Principle 3: Mobile is the default PWA experience; desktop should gain density, not a different product.
- Tradeoffs: use richer visuals and motion only where they clarify state or delight without reducing readability; avoid new dependencies unless they materially improve production quality.

## Visual language
- Color: move from default neutral grayscale to a multi-element palette inspired by five elements: wood green, fire coral, earth gold, metal pearl, water teal/indigo, balanced by warm ink text and porcelain surfaces.
- Typography: keep Next font setup unless replaced deliberately; use Thai-readable sizing and avoid viewport-scaled font sizes.
- Spacing/layout rhythm: compact but breathable dashboard rhythm; stable grids for charts, calendar cells, palace cells, navigation, and icon buttons.
- Shape/radius/elevation: app surfaces can be soft and cute, but repeated cards and controls should stay disciplined; avoid nested cards and avoid page sections styled as floating cards.
- Motion: subtle enter/active transitions, auspicious-state emphasis, profile/context changes, install/offline banners; respect reduced motion.
- Imagery/iconography: use repo-generated bitmap assets for PWA icons, splash/OG imagery, empty states, and gentle domain illustrations; use lucide icons for controls.
- Reference image details to preserve: mobile-first installed-app feel, porcelain/jade background, ink-calligraphy brand mark, profile avatar chip, four-pillar cards with mini landscape illustrations, five-element donut plus bars, blue water useful-god card, auspicious calendar preview with a small cute mascot, bottom navigation on mobile, side navigation plus top actions on desktop.
- Reference image details to translate into code rather than copy literally: device mockup lighting, decorative background photography, and generated text artifacts. Production code must use real Thai/Chinese text and responsive app layouts.

## Components
- Existing components to reuse: shadcn/radix UI components in `src/components/ui`, layout shell components, profile selector/form, BaZi/Tong Shu/Qi Men domain components.
- New/changed components: branded app shell, route headers, profile-aware empty state, PWA install/offline status, visual asset components, motion wrappers, dashboard summary blocks, consistent chart/calendar/palace visual treatments.
- Variants and states: active/inactive nav, selected profile, unknown birth time, no profile, loading/hydration, calculation error, offline, disabled, destructive delete, AI key absent, AI connection fail.
- Token/component ownership: global tokens live in `src/app/globals.css`; reusable shell/UI patterns live in `src/components/layout` or `src/components/ui`; domain-specific visuals stay under their domain folders.

## Accessibility
- Target standard: WCAG 2.1 AA practical baseline.
- Keyboard/focus behavior: all navigation, buttons, selectors, dialogs, calendar days, and chart controls must be keyboard reachable with visible focus.
- Contrast/readability: element colors must pass contrast for text; do not encode auspicious status by color alone.
- Screen-reader semantics: nav labels, current page, dialog labels/descriptions, calendar buttons, and status messages must be meaningful.
- Reduced motion and sensory considerations: use `prefers-reduced-motion` to reduce nonessential animation; avoid flashing or continuous distracting motion.

## Responsive behavior
- Supported breakpoints/devices: mobile PWA first, tablet, desktop; keep current desktop sidebar and mobile bottom nav pattern unless implementation proves a better repo-native variant.
- Layout adaptations: single-column mobile, stable scrollable chart areas where data density demands it, multi-column desktop dashboards.
- Touch/hover differences: 44px practical touch targets for primary mobile controls; hover affordances are enhancement only.

## Interaction states
- Loading: skeletons should match final layout dimensions.
- Empty: no-profile screens should guide profile creation without feeling like an error.
- Error: show recoverable errors with direct action and preserve entered data.
- Success: use small toasts or inline state; avoid blocking flows.
- Disabled: explain why when important, especially profile-dependent analysis or AI actions.
- Offline/slow network: PWA shell should show offline status; core local profile/calculation surfaces should remain understandable.

## Content voice
- Tone: Thai-first, warm, clear, concise, respectful of Chinese terms.
- Terminology: keep Thai + Chinese where domain value matters, with pinyin or explanation when helpful.
- Microcopy rules: avoid overclaiming certainty in interpretations; distinguish calculated facts from guidance.

## Implementation constraints
- Framework/styling system: Next.js 16 App Router, React 19, Tailwind CSS v4, shadcn/radix components, lucide-react icons, next-themes.
- Design-token constraints: use CSS variables in `globals.css`; do not fork a separate design system unless a real boundary appears.
- Performance constraints: keep assets optimized and local; avoid heavy animation libraries unless explicitly justified.
- Compatibility constraints: PWA manifest via `src/app/manifest.ts`; static generated assets in `public/`; service worker only after scope/caching strategy is explicit.
- Test/screenshot expectations: run typecheck/lint/build for code changes; use screenshot/visual checks for key routes before claiming production UI completion.

## Open questions
- [ ] Should the final brand name remain `myBaZi`, or should Thai/Chinese naming be more prominent in the app chrome? Owner: user. Impact: logo/icon direction.
- [ ] Should generated imagery lean more cute mascot, celestial-jade, or elegant modern almanac? Owner: user. Impact: asset generation prompts.
- [ ] Should PWA offline support cache only app shell/static assets, or also recent computed route data? Owner: implementation review. Impact: service worker scope and data privacy.
