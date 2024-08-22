import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import { babel } from '@rollup/plugin-babel'
import postcss from 'rollup-plugin-postcss'
import autoprefixer from 'autoprefixer'
import tailwindcss from 'tailwindcss'
import typescript from '@rollup/plugin-typescript'
import { typescriptPaths } from 'rollup-plugin-typescript-paths'
import replace from '@rollup/plugin-replace'
import commonjs from '@rollup/plugin-commonjs'
import fs from 'fs'

const extensions = ['.ts', '.tsx']

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const packageVersion = packageJson.version
const preamble = `// v${packageVersion}`

const indexConfig = {
  input: './src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'es',
  },
  onwarn,
  watch: {
    clearScreen: false,
  },
  plugins: [
    resolve({ extensions }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ['solid', '@babel/preset-typescript'],
      extensions,
    }),
    typescriptPaths({ preserveExtensions: true }),
    typescript({
      noEmitOnError: !process.env.ROLLUP_WATCH,
    }),
    postcss({
      plugins: [autoprefixer(), tailwindcss()],
      extract: false,
      modules: false,
      autoModules: false,
      minimize: true,
      inject: false,
    }),
    terser({
      format: { preamble },
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true,
    }),
  ],
}

const configs = [
  indexConfig,
  {
    ...indexConfig,
    input: './src/web.ts',
    output: {
      file: 'dist/web.js',
      format: 'es',
    },
  },
]

function onwarn(warning, warn) {
  if (warning.code === 'CIRCULAR_DEPENDENCY') {
    return
  }

  warn(warning.message)
}

export default configs
