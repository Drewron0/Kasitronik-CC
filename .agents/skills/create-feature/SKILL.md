---
name: create-feature
description: Use this skill when asked to create, refactor, or structure a new feature, domain module, or page in Kasitronik following Feature-Based Clean Architecture.
---

# Feature Creation Playbook (Kasitronik)

Follow this step-by-step workflow whenever scaffolding or building a new feature in Kasitronik.

## 1. Feature Directory Structure

Every feature must follow Feature-Based Architecture:

```text
app/<feature-name>/
├── actions/             # Server actions (if multiple, otherwise single action file)
│   └── <action-name>.ts
├── components/          # UI components specific to this feature
│   └── <ComponentName>.tsx
├── interfaces/          # TypeScript interfaces/types (separate from UI)
│   └── <type-name>.ts
├── page.tsx             # Page entry point (clean layout, delegates to components)
└── <feature>.module.css # Styling (if using CSS modules) or Tailwind
```

## 2. Implementation Rules

1. **Strict Logic Separation**:
   - Never write database calls, Supabase queries, or business logic directly inside React components.
   - Always put server actions in `actions/` or a dedicated server action file with `"use server"`.
2. **Interface Isolation**:
   - Every data model, payload, or state contract must have its own file in `interfaces/` (e.g. `user-report.interface.ts`).
3. **Component Modularity**:
   - Avoid monolithic page files. Extract logical pieces into standalone components in `components/`.
4. **Page Metadata & HTML Title**:
   - Always export `metadata: Metadata` in `page.tsx` with a page-specific `title` (e.g. `title: "Nama Halaman"`) and `description`.
   - The root template automatically formats the browser tab title as `Nama Halaman | Kasitronik`.

## 3. UI & Styling Verification
- [ ] Base background is `--canvas: #faf9f7` (60%) with `--surface: #ffffff` cards.
- [ ] Primary buttons/interactive actions use `--green: #046645` (15%) with hover `--green-hover: #034d34`.
- [ ] Accents and badges use `--sage: #e8f2e8` (10%).
- [ ] Errors/alerts use `#a12d24` (5%).
- [ ] Text uses `--ink: #1c2621` for titles/labels and `--muted: #59665d` for descriptions.
- [ ] Borders use `--border: #e1e7de`.
- [ ] Typography uses Geist Sans (`var(--font-geist-sans), Arial, sans-serif`).
- [ ] Flexbox is used over Grid for layout.
- [ ] Any modal popup has `backdrop-blur`.
- [ ] Global header and footer are imported from `app/components/` (not duplicated).
- [ ] No static pseudo-alert or reminder notice boxes are added.

## 4. Verification Step
Always run:
```bash
pnpm run lint
pnpm run build
```
Fix all TypeScript and linting warnings before finalizing.
