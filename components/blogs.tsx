"use client";

import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./reveal";

type Post = {
  title: string;
  summary: string;
  date: string;
  url: string;
};

const POSTS: Post[] = [
  {
    title: "Building Your Own Database from Scratch in Go",
    summary:
      "A first-principles guide to building a SQL database engine in Go, covering the full architecture pipeline from lexer to parser, planner, executor, storage engine, and TCP server.",
    date: "April 22, 2026",
    url: "https://learndevs.com/blogs/building-your-own-database-from-scratch-in-go-part-1-introduction-90004",
  },
  {
    title: "What Is a Large Language Model",
    summary:
      "A clear explainer of LLMs, showing how tokenization, embeddings, Transformer attention, training, inference, and limitations work together in modern language models.",
    date: "April 24, 2026",
    url: "https://learndevs.com/blogs/what-is-a-large-language-model-90010",
  },
  {
    title: "The JavaScript Event Loop: A Complete Guide",
    summary:
      "A practical walkthrough of JavaScript runtime behavior, explaining the call stack, runtime APIs, microtasks, macrotasks, Node.js vs browser phases, and why async code runs in that order.",
    date: "May 6, 2026",
    url: "https://learndevs.com/blogs/the-javascript-event-loop-a-complete-guide-90011",
  },
];

export function Blogs() {
  return (
    <section
      id="blog"
      aria-labelledby="blog-heading"
      className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32"
    >
      {/* Section header */}
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
              <span className="h-px w-8 bg-foreground/30" />
              <span>Blog</span>
            </div>
            <h2
              id="blog-heading"
              className="text-balance text-3xl md:text-5xl font-medium tracking-tight"
            >
              Technical articles and project writeups.
            </h2>
          </div>
        </div>
      </Reveal>

      {/* Posts list */}
      <div className="flex flex-col divide-y divide-border/40">
        {POSTS.map((post, i) => (
          <Reveal key={post.title} delay={i * 0.05}>
            <a
              href={post.url}
              target={post.url === "#" ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="group flex flex-col md:flex-row md:items-start md:justify-between gap-4 py-8 md:py-10 hover:opacity-80 transition-opacity"
            >
              {/* Center: title + summary */}
              <div className="flex-1 md:px-10">
                <h3 className="text-xl md:text-2xl font-medium tracking-tight text-balance mb-2 group-hover:text-foreground transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground text-pretty max-w-2xl">
                  {post.summary}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 md:pt-1">
                <span className="size-7 rounded-full border border-border/40 flex items-center justify-center group-hover:border-foreground/30 group-hover:bg-foreground/5 transition-all">
                  <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </span>
              </div>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
