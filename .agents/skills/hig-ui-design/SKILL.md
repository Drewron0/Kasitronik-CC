---
name: hig-ui-design
description: Use this skill when designing, reviewing, or styling UI components, pages, or modals in Kasitronik to ensure strict Human Interface Guidelines (HIG), proper color palette distribution, text minimalism, SVG iconography, visual imagery, and zero static pseudo-alerts.
---

# HIG & Minimalist UI Design Guide (Kasitronik)

This playbook ensures every UI component in Kasitronik feels cohesive, intentional, uncluttered, and compliant with Apple-inspired Human Interface Guidelines (HIG).

## 1. Color Palette Distribution (Website Design Tokens)

Apply colors strictly following the CSS custom properties defined in `app/page.module.css` and `app/login/login.module.css`:

| Token | Hex | Share | Role & Usage |
| :--- | :--- | :--- | :--- |
| `--canvas` | `#faf9f7` | 60% | Base canvas/page background. Warm light off-white tone. |
| `--surface` | `#ffffff` | Elevated | Pure white for cards, modal dialogs, and elevated surfaces. |
| `--green` | `#046645` | 15% | Primary CTAs, brandmark, active links, focus outlines (`outline: 3px solid var(--green)`). |
| `--green-hover` | `#034d34` | State | Hover and pressed state for primary green buttons. |
| `--sage` | `#e8f2e8` | 10% | Number chips (`01`, `02`), tag pills, badge backgrounds, subtle containers. |
| `--ink` | `#1c2621` | Contrast | Primary text, titles, headings, and high-contrast labels. |
| `--muted` | `#59665d` | Secondary | Subtitles, supporting copy, notes, and secondary links. |
| `--border` | `#e1e7de` | Structure | Card borders, input field borders, subtle dividers. |
| Alert / Error | `#a12d24` | 5% | Destructive actions, validation errors, and dynamic alert messages. |

---

## 2. Visual Imagery over Static Text (Best Practice)

1. **Credibility Through Visual Proof**:
   - Users trust concrete photos and visual representations more than paragraphs of explanatory text.
   - Use high-quality, commercially-licensed images depicting real e-waste sorting, collection, and recycling processes.
2. **Local Storage Best Practice**:
   - Store all images in `public/images/assets/` directly in the codebase.
   - Do NOT hotlink to third-party image URLs (avoids CORS issues, latency, broken CDNs, and privacy concerns).
   - Use Next.js `<Image />` component with defined `sizes`, `width`, and `height` to enable responsive WebP generation and prevent Cumulative Layout Shift (CLS).
3. **Hero Visual Backdrop**:
   - Incorporate the image gallery/marquee directly into the hero background with a soft frosted gradient overlay so that the headline and CTAs stand out crisply in front.

---

## 3. Text Minimalism, Anti-Clutter & NO Pseudo-Alerts

1. **Eliminate Fluff**:
   - Do NOT add descriptive subtitles or paragraph fillers just to fill whitespace.
   - If a sentence does not give the user new, dynamic, or actionable information, **delete it**.
2. **NO Pseudo-Alerts & NO Static Advisory Notes**:
   - Strictly forbid creating static reminder boxes, footer notices, or advisory notes (e.g. "Kondisi barang dicantumkan saat pelaporan", "Catatan penting: ...", "Notice: ...").
   - Alerts must ONLY exist dynamically in response to user actions (such as form validation errors or server failure feedback).
3. **Preserve Focus & Intisari Konsep**:
   - If adding text dilutes the core task the user came to do, omit it.
   - Whitespace is intentional breathing room, not empty space to be filled with text.

---

## 4. Iconography, Logo & Character Restrictions

1. **Official Logo Asset**:
   - Always render `public/logo.svg` using `<Image src="/logo.svg" ... />` for all brand headers and footers.
2. **Zero Emojis**:
   - Absolutely NO emojis (e.g. 📦, ⚡, 🚀, 💡, ⚠️, ❌).
3. **Zero Obscure Unicode**:
   - Do not use symbols that cannot be typed from a standard QWERTY keyboard (e.g. ➔, ➜, ✦, ❖, ⚙, ✕).
   - *Exception*: Khusus simbol copyright `©` pada footer diperbolehkan.
4. **SVG Icons Over Text**:
   - Use clean, minimal SVG icons for toggles, actions, and indicators.

---

## 5. Modular Reusability Checklist

- [ ] Global components (Header/Navbar and Footer) are defined once in `app/components/` and reused across all pages via props (`variant="home" | "auth"`).
- [ ] No duplicated header/footer layout in route page files.
- [ ] Buttons and interactive controls have min 44x44px clickable area.
- [ ] Modal popups use `backdrop-blur`.
