import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs'

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
  plugins: [
    nodeResolve(),
    typescript({ module: 'CommonJS' }),
    commonjs({ extensions: ['.js', '.ts'] }) // the ".ts" extension is required
  ]
}