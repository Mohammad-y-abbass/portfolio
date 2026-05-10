"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowDownToLine } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact" },
]

export function SiteHeader() {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-0 inset-x-0 z-50 transition-all duration-300"
    >
      <nav
        aria-label="Primary"
        className="mx-auto max-w-7xl flex items-center justify-between px-6 lg:px-10 h-16"
      >
        {/* Logo / Wordmark */}
        <a
          href="#top"
          aria-label="Home"
          className="flex items-center gap-2 group"
        >
          <span
            aria-hidden
            className="grid place-items-center h-8 w-8 rounded-md bg-foreground text-background font-mono text-[13px] font-medium"
          >
            MA
          </span>
          <span className="hidden sm:flex flex-col leading-none">
            <span className="text-sm font-medium tracking-tight">
              Mohammad Abbas
            </span>
            <span className="text-[11px] font-mono text-muted-foreground mt-0.5">
              full stack systems
            </span>
          </span>
        </a>

        {/* Center nav */}
        <ul className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right side: theme toggle + resume CTA */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="/resume.pdf"
            download
            aria-label="Download resume PDF"
            className="shimmer-border relative inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="hidden sm:inline">Download Resume</span>
            <span className="sm:hidden">Resume</span>
            <ArrowDownToLine className="size-3.5" aria-hidden />
          </a>
        </div>
      </nav>
    </motion.header>
  )
}
