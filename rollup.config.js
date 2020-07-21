import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
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
    resolve(),
    babel({ babelHelpers: 'bundled' })
  ]
};
