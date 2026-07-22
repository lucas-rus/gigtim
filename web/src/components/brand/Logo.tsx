import React from 'react'

/**
 * GigTim logo mark — "Zori" (Romanian for dawn).
 * A rising sun whose face is also a clock: dawn (zori) + shift time (gig work).
 * Strokes use currentColor so the mark adapts to any foreground token.
 */
export function LogoMark({
  size = 28,
  className,
  strokeWidth = 1.9,
}: {
  size?: number
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      {/* sun / clock half-disc */}
      <path
        d="M7.4 15.2a4.6 4.6 0 0 1 9.2 0"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      {/* clock hands */}
      <path
        d="M12 15.2v-3.1M12 15.2h2.4"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.85}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* dawn rays */}
      <path
        d="M12 5.4v1.9M6.6 7.2l1.3 1.3M17.4 7.2l-1.3 1.3"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.85}
        strokeLinecap="round"
      />
      {/* horizon */}
      <path
        d="M4.4 18.4h15.2"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Brand lockup: ember tile + white mark + "GigTim" wordmark.
 * Used in the sidebar, auth screens, and landing header.
 */
export function LogoTile({
  size = 40,
  className,
  withWordmark = false,
}: {
  size?: number
  className?: string
  withWordmark?: boolean
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <span
        className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25"
        style={{ width: size, height: size }}
      >
        <LogoMark size={Math.round(size * 0.66)} strokeWidth={2.1} />
      </span>
      {withWordmark && (
        <span className="font-heading text-xl font-extrabold tracking-tight text-foreground">
          GigTim
        </span>
      )}
    </span>
  )
}
