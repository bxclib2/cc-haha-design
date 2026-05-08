# cc-haha-design — Minimal Design Preview Tool

A lightweight frontend-only design preview tool. Claude Code generates HTML → Vite dev server serves a preview page with real-time design token controls.

## Project Structure

```
src/
├── App.tsx          # Main app: sidebar (design list + token controls) + iframe preview
├── main.tsx         # React entry point
├── index.css        # Tailwind + CSS variable theme
└── plugin.ts        # Vite plugin: /api/designs and /api/brand endpoints
```

## Design Output Directory

`dist/design/` — Design HTML files are written here. The frontend polls `/api/designs` every 2s to discover new files.

## CSS Variable Contract

Every design HTML MUST include in its `<style>` block:

```css
:root {
  --primary-color: #8F482F;
  --font-family: 'Inter', 'Segoe UI', sans-serif;
  --spacing-unit: 16px;
}
```

These are overridden in real-time by the Design Controls panel.

## Dev Server

```bash
cd /workspace/design-preview && BUN_TMPDIR=/workspace/.bun-tmp bun run dev
# → http://localhost:5173
```

## Slash Commands

- `/design <description>` — Generate a complete HTML design and write it to `dist/design/`
