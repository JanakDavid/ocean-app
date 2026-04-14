# DESIGN.md — OCEAN Personality Assessment Platform

## 1. Visual Theme & Atmosphere
Bauhaus-inspired minimalism with Neo-Bauhaus warmth.
The Bauhaus school (1919–1933) believed form follows function.
Neo-Bauhaus extends this with a slightly warmer palette and more
expressive use of primary colour — still geometric, still purposeful,
never decorative for its own sake.

Design philosophy:
- White space is structural, not empty
- Colour is used to communicate meaning, not decoration
- Every element has one job
- The grid is sacred — never break alignment

Mood: Clinical precision with human warmth.
References: Bauhaus school, Herbert Bayer typography,
Swiss International Style, Dieter Rams.

## 2. Color Palette & Roles

### Base Colors (UI Structure)
| Name        | Hex       | Role                                        |
|-------------|-----------|---------------------------------------------|
| Black       | #1A1A1A   | Primary text, headings, primary buttons     |
| Dark Gray   | #2D2D2D   | Secondary text, icon strokes                |
| Mid Gray    | #6B6B6B   | Labels, captions, placeholder text          |
| Light Gray  | #F5F5F5   | Page backgrounds, card backgrounds          |
| Warm White  | #FAFAF8   | Main page background (slightly warm, not cold white) |
| White       | #FFFFFF   | Surface, input backgrounds, cards           |

### Bauhaus Accent Colors (Use Sparingly)
| Name           | Hex       | Role                                     |
|----------------|-----------|------------------------------------------|
| Bauhaus Blue   | #1D4ED8   | Links, progress bar fill, active states  |
| Bauhaus Red    | #B91C1C   | Errors, warnings, destructive actions    |
| Bauhaus Yellow | #CA8A04   | Highlights, badges, secondary accent     |
| Bauhaus Orange | #EA580C   | CTA hover states, energy accents         |

### OCEAN Trait Colors (Charts & Results Only)
| Trait | Name             | Hex       | Usage                          |
|-------|------------------|-----------|--------------------------------|
| O     | Openness Blue    | #1D4ED8   | O trait bars, O score labels   |
| C     | Conscientiousness Green | #15803D | C trait bars, C score labels |
| E     | Extraversion Orange | #EA580C | E trait bars, E score labels  |
| A     | Agreeableness Yellow | #CA8A04 | A trait bars, A score labels |
| N     | Neuroticism Red  | #B91C1C   | N trait bars, N score labels   |

### Color Usage Rules
- Base colors handle 90% of the UI
- Accent colors appear on maximum 1–2 elements per screen
- OCEAN trait colors are used ONLY on result charts and score displays
- Never use more than 2 accent colors on a single component
- Never use gradients between colors
- All color usage must pass WCAG AA contrast (4.5:1 minimum)

## 3. Typography Rules

### Type Scale
| Element     | Font    | Size  | Weight | Letter Spacing | Case      |
|-------------|---------|-------|--------|----------------|-----------|
| Display H1  | Inter   | 56px  | 700    | -0.02em        | Sentence  |
| H1          | Inter   | 48px  | 700    | -0.01em        | Sentence  |
| H2          | Inter   | 32px  | 600    | 0              | Sentence  |
| H3          | Inter   | 24px  | 600    | 0              | Sentence  |
| Body Large  | Inter   | 18px  | 400    | 0              | Sentence  |
| Body        | Inter   | 16px  | 400    | 0              | Sentence  |
| Label       | Inter   | 12px  | 500    | 0.08em         | UPPERCASE |
| Button      | Inter   | 16px  | 500    | 0.01em         | Sentence  |
| Caption     | Inter   | 14px  | 400    | 0              | Sentence  |
| Mono/ID     | JetBrains Mono | 14px | 500 | 0.05em      | Uppercase |

### Typography Rules
- Primary font: Inter (fallback: -apple-system, system-ui, sans-serif)
- Monospace font: JetBrains Mono — used ONLY for UUID result IDs
- Never more than 3 type sizes on one screen
- Labels above inputs: always uppercase, letter-spacing 0.08em
- Line height: 1.6 for body text, 1.2 for headings
- Max line length: 65 characters (reading comfort)
- Left-align all body text — center only hero headlines

## 4. Component Styling

### Buttons
Primary (main CTA):
- Background: #1A1A1A, Text: #FFFFFF
- Padding: px-8 py-4, border-radius: 0 (sharp corners)
- Hover: background #EA580C (Bauhaus Orange — Neo-Bauhaus warmth)
- Transition: background 150ms ease

Secondary (alternative action):
- Background: #FFFFFF, Text: #1A1A1A, Border: 1px solid #1A1A1A
- Hover: background #F5F5F5
- Transition: background 150ms ease

Disabled (any button):
- Opacity: 0.35, cursor: not-allowed

Rules:
- No border-radius on any button
- No box shadows
- No gradients
- Minimum touch target: 44x44px

### Text Inputs & Form Fields
- Border: 1px solid #2D2D2D
- Background: #FFFFFF
- Border-radius: 0 (sharp corners)
- Focus: border 2px solid #1A1A1A, no glow, no shadow
- Padding: px-4 py-3
- Label: uppercase, 12px, #6B6B6B, margin-bottom 8px
- Error state: border #B91C1C, error text #B91C1C below field
- Optional field label: append "(optional)" in #6B6B6B

### Cards
- Background: #FFFFFF
- Border: 1px solid #F5F5F5
- Border-radius: 0
- No box-shadow
- Padding: 32px desktop, 24px mobile

### Navigation Bar
- Background: #FAFAF8
- Border-bottom: 1px solid #F5F5F5
- Height: 64px
- Logo: Bold, 20px, #1A1A1A
- Links: 16px, #6B6B6B, hover #1A1A1A, transition 150ms
- Active link: #1A1A1A, font-weight 500
- No dropdown menus in EVP

### Progress Bar (Test Pages)
- Track: #F5F5F5, height 3px, border-radius 0
- Fill: #1A1A1A
- Percentage label: 14px, #6B6B6B, right-aligned above bar
- No animation on fill — instant update

### Likert Scale Answer Circles
- Size: 28px diameter
- Unselected: border 1.5px solid #2D2D2D, background #FFFFFF
- Selected: background #1A1A1A, border #1A1A1A
- Hover: background #F5F5F5
- Labels below circles: 11px uppercase #6B6B6B
- Scale labels: "Strongly Disagree" ← → "Strongly Agree"

### OCEAN Trait Score Bars (Results Page)
- Track: #F5F5F5, height 10px, border-radius 0
- Fill: use the trait's assigned color (O=Blue, C=Green, E=Orange, A=Yellow, N=Red)
- Score label: right-aligned next to bar, 16px, font-weight 600,
  same color as the bar fill
- Trait letter label: left-aligned, uppercase, 12px, font-weight 700,
  same color as the bar fill
- Full trait name: 16px, #2D2D2D, below the letter label

### UUID / Result ID Display
- Font: JetBrains Mono, 18px, #1A1A1A
- Background: #F5F5F5
- Padding: px-6 py-4
- Border: 1px solid #2D2D2D
- Border-radius: 0
- "Copy ID" button: inline, secondary style, to the right of UUID

### GDPR / Notice Banners
- Background: #FAFAF8
- Border-top: 3px solid #1A1A1A (Bauhaus weight)
- Text: 14px, #6B6B6B
- Link: #1D4ED8 (Bauhaus Blue)

## 5. Layout Principles

### Spacing Scale (px)
4 — 8 — 12 — 16 — 24 — 32 — 48 — 64 — 96 — 128

### Page Structure
- Max content width: 720px (centered)
- Page background: #FAFAF8 (warm white)
- Page padding: 24px mobile / 48px tablet / 80px desktop
- Section spacing: 96px between major sections
- Single column always — no sidebars
- Never more than 2 columns on any screen

### Grid Philosophy
- The grid is invisible but absolute
- Every element aligns to the 8px baseline grid
- Generous whitespace between sections creates breathing room

## 6. Depth & Elevation
- Zero shadows in EVP
- Depth created by whitespace and 1px borders only
- Hover states use color/background change, never elevation
- Active states use border weight increase (1px → 2px)

## 7. Do's and Don'ts

### DO
- Use white space aggressively — when in doubt, add more
- Use OCEAN trait colors consistently — O is always Blue, never swap
- Use JetBrains Mono for the UUID and nothing else
- Use Bauhaus Orange (#EA580C) for primary button hover only
- Keep every screen to one primary action
- Label all optional fields explicitly with "(optional)"
- Show progress clearly on every test page (page X of 24)

### DON'T
- Use border-radius on any interactive element
- Use more than 2 font weights on one screen
- Use decorative icons or illustrations
- Use color as the only way to convey meaning (always pair with text)
- Add animations longer than 150ms
- Use OCEAN trait colors outside of result/chart contexts
- Mix Classic Bauhaus (pure black) and Neo-Bauhaus (orange) buttons
  on the same screen — pick one style per screen and be consistent
- Use gradients anywhere

## 8. Responsive Behavior

| Breakpoint | Width   | Key Changes                                      |
|------------|---------|--------------------------------------------------|
| Mobile S   | 320px+  | 24px padding, stacked nav, full-width buttons    |
| Mobile L   | 375px+  | Same as above, optimised font sizes              |
| Tablet     | 768px+  | 48px padding, horizontal nav                     |
| Desktop    | 1280px+ | 720px centered max-width, 80px padding           |
| Wide       | 1440px+ | Same as desktop, extra whitespace on sides only  |

Touch targets: minimum 44×44px on all interactive elements.
Likert circles: minimum 44px touch target even if visually 28px.

## 9. Classic vs Neo-Bauhaus Toggle

This project uses **Neo-Bauhaus** as the default.

| Aspect           | Classic Bauhaus          | Neo-Bauhaus (Our Default)        |
|------------------|--------------------------|----------------------------------|
| Primary CTA      | Black button, white text | Black button + Orange hover      |
| Background       | Pure white #FFFFFF       | Warm white #FAFAF8               |
| Accent use       | Rare, structural only    | Accent on hover + trait colors   |
| Typography       | Strict geometric         | Inter (humanist geometric)       |
| Color expression | Black + one primary only | Full ROYGB primary set, sparingly|

Switch back to Classic Bauhaus by:
- Replacing #FAFAF8 with #FFFFFF throughout
- Removing orange hover from buttons (use #2D2D2D instead)
- Restricting accent colors to structural use only

## 10. Agent Prompt Guide

When building components for this project, always:
- Use sharp corners (border-radius: 0) on ALL interactive elements
- Use #FAFAF8 for page backgrounds, #FFFFFF for card/input surfaces
- Use Inter for all text, JetBrains Mono only for UUIDs
- Use #EA580C (Orange) ONLY on primary button hover state
- Apply OCEAN trait colors ONLY on result charts and score displays:
  O=#1D4ED8, C=#15803D, E=#EA580C, A=#CA8A04, N=#B91C1C
- Left-align all body text, center only hero headlines
- Minimum 44px touch targets on mobile
- No shadows, no gradients, no border-radius, no decorative elements
- Progress bars: 3px height, black fill, sharp corners
- Score bars: 10px height, trait color fill, sharp corners
- Single column layout always

Quick color reference for result charts:
- O (Openness): #1D4ED8 blue
- C (Conscientiousness): #15803D green  
- E (Extraversion): #EA580C orange
- A (Agreeableness): #CA8A04 yellow
- N (Neuroticism): #B91C1C red