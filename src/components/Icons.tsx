/** Иконки из макетов (stroke, currentColor). */
const base = {
  'aria-hidden': true,
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export const SearchIcon = () => (
  <svg {...base} width="18" height="18" viewBox="0 0 24 24" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)
export const TelegramIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...base} width={size} height={size} viewBox="0 0 24 24" strokeWidth="1.8">
    <path d="M21 4 3 11l6 2 2 6 3-4 5 4z" />
    <path d="m9 13 8-6" />
  </svg>
)
export const LinkedInIcon = () => (
  <svg {...base} width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
  </svg>
)
export const FacebookIcon = () => (
  <svg {...base} width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.8">
    <path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2z" />
  </svg>
)
export const LinkIcon = () => (
  <svg {...base} width="18" height="18" viewBox="0 0 24 24" strokeWidth="1.8">
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </svg>
)
export const WarningIcon = () => (
  <svg {...base} width="26" height="26" viewBox="0 0 24 24" strokeWidth="2">
    <path d="M12 3 2 20h20z" />
    <path d="M12 10v4M12 17v.01" />
  </svg>
)
export const CheckIcon = () => (
  <svg {...base} width="26" height="26" viewBox="0 0 24 24" strokeWidth="2">
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 3 3 5-6" />
  </svg>
)
