# Design Brief — Akshay Classes Fee Management System

## Visual Direction
Premium SaaS dashboard for educational fee management with glassmorphism, cyan-teal tech aesthetic, localStorage-backed state. Comparable to Linear, Vercel, Stripe dashboards.

## Tone
Refined, professional, accessible. Tech-forward without coldness. Educational institutions and student users deserve premium UX that feels trustworthy and modern.

## Differentiation
Frosted glass cards with backdrop-blur and inset highlights, cyan-teal primary accents (modern educational identity), smooth micro-interactions responsive but not frenetic, intentional depth through layering and soft shadows, zero generic AI defaults.

## Color Palette
| Token | Light OKLCH | Dark OKLCH | Usage |
|-------|-------------|-----------|-------|
| background | 0.98 0.01 260 | 0.11 0.01 260 | Base surface |
| foreground | 0.15 0.01 260 | 0.96 0.01 260 | Primary text |
| card | 0.99 0.0 0 | 0.15 0.02 260 | Elevated cards, glass surfaces |
| primary | 0.52 0.24 192 | 0.70 0.22 192 | CTAs, active states, cyan-teal |
| accent | 0.52 0.24 192 | 0.70 0.22 192 | Highlights, interactive focus |
| success | 0.62 0.2 155 | 0.68 0.2 155 | Paid fees, payment confirmed |
| warning | 0.75 0.2 85 | 0.72 0.2 85 | Pending fees, overdue caution |
| destructive | 0.58 0.24 25 | 0.62 0.22 25 | Delete action, unpaid state |
| muted | 0.92 0.02 260 | 0.20 0.02 260 | Secondary content, disabled |

## Typography
**Display**: Space Grotesk (geometric, tech-forward) | **Body**: DM Sans (clean, readable) | **Mono**: JetBrains Mono (financial data)

**Hierarchy**: H1 `text-5xl font-bold tracking-tight` | H2 `text-3xl font-bold` | H3 `text-lg font-semibold` | Body `text-base leading-relaxed` | Caption `text-xs uppercase tracking-wide`

## Structural Zones
| Zone | Treatment | Notes |
|------|-----------|-------|
| Header | glass-header backdrop blur | Sticky, elevated, gradient accent |
| Sidebar | bg-sidebar/10 subtle border-r | Icon-forward on mobile, collapse on small |
| Content | bg-background + glass-card sections | Alternate muted/5 for rhythm |
| Cards | glass-card + border/35 opacity | 12px radius, hover: shadow-glass-hover |
| Forms | Input bg-input ring-primary | Focus: cyan ring, smooth transition |
| Tables | glass-card rows, zebra stripe muted/5 | High contrast text, clear sorting |

## Elevation & Depth
Layered through card backgrounds (light 0.99L / dark 0.15L), glass blur + transparency, dual-shadow system: `shadow-soft` for ambient light, `shadow-glass-soft` for inset surface highlight. Never full opacity — all surfaces breathe transparency.

## Motion & Interaction
**Entrance**: slide-up + fade-in 0.3s for page sections | **Hover**: transition-fast 0.2s, scale 1.02 + shadow-glass-hover | **Modals**: scale-in 0.3s with backdrop fade-in | **Loading**: pulse-soft infinite for pending fees | **Toast**: slide-up 0.3s

## Constraints
- All colors via CSS variables in OKLCH, no hex/rgb literals
- Chroma ≤0.25 for UI tokens, higher only in chart colors
- Blur only on cards/glass surfaces (header, modals)
- Animations 0.2–0.5s, all use cubic-bezier(0.4, 0, 0.2, 1)
- AA+ contrast verified in both light and dark modes
- localStorage state changes trigger toast + skeleton loader state
- Mobile-first responsive: sidebar collapses on sm screens

## Signature Details
Frosted glass cards (`glass-card` class) with `backdrop-blur-md` + inset highlight shadow (`shadow-glass-soft`) | Cyan-teal primary (0.52 L, 0.24 C) for modern educational identity | Soft elevation shadows replace harsh borders | Generous spacing (24px sections, 16px card padding) reflects premium SaaS confidence
