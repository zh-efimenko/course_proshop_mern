import React from 'react'

// Lucide-style line icons. Inline SVG — no extra dependency.
// Stroke 1.75, line caps round.

const Icon = ({ name, size = 20, strokeWidth = 1.75, className = '', label, ...rest }) => {
  const path = paths[name]
  if (!path) return null
  const a11y = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': 'true', focusable: 'false' }
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth={strokeWidth}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={className}
      {...a11y}
      {...rest}
    >
      {path}
    </svg>
  )
}

const paths = {
  search: <path d='M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.35-4.35' />,
  cart: <path d='M3 3h2l2.4 12.5a2 2 0 0 0 2 1.5h8.6a2 2 0 0 0 2-1.6L22 7H6M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' />,
  user: <path d='M20 21a8 8 0 1 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z' />,
  sun: <path d='M12 4V2m0 20v-2M4 12H2m20 0h-2m-2.5-7.5L19 3M5 19l-1.5 1.5M19 19l1.5 1.5M5 5L3.5 3.5M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z' />,
  moon: <path d='M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z' />,
  plus: <path d='M12 5v14M5 12h14' />,
  minus: <path d='M5 12h14' />,
  pencil: <path d='M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z' />,
  trash: <path d='M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' />,
  check: <path d='M5 13l4 4L19 7' />,
  x: <path d='M18 6 6 18M6 6l12 12' />,
  chevronDown: <path d='M6 9l6 6 6-6' />,
  chevronLeft: <path d='M15 18l-6-6 6-6' />,
  chevronRight: <path d='M9 18l6-6-6-6' />,
  flag: <path d='M4 22V4l8 2 8-2v12l-8 2-8-2V22' />,
  package: <path d='M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7zM3.3 7l8.7 5 8.7-5M12 22V12' />,
  truck: <path d='M1 3h15v13H1zM16 8h4l3 3v5h-7M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm13 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z' />,
  creditCard: <path d='M2 7h20v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7zM2 11h20' />,
  star: <path d='M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 18l-6.2 3 1.2-6.8L2 9.3l6.9-1L12 2z' fill='currentColor' />,
  starOutline: <path d='M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 18l-6.2 3 1.2-6.8L2 9.3l6.9-1L12 2z' />,
  starHalf: (
    <g>
      <path d='M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 18l-6.2 3 1.2-6.8L2 9.3l6.9-1L12 2z' />
      <path d='M12 2v16l-6.2 3 1.2-6.8L2 9.3l6.9-1L12 2z' fill='currentColor' stroke='none' />
    </g>
  ),
  arrowRight: <path d='M5 12h14M13 5l7 7-7 7' />,
  arrowLeft: <path d='M19 12H5M11 19l-7-7 7-7' />,
  upload: <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12' />,
  alertCircle: <path d='M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01' />,
  inbox: <path d='M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' />,
  filter: <path d='M3 4h18l-7 9v6l-4 2v-8L3 4z' />,
  refresh: <path d='M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5' />,
  external: <path d='M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3' />,
  eye: <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z' />,
  eyeOff: <path d='M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.78 19.78 0 0 1 5.06-5.94M9.9 4.24A11 11 0 0 1 12 4c7 0 11 8 11 8a19.83 19.83 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24M1 1l22 22' />,
}

export default Icon
