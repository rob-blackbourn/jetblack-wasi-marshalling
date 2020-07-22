import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser'

export default {
  input: './src/index.ts',
  output: [
    {
      file: 'lib/index.js',
      format: 'umd',
      name: 'WasiMarshalling',
      sourcemap: true
    },
    {
      file: 'lib/index.min.js',
      format: 'umd',
      name: 'WasiMarshalling',
      plugins: [terser()],
      sourcemap: true
    }
  ],
  plugins: [typescript()]
}