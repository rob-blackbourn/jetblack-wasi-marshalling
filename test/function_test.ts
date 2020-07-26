const assert = require('assert')
import { makeMockMemoryManager } from './mocks'
import {
  Float32Type,
  Float64Type,
  FunctionPrototype,
  In,
  Int32Type,
  Uint32Type,
  TypedArrayType,
  FunctionRegistry,
  Marshaller
} from '../src/index'

interface wasmCallback{(...args: any): any;}

describe('test the function invoking', () => {

  it('should invoke wasm functions', () => {
    const memoryManager = makeMockMemoryManager()
    const registry = new FunctionRegistry(memoryManager)
    const marshaller = new Marshaller({})
    marshaller.memoryManager = memoryManager
    marshaller.functionRegistry = registry
    marshaller.instance = {
      'exports': {
        'add_int32': (a, b, len) => {
          const array1 = new Int32Array(memoryManager.memory.buffer, a, len)
          const array2 = new Int32Array(memoryManager.memory.buffer, b, len)
          const result = memoryManager.createTypedArray(Int32Array, len)
          for (let i = 0; i < len; ++i) {
            result[i] = array1[i] + array2[i]
          }
          return result.byteOffset
        },
        'add_float32': (a, b, len) => {
          const array1 = new Float32Array(memoryManager.memory.buffer, a, len)
          const array2 = new Float32Array(memoryManager.memory.buffer, b, len)
          const result = memoryManager.createTypedArray(Float32Array, len)
          for (let i = 0; i < len; ++i) {
            result[i] = array1[i] + array2[i]
          }
          return result.byteOffset
        },
        'add_float64': (a, b, len) => {
          const array1 = new Float64Array(memoryManager.memory.buffer, a, len)
          const array2 = new Float64Array(memoryManager.memory.buffer, b, len)
          const result = memoryManager.createTypedArray(Float64Array, len)
          for (let i = 0; i < len; ++i) {
            result[i] = array1[i] + array2[i]
          }
          return result.byteOffset
        },
        'minus_int32': (a, b, len) => {
          const array1 = new Int32Array(memoryManager.memory.buffer, a, len)
          const array2 = new Int32Array(memoryManager.memory.buffer, b, len)
          const result = memoryManager.createTypedArray(Int32Array, len)
          for (let i = 0; i < len; ++i) {
            result[i] = array1[i] - array2[i]
          }
          return result.byteOffset
        },
        'minus_float32': (a, b, len) => {
          const array1 = new Float32Array(memoryManager.memory.buffer, a, len)
          const array2 = new Float32Array(memoryManager.memory.buffer, b, len)
          const result = memoryManager.createTypedArray(Float32Array, len)
          for (let i = 0; i < len; ++i) {
            result[i] = array1[i] - array2[i]
          }
          return result.byteOffset
        },
        'minus_float64': (a, b, len) => {
          const array1 = new Float64Array(memoryManager.memory.buffer, a, len)
          const array2 = new Float64Array(memoryManager.memory.buffer, b, len)
          const result = memoryManager.createTypedArray(Float64Array, len)
          for (let i = 0; i < len; ++i) {
            result[i] = array1[i] - array2[i]
          }
          return result.byteOffset
        }
      }
    }

    // Plus
    const plusName = Symbol.for('+')
    const plusIntProto = new FunctionPrototype(
      [
        new In(new TypedArrayType(new Int32Type(), null)),
        new In(new TypedArrayType(new Int32Type(), null)),
        new In(new Uint32Type())
      ],
      new TypedArrayType(new Int32Type(), (i, args) => args[2])
    )
    const plusFloatProto = new FunctionPrototype(
      [
        new In(new TypedArrayType(new Float32Type(), null)),
        new In(new TypedArrayType(new Float32Type(), null)),
        new In(new Uint32Type())
      ],
      new TypedArrayType(new Float32Type(), (i, args) => args[2])
    )
    const plusDoubleProto = new FunctionPrototype(
      [
        new In(new TypedArrayType(new Float64Type(), null)),
        new In(new TypedArrayType(new Float64Type(), null)),
        new In(new Uint32Type())
      ],
      new TypedArrayType(new Float64Type(), (i, args) => args[2])
    )

    marshaller.registerFunction(
      plusName,
      plusIntProto,
      <wasmCallback>marshaller.instance.exports.add_int32
    )

    marshaller.registerFunction(
      plusName,
      plusFloatProto,
      <wasmCallback>marshaller.instance.exports.add_float32
    )

    marshaller.registerFunction(
      plusName,
      plusDoubleProto,
      <wasmCallback>marshaller.instance.exports.add_float64
    )

    // Minus
    const minusName = Symbol.for('-')
    const minusIntProto = new FunctionPrototype(
      [
        new In(new TypedArrayType(new Int32Type(), null)),
        new In(new TypedArrayType(new Int32Type(), null)),
        new In(new Uint32Type())
      ],
      new TypedArrayType(new Int32Type(), (i, args) => args[2])
    )
    const minusFloatProto = new FunctionPrototype(
      [
        new In(new TypedArrayType(new Float32Type(), null)),
        new In(new TypedArrayType(new Float32Type(), null)),
        new In(new Uint32Type())
      ],
      new TypedArrayType(new Float32Type(), (i, args) => args[2])
    )
    const minusDoubleProto = new FunctionPrototype(
      [
        new In(new TypedArrayType(new Float64Type(), null)),
        new In(new TypedArrayType(new Float64Type(), null)),
        new In(new Uint32Type())
      ],
      new TypedArrayType(new Float64Type(), (i, args) => args[2])
    )

    marshaller.registerFunction(
      minusName,
      minusIntProto,
      <wasmCallback>marshaller.instance.exports.minus_int32
    )

    marshaller.registerFunction(
      minusName,
      minusFloatProto,
      <wasmCallback>marshaller.instance.exports.minus_float32
    )

    marshaller.registerFunction(
      minusName,
      minusDoubleProto,
      <wasmCallback>marshaller.instance.exports.minus_float64
    )

    const plusIntResult = marshaller.invoke(
      plusName,
      memoryManager.createTypedArray(Int32Array, [1,2,3,4]),
      memoryManager.createTypedArray(Int32Array, [1,2,3,4]),
      4)
    assert.ok(plusIntResult instanceof Int32Array)
    assert.deepStrictEqual(plusIntResult, new Int32Array([2,4,6,8]))

    const minusIntResult = marshaller.invoke(
      minusName,
      memoryManager.createTypedArray(Int32Array, [1,2,3,4]),
      memoryManager.createTypedArray(Int32Array, [1,2,3,4]),
      4)
    assert.ok(minusIntResult instanceof Int32Array)
    assert.deepStrictEqual(minusIntResult, new Int32Array([0,0,0,0]))
  })

})
