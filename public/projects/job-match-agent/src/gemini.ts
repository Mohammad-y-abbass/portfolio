import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const MODELS = ['gemini-3.5-flash','gemini-2.5-flash', 'gemini-2.5-flash-lite'];

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

export async function callGemini(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  if (!genAI) throw new Error('GEMINI_API_KEY not set');

  for (const modelName of MODELS) {
    const model = genAI.getGenerativeModel({ model: modelName, systemInstruction });

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err: any) {
        if (err?.status === 503 && attempt < 3) {
          const wait = attempt * 10;
          console.warn(`  ${modelName} busy (503), retrying in ${wait}s (attempt ${attempt}/3)...`);
          await sleep(wait * 1000);
          continue;
        }
        if (err?.status === 429 && attempt < 3) {
          const wait = attempt * 15;
          console.warn(`  ${modelName} rate limited (429), retrying in ${wait}s...`);
          await sleep(wait * 1000);
          continue;
        }
        if (err?.status === 503 || err?.status === 429) {
          console.warn(`  ${modelName} unavailable after retries, trying next model...`);
          break;
        }
        // non-retryable error
        throw err;
      }
    }
  }

  throw new Error('All Gemini models exhausted');
}
