import { motion } from "framer-motion"
import { CardShell } from "./card-shell"

const TECH_TAGS = [
  { label: "Go", x: -8, y: -4 },
  { label: "TypeScript", x: 12, y: 6 },
  { label: "JavaScript", x: -14, y: 8 },
  { label: "Python", x: 6, y: -10 },
  { label: "Next.js", x: -4, y: 14 },
  { label: "React", x: 16, y: -2 },
  { label: "Node.js", x: -10, y: -8 },
  { label: "PostgreSQL", x: 8, y: 12 },
  { label: "MySQL", x: -16, y: 4 },
  { label: "GCP", x: 14, y: -12 },
  { label: "Docker", x: 0, y: 8 },
  { label: "Playwright", x: -6, y: -14 },
]

export function TechStackCard() {
  return (
    <CardShell className="p-6 md:p-7 flex flex-col">
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
        <span className="size-1.5 rounded-full bg-foreground/40" />
        Stack
      </div>
      <h3 className="text-lg font-medium tracking-tight">
        Tools I reach for daily.
      </h3>

      <div className="relative flex-1 mt-4 -mx-2">
        <div className="flex flex-wrap gap-1.5 px-2">
          {TECH_TAGS.map((tag, i) => (
            <motion.span
              key={tag.label}
              initial={{ x: 0, y: 0 }}
              animate={{
                x: [0, tag.x * 0.5, 0, tag.x * -0.5, 0],
                y: [0, tag.y * 0.5, tag.y, tag.y * 0.5, 0],
              }}
              transition={{
                duration: 8 + (i % 4),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2,
              }}
              className="inline-flex items-center font-mono text-[11px] rounded-full border border-hairline bg-background px-2.5 py-1 text-foreground hover:border-foreground/40 transition-colors"
            >
              {tag.label}
            </motion.span>
          ))}
        </div>
      </div>
    </CardShell>
  )
}
