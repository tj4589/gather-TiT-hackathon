# DESIGN.md — gather

Source of truth for every visual decision in this app. All colors below were
sampled programmatically from the actual pixels of `assets/logo.png`
(`scripts/sample_logo_colors.py`) — none are eyeballed or approximated.

## Brand asset analysis

- File: `assets/logo.png`, 715×631px.
- Logomark: an abstract lotus/leaf form built from three open, unclosed
  curved strokes (two green, one gold) that meet at a single point below the
  wordmark. No literal leaf/tractor iconography — it's linework, not
  illustration.
- Wordmark: "gather", lowercase only. Geometric/rounded sans construction —
  **not a serif**. Single-story `a` and `g` with fully circular bowls, low
  stroke contrast, soft rounded terminals (visible on the `t` crossbar, `r`
  arm, `e` aperture). Generous x-height, wide-ish spacing.
- Tagline: "small harvest. serious supply." — same green, smaller weight.
- Background in the asset is a warm cream, not white.

This rules out pairing the wordmark with a serif display face on the
assumption of a "serif spirit" — the actual letterforms are geometric sans.
The typography direction below leans into that instead of fighting it.

## Color — sampled values

| Token | Hex | Source |
|---|---|---|
| `cream` (background) | `#FCF7EF` | Mode pixel value, 178,425 occurrences (background fill) |
| `green` (primary brand) | `#5C7B63` | Mode pixel value, 18,190 occurrences (wordmark + logomark fill) |
| `gold` (secondary accent) | `#C59749` | Weighted average of gold-cluster pixels (thin stroke → few exact-match pixels, so averaged rather than moded) |

### Derived scale (computed from the three sampled values, not new picks)

Neutrals are cream mixed toward `ink` (`ink` = green darkened 72% toward
black, `#1A221C`) — warm greys tied to the brand hue, not cold blue-greys:

```
neutral-100  #EEEAE2   hairline borders
neutral-200  #E1DDD6   borders
neutral-300  #C6C4BC   dividers
neutral-400  #A2A29B   muted text / icons
neutral-500  #797B75   secondary text
neutral-600  #525751   body text (alt weight)
neutral-900  #1A221C   ink — primary text, headings
```

Green tints (cream mixed toward green — washes, hovers, badges):
```
green-tint-subtle  #F2F0E7   page-level wash, selected-row bg
green-tint-soft    #E6E6DB   badge bg, chip bg
green-tint-medium  #CFD4C8   hover bg on green-tinted surfaces
green-700          #4B6551   button hover/active
green-800          #3F5443   button pressed
```

Gold tints (cream mixed toward gold — used sparingly, see "Color usage"):
```
gold-tint-subtle  #F8EFE2
gold-tint-soft    #F3E8D4
```

### Color usage rules

- **Green is the primary/positive/brand color.** Primary buttons, active nav,
  links, "fulfilled" state, the logo itself.
- **Gold is a strategic accent, not a second primary.** It appears in exactly
  two roles: (1) the supply-gap indicator (remaining quantity, "expand
  radius" affordance) and (2) small structural accents that echo the
  logomark (a divider tick, an active-step marker). It never fills a large
  surface.
- No third hue is introduced. There is no red/orange "error" color in this
  prototype — gap/attention states use gold, success uses green, neutral
  informational states use `neutral-500/600`.
- `cream` is the page background everywhere, not white. Cards sit on cream
  using a 1px `neutral-200` border rather than a shadow, to keep the surface
  flat and quiet (see Elevation).

## Typography

> Amended: the wordmark's actual letterforms are a geometric/rounded sans
> (see Brand asset analysis above) — **Quicksand** is that same family of
> construction (circular bowls, low contrast, soft terminals), so it
> replaces the earlier serif-display idea directly rather than contrasting
> against it. Numbers are carved out from Quicksand explicitly, per rule:

- **Display — Quicksand (Light weight)**: the "gather" wordmark and
  large page-level headings ONLY. Never used for body text, labels, tables,
  or any numeric value.
- **Body / data — Figtree**: a neutral, high-legibility humanist sans. Used
  for all UI text (nav, labels, buttons, form inputs) **and for every
  numeric value without exception** — bag counts, percentages, prices,
  fulfillment figures, including the large hero stat numbers on the
  procurement results screen. Quicksand Light is too thin for data at any
  size; the wordmark is soft, the data is sturdy.
- **Tabular figures**: `font-variant-numeric: tabular-nums` on every price,
  quantity, percentage, and count so columns of numbers align. Non-negotiable
  on the procurement results / supplier breakdown screens.
- Do not use Inter, Roboto, Arial, or system-ui as the primary UI face.

Scale (1.25 ratio, base 16px):
```
display-xl   56px / 1.05   Figtree, 700, tabular-nums — hero stat (e.g. "720")
display-lg   40px / 1.1    Quicksand, 300 — large section headings (non-numeric)
heading-lg   28px / 1.2    Quicksand, 500 — page titles
heading-md   20px / 1.3    Figtree, 600   — section titles
body-lg      17px / 1.5    Figtree, 400
body         15px / 1.5    Figtree, 400   — default UI text
label        13px / 1.4    Figtree, 500, letter-spacing 0.01em — form labels, table headers
caption      12px / 1.4    Figtree, 500   — metadata, timestamps
```

## Spacing

8px base unit. Scale: `4, 8, 12, 16, 24, 32, 48, 64, 96`. Generous whitespace
is a direction requirement — default to the next size up when unsure,
especially around the hero fulfillment metric.

## Shape & elevation

- **Border radius**: 10px for cards/inputs/buttons, 6px for small chips/badges,
  full-round only for avatars and the radius-expansion slider handle. No
  16px+ "bubbly" radii — the logomark's curves are open and precise, not
  puffy.
- **Elevation**: flat design, no drop shadows on static surfaces. Use a 1px
  `neutral-200` border to separate cards from the cream background. Reserve
  a very soft shadow (`0 4px 16px rgba(26,34,28,0.06)`) exclusively for
  transient/overlay elements (modals, the "searching wider network..."
  toast) — never on cards sitting in normal page flow.
- **Icons**: single stroke weight (1.5px), rounded line caps/joins to match
  the logomark's stroke quality, one library only (Lucide). No emoji as UI icons.

## Design direction tiebreaker

Any "Bauhaus-influenced" instruction means a disciplined grid, clear
geometric proportion, and strong typographic hierarchy — **not** visible
decorative shapes, primary-color blocks, or geometric ornament. Where a
flourish would add visual noise, cut it. Restraint wins every tie.

## Entry flow

No login/auth screen. The buyer lands directly on "What do you want to buy?"
(the create-procurement-request screen). Buyer/farmer identity is mocked,
never a real authentication flow.

## Motion

- Durations: 150ms for hover/press micro-interactions, 300–400ms for state
  transitions (fulfillment bar updating, radius expansion), ease-out.
- The signature motion moment is the fulfillment metric counting up and the
  progress bar/ring filling when sourcing radius expands — everything else
  stays still while that happens so it reads as the one meaningful change.
- No parallax, no floating/bobbing idle animation, no page-load choreography.

## Data visualization

- Fulfillment progress: a single horizontal bar or ring, green fill on a
  `neutral-200` track, gold marks the "still needed" remainder segment while
  unfulfilled, resolves to solid green + a small green check treatment at 100%.
  No 3D, no gradients on the fill.
- Supplier contribution: stacked/segmented bar (each supplier = one segment,
  width proportional to bags) reading left→right as it's assembled — this is
  the visual proof of "fragmented supply → one order," so it's worth the
  extra polish pass.
