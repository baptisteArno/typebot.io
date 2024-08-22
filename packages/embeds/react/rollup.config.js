import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import { babel } from '@rollup/plugin-babel'
import { typescriptPaths } from 'rollup-plugin-typescript-paths'
import typescript from '@rollup/plugin-typescript'
import fs from 'fs'

const extensions = ['.ts', '.tsx']

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const packageVersion = packageJson.version
const preamble = `// v${packageVersion}`

const indexConfig = {
  input: './src/index.ts',
  output: {
    file: './dist/index.js',
    format: 'es',
  },
  external: ['react', 'react/jsx-runtime'],
  watch: {
    clearScreen: false,
  },
  plugins: [
    resolve({ extensions }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ['@babel/preset-react', '@babel/preset-typescript'],
      extensions,
    }),
    typescriptPaths({ preserveExtensions: true }),
    typescript({
      noEmitOnError: !process.env.ROLLUP_WATCH,
    }),
    terser({ format: { preamble } }),
  ],
}

const configs = [indexConfig]

export default configs
