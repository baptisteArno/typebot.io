import resolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import { babel } from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'
import { typescriptPaths } from 'rollup-plugin-typescript-paths'
import alias from '@rollup/plugin-alias'
import { dts } from 'rollup-plugin-dts'

const extensions = ['.ts', '.tsx']

const indexConfig = {
  input: './src/index.ts',
  output: {
    dir: './dist',
    format: 'es',
  },
  external: ['next/dynamic', 'react', 'react/jsx-runtime'],
  plugins: [
    alias({
      entries: [
        { find: '@typebot.io/js/dist/web', replacement: '../../js/dist/web' },
      ],
    }),
    resolve({ extensions }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: ['@babel/preset-react', '@babel/preset-typescript'],
      extensions,
    }),
    typescript(),
    typescriptPaths({ preserveExtensions: true }),
    terser({ output: { comments: false } }),
  ],
}

const typesConfig = {
  input: './src/index.ts',
  output: [{ file: './dist/index.d.ts', format: 'es' }],
  plugins: [
    alias({
      entries: [
        { find: '@typebot.io/js', replacement: '../../js' },
        {
          find: '@/types',
          replacement: '../types',
        },
      ],
    }),
    dts(),
  ],
}

const configs = [indexConfig, typesConfig]

export default configs
