import 'dotenv/config';
import * as cron from 'node-cron';
import { scrapeAll } from './scraper';
import { JobRaw } from './types';
import { runMatch } from './matcher';
import { sendTelegram } from './notifier';

async function runOnce(match: boolean) {
  console.log(`[${new Date().toISOString()}] Starting scrape...`);
  try {
    const results = await scrapeAll(true);

    const totalErrors = results.reduce((s, r) => s + r.errors.length, 0);
    const siteTotal = results.reduce((s, r) => s + r.jobs.length, 0);
    console.log(`[${new Date().toISOString()}] Done. ${siteTotal} jobs scraped, ${totalErrors} errors.`);

    if (match) {
      if (!process.env.GEMINI_API_KEY) {
        console.error('\nError: GEMINI_API_KEY environment variable is required for --match');
        return;
      }
      const allJobs: JobRaw[] = [];
      for (const site of results) {
        allJobs.push(...site.jobs);
      }
      const matches = await runMatch(allJobs);
      const highMedium = matches.filter(m => m.matchScore !== 'low');
      console.log(`\n${highMedium.length} matching jobs:`);
      highMedium.forEach((m, i) => {
        console.log(`\n${i + 1}. [${m.matchScore.toUpperCase()}] ${m.job.title}`);
        console.log(`   Company: ${m.job.company}`);
        console.log(`   Stack: ${m.stack || 'N/A'}`);
        console.log(`   Experience: ${m.experienceRequired || 'N/A'}`);
        console.log(`   Link: ${m.job.url}`);
        console.log(`   Why: ${m.reason}`);
      });

      await sendTelegram(matches);
    }
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Fatal error:`, err);
  }
}

function main() {
  const args = process.argv.slice(2);
  const isDaily = args.includes('--daily');
  const isOnce = args.includes('--once');
  const isMatch = args.includes('--match');

  if (isOnce) {
    runOnce(isMatch);
    return;
  }

  if (isDaily) {
    console.log('Starting daily scheduled scraper (runs every day at 6:00 AM)...');
    cron.schedule('0 6 * * *', () => {
      runOnce(isMatch);
    });

    runOnce(isMatch);
    return;
  }

  console.log(`
Usage:
  npm run scrape -- --once          Run once immediately
  npm run scrape -- --daily         Run once now then every day at 6 AM
  npm run scrape -- --once --match  Run once and match jobs against resume
  npm start    -- --once --match    Run via compiled JS (for CI/actions)
`);
}

if (require.main === module) {
  main();
}
