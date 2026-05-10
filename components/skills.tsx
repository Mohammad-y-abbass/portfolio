"use client";

import { Reveal } from "./reveal";
import { Layout, Database, Terminal, Cpu } from "lucide-react";

const SKILLS = [
  {
    category: "Programming Languages",
    icon: <Cpu className="size-4" />,
    items: ["JavaScript", "TypeScript", "Go", "Python", "SQL"],
  },
  {
    category: "Frontend",
    icon: <Layout className="size-4" />,
    items: ["React", "Next.js", "Tailwind"],
  },
  {
    category: "Backend",
    icon: <Terminal className="size-4" />,
    items: ["Node.js (NestJS, Express)", "Gin", "Flask"],
  },
  {
    category: "Databases",
    icon: <Database className="size-4" />,
    items: ["PostgreSQL", "MySQL"],
  },
  {
    category: "DevOps",
    icon: <Cpu className="size-4" />,
    items: ["Docker", "GCP", "vercel", "GitHub Actions", "CI/CD"],
  },
  {
    category: "Automated Testing",
    icon: <Database className="size-4" />,
    items: ["Vitest", "Playwright"],
  },
];

export function Skills() {
  return (
    <section
      id="skills"
      className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32"
    >
      <Reveal>
        <div className="flex flex-col gap-4 mb-16">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px w-8 bg-foreground/30" />
            <span>Technical</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight">
            Toolkit & Expertise
          </h2>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 auto-rows-fr">
        {SKILLS.map((group, idx) => (
          <Reveal key={group.category} delay={idx * 0.1}>
            <div className="h-full rounded-3xl border border-border bg-surface p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex items-center gap-3 mb-5">
                <div className="size-10 rounded-3xl bg-muted/10 border border-muted/20 flex items-center justify-center text-foreground">
                  {group.icon}
                </div>
                <div>
                  <p className="text-sm font-mono uppercase tracking-[0.3em] text-muted-foreground">
                    {group.category}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {group.items.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-border/80 bg-background/80 px-4 py-2 text-sm font-medium text-foreground/90"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
