import assert from 'assert'
import { makeMockMemoryManager } from './mocks'
import {
  ArrayType,
  Float32Type,
  Float64Type,
  FunctionPrototype,
  In,
  Int32Type,
  Uint32Type,
  Out,
  Pointer,
  PointerType,
  StringType,
  VoidType,
  TypedArrayType,
  FunctionRegistry,
  Wasi
} from '../src'

describe('test the function registry', () => {

  it('should invoke wasm functions', () => {
    const memoryManager = makeMockMemoryManager()
    const registry = new FunctionRegistry(memoryManager)
    const wasi = new Wasi({})
    wasi.memoryManager = memoryManager
    wasi.functionRegistry = registry
    wasi.instance = {
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

    registry.register(
      plusName,
      plusIntProto,
      wasi.instance.exports.add_int32
    )

    registry.register(
      plusName,
      plusFloatProto,
      wasi.instance.exports.add_float32
    )

    registry.register(
      plusName,
      plusDoubleProto,
      wasi.instance.exports.add_float64
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

    registry.register(
      minusName,
      minusIntProto,
      wasi.instance.exports.minus_int32
    )

    registry.register(
      minusName,
      minusFloatProto,
      wasi.instance.exports.minus_float32
    )

    registry.register(
      minusName,
      minusDoubleProto,
      wasi.instance.exports.minus_float64
    )

    const plusIntArg1 =  /** @type {Int32Array} */ (memoryManager.createTypedArray(Int32Array, 4))
    plusIntArg1.set([1,2,3,4])
    const plusIntArg2 =  /** @type {Int32Array} */ (memoryManager.createTypedArray(Int32Array, 4))
    plusIntArg2.set([1,2,3,4])
    const plusIntCallback = registry.match(
      plusName,
      [plusIntArg1, plusIntArg2, 4],
      { defaultInt: Uint32Type.MANGLED_NAME, defaultFloat: Float64Type.MANGLED_NAME }
    )
    assert.ok(plusIntCallback != null)
    const plusIntResult = plusIntCallback(plusIntArg1, plusIntArg2, 4)
    assert.ok(plusIntResult instanceof Int32Array)
    assert.deepStrictEqual(plusIntResult, new Int32Array([2,4,6,8]))

    const minusIntArg1 =  /** @type {Int32Array} */ (memoryManager.createTypedArray(Int32Array, 4))
    minusIntArg1.set([1,2,3,4])
    const minusIntArg2 =  /** @type {Int32Array} */ (memoryManager.createTypedArray(Int32Array, 4))
    minusIntArg2.set([1,2,3,4])
    const minusIntCallback = registry.match(
      minusName,
      [minusIntArg1, minusIntArg2, 4],
      { defaultInt: Uint32Type.MANGLED_NAME, defaultFloat: Float64Type.MANGLED_NAME }
    )
    assert.ok(minusIntCallback != null)
    const minusIntResult = minusIntCallback(minusIntArg1, minusIntArg2, 4)
    assert.ok(minusIntResult instanceof Int32Array)
    assert.deepStrictEqual(minusIntResult, new Int32Array([0,0,0,0]))
  })

})
