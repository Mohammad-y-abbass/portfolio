"use client"

import { Github, Linkedin, Mail } from "lucide-react"
import { Reveal } from "./reveal"

const SOCIALS = [
  { label: "Email", href: "mailto:mhmd.y.abbass@gmail.com", Icon: Mail },
  { label: "GitHub", href: "https://github.com/mohammad-y-abbass", Icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/in/mohammad-abbass/", Icon: Linkedin },
]

export function Contact() {
  return (
    <footer
      id="contact"
      aria-labelledby="contact-heading"
      className="relative border-t border-hairline"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-40">
        <Reveal>
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground mb-8 justify-center">
            <span className="h-px w-8 bg-foreground/30" />
            <span>Contact</span>
            <span className="h-px w-8 bg-foreground/30" />
          </div>
        </Reveal>

        <Reveal>
          <h2
            id="contact-heading"
            className="text-center text-balance text-[clamp(2.25rem,7vw,5.5rem)] font-medium tracking-[-0.04em] leading-[1.02] max-w-5xl mx-auto"
          >
            Let&apos;s build something{" "}
            <span className="text-muted-foreground">together.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 text-center text-muted-foreground text-pretty max-w-xl mx-auto">
            I&apos;m taking on a small number of engagements in 2026: from
            systems level R&amp;D to high craft frontend work. If that sounds
            like your thing, say hi.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
            {SOCIALS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  aria-label={`${label} (opens in new tab)`}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/* Footer baseline */}
      <div className="border-t border-hairline">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <span>© {new Date().getFullYear()} Mohammad Abbas</span>
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-brand" />
            Designed &amp; built in Beirut
          </span>
        </div>
      </div>
    </footer>
  )
}
