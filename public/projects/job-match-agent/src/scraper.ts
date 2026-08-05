import * as cheerio from 'cheerio';
import axios from 'axios';
import { Browser, chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { convert } from 'html-to-text';
import {
  ScraperConfig,
  WebsiteConfig,
  SelectorConfig,
  JobRaw,
} from './types';

function loadConfig(): ScraperConfig {
  const configPath = path.resolve(__dirname, '..', 'src', 'websites.json');
  const raw = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(raw) as ScraperConfig;
}

function buildPageUrl(
  baseUrl: string,
  pagination: { enabled: boolean; param: string; startPage?: number } | undefined,
  page: number
): string {
  if (!pagination?.enabled || page === (pagination.startPage || 1)) return baseUrl;
  const url = new URL(baseUrl);
  url.searchParams.set(pagination.param, String(page));
  return url.toString();
}

function cleanText(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function extractField(
  $: cheerio.CheerioAPI,
  element: cheerio.Cheerio<any>,
  fieldConfig: SelectorConfig
): string {
  const el = fieldConfig.index !== undefined
    ? element.find(fieldConfig.selector).eq(fieldConfig.index)
    : element.find(fieldConfig.selector);

  if (el.length === 0) return '';

  switch (fieldConfig.type) {
    case 'text':
      return cleanText(el.text());
    case 'html':
      return el.html()?.trim() || '';
    case 'href':
      return el.attr('href')?.trim() || '';
    case 'attr':
      return el.attr(fieldConfig.attr || '')?.trim() || '';
    default:
      return cleanText(el.text());
  }
}

function extractFieldsFromElement(
  $: cheerio.CheerioAPI,
  element: cheerio.Cheerio<any>,
  fields: Record<string, SelectorConfig>
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, config] of Object.entries(fields)) {
    result[key] = extractField($, element, config);
  }
  return result;
}

function extractFieldsFromHtml(
  html: string,
  fields: Record<string, SelectorConfig>
): Record<string, string> {
  const $ = cheerio.load(html);
  return extractFieldsFromElement($, $('body'), fields);
}

function resolveUrl(raw: string, baseUrl: string): string {
  try {
    if (raw.startsWith('http')) return raw;
    const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    return new URL(raw, base).href;
  } catch {
    return raw;
  }
}

function extractJobId(url: string, baseUrl: string): string {
  try {
    const fullUrl = url.startsWith('http') ? url : resolveUrl(url, baseUrl);
    const parsed = new URL(fullUrl);
    const idParam = parsed.searchParams.get('id');
    if (idParam) return idParam;
    const match = parsed.pathname.match(/\/(\d+)\/show\/job/);
    if (match) return match[1];
    return '';
  } catch {
    return '';
  }
}

function parseDateRaw(
  dateStr: string,
  config: WebsiteConfig
): Date | null {
  const { dateParse } = config;
  if (!dateParse) return null;

  if (dateParse.relative) {
    const cleaned = dateStr.replace(/^(Posted\s+on)?\s*Posted\s+/i, '').trim();
    const dayMatch = cleaned.match(/(\d+)\+?\s*days?\s+ago/i);
    if (dayMatch) {
      const days = parseInt(dayMatch[1]);
      return new Date(Date.now() - days * 86400000);
    }
    const hourMatch = cleaned.match(/(\d+)\s*hours?\s+ago/i);
    if (hourMatch) {
      const hours = parseInt(hourMatch[1]);
      return new Date(Date.now() - hours * 3600000);
    }
    if (/yesterday/i.test(cleaned)) {
      return new Date(Date.now() - 86400000);
    }
    const dMatch = cleaned.match(/(\d+)d/);
    if (dMatch) {
      const days = parseInt(dMatch[1]);
      return new Date(Date.now() - days * 86400000);
    }
    return new Date();
  }

  const cleaned = dateStr.replace(/^Posted at\s*/i, '').trim();
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };

  const match = cleaned.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (match) {
    const [, monthStr, day, year] = match;
    const month = months[monthStr.toLowerCase().slice(0, 3)];
    if (month !== undefined) {
      return new Date(Date.UTC(parseInt(year), month, parseInt(day)));
    }
  }

  const dmyMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1]);
    const month = parseInt(dmyMatch[2]) - 1;
    let year = parseInt(dmyMatch[3]);
    if (year < 100) year += 2000;
    return new Date(Date.UTC(year, month, day));
  }

  const fallback = new Date(cleaned);
  return isNaN(fallback.getTime()) ? null : fallback;
}

function parseCompanyLocation(raw: string): { company: string; location: string } {
  const parts = raw.split(' - ').map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) return { company: '', location: '' };
  if (parts.length === 1) return { company: '', location: parts[0] };
  if (parts.length === 2) return { company: parts[0], location: parts[1] };
  return { company: parts[0], location: parts.slice(1).join(' - ') };
}

function isWithinLast24Hours(date: Date): boolean {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff >= 0 && diff <= 24 * 60 * 60 * 1000;
}

interface ScrapeResult {
  website: string;
  jobs: JobRaw[];
  errors: string[];
}

async function scrapeStaticListings(
  config: WebsiteConfig
): Promise<{ jobs: JobRaw[]; errors: string[] }> {
  const errors: string[] = [];
  const jobs: JobRaw[] = [];
  const { listings } = config;

  let currentPage = listings.pagination?.startPage || 1;
  const maxPages = listings.pagination?.maxPages || 1;
  let hasMorePages = true;

  while (hasMorePages && currentPage <= maxPages) {
    const pageUrl = buildPageUrl(listings.url, listings.pagination, currentPage);

    let cardsLength = 0;

    try {
      const { data: html } = await axios.get<string>(pageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        },
        timeout: 30000,
      });

      const $ = cheerio.load(html);
      const cards = $(listings.jobCardSelector);
      cardsLength = cards.length;

      if (cards.length === 0) {
        hasMorePages = false;
        break;
      }

      cards.each((_, card) => {
        const element = $(card);
        const rawFields = extractFieldsFromElement($, element, listings.fields);

        let parsedDate: Date | null = null;
        if (rawFields.datePostedRaw) {
          parsedDate = parseDateRaw(rawFields.datePostedRaw, config);
          if (parsedDate && !config.skipDateFilter && !isWithinLast24Hours(parsedDate)) return;
        }

        const title = (rawFields.title || '').trim();
        if (!title) return;

        const url = rawFields.url || '';
        const jobId = extractJobId(url, config.baseUrl);

        let company = (rawFields.company || '').trim();
        let location = (rawFields.location || '').trim();
        if (rawFields.companyLocation) {
          const parsed = parseCompanyLocation(rawFields.companyLocation);
          company = company || parsed.company;
          location = location || parsed.location;
        }
        if (!company) company = config.name.charAt(0).toUpperCase() + config.name.slice(1);
        location = location.replace(/^locations/i, '').trim();

        const job: Record<string, unknown> = {
          source: config.name,
          title,
          url: resolveUrl(url, config.baseUrl),
          company,
          location,
          datePosted: parsedDate || new Date(),
        };
        for (const [key, val] of Object.entries(rawFields)) {
          if (!['title', 'url', 'company', 'location', 'companyLocation', 'datePostedRaw'].includes(key)) {
            const v = (typeof val === 'string' ? cleanText(val) : val);
            if (v) job[key] = v;
          }
        }
        if (jobId) job.jobId = jobId;
        jobs.push(job as unknown as import('./types').JobRaw);
      });
    } catch (err) {
      errors.push(`Page ${currentPage}: ${err instanceof Error ? err.message : String(err)}`);
    }

    currentPage++;
    if (listings.pagination?.enabled && cardsLength < 50) {
      hasMorePages = false;
    }
  }

  return { jobs: deduplicateJobs(jobs), errors };
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    u.search = '';
    let path = u.pathname.replace(/\/+$/, '');
    if (!path) path = '/';
    return `${u.protocol}//${u.hostname}${path}`;
  } catch {
    return url.replace(/\/+$/, '').toLowerCase();
  }
}

function deduplicateJobs(jobs: JobRaw[]): JobRaw[] {
  const seen = new Set<string>();
  return jobs.filter(job => {
    const key = job.jobId || normalizeUrl(job.url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}



async function scrapeDynamicListings(
  config: WebsiteConfig
): Promise<{ jobs: JobRaw[]; errors: string[] }> {
  const errors: string[] = [];
  const jobs: JobRaw[] = [];
  const { listings } = config;

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
    });

    let currentPage = listings.pagination?.startPage || 1;
    const maxPages = listings.pagination?.maxPages || 1;
    let hasMorePages = true;

    while (hasMorePages && currentPage <= maxPages) {
      const pageUrl = buildPageUrl(listings.url, listings.pagination, currentPage);

      try {
        const page = await context.newPage();
        await page.addInitScript(() => {
          Object.defineProperty(navigator, 'webdriver', { get: () => false });
        });
        await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForSelector(listings.jobCardSelector, { timeout: 15000 });

        const html = await page.content();
        await page.close();

        const $ = cheerio.load(html);
        const cards = $(listings.jobCardSelector);

        if (cards.length === 0) {
          hasMorePages = false;
          break;
        }

        cards.each((_, card) => {
          const element = $(card);
          const rawFields = extractFieldsFromElement($, element, listings.fields);

          let parsedDate: Date | null = null;
          if (rawFields.datePostedRaw) {
            parsedDate = parseDateRaw(rawFields.datePostedRaw, config);
            if (parsedDate && !config.skipDateFilter && !isWithinLast24Hours(parsedDate)) return;
          }

          const title = (rawFields.title || '').trim();
          if (!title) return;

          const url = rawFields.url || '';
          const jobId = extractJobId(url, config.baseUrl);

          let company = (rawFields.company || '').trim();
          let location = (rawFields.location || '').trim();
          if (rawFields.companyLocation) {
            const parsed = parseCompanyLocation(rawFields.companyLocation);
            company = company || parsed.company;
            location = location || parsed.location;
          }
          if (!company) company = config.name.charAt(0).toUpperCase() + config.name.slice(1);
          location = location.replace(/^locations/i, '').trim();

          const job: Record<string, unknown> = {
            source: config.name,
            title,
            url: resolveUrl(url, config.baseUrl),
            company,
            location,
            datePosted: parsedDate || new Date(),
          };
          for (const [key, val] of Object.entries(rawFields)) {
            if (!['title', 'url', 'company', 'location', 'companyLocation', 'datePostedRaw'].includes(key)) {
              const v = (typeof val === 'string' ? cleanText(val) : val);
              if (v) job[key] = v;
            }
          }
          if (jobId) job.jobId = jobId;
          jobs.push(job as unknown as import('./types').JobRaw);
        });

        if (listings.pagination?.enabled && cards.length < 50) {
          hasMorePages = false;
        }
      } catch (err) {
        errors.push(`Page ${currentPage}: ${err instanceof Error ? err.message : String(err)}`);
      }

      currentPage++;
    }
  } catch (err) {
    errors.push(`Browser: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    if (browser) await browser.close();
  }

  return { jobs: deduplicateJobs(jobs), errors };
}

async function scrapeJobDetails(
  job: JobRaw,
  config: WebsiteConfig
): Promise<void> {
  if (!config.details) return;

  let detailUrl: string;
  if (config.details.urlTemplate.includes('{url}')) {
    detailUrl = config.details.urlTemplate.replace('{url}', job.url);
  } else {
    const jobId = job.jobId || extractJobId(job.url, config.baseUrl);
    if (!jobId) return;
    detailUrl = config.details.urlTemplate.replace('{id}', jobId);
  }

  try {
    let html: string;

    if (config.type === 'static') {
      const { data } = await axios.get<string>(detailUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 30000,
      });
      html = data;
    } else {
      const browser = await chromium.launch({ headless: true });
      try {
        const page = await browser.newPage();
        await page.addInitScript(() => {
          Object.defineProperty(navigator, 'webdriver', { get: () => false });
        });
        await page.goto(detailUrl, { waitUntil: 'networkidle', timeout: 60000 });
        html = await page.content();
        await page.close();
      } finally {
        await browser.close();
      }
    }

    const fields = extractFieldsFromHtml(html, config.details.fields);

    // Convert HTML fields to plain text
    for (const [key, val] of Object.entries(fields)) {
      if (!['title', 'company', 'location'].includes(key)) {
        let v = typeof val === 'string' ? cleanText(val) : val;
        if (v && typeof v === 'string' && v.includes('<')) {
          v = convert(v, { wordwrap: false, preserveNewlines: true }).trim();
        }
        if (v) (job as unknown as Record<string, unknown>)[key] = v;
      }
    }
    if (fields.title) job.title = fields.title;
    if (fields.company) job.company = fields.company;
    if (fields.location) job.location = fields.location;
  } catch (err) {
    // non-fatal
  }
}

export async function scrapeAll(
  scrapeDetails: boolean = false
): Promise<ScrapeResult[]> {
  const config = loadConfig();
  const results: ScrapeResult[] = [];

  for (const website of config.websites) {
    console.log(`Scraping ${website.name} (${website.type})...`);

    let result: { jobs: JobRaw[]; errors: string[] };

    if (website.type === 'dynamic') {
      result = await scrapeDynamicListings(website);
    } else {
      result = await scrapeStaticListings(website);
    }

    const { jobs, errors } = result;

    if (scrapeDetails && website.details && jobs.length > 0) {
      console.log(`  Fetching details for ${jobs.length} jobs...`);
      for (const job of jobs) {
        await scrapeJobDetails(job, website);
      }
    }

    results.push({
      website: website.name,
      jobs,
      errors,
    });

    console.log(`  Found ${jobs.length} jobs from last 24h`);
    if (errors.length > 0) {
      console.log(`  Errors: ${errors.length}`);
    }
  }

  return results;
}

export { loadConfig };
