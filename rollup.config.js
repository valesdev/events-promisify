import typescriptPlugin from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'umd',
    name: 'EventEmitter'
  },
  plugins: [typescriptPlugin()]
}
