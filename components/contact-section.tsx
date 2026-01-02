"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { ArrowUpRight, Copy, Check } from "lucide-react"

const links = [
    { label: "Email", value: "mhmd.y.abbass@gmail.com", href: "mailto:mhmd.y.abbass@gmail.com", copyable: true },
    { label: "GitHub", value: "Mohammad-y-abbass", href: "https://github.com/Mohammad-y-abbass" },
    { label: "LinkedIn", value: "mohammad-abbass", href: "https://www.linkedin.com/in/mohammad-abbass/" },
]

const asciiArt = `
                       .,,uod8B8bou,,.
              ..,uod8BBBBBBBBBBBBBBBBRPFT?l!i:.
         ,=m8BBBBBBBBBBBBBBBRPFT?!||||||||||||||
         !...:!TVBBBRPFT||||||||||!!^^""'   ||||
         !.......:!?|||||!!^^""'            ||||
         !.........||||                     ||||
         !.........||||  ##                 ||||
         !.........||||                     ||||
         !.........||||                     ||||
         !.........||||                     ||||
         !.........||||                     ||||
         !.........||||                    ,||||
          .;.......||||               _.-!!|||||
   .,uodWBBBBb.....||||       _.-!!|||||||||!:'
!YBBBBBBBBBBBBBBb..!|||:..-!!|||||||!iof68BBBBBb....
!..YBBBBBBBBBBBBBBb!!||||||||!iof68BBBBBBRPFT?!::   .
!....YBBBBBBBBBBBBBBbaaitf68BBBBBBRPFT?!:::::::::     .
!......YBBBBBBBBBBBBBBBBBBBRPFT?!::::::;:!^"';:::      .
!........YBBBBBBBBBBRPFT?!::::::::::^''...::::::;         iBBbo.
!..........YBRPFT?!::::::::::::::::::::::::;iof68bo.      WBBBBbo.
  ..........:::::::::::::::::::::::;iof688888888888b.     'YBBBP^'
    ........::::::::::::::::;iof688888888888888888888b.     '
      ......:::::::::;iof688888888888888888888888888888b.
        ....:::;iof688888888888888888888888888888888899fT!
          ..::!8888888888888888888888888888888899fT|!^"'
            ' !!988888888888888888888888899fT|!^"'
                !!8888888888888888899fT|!^"'
                  !988888888899fT|!^"'
                    !9899fT|!^"'
                      !^"'
`

export function ContactSection() {
    const [copied, setCopied] = useState(false)

    const copyEmail = () => {
        navigator.clipboard.writeText("mhmd.y.abbass@gmail.com")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

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
        hidden: { opacity: 0, x: -10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1.0] as const,
            },
        },
    }

    return (
        <section className="py-8 pb-12 md:py-12 md:pb-16 relative">
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
                            <span className="text-mono text-foreground-subtle">contact</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-line-accent rounded-full" />
                            <div className="w-6 md:w-8 h-px bg-line" />
                        </div>
                    </div>
                </motion.div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-12">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="relative flex-1"
                    >
                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-line-accent via-line to-transparent hidden md:block" />

                        <div className="md:pl-6 space-y-2">
                            {links.map((link) => (
                                <motion.div
                                    key={link.label}
                                    variants={itemVariants}
                                    className="group flex items-center justify-between py-2.5 md:py-3 border-b border-line hover:border-line-hover transition-colors duration-300 md:pl-4"
                                >
                                    {link.copyable ? (
                                        <div className="flex items-center justify-between w-full pr-2">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <span className="text-mono text-foreground-subtle">{link.label}</span>
                                                <span className="text-base text-foreground-muted truncate max-w-[140px] md:max-w-none">{link.value}</span>
                                            </div>
                                            <button
                                                onClick={copyEmail}
                                                className="text-foreground-subtle hover:text-foreground transition-colors duration-300 flex-shrink-0"
                                                aria-label="Copy email"
                                            >
                                                {copied ? (
                                                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <a
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between w-full pr-2"
                                        >
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <span className="text-mono text-foreground-subtle group-hover:text-foreground-muted transition-colors">
                                                    {link.label}
                                                </span>
                                                <span className="text-base text-foreground-muted group-hover:text-foreground transition-colors duration-300">
                                                    {link.value}
                                                </span>
                                            </div>
                                            <ArrowUpRight className="w-3.5 h-3.5 md:w-4 md:h-4 text-foreground-subtle group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                                        </a>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="hidden md:block flex-shrink-0"
                    >
                        <pre className="font-mono text-xs text-foreground-subtle leading-none select-none">
                            {asciiArt}
                        </pre>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
