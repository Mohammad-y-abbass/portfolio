import * as fs from 'fs';
import * as path from 'path';
import { callGemini } from './gemini';
import { JobRaw } from './types';

export interface MatchResult {
  job: JobRaw;
  matchScore: 'high' | 'medium' | 'low';
  reason: string;
  stack?: string;
  experienceRequired?: string;
}

function loadResume(): string {
  const p = path.join(__dirname, '..', 'resume.md');
  return fs.readFileSync(p, 'utf-8');
}

function extractJson(raw: string): string {
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start !== -1 && end !== -1 && end > start) {
    return raw.slice(start, end + 1);
  }
  return raw;
}

function resumeSummary(resume: string): string {
  const lines = resume.split('\n');
  const out: string[] = [];
  let inSkills = false, inExp = false, expCount = 0;
  for (const line of lines) {
    if (line.startsWith('## SUMMARY')) { out.push(line); continue; }
    if (line.startsWith('## SKILLS')) { inSkills = true; out.push(''); continue; }
    if (line.startsWith('## EXPERIENCE')) { inExp = true; out.push(''); continue; }
    if (line.startsWith('## ')) { inSkills = false; inExp = false; }
    if (inSkills && line.trim()) out.push(line);
    if (inExp && line.trim()) {
      if (line.startsWith('**')) {
        if (expCount < 2) out.push(line);
        expCount++;
      } else if (expCount <= 2 && line.startsWith('-')) {
        if (expCount <= 2) out.push(line);
      }
    }
  }
  return out.join('\n');
}

async function filterTitles(
  jobs: JobRaw[],
  resume: string
): Promise<JobRaw[]> {
  const profile = resumeSummary(resume);
  const titlesList = jobs.map((j, i) => `${i}: "${j.title}"`).join('\n');

  const prompt = `Full Stack Developer skills: ${profile.replace(/\n/g, '; ')}

Given these job titles, return ONLY a JSON array of 0-based indices of jobs a Full Stack Developer could do.
"UI/UX Designer" or "Data Entry Clerk" are NOT relevant.

${titlesList}`;

  const raw = await callGemini(prompt);
  const cleaned = extractJson(raw);

  let indices: number[];
  try {
    indices = JSON.parse(cleaned);
  } catch {
    const found = cleaned.match(/\d+/g);
    indices = found ? [...new Set(found.map(Number))] : [];
  }

  const kept = jobs.filter((_, i) => indices.includes(i));
  console.log(`  Title filter: ${kept.length}/${jobs.length} jobs kept`);
  return kept;
}

const BATCH_SIZE = 4;

async function matchBatch(
  batch: { index: number; job: JobRaw }[],
  resume: string
): Promise<{ index: number; matchScore: 'high' | 'medium' | 'low'; reason: string; stack?: string; experienceRequired?: string }[]> {
  const profile = resumeSummary(resume);
  const jobsJson = JSON.stringify(
    batch.map(({ index, job }) => ({
      index,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description || '',
      salary: job.salary || '',
      employmentType: job.employmentType || job.jobType || '',
      category: job.category || job.categories || '',
    })),
    null,
    2
  );

  const prompt = `Candidate: Full Stack Developer, <2 years experience.
Skills: ${profile.replace(/\n/g, '; ')}

For each job, extract from the DESCRIPTION and return a JSON array with:
- index
- matchScore: "high"|"medium"|"low"
- stack: programming languages, frameworks, tools mentioned in the description
- experienceRequired: years of experience required (or "unknown" if not mentioned)
- reason: why the candidate matches this role given their <2 years of experience

If a job says "Senior" but the tech stack aligns and experience seems flexible, explain that in the reason.

Jobs:
${jobsJson}`;

  const raw = await callGemini(prompt);
  const cleaned = extractJson(raw);

  try {
    return JSON.parse(cleaned);
  } catch {
    console.warn('  Batch parse failed:', cleaned.slice(0, 100));
    return [];
  }
}

async function matchJobs(
  jobs: JobRaw[],
  resume: string
): Promise<MatchResult[]> {
  const all: MatchResult[] = [];
  const indexed = jobs.map((job, i) => ({ index: i, job }));

  for (let i = 0; i < indexed.length; i += BATCH_SIZE) {
    const batch = indexed.slice(i, i + BATCH_SIZE);
    console.log(`  Matching batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(indexed.length / BATCH_SIZE)}...`);
    const results = await matchBatch(batch, resume);
    for (const r of results) {
      const found = batch.find(b => b.index === r.index);
      if (found) all.push({ job: found.job, matchScore: r.matchScore, reason: r.reason, stack: r.stack, experienceRequired: r.experienceRequired });
    }
  }

  return all;
}

export async function runMatch(jobs: JobRaw[]): Promise<MatchResult[]> {
  const resume = loadResume();
  console.log('Pass 1: Filtering unrelated titles...');
  const relevant = await filterTitles(jobs, resume);
  if (relevant.length === 0) {
    console.log('  No relevant jobs found.');
    return [];
  }

  console.log(`Pass 2: Matching ${relevant.length} jobs against resume (batches of ${BATCH_SIZE})...`);
  const matches = await matchJobs(relevant, resume);
  console.log(`  ${matches.filter(m => m.matchScore !== 'low').length} matching jobs found`);

  return matches;
}
