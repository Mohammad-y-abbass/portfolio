"use client"

import { motion } from "framer-motion"
import { HeroSection } from "@/components/hero-section"
import { WorkSection } from "@/components/work-section"
import { SkillsSection } from "@/components/skills-section"
import { ContactSection } from "@/components/contact-section"
import { ExperienceSection } from "@/components/experience-section"
import { Navbar } from "@/components/navbar"
import { CustomCursor } from "@/components/custom-cursor"
import { SmoothScrollProvider, SectionTransition } from "@/components/smooth-scroll-provider"

export default function Home() {
  return (
    <SmoothScrollProvider>
      <motion.main
        className="min-h-screen relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
      >
        <CustomCursor />
        <Navbar />

        <div className="grid-container relative">
          {/* Left border line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-[#222] hidden md:block" />
          {/* Right border line */}
          <div className="absolute right-0 top-0 bottom-0 w-px bg-[#222] hidden md:block" />

          <SectionTransition id="hero">
            <HeroSection />
          </SectionTransition>

          <SectionTransition id="experience">
            <ExperienceSection />
          </SectionTransition>

          <SectionTransition id="work">
            <WorkSection />
          </SectionTransition>

          <SectionTransition id="skills">
            <SkillsSection />
          </SectionTransition>

          <SectionTransition id="contact">
            <ContactSection />
          </SectionTransition>
        </div>
      </motion.main>
    </SmoothScrollProvider>
  )
}
