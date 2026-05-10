"use client"

import { useEffect, useRef, useState } from "react"
import { Github, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Contribution {
  date: string
  count: number
}

interface GitHubData {
  total: Record<string, number>
  contributions: Contribution[]
}

function getStats(year: string, contributions: Contribution[], total: number) {
  const days = contributions
    .filter((d) => d.date.startsWith(year))
    .sort((a, b) => a.date.localeCompare(b.date))

  const active = days.filter((d) => d.count > 0).length
  let max = 0,
    cur = 0,
    last: string | null = null

  days.forEach((d) => {
    if (d.count > 0) {
      if (last) {
        const p = new Date(last)
        p.setDate(p.getDate() + 1)
        cur = p.toISOString().split("T")[0] === d.date ? cur + 1 : 1
      } else {
        cur = 1
      }
      max = Math.max(max, cur)
      last = d.date
    } else {
      cur = 0
    }
  })

  return {
    active,
    streak: max,
    avg: active ? Math.round(total / active) : 0,
  }
}

function buildAmplitudes(year: string, contributions: Contribution[]) {
  const days = contributions.filter((d) => d.date.startsWith(year))
  const counts = days.map((d) => d.count)
  const max = Math.max(...counts, 1)
  return counts.map((c) => c / max)
}

function getMonthRange(year: string, contributions: Contribution[]) {
  const days = contributions.filter((d) => d.date.startsWith(year))
  if (!days.length) return ""
  const fmt = (ds: string) => new Date(ds).toLocaleString("en", { month: "short" })
  return `${fmt(days[0].date)} — ${fmt(days[days.length - 1].date)}`
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function WaveCanvas({ amplitudes }: { amplitudes: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const currentAmpsRef = useRef<number[]>([])
  const targetAmpsRef = useRef<number[]>(amplitudes)
  const phaseRef = useRef(0)

  useEffect(() => {
    targetAmpsRef.current = amplitudes

    if (
      currentAmpsRef.current.length === 0 ||
      currentAmpsRef.current.length !== amplitudes.length
    ) {
      currentAmpsRef.current = amplitudes.map(() => 0)
    }
  }, [amplitudes])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    function draw() {
      if (!canvas || !ctx) return
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      const current = currentAmpsRef.current
      const target = targetAmpsRef.current
      const n = current.length
      if (!n) {
        animRef.current = requestAnimationFrame(draw)
        return
      }

      phaseRef.current += 0.018
      const phase = phaseRef.current
      const midY = H / 2
      const step = W / n

      const getY = (i: number, sign: 1 | -1) => {
        const wobble = Math.sin(phase + i * 0.22) * 0.06
        return midY + sign * (current[i] + wobble) * (midY * 0.85)
      }

      // Filled area
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const x = i * step
        const y = getY(i, -1)
        if (i === 0) ctx.moveTo(x, y)
        else {
          const px = (i - 1) * step
          const cpx = (px + x) / 2
          ctx.bezierCurveTo(cpx, getY(i - 1, -1), cpx, y, x, y)
        }
      }
      for (let i = n - 1; i >= 0; i--) {
        const x = i * step
        const y = getY(i, 1)
        const px = (i + 1) * step
        if (i === n - 1) ctx.lineTo(x, y)
        else {
          const cpx = (px + x) / 2
          ctx.bezierCurveTo(cpx, getY(i + 1, 1), cpx, y, x, y)
        }
      }
      ctx.closePath()
      ctx.fillStyle = "rgba(29,158,117,0.08)"
      ctx.fill()

      // Top line
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const x = i * step
        const y = getY(i, -1)
        if (i === 0) ctx.moveTo(x, y)
        else {
          const px = (i - 1) * step
          const cpx = (px + x) / 2
          ctx.bezierCurveTo(cpx, getY(i - 1, -1), cpx, y, x, y)
        }
      }
      ctx.strokeStyle = "#1D9E75"
      ctx.lineWidth = 1.2
      ctx.stroke()

      // Bottom mirror line
      ctx.beginPath()
      for (let i = 0; i < n; i++) {
        const x = i * step
        const y = getY(i, 1)
        if (i === 0) ctx.moveTo(x, y)
        else {
          const px = (i - 1) * step
          const cpx = (px + x) / 2
          ctx.bezierCurveTo(cpx, getY(i + 1, 1), cpx, y, x, y)
        }
      }
      ctx.strokeStyle = "rgba(29,158,117,0.3)"
      ctx.lineWidth = 0.8
      ctx.stroke()

      // Lerp toward target
      for (let i = 0; i < n; i++) {
        current[i] = lerp(current[i], target[i] ?? 0, 0.06)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={90}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  )
}

export function GitHubCard({ data }: { data: GitHubData }) {
  const years = Object.keys(data.total).sort().filter((y) => y !== "2023")
  const [selectedYear, setSelectedYear] = useState(years[years.length - 1] ?? "2026")

  const total = data.total[selectedYear] ?? 0
  const { active, streak, avg } = getStats(selectedYear, data.contributions, total)
  const amplitudes = buildAmplitudes(selectedYear, data.contributions)
  const monthRange = getMonthRange(selectedYear, data.contributions)

  return (
    <a
      href="https://github.com/mohammad-y-abbass"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub contribution activity"
      style={{
        display: "block",
        textDecoration: "none",
        background: "var(--card)",
        border: "0.5px solid var(--hairline)",
        borderRadius: 16,
        padding: "22px 20px 18px",
        fontFamily: "var(--font-mono, monospace)",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        width: "100%",
      }}
    >
      {/* Scanline */}
      <style>{`
        @keyframes scan { 0% { top: 0 } 100% { top: 100% } }
        @keyframes pulse-dot { 0%,100% { opacity:1 } 50% { opacity:0.2 } }
        .ghw-scan { position:absolute;left:0;right:0;height:1px;background:var(--brand);opacity:0.15;animation:scan 4s linear infinite; }
        .ghw-live-dot { width:5px;height:5px;border-radius:50%;background:var(--brand);animation:pulse-dot 1.5s infinite; }
      `}</style>
      <div className="ghw-scan" />

      {/* Top row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 500,
              color: "var(--foreground)",
              lineHeight: 1,
              fontFamily: "var(--font-sans, sans-serif)",
            }}
          >
            {total.toLocaleString()}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "var(--muted-foreground)",
              letterSpacing: "0.15em",
              marginTop: 5,
            }}
          >
            contributions · {selectedYear}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 9,
              letterSpacing: "0.15em",
              color: "var(--brand)",
              marginBottom: 8,
            }}
          >
            <div className="ghw-live-dot" />
            live
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            {years.map((y) => (
              <button
                key={y}
                onClick={(e) => {
                  e.preventDefault()
                  setSelectedYear(y)
                }}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: `1px solid ${y === selectedYear ? "var(--brand)" : "transparent"}`,
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  padding: "2px 0",
                  color: y === selectedYear ? "var(--brand)" : "var(--muted-foreground)",
                }}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Wave */}
      <div style={{ position: "relative", height: 90, marginBottom: 14 }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: "0.5px",
            background: "var(--hairline)",
          }}
        />
        <WaveCanvas amplitudes={amplitudes} />
      </div>

      {/* Bottom row */}
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { val: active, lbl: "active days" },
            { val: `${streak}d`, lbl: "best streak" },
            { val: avg, lbl: "avg / day" },
          ].map(({ val, lbl }) => (
            <div key={lbl} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--foreground)",
                  opacity: 0.8,
                  fontWeight: 500,
                  fontFamily: "var(--font-sans, sans-serif)",
                }}
              >
                {val}
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: "var(--muted-foreground)",
                  letterSpacing: "0.1em",
                }}
              >
                {lbl}
              </span>
            </div>
          ))}
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <div style={{ fontSize: 9, color: "var(--muted-foreground)", letterSpacing: "0.05em" }}>
            {monthRange}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 rounded-full text-[10px] uppercase tracking-wider font-mono border-border/40 hover:bg-foreground hover:text-background transition-all"
          >
            View Profile <ArrowUpRight className="ml-1 size-2.5" />
          </Button>
        </div>
      </div>
    </a>
  )
}
