"use client"

import { Briefcase } from "lucide-react"
import { Reveal } from "./reveal"

type Role = {
  company: string
  role: string
  period: string
  location: string
  summary: string
  highlights: string[]
  stack: string[]
  current?: boolean
}

const ROLES: Role[] = [
  {
    company: "Big Data Specialist (Volunteer)",
    role: "Full Stack Developer",
    period: "08/2024 to Present",
    location: "Remote",
    summary:
      "Designing and deploying LearnDevs, a unified developer hub aggregating programming courses, tech news, and remote jobs.",
    highlights: [
      "Built fully automated background job system using cron-based scheduling to ingest tech news, remote jobs, and GitHub repositories daily.",
      "Engineered scalable data pipelines using Python and Playwright to aggregate 20,000+ records with fault tolerant processing.",
      "Implemented CI/CD pipelines with GitHub Actions and containerized deployment workflows for reliable production releases.",
      "Integrated Cloudflare to optimize global performance and system availability.",
    ],
    stack: ["Next.js", "Go", "Python", "GCP", "Docker"],
    current: true,
  },
  {
    company: "Vertex Partners",
    role: "Frontend Developer",
    period: "04/2025 to 10/2025",
    location: "Remote",
    summary:
      "Optimized frontend performance and user experience for a high traffic student housing platform.",
    highlights: [
      "Achieved Lighthouse performance scores of 90+ through systematic optimization and modern Next.js patterns.",
      "Designed scalable UI systems for complex dashboards and map-based interfaces with efficient state management.",
      "Collaborated in agile cycles with backend and product teams to deliver production ready features.",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind"],
  },
  {
    company: "3E Tech",
    role: "Full Stack Developer Intern",
    period: "01/2025 to 04/2025",
    location: "Beirut · Hybrid",
    summary:
      "Developed full-stack features for LMS and property management platforms using React and NestJS.",
    highlights: [
      "Managed complex client state using Redux Toolkit, significantly improving maintainability of large scale UI workflows.",
      "Optimized backend services and PostgreSQL queries using Prisma ORM, reducing API response time by ~25%.",
      "Implemented role based access control and secure validation pipelines across all backend services.",
    ],
    stack: ["React", "TypeScript", "NestJS", "PostgreSQL", "Prisma"],
  },
  {
    company: "Bracket Technologies",
    role: "Software Developer",
    period: "2024",
    location: "Beirut",
    summary:
      "Contributed to high performance search and filtering systems for travel platforms.",
    highlights: [
      "Built a robust search system for flight and hotel listings, focusing on performance and accuracy.",
      "Designed secure backend authentication and role based access control workflows.",
      "Collaborated in a high load environment to ensure system reliability and consistent performance.",
    ],
    stack: ["JavaScript", "Node.js", "SQL"],
  },
]

export function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32"
    >
      {/* Section header */}
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
              <span className="h-px w-8 bg-foreground/30" />
              <span>Career · 2024 to Present</span>
            </div>
            <h2
              id="experience-heading"
              className="text-balance text-3xl md:text-5xl font-medium tracking-tight"
            >
              Building scalable systems and high performance products.
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md text-pretty">
            Two years of building full stack applications, from data intensive pipelines to polished frontend experiences.
          </p>
        </div>
      </Reveal>

      {/* Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
        {/* Roles list */}
        <div className="md:col-span-9 relative">
          {/* Rail */}
          <div
            aria-hidden
            className="absolute left-[7px] top-2 bottom-2 w-px bg-hairline md:left-[7px]"
          />

          <ol className="flex flex-col gap-10 md:gap-12">
            {ROLES.map((role, i) => (
              <Reveal as="li" key={role.company} delay={i * 0.05}>
                <RoleEntry role={role} />
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function RoleEntry({ role }: { role: Role }) {
  return (
    <article className="relative pl-8 md:pl-10 group">
      {/* Dot */}
      <span
        aria-hidden
        className="absolute left-0 top-1.5 grid place-items-center size-[15px]"
      >
        <span
          className={`size-[15px] rounded-full border-2 ${
            role.current
              ? "border-brand bg-background"
              : "border-hairline bg-background group-hover:border-foreground/40 transition-colors"
          }`}
        />
        {role.current && (
          <>
            <span className="absolute size-[7px] rounded-full bg-brand" />
            <span className="absolute size-[15px] rounded-full bg-brand/30 animate-ping" />
          </>
        )}
      </span>

      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 md:gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xl md:text-2xl font-medium tracking-tight text-balance">
              {role.company}
            </h3>
            {role.current && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-brand">
                <span className="size-1 rounded-full bg-brand" />
                Current
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm md:text-base text-muted-foreground">
            {role.role}
          </p>
        </div>

        <div className="font-mono text-[11px] text-muted-foreground tabular-nums whitespace-nowrap flex md:flex-col md:items-end gap-2 md:gap-0.5">
          <span className="text-foreground">{role.period}</span>
          <span className="md:text-[10px]">{role.location}</span>
        </div>
      </div>

      {/* Body */}
      <p className="mt-4 text-sm md:text-base text-foreground/80 text-pretty max-w-2xl">
        {role.summary}
      </p>

      <ul className="mt-4 space-y-2">
        {role.highlights.map((h) => (
          <li
            key={h}
            className="relative pl-4 text-sm text-muted-foreground text-pretty max-w-2xl"
          >
            <span
              aria-hidden
              className="absolute left-0 top-2 size-1 rounded-full bg-foreground/40"
            />
            {h}
          </li>
        ))}
      </ul>

      {/* Stack tags */}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {role.stack.map((s) => (
          <span
            key={s}
            className="font-mono text-[11px] rounded-full border border-hairline bg-surface px-2 py-0.5 text-muted-foreground"
          >
            {s}
          </span>
        ))}
      </div>
    </article>
  )
}
