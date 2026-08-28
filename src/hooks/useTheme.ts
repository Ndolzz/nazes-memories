import { useEffect, useState, useCallback } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemePreset = 'rose' | 'lavender' | 'magenta' | 'midnight'

const MODE_KEY = 'naze:theme-mode'
const PRESET_KEY = 'naze:theme-preset'

function applyMode(mode: ThemeMode) {
  const root = document.documentElement
  const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  root.classList.toggle('dark', isDark)
}

function applyPreset(preset: ThemePreset) {
  document.documentElement.setAttribute('data-theme-preset', preset)
}

// Light/dark/system + preset warna (Rose/Lavender/Magenta/Midnight) tersimpan
// di localStorage — bukan state UI yang perlu disinkron ke server.
export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(() => (localStorage.getItem(MODE_KEY) as ThemeMode) || 'system')
  const [preset, setPresetState] = useState<ThemePreset>(() => (localStorage.getItem(PRESET_KEY) as ThemePreset) || 'rose')

  useEffect(() => {
    applyMode(mode)
    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => applyMode('system')
      mq.addEventListener('change', listener)
      return () => mq.removeEventListener('change', listener)
    }
  }, [mode])

  useEffect(() => {
    applyPreset(preset)
  }, [preset])

  const setMode = useCallback((m: ThemeMode) => {
    localStorage.setItem(MODE_KEY, m)
    setModeState(m)
  }, [])

  const setPreset = useCallback((p: ThemePreset) => {
    localStorage.setItem(PRESET_KEY, p)
    setPresetState(p)
  }, [])

  return { mode, setMode, preset, setPreset }
}
