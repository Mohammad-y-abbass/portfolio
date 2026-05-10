"use client"

import type { ReactNode } from "react"
import { motion, type Variants } from "framer-motion"

type RevealProps = {
  children: ReactNode
  delay?: number
  className?: string
  as?: "div" | "section" | "article" | "li" | "header" | "footer"
  y?: number
}

const variants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
  y = 24,
}: RevealProps) {
  const MotionTag = motion[as] as typeof motion.div

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      variants={{
        hidden: { opacity: 0, y, filter: "blur(6px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: {
            duration: 0.7,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
    >
      {children}
    </MotionTag>
  )
}

export const fadeUp = variants
