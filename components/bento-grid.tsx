"use client"

import { Reveal } from "./reveal"
import { ProjectCard } from "@/components/bento/project-card"
import { GitHubCard } from "@/components/bento/github-card"

export function BentoGrid({ githubData }: { githubData: any }) {
  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32"
    >
      {/* Section header */}
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
              <span className="h-px w-8 bg-foreground/30" />
              <span>Work</span>
            </div>
            <h2
              id="projects-heading"
              className="text-balance text-3xl md:text-5xl font-medium tracking-tight"
            >
              Some of the things I've built.
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md text-pretty">
            A deep dive into the systems and platforms I've architected, from database internals to AI-driven matching engines.
          </p>
        </div>
      </Reveal>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5 auto-rows-[minmax(180px,auto)]">
        {/* 01 — MoDB */}
        <Reveal className="md:col-span-4 md:row-span-1" delay={0.05}>
          <ProjectCard
            title="MoDB"
            summary="A persistent, SQL-compatible RDBMS built from scratch in Go. Features a custom storage engine with slotted-page architecture, a recursive descent parser, and support for Joins, Foreign Keys, and multi-database isolation."
            stack={["Go", "Data Structures", "Compilers", "Systems Engineering", "Storage Engine", "Networking"]}
            codeUrl="https://github.com/Mohammad-y-abbass/moDB"
            instructions="Clone the repository and run 'go run cmd/modb/main.go' to start the interactive SQL REPL."
          />
        </Reveal>

        {/* 02 — Mo Language */}
        <Reveal className="md:col-span-2 md:row-span-1" delay={0.1}>
          <ProjectCard
            title="Mo Language"
            summary="A minimalist, symbol-driven programming language that uses symbols instead of traditional keywords. Built with the Nearley toolkit, it transpiles to JavaScript to explore unconventional language design."
            stack={["JavaScript", "Transpilers", "AST", "Nearley.js"]}
            codeUrl="https://github.com/Mohammad-y-abbass/mo-programming-language"
            instructions="Clone the repo and run 'npm run build' to transpile and execute. Sample code in src/example/example.txt."
          />
        </Reveal>

        {/* 03 — Job Match Agent */}
        <Reveal className="md:col-span-3 md:row-span-1" delay={0.15}>
          <ProjectCard
            title="Job Match Agent"
            summary="A personal job-hunting assistant that scrapes job boards using Playwright and matches listings against my resume using semantic search. It leverages sentence-transformers and cosine similarity to find the most relevant opportunities."
            stack={["Python", "Sentence Transformers", "Flask", "Playwright"]}
            codeUrl="https://github.com/Mohammad-y-abbass/job-match-agent"
            instructions="Clone the repo, run 'pip install -r requirements.txt', then run 'python app.py'."
          />
        </Reveal>

        {/* 04 — JS Code Editor */}
        <Reveal className="md:col-span-3 md:row-span-1" delay={0.2}>
          <ProjectCard
            title="JS Code Editor"
            summary="A browser-based JavaScript and React code editor with live preview, built using React, Monaco Editor, and esbuild-wasm. It allows users to write, bundle, and run JSX code directly in the browser with support for npm imports and real-time execution."
            stack={["React", "TypeScript", "Monaco Editor", "EsBuild", "Caching", "Netlify"]}
            codeUrl="https://github.com/Mohammad-y-abbass/code-editor"
            liveUrl="https://online-js-code-editor.netlify.app/"
          />
        </Reveal>

        {/* 05 — Rapid Express */}
        <Reveal className="md:col-span-2 md:row-span-1" delay={0.25}>
          <ProjectCard
            title="Rapid Express"
            summary="A CLI tool for generating scalable class-based Express.js applications with TypeScript, Prisma, decorators, authentication, and built-in error handling. It reduces boilerplate and provides a structured backend architecture out of the box."
            stack={["Node.js", "TypeScript", "Express", "CLI", "NPM"]}
            codeUrl="https://github.com/Mohammad-y-abbass/rapid-express"
            liveUrl="https://www.npmjs.com/package/@mohammad-abbass/rapid-express"
          />
        </Reveal>

        {/* 06 — Solar System */}
        <Reveal className="md:col-span-2 md:row-span-1" delay={0.3}>
          <ProjectCard
            title="Solar System"
            summary="A 3D interactive solar system visualization built with Three.js, featuring realistic planet textures, orbital animations, moon systems, and immersive space environments with interactive camera controls."
            stack={["JavaScript", "Three.js", "Vite"]}
            codeUrl="https://github.com/Mohammad-y-abbass/solar-system"
            liveUrl="https://mini-solar-system.netlify.app/"
          />
        </Reveal>

        {/* 07 — React Img */}
        <Reveal className="md:col-span-2 md:row-span-1" delay={0.35}>
          <ProjectCard
            title="React Img"
            summary="A lightweight React component for lazy loading images with optional blurred placeholders, improving performance by loading images only when they enter the viewport. Built with Intersection Observer and designed for easy customization and seamless integration into React applications."
            stack={["React", "TypeScript", "NPM"]}
            codeUrl="https://github.com/Mohammad-y-abbass/react-img-component"
            liveUrl="https://www.npmjs.com/package/react-img-component"
          />
        </Reveal>

        {/* 08 — LearnDevs */}
        <Reveal className="md:col-span-3 md:row-span-1" delay={0.4}>
          <ProjectCard
            title="LearnDevs"
            summary="A developer-focused platform that curates programming courses, open-source projects, educational promotions, tech content, and remote job opportunities in one place. Learndevs helps developers discover reliable learning resources and career opportunities more efficiently."
            stack={["Next.js", "TypeScript", "TailwindCSS", "Golang", "Python", "Mysql", "Redux Toolkit", "Tanstack Query", "OpenAI", "Vercel", "GCP", "Cron Jobs", "Web Scrapping", "Docker", "Github Actions", "Vitest", "Playwright"]}
            codeUrl="https://github.com/mohammad-y-abbass"
            liveUrl="learndevs.com"
            privateCode
          />
        </Reveal>

        {/* 09 — Places4Students */}
        <Reveal className="md:col-span-3 md:row-span-1" delay={0.45}>
          <ProjectCard
            title="Places4Students"
            summary="An off-campus housing platform that connects students with verified rental listings near universities across North America. It provides students with a simple and effective way to find off-campus housing options that fit their needs and preferences, while also helping landlords and property managers reach their target audience."
            stack={["Next.js", "TypeScript", "TailwindCSS", "Vercel", "Github Actions", "React Hook Form", "Zod", "Google Maps Api"
            ]}
            codeUrl="https://github.com/mohammad-y-abbass"
            liveUrl="places4students.com"
            privateCode
          />
        </Reveal>

        {/* GitHub Activity */}
        <Reveal className="md:col-span-6 md:row-span-2" delay={0.5}>
          <GitHubCard data={githubData} />
        </Reveal>
      </div>
    </section>
  )
}
