import axios from 'axios';
import { MatchResult } from './matcher';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function formatMessage(matches: MatchResult[]): string {
  const relevant = matches.filter(m => m.matchScore !== 'low');
  if (relevant.length === 0) return 'No matching jobs found today.';

  const lines: string[] = [
    `*Job Matcher — ${new Date().toISOString().slice(0, 10)}*`,
    `${relevant.length} matching jobs found\n`,
  ];

  relevant.forEach((m, i) => {
    const icon = m.matchScore === 'high' ? '🟢' : '🟡';
    lines.push(
      `${icon} *${m.job.title}*`,
      `Company: ${m.job.company}`,
      `Stack: ${m.stack || 'N/A'}`,
      `Experience: ${m.experienceRequired || 'N/A'}`,
      `Link: ${m.job.url}`,
      `Why: ${m.reason}`,
      ''
    );
  });

  return lines.join('\n');
}

export async function sendTelegram(matches: MatchResult[]): Promise<void> {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('  TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set. Skipping Telegram notification.');
    return;
  }

  const text = formatMessage(matches);

  if (text.length > 4000) {
    const chunks = splitMessage(text);
    for (const chunk of chunks) {
      await sendChunk(chunk);
    }
  } else {
    await sendChunk(text);
  }
}

function splitMessage(text: string): string[] {
  const chunks: string[] = [];
  const parts = text.split('\n\n');
  let current = '';
  for (const part of parts) {
    if (current.length + part.length > 3500) {
      chunks.push(current);
      current = part + '\n\n';
    } else {
      current += part + '\n\n';
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function sendChunk(text: string): Promise<void> {
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text,
      parse_mode: 'Markdown',
    }, { timeout: 15000 });
    console.log('  Telegram notification sent.');
  } catch (err: any) {
    if (err?.response?.data?.description?.includes('can\'t parse')) {
      try {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: CHAT_ID,
          text,
        }, { timeout: 15000 });
        console.log('  Telegram notification sent.');
      } catch (e: any) {
        console.error('  Telegram send failed:', e?.response?.data?.description || e.message);
      }
    } else {
      console.error('  Telegram send failed:', err?.response?.data?.description || err.message);
    }
  }
}
