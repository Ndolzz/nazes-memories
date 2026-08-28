import { motion } from 'framer-motion'

// Logo custom Naze's Memories: huruf "N" dibangun dari sudut bingkai foto
// (photo-frame corner) di kiri-bawah dan kanan-atas, dengan sparkle sebagai
// titik penutup diagonal N — merepresentasikan "memory framed, moment sparks."
// Dipakai untuk navbar, favicon, PWA icon, loading screen, dan social preview.
export function Logo({ size = 40, animated = false, className = '' }: { size?: number; animated?: boolean; className?: string }) {
  const Wrapper = animated ? motion.svg : 'svg'
  const props = animated
    ? {
        initial: { opacity: 0, scale: 0.85 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
      }
    : {}

  return (
    <Wrapper
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Naze's Memories"
      {...props}
    >
      <defs>
        <linearGradient id="nazeGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F2A9CC" />
          <stop offset="0.5" stopColor="#C13D8A" />
          <stop offset="1" stopColor="#6E3AA8" />
        </linearGradient>
      </defs>

      {/* Sudut bingkai foto kiri-bawah */}
      <path d="M6 34V42H14" stroke="url(#nazeGrad)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Sudut bingkai foto kanan-atas */}
      <path d="M42 14V6H34" stroke="url(#nazeGrad)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Batang kiri N */}
      <path d="M11 38V10" stroke="url(#nazeGrad)" strokeWidth="3.4" strokeLinecap="round" />
      {/* Batang kanan N */}
      <path d="M37 10V38" stroke="url(#nazeGrad)" strokeWidth="3.4" strokeLinecap="round" />
      {/* Diagonal N */}
      <path d="M11 10L37 38" stroke="url(#nazeGrad)" strokeWidth="3.4" strokeLinecap="round" />
      {/* Sparkle — titik momen */}
      <path
        d="M24 16.5c0.6 2.6 1.3 3.3 3.9 3.9-2.6 0.6-3.3 1.3-3.9 3.9-0.6-2.6-1.3-3.3-3.9-3.9 2.6-0.6 3.3-1.3 3.9-3.9Z"
        fill="#C13D8A"
      />
    </Wrapper>
  )
}
