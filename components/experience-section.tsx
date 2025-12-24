"use client"

import { motion } from "framer-motion"
import { Briefcase } from "lucide-react"

const experiences = [

    {
        id: 1,
        role: "Frontend Developer",
        company: "Vertex Partners",
        period: "Apr 2025 - Oct 2025",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Google Maps", "React Hook Form", "Zod", "Shadcn UI", "Framer Motion", "visx/geo", "Next-intl", "Swr", "Recharts"],
    },
    {
        id: 2,
        role: "Fullstack Developer Volunteer",
        company: "Big Data Specialist",
        period: "Aug 2024 - present",
        technologies: ["Nextjs", "TypeScript", "Tailwind CSS", "React Hook Form", "Zod", "Tanstack Query", "Redux Toolkit", "Shadcn UI", "Recharts", "Java", "Spring Boot", "Go", "Gin", "Gorm", "MySQL", "Python", "Flask", "Playwright", "Github Actions", "Docker", "Scraping", "Gemeni AI", "GCP", "Cron Jobs", "Vercel", "Cloudfare"],
    },
    {
        id: 3,
        role: "Fullstack Developer Intern",
        company: "3E Tech",
        period: "Jan 2025 - Apr 2025",
        technologies: ["React", "TypeScript", "Tailwind CSS", "Shadcn UI", "React Router", "Tanstack Query", "React Hook Form", "Zod", "Redux Toolkit", "ExpressJs", "NodeJs", "NestJs", "Postgres", "Prisma"],
    },
    {
        id: 4,
        role: "Software Developer Intern",
        company: "Bracket Technologies",
        period: "May 2025 - Aug 2025",
        technologies: ["Bracket"],
    }
]

export function ExperienceSection() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1.0] as const,
            },
        },
    }

    return (
        <section className="pt-8 md:pt-12  relative">
            <div className="px-4 md:px-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative mb-6 md:mb-10"
                >
                    <div className="h-px bg-[#2a2a2a] mb-4 md:mb-6" />

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-4 md:w-6 h-px bg-[#404040]" />
                            <span className="text-mono text-[#737373]">experience</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#525252]" />
                            <div className="w-6 md:w-8 h-px bg-[#2a2a2a]" />
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
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-[#404040] via-[#2a2a2a] to-transparent hidden md:block" />

                    <div className="md:pl-6 space-y-0">
                        {experiences.map((experience, index) => (
                            <motion.div key={experience.id} variants={itemVariants}>
                                <div className={`group relative py-4 md:py-6 transition-all duration-300 ${index !== experiences.length - 1 ? 'border-b border-[#1a1a1a] hover:border-[#404040]' : ''}`}>
                                    {/* Timeline dot */}
                                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#2a2a2a] group-hover:bg-[#525252] rounded-full transition-colors duration-300 hidden md:block" />

                                    {/* Hover indicator line */}
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 group-hover:w-3 h-px bg-[#525252] transition-all duration-300 hidden md:block" />

                                    <div className="md:pl-4">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 md:gap-3 mb-1">
                                                    <h3 className="text-large font-normal text-[#fafafa] group-hover:text-white transition-colors duration-300">
                                                        {experience.role}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-2 mb-2 md:mb-3">
                                                    <span className="text-base text-[#a1a1a1]">{experience.company}</span>
                                                    <span className="text-[#404040]">•</span>
                                                    <span className="text-mono text-[#525252]">{experience.period}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Technologies */}
                                        <div className="flex flex-wrap gap-2 mt-3 md:mt-4">
                                            {experience.technologies.map((tech) => (
                                                <span
                                                    key={tech}
                                                    className="text-mono text-[#525252] group-hover:text-[#737373] transition-colors duration-300 px-2 py-0.5 border border-[#2a2a2a] group-hover:border-[#404040] rounded"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
