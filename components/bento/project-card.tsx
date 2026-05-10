"use client"

import React, { useState } from "react"
import { ArrowUpRight, Github, ExternalLink, Info, X, Lock } from "lucide-react"
import { CardShell } from "./card-shell"
import { Button } from "@/components/ui/button"

export function ProjectCard({
  title,
  summary,
  stack,
  codeUrl,
  liveUrl,
  instructions,
  privateCode,
}: {
  title: string
  summary: string
  stack: string[]
  codeUrl: string
  liveUrl?: string
  instructions?: string
  privateCode?: boolean
}) {
  const [showInstructions, setShowInstructions] = useState(false)
  const [showPrivate, setShowPrivate] = useState(false)

  return (
    <CardShell 
      ariaLabel={`Project: ${title}`} 
      className="p-6 md:p-7 flex flex-col relative overflow-hidden"
    >
      {/* Instructions Overlay */}
      {showInstructions && (
        <div className="absolute inset-0 z-20 bg-background/95 backdrop-blur-sm p-6 flex flex-col animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <Info className="size-3.5" />
              Testing Instructions
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowInstructions(false)}
              className="size-7 rounded-full hover:bg-foreground/10 transition-colors"
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-sm text-foreground/80 leading-relaxed font-mono bg-surface p-4 rounded-lg border border-hairline mb-4">
              {instructions || "This project is a systems-level tool and cannot be hosted as a live website. Please refer to the repository for local setup."}
            </p>
            <Button 
              asChild
              className="w-full h-11 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              <a 
                href={codeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="size-4" />
                View Repository
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* Private Code Overlay */}
      {showPrivate && (
        <div className="absolute inset-0 z-20 bg-background/95 backdrop-blur-sm p-6 flex flex-col animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              <Lock className="size-3.5" />
              Private Repository
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setShowPrivate(false)}
              className="size-7 rounded-full hover:bg-foreground/10 transition-colors"
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-3">
            <div className="flex flex-col items-center gap-3 text-center py-4">
              <div className="size-12 rounded-full border border-border/40 flex items-center justify-center bg-muted/30">
                <Lock className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground font-mono leading-relaxed max-w-xs">
                The source code for this project is private and not publicly available.
              </p>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-xl font-medium tracking-tight text-balance mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground text-pretty mb-6">
        {summary}
      </p>

      <div className="mt-auto flex flex-col gap-6">
        <div className="flex flex-wrap gap-1.5">
          {stack.map((s) => (
            <span
              key={s}
              className="font-mono text-[10px] rounded-full border border-border/40 bg-muted/30 px-2 py-0.5 text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between group/btn">
          {liveUrl ? (
            <Button
              variant="link"
              size="sm"
              asChild
              className="px-0 h-auto font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                Launch Project <ArrowUpRight className="ml-1 size-3" />
              </a>
            </Button>
          ) : (
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowInstructions(true)}
              className="px-0 h-auto font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Local Testing <Info className="ml-1 size-3" />
            </Button>
          )}
          
          <div className="h-px flex-1 mx-4 bg-border/20 group-hover/btn:bg-foreground/10 transition-colors" />
          
          {privateCode ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPrivate(true)}
              className="px-0 h-auto font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Code <Lock className="ml-1 size-3" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="px-0 h-auto font-mono text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              <a href={codeUrl} target="_blank" rel="noopener noreferrer">
                Code <Github className="ml-1 size-3" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </CardShell>
  )
}
