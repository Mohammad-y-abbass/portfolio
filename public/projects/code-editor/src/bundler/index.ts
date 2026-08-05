import * as esbuild from 'esbuild-wasm';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';
import { fetchPlugin } from './plugins/fetch-plugin';

interface BundlerResult {
  code: string;
  error: string;
}

export async function init() {
  await esbuild.initialize({
    wasmURL: 'https://unpkg.com/esbuild-wasm@0.21.4/esbuild.wasm',
  });
}
export async function bundler(rawCode: string): Promise<BundlerResult> {
  try {
    const result = await esbuild.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(rawCode)],
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window',
      },
    });

    return { code: result.outputFiles[0].text, error: '' };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { code: '', error: error.message };
  }
}
