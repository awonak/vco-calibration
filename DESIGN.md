# VCO Calibration Tool - Design Guide

## Theme: "Test Bench"
The visual aesthetic draws from high-end industrial machinery and electronic testing equipment (e.g., oscilloscopes, multimeters, control panels). 
Key characteristics:
*   **High Contrast & Legibility:** Clean, highly readable text with distinct visual hierarchy.
*   **Utilitarian & Functional:** Minimal decorative elements; every visual component serves a purpose.
*   **Tactile Feel:** Elements should look like physical buttons, switches, and displays, without being overly skeuomorphic.

---

## Color Palette

### Dark Mode
*   **Background:** Deep Charcoal (`#1E1E1E` or `#121212`)
*   **Panels/Cards:** Slightly lighter grey (`#2A2A2A`) with subtle, hard inner shadows.
*   **Primary Text:** Off-White/Light Ash (`#E0E0E0`)
*   **Muted Text:** Medium Grey (`#777777`)
*   **Accent Color (Active):** Deep Amber / Safety Orange (`#FF6F00`) - highly visible and industrial.
*   **Success (Perfect Match):** Emerald Green (`#16A34A`)
*   **Warning (Slight Drift):** Warning Amber (`#F59E0B` / `#D97706`)
*   **Error/Danger (Out of Tune):** Industrial Red (`#EF4444` / `#CC0000`)
*   **Info (UI Elements):** Cyan/Blue (`#0284C7`)
*   **Borders:** Thin, crisp lines (`#444444`) to define sections clearly.

### Light Mode
*   **Background:** Pale Grey/Bone (`#F4F4F4`)
*   **Panels/Cards:** Very Light Grey (`#EAEAEA`)
*   **Primary Text:** Dark Gunmetal (`#222222`)
*   **Muted Text:** Medium Grey (`#777777`)
*   **Accent Color (Active):** Deep Amber / Safety Orange (`#FF6F00`)
*   **Success (Perfect Match):** Emerald Green (`#16A34A`)
*   **Warning (Slight Drift):** Warning Amber (`#D97706`)
*   **Error/Danger (Out of Tune):** Signal Red (`#CC0000`)
*   **Info (UI Elements):** Blue (`#0284C7`)
*   **Borders:** Mid-grey (`#CCCCCC`)

---

## Typography
*   **Font Family:** Barlow Semi Condensed
*   **Vibe:** Utilitarian, engineered, highway-sign aesthetic.
*   **Why it works:** Its slightly rounded yet technical structure is heavily inspired by public typography and hardware, giving it a very physical, robust feel.

---

## UI Components

### Buttons
*   **Style:** Physical, tactile look.
*   **Idle:** Solid background matching the panel color, with a thin border and standard text.
*   **Hover:** Slight brightness increase.
*   **Active/Pressed:** Inset shadow (looks physically pushed in), border color changes to the Accent Color (`#FF6F00`).

### Cards & Panels
*   **Style:** Modular, compartmentalized.
*   **Borders:** Defined borders (`1px solid var(--border-color)`) to separate logical groups of controls, similar to an oscilloscope's faceplate.

### Data Displays (History Log, Values)
*   **Style:** Recessed screens.
*   **Background:** Slightly darker than the main background to appear "inset".

---

## Architecture & Styling Rules

To ensure strict compliance with the dual-theme "Test Bench" aesthetic (Light/Dark mode support) and maintain clean React components, we enforce the following styling rules:

### 1. Centralized Theming (index.css)
*   All explicit aesthetic properties (hex colors, specific `rgba()` strings, borders, shadows, and hover states) **MUST** be defined as CSS custom properties (`var(--color-name)`) inside `index.css`.
*   Every token must be defined in the `:root` pseudo-class (Dark Mode default) and explicitly overridden in the `@media (prefers-color-scheme: light)` block to guarantee seamless theme switching.

### 2. Tailwind CSS for Layout
*   Avoid inline `style={{ display: 'flex', padding: '10px' }}` declarations.
*   Utilize standard Tailwind utility classes (e.g., `flex`, `flex-col`, `items-center`, `gap-4`, `p-5`) directly on React elements for structural layouts, typography weights, and spacing.

### 3. No Hardcoded Inline Colors
*   Never hardcode RGB, Hex, or RGBA strings into React inline styles, as this actively breaks the Light Mode implementation.
*   Inline `style={{}}` tags should strictly be reserved for dynamic, math-based visual calculations (e.g., setting the `left` percentage or `width` of a moving needle on a tuner display) that cannot be easily modeled with predefined CSS classes.
