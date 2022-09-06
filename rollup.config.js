import resolve from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import commonjs from "@rollup/plugin-commonjs"
import json from 'rollup-plugin-json'
import cleaner from 'rollup-plugin-cleaner';
import {uglify} from 'rollup-plugin-uglify'

export default [
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].cjs.js',
      exports: 'auto'
    },
    plugins: [resolve(), commonjs(), typescript(), json(), cleaner({
      targets: [
        './dist/'
      ]
    })]
  },
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].esm.js'
    },
    plugins: [resolve(), commonjs(), typescript(), json()]
  },
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'umd',
      name: 'AMZGif',
      entryFileNames: '[name].umd.js'
    },
    plugins: [resolve(), commonjs(), typescript(), json()]
  },
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'umd',
      name: 'AMZGif',
      entryFileNames: '[name].umd.min.js'
    },
    plugins: [resolve(), commonjs(), typescript(), json(), uglify()]
  }
]
