"use client"

import { useEffect, useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { ArrowUpRight } from "lucide-react"

export function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springX = useSpring(mouseX, { stiffness: 80, damping: 18, mass: 0.6 })
  const springY = useSpring(mouseY, { stiffness: 80, damping: 18, mass: 0.6 })

  const headingX = useTransform(springX, (v) => v * 18)
  const headingY = useTransform(springY, (v) => v * 12)
  const subX = useTransform(springX, (v) => v * -8)
  const subY = useTransform(springY, (v) => v * -5)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const rect = ref.current?.getBoundingClientRect()
      if (!rect) return
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      mouseX.set(x)
      mouseY.set(y)
    }
    const onLeave = () => {
      mouseX.set(0)
      mouseY.set(0)
    }
    const node = ref.current
    node?.addEventListener("mousemove", onMove)
    node?.addEventListener("mouseleave", onLeave)
    return () => {
      node?.removeEventListener("mousemove", onMove)
      node?.removeEventListener("mouseleave", onLeave)
    }
  }, [mouseX, mouseY])

  return (
    <section
      id="top"
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden>
        {/* Mouse Spotlight */}
        <motion.div
          className="absolute inset-0 opacity-[0.2] dark:opacity-[0.3]"
          style={{
            background: useTransform(
              [springX, springY],
              ([x, y]) =>
                `radial-gradient(350px circle at ${50 + (x as number) * 50}% ${50 + (y as number) * 50}%, var(--brand), transparent)`
            ),
          }}
        />

        {/* Animated Ambient Blobs (Smaller) */}
        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-brand/[0.08] dark:bg-brand/[0.12] blur-[80px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-[10%] right-[10%] w-[25%] h-[25%] rounded-full bg-brand/[0.08] dark:bg-brand/[0.12] blur-[80px]"
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 grid-pattern opacity-[0.3] dark:opacity-[0.5] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />
      </div>

      <div className="relative mx-auto max-w-7xl w-full px-6 lg:px-10 mt-24 lg:mt-0 lg:py-24">
        {/* Top eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center gap-3 font-mono text-xs text-muted-foreground mb-6"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-brand opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full size-2 bg-brand" />
          </span>
          <span>Available for new opportunities</span>
        </motion.div>

        {/* Headline with mouse parallax */}
        <motion.h1
          style={{ x: headingX, y: headingY }}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="text-balance text-[clamp(2.5rem,7.5vw,6.5rem)] font-medium tracking-[-0.04em] leading-[1.02] max-w-[14ch]"
        >
          I build <span className="text-muted-foreground">high performance</span>{" "}
          full stack systems.
        </motion.h1>

        <motion.div
          style={{ x: subX, y: subY }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className="mt-6 max-w-2xl"
        >
          <p className="text-pretty text-lg md:text-xl text-muted-foreground leading-relaxed">
            Full Stack Developer with proven ability to design and deploy production systems using TypeScript, Go, Node.js, and GCP.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <a
            href="#projects"
            className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-foreground/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            View work
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-5 py-2.5 text-sm font-medium text-foreground hover:border-foreground/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Get in touch
          </a>
        </motion.div>

        {/* Footer meta strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
        >
          <div>
            <div className="text-foreground/40 mb-1.5">01 / Domain</div>
            <div className="text-foreground normal-case tracking-tight font-sans text-sm">
              Full Stack &amp; Data
            </div>
          </div>
          <div>
            <div className="text-foreground/40 mb-1.5">02 / Years</div>
            <div className="text-foreground normal-case tracking-tight font-sans text-sm">
              2+ shipping
            </div>
          </div>
          <div>
            <div className="text-foreground/40 mb-1.5">03 / Stack</div>
            <div className="text-foreground normal-case tracking-tight font-sans text-sm">
              Go · NodeJs · TypeScript
            </div>
          </div>
          <div>
            <div className="text-foreground/40 mb-1.5">04 / Based in</div>
            <div className="text-foreground normal-case tracking-tight font-sans text-sm">
              Beirut, LB
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
