import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'
import { babel } from '@rollup/plugin-babel'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import { typescriptPaths } from 'rollup-plugin-typescript-paths'
import dts from 'rollup-plugin-dts'
import typescript from '@rollup/plugin-typescript'

const extensions = ['.ts', '.tsx']

const webComponentsConfig = {
  input: './src/index.ts',
  output: {
    file: 'dist/index.mjs',
    format: 'es',
  },
  external: ['models', 'utils', 'react'],
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    resolve({ extensions }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ['solid', '@babel/preset-typescript'],
      extensions,
    }),
    postcss({
      plugins: [autoprefixer(), tailwindcss()],
      extract: false,
      modules: false,
      autoModules: false,
      minimize: true,
      inject: false,
    }),
    typescript(),
    typescriptPaths({ preserveExtensions: true }),
    terser({ output: { comments: false } }),
  ],
}

const config = [
  webComponentsConfig,
  {
    input: './dist/dts/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]

export default config
