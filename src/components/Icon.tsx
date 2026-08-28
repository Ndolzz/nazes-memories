import type { SVGProps } from 'react'

// Sistem icon custom, satu file, satu gaya visual konsisten (stroke 1.8,
// rounded caps, viewBox 24x24) — supaya tidak perlu 25 file terpisah namun
// tetap bukan emoji dan tetap satu bahasa visual di seluruh UI.
const paths: Record<string, JSX.Element> = {
  memory: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M20 15l-5.2-5.2a1.5 1.5 0 0 0-2.1 0L4 18" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" />
      <circle cx="12" cy="12.5" r="3.4" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="M16 10.5l4.2-2.6a.8.8 0 0 1 1.2.7v6.8a.8.8 0 0 1-1.2.7L16 13.5" />
    </>
  ),
  music: (
    <>
      <circle cx="6.5" cy="17.5" r="2.3" />
      <circle cx="16.5" cy="15.5" r="2.3" />
      <path d="M8.8 17.5V6.8L18.8 5v10.5" />
    </>
  ),
  random: (
    <>
      <path d="M3 7h3.5c1.6 0 2.4.7 3.4 2.2M3 17h3.5c1.6 0 2.4-.7 3.4-2.2M14 7h4M14 17h4" />
      <path d="M16 4.5 18.5 7 16 9.5M16 14.5l2.5 2.5-2.5 2.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
    </>
  ),
  heart: <path d="M12 19.5s-7-4.35-9-8.6C1.6 7.4 4 4.5 7.2 4.5c2 0 3.4 1.05 4.8 2.85C13.4 5.55 14.8 4.5 16.8 4.5c3.2 0 5.6 2.9 4.2 6.4-2 4.25-9 8.6-9 8.6Z" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19.5 19.5l-4.4-4.4" />
    </>
  ),
  upload: (
    <>
      <path d="M12 15.5V4.5M8 8.5 12 4.5l4 4" />
      <path d="M4.5 15.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H4.5a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10a1.7 1.7 0 0 0 1-1.55V4.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10c.14.42.42.78 1.55 1H19.5a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.55 1Z" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="6" r="2.3" />
      <circle cx="6" cy="12" r="2.3" />
      <circle cx="18" cy="18" r="2.3" />
      <path d="M8.1 10.8 15.9 7.2M8.1 13.2l7.8 3.6" />
    </>
  ),
  download: (
    <>
      <path d="M12 4.5v11M8 12l4 4 4-4" />
      <path d="M4.5 17.5v2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2" />
    </>
  ),
  play: <path d="M7 5.2v13.6a.8.8 0 0 0 1.2.7l11-6.8a.8.8 0 0 0 0-1.4l-11-6.8A.8.8 0 0 0 7 5.2Z" />,
  pause: (
    <>
      <rect x="6.5" y="5" width="4" height="14" rx="1" />
      <rect x="13.5" y="5" width="4" height="14" rx="1" />
    </>
  ),
  next: (
    <>
      <path d="M6 5.5v13l9-6.5-9-6.5Z" />
      <path d="M17.5 5.5v13" />
    </>
  ),
  previous: (
    <>
      <path d="M18 5.5v13l-9-6.5 9-6.5Z" />
      <path d="M6.5 5.5v13" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
    </>
  ),
  masonry: (
    <>
      <rect x="3.5" y="3.5" width="7" height="10" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="6" rx="1.2" />
      <rect x="3.5" y="16" width="7" height="4.5" rx="1.2" />
      <rect x="13.5" y="12" width="7" height="8.5" rx="1.2" />
    </>
  ),
  timeline: (
    <>
      <path d="M5 4.5v15" />
      <circle cx="5" cy="8" r="1.6" />
      <circle cx="5" cy="14" r="1.6" />
      <path d="M9 8h10M9 14h10" />
    </>
  ),
  moon: <path d="M20 14.2A8.2 8.2 0 1 1 9.8 4a6.4 6.4 0 0 0 10.2 10.2Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </>
  ),
  filter: <path d="M4 5.5h16l-6 7.2v5l-4 2v-7L4 5.5Z" />,
  trash: (
    <>
      <path d="M5 7.5h14M9.5 7.5V5.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3V7.5" />
      <path d="M7 7.5 7.7 19a1.5 1.5 0 0 0 1.5 1.4h5.6A1.5 1.5 0 0 0 16.3 19l.7-11.5" />
    </>
  ),
  edit: <path d="M14.5 5.5 18.5 9.5 8 20H4v-4L14.5 5.5Z" />,
  more: (
    <>
      <circle cx="5.5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18.5" cy="12" r="1.4" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  chevronLeft: <path d="M15 5.5 8.5 12 15 18.5" />,
  chevronRight: <path d="M9 5.5 15.5 12 9 18.5" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 8v.01" />
    </>
  ),
  zoom: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19.5 19.5l-4.4-4.4M10.5 8v5M8 10.5h5" />
    </>
  ),
  fullscreen: <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" />,
  home: <path d="M4 11.5 12 4l8 7.5M6 10v8.5A1.5 1.5 0 0 0 7.5 20h9a1.5 1.5 0 0 0 1.5-1.5V10" />,
  volume: <path d="M4 9.5v5h3.5L13 19V5L7.5 9.5H4ZM16.5 8.5a5 5 0 0 1 0 7" />
}

export type IconName = keyof typeof paths

export function Icon({ name, size = 20, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  )
}
