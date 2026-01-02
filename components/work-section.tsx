"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { useState } from "react"

const projects = [
    {
        id: 0,
        title: "Mo Programming Language",
        description: "As an experimental graduation project, I built a custom dynamically typed programming language from the ground up, motivated by a deep curiosity about how programming languages work beneath the surface. Through this project, I explored language design by defining the grammar and implementing a parser with nearley.js to generate an Abstract Syntax Tree (AST), then translating that structure into optimized, executable JavaScript via a custom-built transpiler compatible with the Node.js runtime. The experience gave me hands-on insight into the full lifecycle of a programming language, from syntax design to execution.",
        link: "https://github.com/Mohammad-y-abbass/mo-programming-language",
        technologies: ["JavaScript", "Node.js", "Nearley.js", "Transpiler", "AST"],
    },
    {
        id: 1,
        title: "Job Matching Agent",
        description: "I built a personal automated job-matching tool to save time filtering through irrelevant postings. It scrapes job listings in parallel from ~10 different websites, reducing total scrape time, then extracts and cleans job titles and descriptions. Each job is embedded using a Sentence-Transformers model (all-MiniLM-L6-v2) and matched against my resume using cosine similarity, allowing semantic comparison instead of simple keyword rules. The system maintains history to avoid reprocessing seen jobs and continuously surfaces the most relevant opportunities based on actual role requirements and experience alignment.",
        link: "https://github.com/Mohammad-y-abbass/job-match-agent",
        technologies: ["Python", "Flask", "Sentence Transformers", "Playwright"],
    },
    {
        id: 2,
        title: "Places4Students",
        description: "Built the frontend of Places4Students using Next.js and TypeScript with a modular architecture and strong type safety, integrating Google Maps API and visx/geo for interactive property searches, geolocation-based filtering, and dynamic visualizations. Implemented authentication and authorization workflows for students, landlords, and admins with secure session handling, applied multilingual support using next-intl, and optimized frontend performance to reduce load times and improve dashboard responsiveness across devices.",
        link: "https://www.places4students.com/",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Google Maps API", "Visx/Geo", "React Hook Form", "Zod", "Swr", "Shadcn UI", "Next-Intl", "Recharts", "Framer Motion"],
    },
    {
        id: 4,
        title: "Rapid Express",
        description: "Engineered a globally-installed CLI tool to automate Express.js app scaffolding, enabling rapid generation of production-ready APIs with a single command. Designed a scalable folder architecture with built-in decorators and error-handling middleware, reducing initial developer setup time by 70%, and published it on npm, achieving 1,200+ downloads and providing a valuable resource for the developer community.",
        link: "https://www.npmjs.com/package/@mohammad-abbass/rapid-express",
        technologies: ["Node.js", "Express.js", "TypeScript", "NPM"],
    },
    {
        id: 5,
        title: "Online JavaScript Code Editor",
        description: "Built an online JavaScript code editor using TypeScript and the Monaco Editor, integrating Prettier for real-time code formatting and esbuild for fast bundling. Enabled package imports with caching for improved performance, and developed a custom esbuild plugin to seamlessly redirect npm package imports to unpkg, creating a fully-featured, browser-based development environment.",
        link: "https://online-react-code-editor.netlify.app/",
        technologies: ["TypeScript", "Monaco Editor", "Prettier", "esbuild"],
    },
    {
        id: 6,
        title: "React Image Component",
        description: "react‑img‑component — A lightweight, responsive React image component that enhances image loading performance by lazy‑loading images only when they enter the viewport, optionally showing a blurred placeholder while the actual image loads. It uses the browser’s Intersection Observer API for efficient visibility detection and supports passing through standard image props such as className and style, making it easy to integrate into modern React applications.",
        link: "https://www.npmjs.com/package/react-img-component",
        technologies: ["React", "TypeScript", "CSS", "NPM", "Intersection Observer API"],
    },
]

export function WorkSection() {
    const [hoveredId, setHoveredId] = useState<number | null>(null)

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.06,
                delayChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1.0] as const,
            },
        },
    }

    return (
        <section className="py-8 md:py-12 relative">
            <div className="px-4 md:px-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative mb-6 md:mb-10"
                >
                    <div className="h-px bg-line mb-4 md:mb-6" />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-4 md:w-6 h-px bg-line-accent" />
                            <span className="text-mono text-foreground-subtle">projects</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-line-accent rounded-full" />
                            <div className="w-6 md:w-8 h-px bg-line" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="relative"
                >
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-line-accent via-line to-transparent hidden md:block" />

                    <div className="md:pl-6">
                        {projects.map((project, index) => (
                            <motion.div key={project.id} variants={itemVariants}>
                                <div
                                    className={`group relative py-3 md:py-4 transition-all duration-300 ${index !== projects.length - 1 ? 'border-b border-line hover:border-line-hover' : ''}`}
                                    onMouseEnter={() => setHoveredId(project.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                >
                                    {/* Hover indicator line */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 group-hover:w-3 h-px bg-line-accent transition-all duration-300 hidden md:block" />

                                    <a
                                        href={project.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block md:pl-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 md:gap-4">
                                                <span className="text-large font-normal text-foreground group-hover:text-foreground transition-colors duration-300">
                                                    {project.title}
                                                </span>
                                                <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-foreground-subtle group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                                            </div>
                                        </div>

                                        {/* Hover details box */}
                                        <AnimatePresence>
                                            {hoveredId === project.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
                                                    className="overflow-hidden mt-3"
                                                >
                                                    <div className="p-3 md:p-4 bg-secondary/30 border border-line rounded-lg">
                                                        <p className="text-sm text-foreground-muted mb-3">
                                                            {project.description}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {project.technologies.map((tech) => (
                                                                <span
                                                                    key={tech}
                                                                    className="text-mono text-xs text-foreground-subtle px-2 py-1 border border-line rounded bg-secondary/50"
                                                                >
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
