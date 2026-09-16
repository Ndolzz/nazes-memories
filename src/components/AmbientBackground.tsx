import type { CSSProperties } from 'react'

// Ambient background untuk seluruh area publik — suasana "ruang
// penyimpanan kenangan digital": gradient lembut blue -> lavender -> pink,
// orbs blur besar, partikel cahaya mengambang, dan gerak cahaya halus.
//
// - Semua gerakan adalah CSS animation murni (transform + opacity saja),
//   tanpa canvas, tanpa video, tanpa loop JS -> ringan di perangkat low-end.
// - Posisi & ukuran partikel dihasilkan PRNG ber-seed tetap (mulberry32):
//   tampak acak tetapi deterministic — identik di setiap render/build.
// - Class .ambient-* didefinisikan di src/styles/index.css dan dipakai di
//   sini, jadi animasinya pasti aktif setelah build.
// - prefers-reduced-motion dan mode mobile ditangani lewat CSS.

// PRNG deterministik — hasil sama setiap kali modul dievaluasi.
function mulberry32(seed: number) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Particle = {
  left: number
  top: number
  size: number
  duration: number
  delay: number
  dx: number
  dy: number
  oMax: number
  extra: boolean
}

// Dihitung sekali di module scope — deterministic antar-render.
const PARTICLES: Particle[] = (() => {
  const rand = mulberry32(20260916)
  return Array.from({ length: 26 }, (_, i) => ({
    left: +(rand() * 100).toFixed(2),
    top: +(rand() * 100).toFixed(2),
    size: 2 + Math.round(rand() * 3), // 2-5px
    duration: 24 + Math.round(rand() * 16), // 24-40 detik per fase
    delay: -Math.round(rand() * 40), // negatif -> langsung di tengah animasi
    dx: Math.round((rand() - 0.5) * 36), // bergeser +-18px
    dy: -Math.round(10 + rand() * 24), // naik perlahan 10-34px
    oMax: 0.5 + rand() * 0.35,
    extra: i >= 13 // disembunyikan di layar kecil (perangkat low-end)
  }))
})()

// Orbs blur: ukuran, posisi, dan durasi berbeda -> depth/parallax lembut.
const ORBS = [
  { color: 'ambient-orb--blue', size: 620, top: '-14%', left: '-10%', animation: 'ambient-drift-a 84s ease-in-out -30s infinite alternate', extra: false },
  { color: 'ambient-orb--violet', size: 520, top: '52%', left: '68%', animation: 'ambient-drift-b 96s ease-in-out -12s infinite alternate', extra: false },
  { color: 'ambient-orb--pink', size: 440, top: '72%', left: '-6%', animation: 'ambient-drift-c 72s ease-in-out -48s infinite alternate', extra: false },
  { color: 'ambient-orb--violet', size: 380, top: '4%', left: '56%', animation: 'ambient-drift-b 110s ease-in-out -60s infinite alternate', extra: true }
]

export function AmbientBackground() {
  return (
    <div className="ambient-root" aria-hidden="true">
      {/* Layer 1 — gradient dasar yang bergerak sangat lambat */}
      <div className="ambient-gradient" />

      {/* Layer 2 — orbs blur besar dengan kecepatan berbeda (depth) */}
      {ORBS.map((o, i) => (
        <div
          key={i}
          className={'ambient-orb ' + o.color + (o.extra ? ' ambient-orb--extra' : '')}
          style={{ top: o.top, left: o.left, width: o.size, height: o.size, animation: o.animation }}
        />
      ))}

      {/* Layer 3 — partikel cahaya kecil yang mengambang perlahan */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={'ambient-particle' + (p.extra ? ' ambient-particle--extra' : '')}
          style={
            {
              left: p.left + '%',
              top: p.top + '%',
              width: p.size,
              height: p.size,
              '--d': p.duration + 's',
              '--delay': p.delay + 's',
              '--dx': p.dx + 'px',
              '--dy': p.dy + 'px',
              '--o-max': p.oMax.toFixed(2)
            } as CSSProperties
          }
        />
      ))}

      {/* Layer 4 — gerak cahaya sangat halus */}
      <div className="ambient-sheen" />
    </div>
  )
}
