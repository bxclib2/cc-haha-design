import { useState, useEffect, useRef, useCallback, useMemo } from 'react'

// ── Theme Tokens ──
interface TokenDef {
  key: string
  cssVar: string
  label: string
  group: string
  control: 'color' | 'font-family' | 'range' | 'select'
  default: string
  min?: number
  max?: number
  step?: number
  suffix?: string
  options?: { label: string; value: string }[]
  utility?: string
}

const ALL_TOKENS: TokenDef[] = [
  // Colors
  { key: 'primary',     cssVar: '--color-primary',      label: 'Primary',       group: 'colors', control: 'color', default: '#6366F1', utility: 'bg-primary / text-primary' },
  { key: 'primaryDark', cssVar: '--color-primary-dark', label: 'Primary Dark',  group: 'colors', control: 'color', default: '#4F46E5' },
  { key: 'accent',      cssVar: '--color-accent',       label: 'Accent',        group: 'colors', control: 'color', default: '#F59E0B', utility: 'bg-accent / text-accent' },
  { key: 'surface',     cssVar: '--color-surface',      label: 'Surface',       group: 'colors', control: 'color', default: '#FFFFFF', utility: 'bg-surface' },
  { key: 'surfaceAlt',  cssVar: '--color-surface-alt',  label: 'Surface Alt',   group: 'colors', control: 'color', default: '#F9FAFB', utility: 'bg-surface-alt' },
  { key: 'textPrimary', cssVar: '--color-text',         label: 'Text Primary',  group: 'colors', control: 'color', default: '#111827', utility: 'text-text' },
  { key: 'textMuted',   cssVar: '--color-muted',        label: 'Text Muted',    group: 'colors', control: 'color', default: '#6B7280', utility: 'text-muted' },
  { key: 'border',      cssVar: '--color-border',       label: 'Border',        group: 'colors', control: 'color', default: '#E5E7EB', utility: 'border-border' },
  { key: 'success',     cssVar: '--color-success',      label: 'Success',       group: 'colors', control: 'color', default: '#22C55E', utility: 'text-success / bg-success' },
  { key: 'error',       cssVar: '--color-error',        label: 'Error',         group: 'colors', control: 'color', default: '#EF4444', utility: 'text-error / bg-error' },

  // Typography
  { key: 'fontSans',     cssVar: '--font-sans',     label: 'Font (Sans)',  group: 'typography', control: 'font-family', default: "Inter, ui-sans-serif, system-ui, sans-serif" },
  { key: 'fontHeading',  cssVar: '--font-heading',  label: 'Font (Heading)', group: 'typography', control: 'font-family', default: "Inter, ui-sans-serif, system-ui, sans-serif" },
  { key: 'fontMono',     cssVar: '--font-mono',     label: 'Font (Mono)',  group: 'typography', control: 'font-family', default: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
  { key: 'textBase',         cssVar: '--text-base',          label: 'Font Size Base',   group: 'typography', control: 'range', default: '16', min: 12, max: 24, step: 1, suffix: 'px' },
  { key: 'fontWeightNormal', cssVar: '--font-weight-normal', label: 'Weight Normal',    group: 'typography', control: 'range', default: '400', min: 100, max: 900, step: 100 },
  { key: 'fontWeightBold',   cssVar: '--font-weight-bold',   label: 'Weight Bold',      group: 'typography', control: 'range', default: '700', min: 100, max: 900, step: 100 },
  { key: 'tracking',         cssVar: '--tracking-normal',    label: 'Letter Spacing',   group: 'typography', control: 'range', default: '0', min: -2, max: 4, step: 0.25, suffix: 'em' },
  { key: 'leading',          cssVar: '--leading-normal',     label: 'Line Height',      group: 'typography', control: 'range', default: '1.5', min: 1, max: 2, step: 0.125 },

  // Spacing
  { key: 'spacingUnit', cssVar: '--spacing', label: 'Spacing Unit', group: 'spacing', control: 'range', default: '4', min: 2, max: 12, step: 1, suffix: 'px' },
  { key: 'gap',         cssVar: '--gap',     label: 'Gap Default',  group: 'spacing', control: 'range', default: '24', min: 4, max: 64, step: 4, suffix: 'px' },
  { key: 'sectionPad',  cssVar: '--section-pad', label: 'Section Pad', group: 'spacing', control: 'range', default: '80', min: 16, max: 160, step: 8, suffix: 'px' },

  // Border & Radius
  { key: 'radiusSm',  cssVar: '--radius-sm',  label: 'Radius SM', group: 'radius', control: 'range', default: '4', min: 0, max: 24, step: 2, suffix: 'px', utility: 'rounded-sm' },
  { key: 'radiusMd',  cssVar: '--radius-md',  label: 'Radius MD', group: 'radius', control: 'range', default: '8', min: 0, max: 32, step: 2, suffix: 'px', utility: 'rounded-md' },
  { key: 'radiusLg',  cssVar: '--radius-lg',  label: 'Radius LG', group: 'radius', control: 'range', default: '12', min: 0, max: 48, step: 2, suffix: 'px', utility: 'rounded-lg' },
  { key: 'radiusXl',  cssVar: '--radius-xl',  label: 'Radius XL', group: 'radius', control: 'range', default: '16', min: 0, max: 64, step: 2, suffix: 'px', utility: 'rounded-xl' },
  { key: 'radiusFull', cssVar: '--radius-full', label: 'Radius Full', group: 'radius', control: 'range', default: '9999', min: 0, max: 9999, step: 1, suffix: 'px', utility: 'rounded-full' },
  { key: 'borderWidth', cssVar: '--border-width', label: 'Border Width', group: 'radius', control: 'range', default: '1', min: 0, max: 8, step: 1, suffix: 'px' },

  // Shadows
  { key: 'shadowSm', cssVar: '--shadow-sm', label: 'Shadow SM', group: 'shadows', control: 'select', default: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Subtle', value: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
      { label: 'Soft', value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' },
      { label: 'Medium', value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
      { label: 'Large', value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' },
      { label: 'XL', value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' },
    ] },
  { key: 'shadowMd', cssVar: '--shadow-md', label: 'Shadow MD', group: 'shadows', control: 'select', default: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Subtle', value: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
      { label: 'Soft', value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' },
      { label: 'Medium', value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
      { label: 'Large', value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' },
      { label: 'XL', value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' },
    ] },
  { key: 'shadowLg', cssVar: '--shadow-lg', label: 'Shadow LG', group: 'shadows', control: 'select', default: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Subtle', value: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
      { label: 'Soft', value: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' },
      { label: 'Medium', value: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
      { label: 'Large', value: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' },
      { label: 'XL', value: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' },
    ] },

  // Effects
  { key: 'transition', cssVar: '--default-transition-duration', label: 'Transition Duration', group: 'effects', control: 'select', default: '200ms',
    options: [
      { label: 'None', value: '0ms' },
      { label: 'Fast', value: '150ms' },
      { label: 'Normal', value: '200ms' },
      { label: 'Slow', value: '400ms' },
      { label: 'Very Slow', value: '600ms' },
    ] },
  { key: 'easing', cssVar: '--default-transition-timing-function', label: 'Easing', group: 'effects', control: 'select', default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    options: [
      { label: 'Linear', value: 'linear' },
      { label: 'Ease In', value: 'cubic-bezier(0.4, 0, 1, 1)' },
      { label: 'Ease Out', value: 'cubic-bezier(0, 0, 0.2, 1)' },
      { label: 'Ease In-Out', value: 'cubic-bezier(0.4, 0, 0.2, 1)' },
    ] },
  { key: 'blur', cssVar: '--blur-md', label: 'Blur MD', group: 'effects', control: 'range', default: '12', min: 0, max: 64, step: 4, suffix: 'px' },

  // Breakpoints
  { key: 'bpSm',  cssVar: '--breakpoint-sm',  label: 'Breakpoint SM', group: 'breakpoints', control: 'range', default: '640', min: 320, max: 960, step: 16, suffix: 'px' },
  { key: 'bpMd',  cssVar: '--breakpoint-md',  label: 'Breakpoint MD', group: 'breakpoints', control: 'range', default: '768', min: 480, max: 1200, step: 16, suffix: 'px' },
  { key: 'bpLg',  cssVar: '--breakpoint-lg',  label: 'Breakpoint LG', group: 'breakpoints', control: 'range', default: '1024', min: 640, max: 1600, step: 16, suffix: 'px' },
  { key: 'bpXl',  cssVar: '--breakpoint-xl',  label: 'Breakpoint XL', group: 'breakpoints', control: 'range', default: '1280', min: 800, max: 2000, step: 16, suffix: 'px' },
]

type TokenValues = Record<string, string>

function buildDefaults(): TokenValues {
  const vals: TokenValues = {}
  for (const t of ALL_TOKENS) vals[t.key] = t.default
  return vals
}

// ── HTML processing ──
// Replace @theme block values in a design's HTML with current token overrides.
// This forces the Play CDN to re-process the @theme with the new values on iframe reload.
function applyOverrides(html: string, overrides: TokenValues): string {
  let result = html
  for (const t of ALL_TOKENS) {
    const overrideVal = overrides[t.key]
    if (!overrideVal) continue
    // Replace CSS var value in :root { } block — exact match on the cssVar
    const regex = new RegExp(`(${t.cssVar}):\\s*[^;]+;`, 'g')
    result = result.replace(regex, `$1: ${overrideVal};`)
  }
  return result
}

// ── API ──
async function fetchDesigns(): Promise<{ name: string; html: string; timestamp: number }[]> {
  try {
    const res = await fetch('/api/designs')
    if (!res.ok) return []
    return await res.json()
  } catch { return [] }
}

// ── Control components ──
function Control({ def, value, onChange }: { def: TokenDef; value: string; onChange: (v: string) => void }) {
  const row = (control: React.ReactNode) => (
    <div className="tw-ctl-row">
      <label className="tw-ctl-label">{def.label}</label>
      <div className="flex-1 flex items-center justify-end gap-2">
        {control}
        {def.utility && <span className="tw-ctl-class">{def.utility}</span>}
      </div>
    </div>
  )
  switch (def.control) {
    case 'color':
      return row(
        <div className="tw-ctl-color-group">
          <input type="color" value={value} onChange={e => onChange(e.target.value)} className="tw-ctl-color" />
          <span className="tw-ctl-mono">{value}</span>
        </div>
      )
    case 'font-family':
      return row(
        <select value={value} onChange={e => onChange(e.target.value)} className="tw-ctl-select">
          {FONT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
    case 'range':
      return row(
        <div className="tw-ctl-range-group">
          <input type="range" min={def.min} max={def.max} step={def.step ?? 1}
            value={Number(value)} onChange={e => onChange(e.target.value)}
            className="tw-ctl-range" />
          <span className="tw-ctl-mono">{value}{def.suffix ?? ''}</span>
        </div>
      )
    case 'select':
      return row(
        <select value={value} onChange={e => onChange(e.target.value)} className="tw-ctl-select">
          {(def.options ?? []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )
  }
}

const FONT_OPTIONS = [
  { label: 'Inter', value: "Inter, ui-sans-serif, system-ui, sans-serif" },
  { label: 'Manrope', value: "'Manrope', sans-serif" },
  { label: 'Geist', value: "'Geist', 'Inter', ui-sans-serif, sans-serif" },
  { label: 'System UI', value: "ui-sans-serif, system-ui, -apple-system, sans-serif" },
  { label: 'Serif (Georgia)', value: "Georgia, ui-serif, serif" },
  { label: 'Mono (JetBrains)', value: "'JetBrains Mono', ui-monospace, monospace" },
]

// ── App ──
function App() {
  const [designs, setDesigns] = useState<{ name: string; html: string; timestamp: number }[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<TokenValues>(buildDefaults)
  const [showDialog, setShowDialog] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(260)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [addrPath, setAddrPath] = useState('/dashboard')

  const selectedDesign = designs.find(d => d.name === selected)

  // Generate patched HTML with overrides baked into :root / @theme values
  const patchedHtml = useMemo(() => {
    if (!selectedDesign?.html) return ''
    return applyOverrides(selectedDesign.html, overrides)
  }, [selectedDesign?.html, overrides])

  // Poll for new designs
  useEffect(() => {
    const poll = async () => {
      const list = await fetchDesigns()
      setDesigns(prev => {
        if (list.length > 0 && !(selected && prev.find(d => d.name === selected)))
          setSelected(list[list.length - 1].name)
        return list
      })
    }
    poll()
    const interval = setInterval(poll, 2000)
    return () => clearInterval(interval)
  }, [selected])

  // Export preset
  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify({ tokens: overrides }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'tw-preset.json'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [overrides])

  // Import preset
  const handleImport = useCallback(() => { fileInputRef.current?.click() }, [])
  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        if (data.tokens) setOverrides(prev => ({ ...prev, ...data.tokens }))
      } catch { /* ignore */ }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  // Listen for iframe nav messages
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === '__tw_nav' && e.data?.path) {
        setAddrPath(e.data.path)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Reset path when design changes
  useEffect(() => {
    setAddrPath('/dashboard')
  }, [selectedDesign?.name])

  // Reset all tokens to defaults
  const handleReset = useCallback(() => setOverrides(buildDefaults()), [])

  // Export HTML / PDF
  const handleExportHtml = useCallback(() => {
    if (!patchedHtml) return
    const blob = new Blob([patchedHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = selectedDesign?.name ?? 'design.html'
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [patchedHtml, selectedDesign?.name])

  const handleExportPdf = useCallback(() => {
    iframeRef.current?.contentWindow?.print()
  }, [])

  const handleDividerDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startW = sidebarWidth
    setIsDragging(true)
    const m = (ev: MouseEvent) => setSidebarWidth(Math.max(200, Math.min(500, startW + ev.clientX - startX)))
    const u = () => { setIsDragging(false); document.removeEventListener('mousemove', m); document.removeEventListener('mouseup', u) }
    document.addEventListener('mousemove', m)
    document.addEventListener('mouseup', u)
  }, [sidebarWidth])

  // Dialog state
  const groups = [...new Set(ALL_TOKENS.map(t => t.group))] as const
  const groupIcons: Record<string, string> = {
    colors: '🎨', typography: 'Aa', spacing: '⊞', radius: '⊡',
    shadows: '✦', effects: '⚡', breakpoints: '📱',
  }
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    colors: true, typography: false, spacing: false, radius: false,
    shadows: false, effects: false, breakpoints: false,
  })

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div style={{ width: sidebarWidth }} className="flex shrink-0 flex-col border-r border-gray-200 bg-gray-50">
        {/* Toolbar */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-200 shrink-0">
          <span className="text-sm font-semibold text-gray-800 mr-auto">Claude Design</span>
          <button onClick={handleExportHtml} disabled={!selectedDesign}
            className="text-[10px] font-medium px-2 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30">HTML</button>
          <button onClick={handleExportPdf} disabled={!selectedDesign}
            className="text-[10px] font-medium px-2 py-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30">PDF</button>
        </div>

        {/* Design list */}
        <div className="flex-1 overflow-y-auto py-1">
          {designs.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-gray-400">
              <p>No designs yet.</p>
              <p className="mt-1">Use <span className="text-indigo-500 font-medium">/design</span> to generate.</p>
            </div>
          ) : (
            designs.map(d => (
              <button key={d.name} onClick={() => setSelected(d.name)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${selected === d.name ? 'bg-gray-200 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                <div className="truncate">{d.name.replace('.html', '')}</div>
              </button>
            ))
          )}
        </div>

        {/* Bottom: Tailwind Config button */}
        <div className="px-3 py-3 border-t border-gray-200 flex gap-2">
          <button onClick={() => setShowDialog(true)}
            className="flex-1 h-8 text-xs font-medium rounded border border-gray-300 text-gray-600 hover:bg-gray-100">
            ⚙️ Tailwind Config
          </button>
          <button onClick={handleExport} disabled={!selectedDesign}
            className="h-8 px-2 text-xs font-medium rounded border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-30">
            ⬇ Preset
          </button>
          <button onClick={handleImport}
            className="h-8 px-2 text-xs font-medium rounded border border-gray-300 text-gray-500 hover:bg-gray-100">
            ⬆ Load
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFile} style={{ display: 'none' }} />
        </div>
      </div>

      {/* Divider */}
      <div onMouseDown={handleDividerDrag}
        className="w-1 cursor-col-resize hover:bg-indigo-400 bg-gray-200 shrink-0 transition-colors" />

      {/* Preview */}
      <div className="flex-1 flex flex-col bg-white" style={{ pointerEvents: isDragging ? 'none' : undefined }}>
        {!patchedHtml ? (
          <div className="flex-1 flex flex-col items-center justify-center select-none text-gray-400 bg-gray-50">
            <span className="text-5xl mb-3 opacity-20">🖼️</span>
            <p className="text-sm">Select a design to preview</p>
          </div>
        ) : (
          <>
            {/* Address bar */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-200 bg-gray-50 shrink-0">
              <span className="text-[10px] text-green-600 font-semibold">🔒 HTTPS</span>
              <div className="flex-1 flex items-center px-3 py-1 rounded-md bg-white border border-gray-200 text-xs text-gray-500 font-mono">
                <span className="text-gray-400">{selectedDesign?.name.replace('.html', '')}.vercel.app</span>
                <span className="text-gray-800">{addrPath}</span>
              </div>
              <button onClick={() => { iframeRef.current?.contentWindow?.location?.reload() }}
                className="w-6 h-6 flex items-center justify-center rounded text-xs text-gray-500 hover:bg-gray-200 border border-gray-200 bg-white cursor-pointer">⟳</button>
            </div>
            <iframe key={selectedDesign?.name ?? 'empty'} ref={iframeRef} srcDoc={patchedHtml}
              className="flex-1 w-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin"
              title="Design Preview" />
          </>
        )}
      </div>

      {/* Tailwind Config Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          onClick={() => setShowDialog(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-[560px] max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            {/* Dialog header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
              <h2 className="text-sm font-semibold text-gray-800">⚙️ Tailwind Config</h2>
              <div className="flex gap-2">
                <button onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded border border-gray-200">Reset</button>
                <button onClick={() => setShowDialog(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
              </div>
            </div>
            {/* Dialog body */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-0">
              {groups.map(g => (
                <div key={g} className="border-b border-gray-100 last:border-b-0">
                  <button onClick={() => setOpenGroups(p => ({ ...p, [g]: !p[g] }))}
                    className="flex items-center gap-2 w-full py-2 text-[10px] font-semibold tracking-wider uppercase text-gray-400">
                    <span className="text-xs">{groupIcons[g]}</span>
                    <span>{g}</span>
                    <span className="ml-auto text-[8px]">{openGroups[g] ? '▾' : '▸'}</span>
                  </button>
                  {openGroups[g] && (
                    <div className="pb-2">
                      {ALL_TOKENS.filter(t => t.group === g).map(t => (
                        <Control key={t.key} def={t} value={overrides[t.key] ?? t.default}
                          onChange={v => setOverrides(p => ({ ...p, [t.key]: v }))} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Dialog footer */}
            <div className="px-5 py-3 border-t border-gray-200 flex gap-2 shrink-0">
              <button onClick={handleExport} className="flex-1 h-8 text-xs font-medium rounded border border-gray-300 text-gray-600 hover:bg-gray-100">
                ⬇ Export Preset
              </button>
              <button onClick={handleImport} className="flex-1 h-8 text-xs font-medium rounded border border-gray-300 text-gray-600 hover:bg-gray-100">
                ⬆ Import Preset
              </button>
              <button onClick={() => setShowDialog(false)}
                className="px-4 h-8 text-xs font-medium rounded bg-indigo-500 text-white hover:bg-indigo-600">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { App }
