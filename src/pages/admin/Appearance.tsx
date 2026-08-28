import { useTheme, type ThemePreset } from '@/hooks/useTheme'

const presets: { value: ThemePreset; label: string; swatch: string }[] = [
  { value: 'rose', label: 'Rose', swatch: 'linear-gradient(135deg,#F2A9CC,#C13D8A)' },
  { value: 'lavender', label: 'Lavender', swatch: 'linear-gradient(135deg,#EFE4FA,#8A54C4)' },
  { value: 'magenta', label: 'Magenta', swatch: 'linear-gradient(135deg,#DB5BA0,#6E3AA8)' },
  { value: 'midnight', label: 'Midnight', swatch: 'linear-gradient(135deg,#4E2779,#2B1240)' }
]

export function AdminAppearance() {
  const { mode, setMode, preset, setPreset } = useTheme()

  return (
    <div className="space-y-8 max-w-lg">
      <h1 className="font-display text-2xl">Appearance</h1>

      <div className="space-y-2">
        <p className="text-sm font-medium text-ink">Mode</p>
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                mode === m ? 'bg-naze-gradient text-white' : 'bg-violet-50 text-ink-soft'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-ink">Theme preset</p>
        <div className="grid grid-cols-2 gap-3">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className={`flex items-center gap-3 rounded-xl2 border p-3 text-left transition-colors ${
                preset === p.value ? 'border-violet-400 bg-violet-50' : 'border-violet-100'
              }`}
            >
              <span className="h-8 w-8 rounded-full" style={{ background: p.swatch }} />
              <span className="text-sm font-medium">{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
