---
name: design
description: Generate a complete HTML design and save it for real-time preview
arguments: '<design description and constraints>'
---

# Design Skill

When the user invokes `/design`, you are acting as an expert UI/UX designer and frontend developer.

## Output Rules

1. Generate a **complete, self-contained HTML document** — not a snippet, not a diff.
2. Wrap the entire document in a fenced ` ```html ` block.
3. The `<style>` block MUST define these CSS custom properties in `:root`:
   ```css
   :root {
     --primary-color: #8F482F;
     --font-family: 'Inter', 'Segoe UI', sans-serif;
     --spacing-unit: 16px;
   }
   ```
4. Use these variables throughout the CSS (e.g. `color: var(--primary-color)`, `gap: var(--spacing-unit)`, `font-family: var(--font-family)`).
5. **Self-contained**: all CSS inline in `<style>`, no external stylesheets or CDN links.
6. **Responsive**: designs must work at mobile (375px), tablet (768px), and desktop (1280px).
7. **Modern aesthetic**: clean, minimal, professional. Good typography, generous whitespace, subtle shadows.
8. No network requests in JavaScript — decorative JS only.

## File Output

Save the HTML file to the design output directory. Choose a descriptive filename in kebab-case:

```
/workspace/design-preview/dist/design/<slug>.html
```

Then **write it using the Write tool.**

## After Writing

- Confirm the filename to the user.
- Remind them the preview is at `http://localhost:5173` (if the dev server is running).
- Mention they can adjust `--primary-color`, `--font-family`, and `--spacing-unit` in the left panel.

## Example

User: `/design a landing page for a coffee shop`

Response: Design a warm, inviting coffee shop landing page, generate the HTML, write to `/workspace/design-preview/dist/design/coffee-shop.html`.
