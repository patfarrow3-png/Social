# CMS Dashboard — CLAUDE.md

Developer reference for the Social CMS Dashboard project.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| UI Components | shadcn/ui (manually scaffolded) | — |
| Icons | lucide-react | 0.469+ |
| Utility | clsx + tailwind-merge (via `cn()`) | — |
| Package Manager | npm | — |

---

## Folder Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout with Sidebar + dark HTML class
│   ├── globals.css             # Global styles + CSS custom properties (design tokens)
│   ├── page.tsx                # Dashboard home page
│   ├── instagram/page.tsx      # Instagram Manager section
│   ├── analytics/page.tsx      # Analytics section
│   ├── calendar/page.tsx       # Content Calendar section
│   ├── competitors/page.tsx    # Competitor Tracker section
│   └── news/page.tsx           # News Consolidator section
│
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx         # Shared sidebar navigation (client component)
│   │   ├── page-header.tsx     # Reusable page title + icon header
│   │   └── placeholder-card.tsx # Generic feature/content card
│   └── ui/                     # shadcn/ui primitives
│       ├── button.tsx
│       ├── badge.tsx
│       └── separator.tsx
│
└── lib/
    └── utils.ts                # cn() helper (clsx + tailwind-merge)
```

---

## Component Conventions

### shadcn/ui
Components are manually scaffolded into `src/components/ui/` following the [shadcn/ui](https://ui.shadcn.com/) pattern. They use `cva` (class-variance-authority) for variants and `cn()` for class merging. Do **not** use the shadcn CLI — add components by hand to maintain full control.

### Layout Components
- `PageHeader` — used at the top of every section page. Accepts `title`, `description`, `icon` (LucideIcon), and optional `badge`.
- `PlaceholderCard` — generic card for feature previews and placeholder content. Accepts `title`, `description`, `icon`, `className`, `children`.
- `Sidebar` — client component using `usePathname()` for active link detection.

### `cn()` utility
Always use `cn()` from `@/lib/utils` for conditional or merged Tailwind classes:
```ts
import { cn } from "@/lib/utils";
cn("base-class", condition && "conditional-class", className)
```

---

## Dark Theme

The app is **permanently dark**. Dark mode is enforced via `<html lang="en" className="dark">` in `src/app/layout.tsx` — there is no light/dark toggle.

All colors use **CSS custom properties** defined in `src/app/globals.css` under the `:root` selector. Tailwind references these via `hsl(var(--token))` in `tailwind.config.ts`.

### Design Tokens

| Token | Purpose |
|---|---|
| `--background` | Main page background |
| `--foreground` | Primary text |
| `--card` | Card/panel background |
| `--muted` | Subtle backgrounds (inputs, hover states) |
| `--muted-foreground` | Secondary/placeholder text |
| `--primary` | Brand blue accent |
| `--border` | Borders and dividers |
| `--sidebar` | Sidebar background (slightly darker than `--background`) |
| `--sidebar-accent` | Sidebar hover/active state background |

---

## Navigation Sections

| Section | Route | Icon |
|---|---|---|
| Dashboard | `/` | `LayoutDashboard` |
| Instagram Manager | `/instagram` | `Instagram` |
| Analytics | `/analytics` | `BarChart2` |
| Content Calendar | `/calendar` | `CalendarDays` |
| Competitor Tracker | `/competitors` | `Users` |
| News Consolidator | `/news` | `Newspaper` |

To add a new nav item, edit `src/components/layout/sidebar.tsx` → `navItems` array.

---

## Key Decisions

1. **No `create-next-app`** — The project directory (`Social`) contains an uppercase letter which violates npm package naming rules. The project was scaffolded manually with all configuration files hand-authored.

2. **Manual shadcn/ui** — Components were written by hand rather than using the `shadcn` CLI to avoid the need for an interactive terminal during setup and to keep the dependency surface minimal.

3. **No Google Fonts** — `next/font/google` was removed because the build environment has no outbound internet access to Google's font CDN. The app falls back to the system `font-sans` stack.

4. **Permanent dark mode** — The `dark` class is hardcoded on `<html>` and all CSS tokens are defined once (no light-mode overrides). A toggle can be added later using `next-themes`.

5. **Static pages** — All section pages are server components with no dynamic data fetching, making them fully statically renderable (`○` in the build output). Dynamic data (API integrations, live feeds) will be introduced per-section as features are built out.

---

## Development

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
```
