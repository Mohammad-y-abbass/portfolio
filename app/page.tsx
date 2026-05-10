import { BentoGrid } from "@/components/bento-grid";
import { Blogs } from "@/components/blogs";
import { Contact } from "@/components/contact";
import { Experience } from "@/components/experience";
import { Hero } from "@/components/hero";
import { SiteHeader } from "@/components/site-header";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Skills } from "@/components/skills";

async function getGithubData() {
  try {
    const res = await fetch(
      "https://github-contributions-api.jogruber.de/v4/mohammad-y-abbass",
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    );
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error("Failed to fetch GitHub data:", e);
    return null;
  }
}

export default async function Page() {
  const githubData = await getGithubData();

  return (
    <>
      <SmoothScroll />
      <SiteHeader />
      <main className="relative">
        <Hero />
        <BentoGrid githubData={githubData} />
        <Skills />
        <Experience />
        <Blogs />
        <Contact />
      </main>
    </>
  );
}
