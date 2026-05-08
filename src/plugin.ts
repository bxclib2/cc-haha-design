import type { Plugin, ViteDevServer } from 'vite'
import { readFile, readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { createServer } from 'node:http'

const DESIGN_DIR = join(process.cwd(), 'dist', 'design')

/** Vite plugin: serves /api/designs, /api/brand */
export function designAPIPlugin(): Plugin {
  return {
    name: 'design-api',
    configureServer(server: ViteDevServer) {
      // List designs
      server.middlewares.use('/api/designs', async (_req, res) => {
        try {
          const entries = await readdir(DESIGN_DIR)
          const htmlFiles = entries.filter((f) => f.endsWith('.html'))
          const designs = await Promise.all(
            htmlFiles.map(async (name) => {
              const html = await readFile(join(DESIGN_DIR, name), 'utf-8')
              const s = await stat(join(DESIGN_DIR, name))
              return { name, html, timestamp: s.mtimeMs }
            }),
          )
          designs.sort((a, b) => b.timestamp - a.timestamp)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(designs))
        } catch {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify([]))
        }
      })

      // Brand extraction: scan project dir for colors/fonts
      server.middlewares.use('/api/brand', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        try {
          const body = await new Promise<string>((resolve) => {
            let data = ''
            req.on('data', (chunk) => { data += chunk })
            req.on('end', () => resolve(data))
          })
          const { projectDir } = JSON.parse(body) as { projectDir?: string }
          if (!projectDir) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ colors: [], fonts: [] }))
            return
          }
          const tokens = await scanProjectForBrand(projectDir)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(tokens))
        } catch {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ colors: [], fonts: [] }))
        }
      })
    },
  }
}

// ── Brand scanning logic ──

async function scanProjectForBrand(projectDir: string): Promise<{ colors: string[]; fonts: string[] }> {
  const filesToCheck = [
    'tailwind.config.ts', 'tailwind.config.js', 'tailwind.config.mjs',
    'globals.css', 'index.css', 'App.css', 'styles.css',
    'theme.ts', 'theme.js', 'theme.css',
    'package.json',
  ]

  const colors = new Set<string>()
  const fonts = new Set<string>()

  for (const filename of filesToCheck) {
    try {
      const content = await readFile(join(projectDir, filename), 'utf-8')
      // Extract hex colors
      const hexMatches = content.match(/#[0-9A-Fa-f]{6}\b/g) ?? []
      for (const hex of hexMatches) colors.add(hex.toUpperCase())
      // Extract quoted font names (likely custom fonts)
      const fontMatches = content.match(/["'](Inter|Manrope|Geist|Poppins|Roboto|Lato|Montserrat|Open Sans|Nunito|Raleway|Playfair Display|Merriweather|IBM Plex|Source Sans|DM Sans|Space Grotesk|Plus Jakarta|Work Sans|Lexend|Figtree|Outfit)["']/gi) ?? []
      for (const f of fontMatches) {
        const clean = f.replace(/['"]/g, '')
        if (clean) fonts.add(clean)
      }
    } catch {
      // file doesn't exist, skip
    }
  }

  return {
    colors: [...colors].slice(0, 20),
    fonts: [...fonts].slice(0, 10),
  }
}
