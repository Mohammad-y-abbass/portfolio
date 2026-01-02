"use client"

import { motion } from "framer-motion"

const skills = [
    { category: "Programming Languages", items: ["JavaScript", "TypeScript", "C", "C#", "Java", "Python", "Go", "SQL", "NoSQL"] },
    { category: "Frameworks & Libraries", items: ["React.js", "Next.js", "Angular", "Express.js", "Nest.js", "Spring Boot", "Flask", "Tailwind"] },
    { category: "Databases & ORMs", items: ["PostgreSQL", "MySQL", "MongoDB", "Prisma", "Hibernate", "JPA"] },
    { category: "Tools", items: ["Git", "GitHub", "GitHub Actions", "Docker", "Playwright"] },
    { category: "Runtime Environment", items: ["Node.js"] },
]

export function SkillsSection() {
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
                            <span className="text-mono text-foreground-subtle">skills</span>
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

                    <div className="md:pl-6 space-y-6 md:space-y-8">
                        {skills.map((skillGroup) => (
                            <motion.div key={skillGroup.category} variants={itemVariants}>
                                <div className="group relative">
                                    <div className="flex flex-col gap-3 md:gap-4">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            <div className="w-2 h-2 md:w-2.5 md:h-2.5 border border-line-accent rounded-full group-hover:bg-line-accent transition-colors duration-300" />
                                            <h3 className="text-large font-normal text-foreground">{skillGroup.category}</h3>
                                        </div>

                                        <div className="flex flex-wrap gap-2 md:gap-3 ml-5 md:ml-6">
                                            {skillGroup.items.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="px-3 py-1.5 md:px-4 md:py-2 text-base text-foreground-muted bg-secondary/50 border border-line rounded-md hover:border-line-accent hover:text-foreground transition-all duration-300"
                                                >
                                                    {skill}
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
