import React from "react"

export function CardShell({
  children,
  className,
  href,
  ariaLabel,
}: {
  children: React.ReactNode
  className?: string
  href?: string
  ariaLabel?: string
}) {
  const base =
    "group relative h-full overflow-hidden rounded-2xl border border-hairline bg-surface transition-colors hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
  if (href) {
    return (
      <a
        href={href}
        aria-label={ariaLabel}
        className={`${base} ${className ?? ""}`}
      >
        {children}
      </a>
    )
  }
  return <div className={`${base} ${className ?? ""}`}>{children}</div>
}
