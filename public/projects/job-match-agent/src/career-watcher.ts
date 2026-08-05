import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createHash } from 'crypto';
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import axios from 'axios';

const COMPANIES_PATH = resolve(__dirname, '..', 'src', 'companies.json');
const HASHES_PATH = resolve(__dirname, '..', 'career_hashes.json');

interface Company {
  title: string;
  career_url: string | null;
  [key: string]: unknown;
}

interface CareerHashEntry {
  url: string;
  hash: string;
  lastChecked: string;
  lastChanged: string;
  error?: string;
}

type Hashes = Record<string, CareerHashEntry>;

function hashText(text: string): string {
  return createHash('sha256').update(text, 'utf-8').digest('hex');
}

function extractText(html: string): string {
  const $ = cheerio.load(html);
  $('script, style, link, meta, noscript, svg, iframe, canvas, video, audio').remove();
  return $.text().replace(/\s+/g, ' ').trim();
}

async function sendTelegramNotification(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.log('  TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set. Skipping notification.');
    return;
  }
  try {
    await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      },
      { timeout: 15000 }
    );
    console.log('  Telegram notification sent.');
  } catch (err: any) {
    console.error('  Telegram send failed:', err?.response?.data?.description || err.message);
  }
}

async function main() {
  console.log('Loading companies...');
  const raw = readFileSync(COMPANIES_PATH, 'utf-8');
  const companies: Company[] = JSON.parse(raw);
  const careerUrls = companies.filter((c): c is Company & { career_url: string } => !!c.career_url);
  console.log(`Found ${careerUrls.length} companies with career URLs out of ${companies.length} total`);

  let previousHashes: Hashes = {};
  if (existsSync(HASHES_PATH)) {
    previousHashes = JSON.parse(readFileSync(HASHES_PATH, 'utf-8'));
    console.log(`Loaded ${Object.keys(previousHashes).length} previous hashes`);
  }

  const newHashes: Hashes = {};
  const changed: Array<{ title: string; url: string }> = [];
  const now = new Date().toISOString();

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });

  try {
    for (const company of careerUrls) {
      const { title } = company;
      const url = company.career_url;
      process.stdout.write(`  ${title}... `);

      try {
        const context = await browser.newContext({
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          viewport: { width: 1280, height: 720 },
          locale: 'en-US',
        });
        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        const html = await page.locator('body').innerHTML();
        await context.close();

        const text = extractText(html);
        const hash = hashText(text);
        const prev = previousHashes[title];

        let lastChanged: string;
        if (!prev) {
          lastChanged = now;
          console.log('new');
        } else if (prev.hash !== hash) {
          lastChanged = now;
          console.log('CHANGED');
          changed.push({ title, url });
        } else {
          lastChanged = prev.lastChanged;
          console.log('ok');
        }

        newHashes[title] = {
          url,
          hash,
          lastChecked: now,
          lastChanged,
        };
      } catch (err: any) {
        console.error(`ERROR: ${err.message}`);
        newHashes[title] = {
          url,
          hash: previousHashes[title]?.hash || '',
          lastChecked: now,
          lastChanged: previousHashes[title]?.lastChanged || now,
          error: err.message,
        };
      }
    }
  } finally {
    await browser.close();
  }

  writeFileSync(HASHES_PATH, JSON.stringify(newHashes, null, 2));
  console.log(`\nSaved ${Object.keys(newHashes).length} hashes to career_hashes.json`);

  if (changed.length > 0) {
    const lines = [
      '<b>Career Page Changes Detected</b>',
      `${changed.length} company(-ies) updated their careers page:\n`,
    ];
    changed.forEach((c, i) => {
      lines.push(`${i + 1}. <a href="${c.url}">${c.title}</a>`);
    });
    await sendTelegramNotification(lines.join('\n'));
  } else {
    console.log('No changes detected.');
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
