# Technical debt: mobile responsiveness (interview + related UI)

This document captures findings from a **code review** of mobile responsiveness for the interview flow and closely related screens. Items are intended to be resolved **one at a time** when ready; check them off as you go.

**Scope:** Candidate live interview (`InterviewClient`), interview not-found, recruiter dashboard shell, candidate interview detail (review).

**Not done in review:** Real device/browser QA (iOS Safari, Android Chrome, landscape, safe areas, keyboard).

---

## Summary

| Area | Status |
|------|--------|
| Candidate interview (live session) | **Partially** mobile-friendly; several fixed-size / desktop-first patterns |
| Entry / permission / complete / uploading phases | Generally centered cards; some **fixed dimensions** risk small-screen overflow |
| Recruiter dashboard + candidate detail | **Desktop-oriented** (fixed sidebar, multi-column grids) |

---

## Debt items (resolve in any order)

### 1. Live interview layout — no breakpoint adaptation

- **Severity:** High  
- **Files:** `src/components/interview/interview-client.tsx`  
- **Issue:** Main interview UI uses a single horizontal “avatar row” (`flex justify-between`) with fixed `w-36 h-36` circles for AI + candidate video, divider, waveforms, and badges. No `sm:` / `md:` / `lg:` layout changes. Narrow viewports get crowded; transcript and controls lose vertical space.  
- **Suggested direction:** Stack vertically on small screens (e.g. `flex-col md:flex-row`), scale avatar/video sizes by breakpoint, optionally collapse secondary chrome.

---

### 2. Fixed-size permission preview + countdown UI

- **Severity:** High  
- **Files:** `src/components/interview/interview-client.tsx`  
- **Issue:** Permission camera preview uses inline `width: 280, height: 210`. Countdown overlay uses fixed SVG `160×160` and `text-8xl` number. Can dominate or clip on small phones.  
- **Suggested direction:** Replace fixed pixels with `w-full max-w-*` + `aspect-video`, responsive text (`text-6xl sm:text-8xl`), responsive SVG sizing (`w-32 h-32 sm:w-40 sm:h-40` or `%` of container).

---

### 3. Transcript panel — hard `maxHeight`

- **Severity:** Medium  
- **Files:** `src/components/interview/interview-client.tsx`  
- **Issue:** Transcript container uses `style={{ maxHeight: "260px" }}` regardless of viewport. On mobile, combined with top bar, dual avatars, and record UI, usable transcript area is tight.  
- **Suggested direction:** Use `min-h-0` flex child + `flex-1` + `max-h-[…]` via `clamp()` / `dvh` / breakpoint-specific max heights, or a collapsible transcript drawer on small screens.

---

### 4. Dashboard layout — fixed sidebar, no mobile nav

- **Status:** Done (2026-04-07)  
- **Severity:** Medium (recruiter UX; not candidate interview)  
- **Files:** `src/app/(dashboard)/layout.tsx`, `src/components/dashboard/sidebar.tsx`, `src/components/dashboard/dashboard-shell.tsx`  
- **Issue:** Always-on `w-64` sidebar beside `main`. On narrow screens content width is reduced; no hamburger / drawer / bottom nav pattern.  
- **Resolution:** `DashboardShell` hides the sidebar below `md`, adds a top bar with menu button, overlay + slide-in drawer reusing `SidebarNavBody`, body scroll lock while open.

---

### 5. Candidate detail (interview review) — desktop grid only

- **Status:** Done (2026-04-07)  
- **Severity:** Medium (recruiter UX)  
- **Files:** `src/app/(dashboard)/candidates/[id]/page.tsx`  
- **Issue:** Uses `grid grid-cols-3` / `col-span-*` for scores vs summary/transcript/video. Header row uses `flex` without stacking for small screens. Video uses `style={{ maxHeight: 360 }}` only.  
- **Resolution:** `grid-cols-1 lg:grid-cols-3` with `order-*` so video/summary/transcript come first on mobile; responsive padding; stacked header + overall score row on small screens; video `max-h` uses `min(vh, px)` + `playsInline`; transcript panels use viewport-aware max heights.

---

### 6. Top bar + offline banner — horizontal pressure

- **Severity:** Low–Medium  
- **Files:** `src/components/interview/interview-client.tsx`  
- **Issue:** Top bar packs logo, job title, REC badge, and progress in one row (`justify-between`). Offline banner is a single long line. Very narrow widths may wrap awkwardly or feel cramped.  
- **Suggested direction:** Stack or truncate job/company on `sm`, shorten offline copy on small screens, or use icon-only REC on narrow viewports.

---

## Follow-up testing (when hardening)

- [ ] iPhone Safari: camera permission, `playsInline`, recording, upload completion  
- [ ] Android Chrome: same  
- [ ] Landscape + notched devices (safe-area insets if needed)  
- [ ] Verify no horizontal scroll on key interview screens at 320–390px width  

---

## Changelog

| Date | Action |
|------|--------|
| 2026-04-07 | Initial debt list from static code review |
| 2026-04-07 | Items 4–5: dashboard mobile drawer + responsive candidate detail page |
