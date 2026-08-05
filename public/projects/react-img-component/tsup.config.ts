import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'], // Entry file for your library
  format: ['cjs', 'esm'], // Output formats: CommonJS and ESM
  target: 'esnext', // Use the latest ECMAScript features
  dts: true, // Generate .d.ts declaration files
  sourcemap: true, // Generate source maps for debugging
  clean: true, // Clean the dist folder before each build
});
