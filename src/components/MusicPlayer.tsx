import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from './Icon'
import { MusicService } from '@/services/MusicService'
import type { Track } from '@/types'

// Floating music player. Autoplay TIDAK dipaksa (browser akan memblokirnya
// dan itu bukan bug) — musik hanya mulai setelah interaksi user yang eksplisit
// ("Play Memories" di Home, atau tombol Play di sini), sesuai spec §25.
export function MusicPlayer() {
  const [tracks] = useState<Track[]>(() => MusicService.getPlaylist())
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [minimized, setMinimized] = useState(true)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const audioRef = useRef<HTMLAudioElement>(null)

  const current = tracks[index]

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    if (playing) el.play().catch(() => setPlaying(false))
    else el.pause()
  }, [playing, index])

  useEffect(() => {
    const el = audioRef.current
    if (el) el.volume = volume
  }, [volume])

  if (tracks.length === 0) return null

  function next() {
    setIndex((i) => (shuffle ? Math.floor(Math.random() * tracks.length) : (i + 1) % tracks.length))
  }
  function prev() {
    setIndex((i) => (i - 1 + tracks.length) % tracks.length)
  }

  return (
    <div className="fixed z-40 bottom-20 md:bottom-6 right-4 md:right-6">
      <audio
        ref={audioRef}
        src={current?.url}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => (repeat ? (audioRef.current!.currentTime = 0) : next())}
      />
      <AnimatePresence mode="wait">
        {minimized ? (
          <motion.button
            key="mini"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setMinimized(false)}
            className="h-12 w-12 rounded-full bg-naze-gradient text-white shadow-floating flex items-center justify-center"
            aria-label="Buka music player"
          >
            <Icon name="music" size={18} />
          </motion.button>
        ) : (
          <motion.div
            key="full"
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            className="w-72 rounded-xl2 bg-paper shadow-floating border border-violet-100 p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{current?.title}</p>
                <p className="text-xs text-ink-soft/60 truncate">{current?.artist}</p>
              </div>
              <button onClick={() => setMinimized(true)} className="text-ink-soft/60 hover:text-ink" aria-label="Kecilkan player">
                <Icon name="close" size={16} />
              </button>
            </div>

            <input
              type="range"
              min={0}
              max={duration || 0}
              value={progress}
              onChange={(e) => {
                const t = Number(e.target.value)
                if (audioRef.current) audioRef.current.currentTime = t
                setProgress(t)
              }}
              className="w-full mt-3 accent-rose-600"
              aria-label="Posisi lagu"
            />

            <div className="flex items-center justify-center gap-3 mt-2">
              <button onClick={() => setShuffle((s) => !s)} className={shuffle ? 'text-rose-600' : 'text-ink-soft/50'} aria-label="Shuffle">
                <Icon name="random" size={16} />
              </button>
              <button onClick={prev} className="text-ink-soft" aria-label="Sebelumnya">
                <Icon name="previous" size={20} />
              </button>
              <button
                onClick={() => setPlaying((p) => !p)}
                className="h-10 w-10 rounded-full bg-naze-gradient text-white flex items-center justify-center"
                aria-label={playing ? 'Jeda' : 'Putar'}
              >
                <Icon name={playing ? 'pause' : 'play'} size={18} />
              </button>
              <button onClick={next} className="text-ink-soft" aria-label="Berikutnya">
                <Icon name="next" size={20} />
              </button>
              <button onClick={() => setRepeat((r) => !r)} className={repeat ? 'text-rose-600' : 'text-ink-soft/50'} aria-label="Repeat">
                <Icon name="music" size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <Icon name="volume" size={14} className="text-ink-soft/50" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-violet-600"
                aria-label="Volume"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
