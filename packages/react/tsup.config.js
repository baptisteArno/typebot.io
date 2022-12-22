import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  sourcemap: options.watch,
  minify: !options.watch,
  dts: true,
  format: ['esm'],
}))
