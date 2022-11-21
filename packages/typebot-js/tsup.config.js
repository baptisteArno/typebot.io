import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  sourcemap: true,
  minify: !options.watch,
  dts: true,
  format: ['esm', 'cjs', 'iife'],
  globalName: 'Typebot',
  injectStyle: true,
}))
