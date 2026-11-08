<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Kasitronik — Project Rules & Guidelines

## 1. UI & Visual Identity (HIG-Compliant)

### Color Palette (Extracted Directly from Website Design System)
Strictly adhere to the design tokens and CSS variables used in the website (`app/page.module.css` & `app/login/login.module.css`):

- **Canvas & Surfaces (60% — Dominant)**:
  - `--canvas: #faf9f7` (Soft warm linen canvas for base page backgrounds)
  - `--surface: #ffffff` (Pure white for cards, elevated surfaces, and form containers)
- **Primary Brand (15% — Interactive)**:
  - `--green: #046645` (Deep forest emerald green for brand mark, primary CTAs, active links, focus rings)
  - `--green-hover: #034d34` (Darker forest green for hover/active button states)
- **Accent & Badges (10% — Soft Highlights)**:
  - `--sage: #e8f2e8` (Light sage green for step numbers, category badges, subtle containers)
  - Accompanying subtle tints: `#f2f6ef`, `#f0f4ec`, `#e3efdf`
- **Typography & Structure**:
  - `--ink: #1c2621` (Deep dark forest ink for primary text, headings, and prominent labels)
  - `--muted: #59665d` (Muted greenish-slate for descriptions, subtitles, notes, and secondary text)
  - `--border: #e1e7de` (Subtle border for cards, inputs, and section dividers)
- **Alert & Destructive (5% — Urgent & Alert)**:
  - `#a12d24` (Brick red reserved strictly for error alerts, invalid input feedback, and destructive actions)

### Theme & Typography
- **Theme**: Light theme only (no dark mode).
- **Typography**: Uses Geist Sans (`var(--font-geist-sans), Arial, sans-serif`) with Geist Mono (`var(--font-geist-mono)`).

### Page Metadata, HTML Head & Browser Tab Icon (Favicon)
- **Official Tab Icon (Favicon)**:
  - Browser tab icon / favicon must ALWAYS use the official Kasitronik vector logo (`app/icon.svg` / `public/logo.svg`).
  - Never leave default Next.js or Vercel favicons.
- **Dynamic HTML Title & Metadata**:
  - Every page/route (`page.tsx`) MUST export a dedicated `metadata: Metadata` object.
  - Root layout (`app/layout.tsx`) defines the master title template: `template: "%s | Kasitronik"` and the default title.
  - Page-level routes must specify their human-friendly page name as `title` (e.g., `title: "Masuk"` which renders as `"Masuk | Kasitronik"`, `title: "Daftar Akun"`), along with a concise, relevant `description`.
  - Never allow generic or hardcoded legacy titles (e.g. "E-Waste", "Create Next App").

### Layout, Modals & Components
- **Flexbox**: Use `flex` over `grid` for layout composition.
- **Popup Modals**: The background backdrop must always be blurred (`backdrop-blur`).
- **Visual Consistency**: Match the existing UI styling across all pages (`page.module.css` and `login.module.css`).
- **Brand Logo Asset**:
  - Use the official vector logo at `public/logo.svg` across all headers and footers.
- **Image Assets & Visual Credibility**:
  - Store commercially-licensed, optimized local images in `public/images/assets/`.
  - Prioritize real visual proof (e.g. photo marquee/gallery as visual backdrop in hero) over dense static paragraphs.
  - Never hotlink external CDNs; local assets prevent network lag, CLS, and broken links.
- **Modular Components (Zero Duplication)**:
  - Core layouts like Header/Navbar and Footer must be written ONCE in `app/components/` and reused across all routes (Home, Login, Register) via props (`variant="home" | "auth"`). Never duplicate header/footer JSX markup in individual page files.

### Minimalism, Iconography & Anti-Clutter (Human Interface Guidelines)
- **NO Emojis & NO Obscure Unicode**: Strictly do NOT use emojis or non-standard Unicode glyphs (e.g. 🚀, 🔥, 💡, ⚡, ✦, ➜). Only use standard ASCII characters typeable directly on a standard physical keyboard.
  - *Exception*: Khusus simbol hak cipta `©` pada footer diperbolehkan.
- **No Text Decoration / Zero Fluff**: Do NOT decorate or fill empty space by "adding information" with text. Never write filler sentences or static paragraphs that don't add dynamic utility. If a text string dilutes or distracts from the core concept, remove it completely.
- **NO Pseudo-Alerts / NO Static Advisory Notes**: Dilarang keras membuat box alert, catatan kaki, atau pengingat statis (misal: "Kondisi barang dicantumkan saat pelaporan", "Perhatian: ...", atau box notice statis). Alert HANYA boleh muncul secara dinamis sebagai respon atas interaksi pengguna (misal: validasi input gagal atau pesan server error).
- **SVG Icons over Wordy Text**: Favor clean, inline/component SVG icons instead of clustering the interface with static labels or lengthy explanations.
- **HIG Focus**: Maintain high signal-to-noise ratio, clear visual hierarchy, effortless cognitive scanability, and generous click/touch targets (min 44x44px).

---

## 2. Architecture & Code Quality Rules

- **Feature-Based Clean Architecture**: Code must be modularized by feature/domain.
- **Server Actions**:
  - Do NOT put server actions or business logic directly inside UI components.
  - Put server actions in a dedicated action file or `actions/` folder per feature.
- **Interfaces & Types**:
  - Never mix interface/type definitions into UI files.
  - Create a separate file for each interface. If there are multiple, group them inside an `interfaces/` or `types/` folder.
- **Component Decomposition**:
  - Break down UI into dedicated component files inside a `components/` folder.
- **Code Hygiene**:
  - Remove all unused imports.
  - Ensure zero TypeScript errors and zero linting warnings.
- **Package Manager**: Strictly use `pnpm` (never `npm` or `yarn`).
