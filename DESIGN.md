# Design Brief — Akshay Classes Fee Management Portal

## Visual Direction
Premium SaaS institute fee management platform with advanced glassmorphism, indigo-to-cyan gradient primary (deep tech aesthetic), enhanced student/admin portals, landing page showcase. Production-ready dashboard comparable to Linear, Vercel, Stripe, Notion.

## Tone
Refined, trustworthy, forward-thinking. Tech-confident without coldness. Educational institutions receive premium UX with smooth animations, accessible interfaces, and data-driven precision.

## Differentiation
Advanced frosted glass cards with gradient backdrops + dual-shadow elevation system, animated stat counters, premium modal centering, responsive sidebar with Framer Motion drawer animations, UPI payment integration with modal QR code display, complete auth flow with role-based routing, landing page with sticky navbar + hero + full-page sections.

## Color Palette
| Token | Light OKLCH | Dark OKLCH | Usage |
|-------|-------------|-----------|-------|
| background | 0.98 0.01 260 | 0.10 0.01 260 | Base surface |
| foreground | 0.12 0.01 260 | 0.96 0.01 260 | Primary text |
| card | 0.98 0.005 260 | 0.14 0.02 260 | Elevated cards, glass surfaces |
| primary | 0.52 0.24 270 | 0.72 0.25 270 | CTAs, indigo-cyan tech aesthetic |
| accent | 0.65 0.22 300 | 0.72 0.25 300 | Highlights, purple accents |
| success | 0.62 0.2 155 | 0.68 0.2 155 | Paid fees, payment confirmed |
| warning | 0.75 0.2 85 | 0.72 0.2 85 | Pending fees, overdue caution |
| destructive | 0.58 0.24 25 | 0.62 0.22 25 | Delete, unpaid state |

## Typography
**Display**: Space Grotesk (geometric, bold, tech-forward) | **Body**: DM Sans (clean, 16px base, 1.6 line-height) | **Mono**: JetBrains Mono (financial tables)

**Hierarchy**: H1 `text-5xl font-bold tracking-tight` | H2 `text-3xl font-bold` | H3 `text-lg font-semibold` | Body `text-base leading-relaxed` | Caption `text-xs uppercase tracking-wide`

## Structural Zones
| Zone | Treatment | Notes |
|------|-----------|-------|
| Header | glass-header backdrop blur | Sticky, gradient accent bar, nav buttons |
| Sidebar | bg-sidebar/5 subtle border-r | Icon-forward mobile drawer, collapsible |
| Content | bg-background + glass-card sections | Alternate muted/5 for visual rhythm |
| Cards | glass-premium gradient + border/35 | 12px radius, card-interactive hover |
| Modals | centered scale-in + backdrop blur | Premium spacing, perfect centering |
| Forms | Input ring-primary smooth focus | Dropdown selects, phone validation |
| Tables | glass-card rows zebra stripe | High contrast, sorting indicators |

## Elevation & Depth
Layered through: background opacity gradient (light 0.98L / dark 0.14L), glass blur (8-32px), dual shadow (soft ambient + glass inset), color gradients (135deg primary→accent). Never full opacity — all surfaces use 0.75–0.9 transparency.

## Motion & Interaction
**Page entrance**: slide-up + fade-in 0.3s for hero sections | **Card hover**: transition-fast 0.2s, scale-102 + shadow-elevated | **Modals**: scale-in 0.3s, backdrop fade, perfect center positioning | **Loading**: shimmer infinite for skeleton loaders | **Stat counters**: animate-in with bounce-in 0.4s | **Toast**: slide-up 0.3s from bottom

## Constraints
- All colors via CSS variables OKLCH, zero hex/rgb literals
- Chroma ≤0.25 for UI tokens; higher only charts
- Blur only glass surfaces: cards, header, modals, drawer
- All animations 0.2–0.5s cubic-bezier(0.4, 0, 0.2, 1); bounce-in uses (0.34, 1.56, 0.64, 1)
- AA+ contrast verified light/dark, text≥16px primary UI
- Mobile-first: sidebar drawer on sm screens, full sidebar md+
- Role-based routing: admin/student protected layouts

## Landing Page Sections
**Navbar**: sticky glass-header, logo, Get Started CTA, Admin Login, Student Login, theme toggle | **Hero**: large H1 (0.52 0.24 270 gradient), subheading, gradient CTA button, animated illustration | **Features**: 4–6 cards with icons, glassmorphism | **Stats**: animated counters (students, revenue, pending fees) | **Benefits**: timeline or grid layout | **Testimonials**: carousel or grid | **FAQ**: accordion with smooth expand | **Pricing**: 3 tiers with CTA | **Contact**: form or email link | **Footer**: links, copyright

## Auth & Forms
**Login flow**: email + password, role selector, forgot password link | **Signup**: admin only, temp password generation format `FirstName@4821` | **Student creation**: admin bulk/single, auto-generate credentials, send via email | **Forms**: grouped sections (Personal, Academic, Fees), phone validation (Indian), dropdown selects for class/section/gender/status

## Student Portal Features
**Dashboard**: fee summary cards, payment history table, pending dues chart | **Fees**: pay now modal with UPI QR + ID copy button, payment confirmed toast | **Profile**: edit personal info, view enrollment code | **Payments**: filter by month/status, download receipt UI

## Admin Portal Features
**Dashboard**: revenue chart, pending fees count, recent payments, activity timeline | **Students**: CRUD table, bulk import UI, search/filter/paginate | **Classes**: create/edit sections, assign students | **Payments**: record modal, history, export CSV UI | **Notifications**: send to student/admin, toast on send

## Signature Details
Gradient glass cards (`glass-premium`) with 135deg indigo→purple backdrop, soft + elevated dual shadows, hover scale-102 + shadow bump. Centered modals (scale-in animation + perfect vh/vw centering). Animated stat counters (bounce-in 0.4s). Sticky navbar with gradient bottom border. Mobile drawer sidebar with slide animations. UPI payment modal with QR code display + copy-button on UPI ID. Premium typography pairing (Space Grotesk + DM Sans). Smooth 0.3s transitions throughout.
