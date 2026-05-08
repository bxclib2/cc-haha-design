---
name: design
description: Generate a complete HTML design using Tailwind CSS v4 and save it for real-time preview
arguments: '<design description and constraints>'
---

# Design Skill

When the user invokes `/design`, you are acting as an expert UI/UX designer and frontend developer.

## Core Requirements

1. Generate a **complete, self-contained HTML document** — not a snippet, not a diff.
2. Wrap the entire document in a fenced ` ```html ` block.
3. **Tailwind CSS v4 via CDN is mandatory**. Use `@tailwindcss/browser`:

   ```html
   <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
   ```

4. **Multi-page structure**: A website has multiple pages/views. Generate a **single HTML file with multiple "pages"** using vanilla JS to switch between them (SPA-style). This keeps the design as one file while showing realistic navigation between different views.

   - Each page/view is a `<div>` with a class like `.page` and `id="page-{name}"`
   - A simple `switchPage(name)` JS function shows/hides pages on nav click
   - The sidebar/nav layout stays shared; only the content area swaps
   - Every nav click must call `switchPage('name')`
   - When switching pages, `switchPage` must also `postMessage` the path to the parent frame so the address bar updates:
     ```js
     try { parent.postMessage({ type: '__tw_nav', path: '/' + name }, '*') } catch(e) {}
     ```

5. **Must** define brand color tokens. Use **two `<style>` blocks** — one with `type="text/tailwindcss"` for the `@theme` definition, one plain `<style>` for `:root` variables (the preview panel overrides these in real-time):

   ```html
   <style type="text/tailwindcss">
   @theme {
     --color-primary: var(--color-primary);
     --color-primary-dark: var(--color-primary-dark);
     --color-accent: var(--color-accent);
     --color-surface: var(--color-surface);
     --color-surface-alt: var(--color-surface-alt);
     --color-text: var(--color-text);
     --color-muted: var(--color-muted);
     --color-border: var(--color-border);
     --color-success: var(--color-success);
     --color-error: var(--color-error);
   }
   </style>
   <style>
   :root {
     --color-primary: #6366F1;
     --color-primary-dark: #4F46E5;
     --color-accent: #F59E0B;
     --color-surface: #FFFFFF;
     --color-surface-alt: #F9FAFB;
     --color-text: #111827;
     --color-muted: #6B7280;
     --color-border: #E5E7EB;
     --color-success: #22C55E;
     --color-error: #EF4444;
   }
   </style>
   ```

   **Important:** The `@theme` block MUST come BEFORE the `:root` block so Tailwind v4's CDN parses `var()` references correctly.

6. **Use Tailwind utility classes** throughout the design — `bg-primary`, `text-primary`, `text-muted`, `border-border`, `bg-surface`, `bg-surface-alt`, `rounded-lg`, `shadow-md`, etc. This way the Config panel's theme overrides actually apply to your design.

7. Include other standard Tailwind utility classes for layout (flex, grid, padding, margin, gap, etc.) using Tailwind's standard scale.

8. **Responsive**: use Tailwind's responsive prefixes (`md:`, `lg:`) for mobile/tablet/desktop layouts.

9. **Modern aesthetic**: clean, minimal, professional. Good typography, generous whitespace, subtle shadows.

10. No network requests in JavaScript — decorative JS only.

11. **Always `<!doctype html>` at line 1.** No HTML comment prefix needed.

## File Output

```
/home/xingc/cc-haha-design/design/<slug>.html
```

Then **write it using the Write tool.**

## After Writing

- Confirm the filename to the user.
- Remind them the preview is at `http://localhost:5173` (if the dev server is running).
- Mention they can click the **Tailwind Config** button in the bottom-left to adjust all theme variables.
