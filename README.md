# cc-haha-design

A minimal frontend design preview tool — Claude Code generates HTML in CLI, the web page renders it with real-time design token controls.

Forked and simplified from [claude-design](https://github.com/owlteam990/claude-design).

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) >= 1.3

### Install & Run

```bash
git clone https://github.com/bxclib2/cc-haha-design.git
cd cc-haha-design
bun install
bun run dev
```

Open <http://localhost:5173>.

### Usage

This project comes with a Claude Code `/design` slash command. After opening this project in Claude Code, type:

```
/design a landing page for a coffee shop
```

Claude generates a complete self-contained HTML file and saves it to `dist/design/`. The preview page auto-discovers new designs every 2 seconds.

## How It Works

```
Claude Code CLI (/design)     Vite Dev Server (localhost:5173)
    │                                    │
    ├─ generates HTML ──► dist/design/   │
    │                    (polled by) ────┤
    │                                    ├─ iframe preview
    │                                    ├─ Design Controls (color / font / spacing)
    │                                    ├─ Export HTML / PDF
    │                                    └─ Brand extraction
```

## Features

| Feature | Description |
|---|---|
| iframe preview | Full HTML rendering with `srcDoc` |
| CSS variable override | Real-time adjust `--primary-color`, `--font-family`, `--spacing-unit` |
| Design Controls | Color picker, font selector, spacing slider |
| Export HTML | One-click Blob download |
| Export PDF | iframe.print() |
| Brand extraction | Scan project dir for hex colors and known fonts |
| Resizable panels | Drag divider between sidebar and preview |

## Project Structure

```
src/
├── App.tsx          # Sidebar (design list, token controls) + iframe preview
├── main.tsx         # React entry
├── index.css        # Tailwind + CSS variable theme
└── plugin.ts        # Vite plugin: /api/designs, /api/brand
dist/design/         # Output directory for generated HTML
.claude/skills/      # Claude Code /design slash command definition
```

## CSS Variable Contract

Every generated design HTML must include in its `<style>` block:

```css
:root {
  --primary-color: #8F482F;
  --font-family: 'Inter', 'Segoe UI', sans-serif;
  --spacing-unit: 16px;
}
```

These are live-injected into the iframe by the Design Controls panel.

## Compared to claude-design

| | claude-design | cc-haha-design |
|---|---|---|
| Architecture | Tauri 2 + WebSocket + full CLI clone | Pure Vite + React |
| Dependencies | cc-haha CLI, desktop bin, server | ~10 npm packages |
| Design workflow | In-app chat input → WS stream → preview | CLI `/design` → write file → preview |
| Frontend features | Design controls, export, brand extraction | Same |
| install/cold-start | Bun, Rust toolchain, Tauri deps | `bun install && bun run dev` |

## License

MIT
