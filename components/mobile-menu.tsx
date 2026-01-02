"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useScrollContext } from "./smooth-scroll-provider"
import { createPortal } from "react-dom"
import { useEffect, useState } from "react"
import { useLenis } from "lenis/react"

interface MobileMenuProps {
    isOpen: boolean
    onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const { currentSection } = useScrollContext()
    const [mounted, setMounted] = useState(false)

    const lenis = useLenis()

    const handleNavClick = (href: string) => {
        onClose()
        setTimeout(() => {
            if (lenis) {
                lenis.scrollTo(href, {
                    offset: 0,
                    duration: 1.5,
                    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                })
            } else {
                const element = document.querySelector(href)
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" })
                }
            }
        }, 300)
    }

    const navItems = [
        { name: "Home", href: "#hero", id: "hero" },
        { name: "Experience", href: "#experience", id: "experience" },
        { name: "Projects", href: "#work", id: "work" },
        { name: "Skills", href: "#skills", id: "skills" },
        { name: "Contact", href: "#contact", id: "contact" },
    ]

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    if (!mounted) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] isolate">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-background/95 backdrop-blur-md"
                        onClick={onClose}
                        style={{ zIndex: 1 }}
                    />

                    <motion.div
                        initial={{ translateX: "100%" }}
                        animate={{ translateX: 0 }}
                        exit={{ translateX: "100%" }}
                        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
                        className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-background border-l border-line flex flex-col h-full"
                        style={{ zIndex: 2, willChange: "transform" }}
                    >
                        <div className="flex justify-between items-center p-3 border-b border-line">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-px bg-line-accent" />
                                <span className="text-mono text-foreground-subtle">menu</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-7 h-7 flex items-center justify-center border border-line hover:border-line-hover text-foreground-subtle hover:text-foreground transition-colors"
                                aria-label="Close menu"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-6">
                            <nav className="flex flex-col px-3">
                                {navItems.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center gap-3 py-3 border-b border-line-hover ${currentSection === item.id ? "text-foreground" : "text-foreground-subtle hover:text-foreground"
                                            } transition-colors duration-300`}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            handleNavClick(item.href)
                                        }}
                                    >
                                        <span className="text-large">{item.name}</span>
                                    </a>
                                ))}
                            </nav>
                        </div>

                        <div className="border-t border-line p-3">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-line-accent rounded-full" />
                                <span className="text-mono text-foreground-subtle">&copy; {new Date().getFullYear()}</span>
                                <div className="flex-1 h-px bg-line" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    )
}
