import { useState, useEffect, useRef, useCallback } from 'react'

type CssOverrides = {
  primaryColor: string
  fontFamily: string
  spacing: number
}

const FONT_OPTIONS = [
  { label: 'Inter', value: "'Inter', 'Segoe UI', sans-serif" },
  { label: 'Manrope', value: "'Manrope', sans-serif" },
  { label: 'Georgia (Serif)', value: "Georgia, 'Times New Roman', serif" },
  { label: 'JetBrains Mono', value: "'JetBrains Mono', monospace" },
  { label: 'System UI', value: 'system-ui, -apple-system, sans-serif' },
]

const DEFAULT_CSS: CssOverrides = {
  primaryColor: '#8F482F',
  fontFamily: "'Inter', 'Segoe UI', sans-serif",
  spacing: 16,
}

async function fetchDesigns(): Promise<{ name: string; html: string; timestamp: number }[]> {
  try {
    const res = await fetch('/api/designs')
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

async function extractBrand(projectDir: string): Promise<{ colors: string[]; fonts: string[] }> {
  const res = await fetch('/api/brand', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectDir }),
  })
  if (!res.ok) return { colors: [], fonts: [] }
  return await res.json()
}

function App() {
  const [designs, setDesigns] = useState<{ name: string; html: string; timestamp: number }[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<CssOverrides>(DEFAULT_CSS)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isExtracting, setIsExtracting] = useState(false)
  const [brandTokens, setBrandTokens] = useState<{ colors: string[]; fonts: string[] } | null>(null)
  const [projectDir, setProjectDir] = useState('')

  const selectedDesign = designs.find((d) => d.name === selected)
  const html = selectedDesign?.html ?? ''

  // Poll for new designs
  useEffect(() => {
    const poll = async () => {
      const list = await fetchDesigns()
      setDesigns((prev) => {
        if (list.length > 0 && !selected) {
          // Auto-select newest on first load or when selected deleted
          setSelected((s) => (s && list.find((d) => d.name === s) ? s : list[list.length - 1].name))
        }
        return list
      })
    }
    poll()
    const interval = setInterval(poll, 2000)
    return () => clearInterval(interval)
  }, [selected])

  // Inject CSS overrides into iframe
  const injectOverrides = useCallback(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document
    if (!doc?.head) return
    let el = doc.getElementById('design-overrides') as HTMLStyleElement | null
    if (!el) {
      el = doc.createElement('style')
      el.id = 'design-overrides'
      doc.head.appendChild(el)
    }
    el.textContent = `:root {
  --primary-color: ${overrides.primaryColor} !important;
  --font-family: ${overrides.fontFamily} !important;
  --spacing-unit: ${overrides.spacing}px !important;
}`
  }, [overrides])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const onLoad = () => injectOverrides()
    iframe.addEventListener('load', onLoad)
    return () => iframe.removeEventListener('load', onLoad)
  }, [html, injectOverrides])

  useEffect(() => {
    injectOverrides()
  }, [injectOverrides])

  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = sidebarWidth
    setIsDragging(true)
    const onMove = (ev: MouseEvent) => {
      setSidebarWidth(Math.max(200, Math.min(500, startWidth + ev.clientX - startX)))
    }
    const onUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [sidebarWidth])

  // ── Export HTML ──
  const handleExportHtml = useCallback(() => {
    if (!html) return
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = selectedDesign?.name ?? `design-${Date.now()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [html, selectedDesign])

  // ── Export PDF ──
  const handleExportPdf = useCallback(() => {
    iframeRef.current?.contentWindow?.print()
  }, [])

  // ── Brand Extraction ──
  const handleExtractBrand = useCallback(async () => {
    if (!projectDir.trim()) return
    setIsExtracting(true)
    try {
      const tokens = await extractBrand(projectDir)
      setBrandTokens(tokens)
      if (tokens.colors.length > 0) {
        setOverrides((o) => ({ ...o, primaryColor: tokens.colors[0] }))
      }
    } finally {
      setIsExtracting(false)
    }
  }, [projectDir])

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div style={{ width: sidebarWidth }} className="flex shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface-container-low)]">
        {/* Toolbar */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[var(--border)] shrink-0">
          <span className="text-sm mr-auto">
            <span className="font-semibold text-[var(--text-primary)]">Claude Design</span>
          </span>
          <button
            onClick={handleExportHtml}
            disabled={!html}
            title="Export HTML"
            className="px-2 py-1 text-[10px] font-medium rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-container)] disabled:opacity-30 transition-colors"
          >
            HTML
          </button>
          <button
            onClick={handleExportPdf}
            disabled={!html}
            title="Export PDF"
            className="px-2 py-1 text-[10px] font-medium rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-container)] disabled:opacity-30 transition-colors"
          >
            PDF
          </button>
        </div>

        {/* Brand extraction */}
        <div className="px-4 py-2 border-b border-[var(--border)] shrink-0 space-y-2">
          <div className="flex gap-1.5">
            <input
              type="text"
              value={projectDir}
              onChange={(e) => setProjectDir(e.target.value)}
              placeholder="Project path... e.g. /workspace/my-app"
              className="flex-1 h-7 px-2 text-[11px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-white text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)] placeholder:text-[var(--text-tertiary)]"
            />
            <button
              onClick={handleExtractBrand}
              disabled={isExtracting || !projectDir.trim()}
              className="shrink-0 h-7 px-2 text-[10px] font-medium rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-container)] disabled:opacity-30 transition-colors"
            >
              {isExtracting ? '...' : 'Extract'}
            </button>
          </div>
          {brandTokens && (
            <div className="space-y-1">
              {brandTokens.colors.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] text-[var(--text-tertiary)]">Colors:</span>
                  {brandTokens.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setOverrides((o) => ({ ...o, primaryColor: c }))}
                      className="w-4 h-4 rounded-full border border-[var(--border)] cursor-pointer transition-transform hover:scale-125"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              )}
              {brandTokens.fonts.length > 0 && (
                <div className="text-[10px] text-[var(--text-tertiary)]">
                  Fonts: {brandTokens.fonts.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Design list */}
        <div className="flex-1 overflow-y-auto py-1">
          {designs.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-[var(--text-tertiary)]">
              <p>No designs yet.</p>
              <p className="mt-1">Describe a design in Claude Code<br />and HTML files will appear here.</p>
            </div>
          ) : (
            designs.map((d) => (
              <button
                key={d.name}
                onClick={() => setSelected(d.name)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  selected === d.name
                    ? 'bg-[var(--surface-container-high)] text-[var(--text-primary)] font-medium'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-container)]'
                }`}
              >
                <div className="truncate">{d.name.replace('.html', '')}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">.html</div>
              </button>
            ))
          )}
        </div>

        {/* Design Controls */}
        <div className="flex flex-col gap-3 px-4 py-3 border-t border-[var(--border)] bg-[var(--surface-container-low)]">
          <div className="text-[10px] font-semibold tracking-widest text-[var(--text-tertiary)] uppercase">
            Design Tokens
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-[var(--text-secondary)] w-24 shrink-0">Primary</label>
            <input
              type="color"
              value={overrides.primaryColor}
              onChange={(e) => setOverrides((o) => ({ ...o, primaryColor: e.target.value }))}
              className="h-7 w-10 rounded cursor-pointer border border-[var(--border)] bg-transparent p-0.5"
            />
            <span className="text-xs font-mono text-[var(--text-tertiary)]">{overrides.primaryColor}</span>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-[var(--text-secondary)] w-24 shrink-0">Font</label>
            <select
              value={overrides.fontFamily}
              onChange={(e) => setOverrides((o) => ({ ...o, fontFamily: e.target.value }))}
              className="flex-1 h-7 px-2 text-xs rounded-[var(--radius-md)] border border-[var(--border)] bg-white text-[var(--text-primary)] outline-none focus:border-[var(--border-focus)]"
            >
              {FONT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[var(--text-secondary)]">Spacing</label>
              <span className="text-xs font-mono text-[var(--text-tertiary)]">{overrides.spacing}px</span>
            </div>
            <input
              type="range"
              min={8}
              max={32}
              step={2}
              value={overrides.spacing}
              onChange={(e) => setOverrides((o) => ({ ...o, spacing: Number(e.target.value) }))}
              className="w-full accent-[var(--brand)]"
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        onMouseDown={handleDividerMouseDown}
        className="w-1 cursor-col-resize hover:bg-[var(--brand)] bg-[var(--border)] shrink-0 transition-colors"
      />

      {/* Preview */}
      <div className="flex-1 flex flex-col" style={{ pointerEvents: isDragging ? 'none' : undefined }}>
        {!html ? (
          <div className="flex-1 flex flex-col items-center justify-center select-none text-[var(--text-tertiary)] bg-[var(--surface-container-low)]">
            <span className="text-5xl mb-3 opacity-20">🖼️</span>
            <p className="text-sm">Select a design to preview</p>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            srcDoc={html}
            className="flex-1 w-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin"
            title="Design Preview"
          />
        )}
      </div>
    </div>
  )
}

export { App }
