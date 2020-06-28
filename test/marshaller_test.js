/* eslint-env mocha */

import assert from 'assert'
import { makeMockMemoryManager } from './mocks'
import {
  ArrayType,
  Float64Type,
  FunctionPrototype,
  In,
  Int32Type,
  Out,
  Pointer,
  PointerType,
  StringType
} from '../src/types'

describe('test the marshaller', () => {
  it('should convert a string to a pointer and back', () => {
    const memoryManager = makeMockMemoryManager()

    const value = 'Hello, World!'
    const type = new StringType()
    const ptr = type.marshall(value, memoryManager)
    const roundtrip = type.unmarshall(ptr, memoryManager)
    assert.strictEqual(value, roundtrip)
    assert.strictEqual(memoryManager.usedCount(), 0)
  })

  it('should roundtrip float 64 array', () => {
    const memoryManager = makeMockMemoryManager()

    const value = [1, 2, 3, 4]
    const type = new ArrayType(new Float64Type(), value.length)
    const ptr = type.marshall(value, memoryManager)
    const roundtrip = type.unmarshall(ptr, memoryManager)
    console.log(value, roundtrip)
    assert.deepStrictEqual(value, roundtrip)
    assert.strictEqual(memoryManager.usedCount(), 0)
  })

  it('should roundtrip array of strings', () => {
    const memoryManager = makeMockMemoryManager()
    const value = ['one', 'two', 'three', 'four']
    const type = new ArrayType(new StringType(), value.length)
    const ptr = type.marshall(value, memoryManager)
    const roundtrip = type.unmarshall(ptr, memoryManager)
    assert.deepStrictEqual(value, roundtrip)
    assert.strictEqual(memoryManager.usedCount(), 0)
  })

  it('should roundtrip array of arrays', () => {
    const memoryManager = makeMockMemoryManager()
    const value = [
      [1, 2, 3],
      [4, 5, 6]
    ]
    const type = new ArrayType(new ArrayType(new Int32Type(), 3), 2)
    const ptr = type.marshall(value, memoryManager)
    const roundtrip = type.unmarshall(ptr, memoryManager)
    assert.deepStrictEqual(value, roundtrip)
    assert.strictEqual(memoryManager.usedCount(), 0)
  })

  it('should roundtrip pointers', () => {
    const memoryManager = makeMockMemoryManager()
    const value = new Pointer(42)
    const type = new PointerType(new Int32Type())
    const ptr = type.marshall(value, memoryManager)
    const roundtrip = type.unmarshall(ptr, memoryManager)
    assert.deepStrictEqual(value, roundtrip)
    assert.strictEqual(memoryManager.usedCount(), 0)
  })

  it('should capture function result', () => {
    const memoryManager = makeMockMemoryManager()

    function multipleFloat64ArraysReturningPtr (arrayPtr1, arrayPtr2, length) {
      const array1 = new Float64Array(memoryManager.memory.buffer, arrayPtr1, length)
      const array2 = new Float64Array(memoryManager.memory.buffer, arrayPtr2, length)
      const resultPtr = memoryManager.malloc(length * Float64Array.BYTES_PER_ELEMENT)
      const result = new Float64Array(memoryManager.memory.buffer, resultPtr, length)
      for (let i = 0; i < length; ++i) {
        result[i] = array1[i] * array2[i]
      }
      return resultPtr
    }

    const proto = new FunctionPrototype(
      [
        new In(new ArrayType(new Float64Type())),
        new In(new ArrayType(new Float64Type())),
        new In(new Int32Type())
      ],
      new ArrayType(new Float64Type(), 4)
    )

    const result = proto.invoke(
      memoryManager,
      multipleFloat64ArraysReturningPtr,
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      4)

    assert.deepStrictEqual(result, [5, 12, 21, 32])
    assert.strictEqual(memoryManager.usedCount(), 0)
  })

  it('should update output argument', () => {
    const memoryManager = makeMockMemoryManager()

    function multipleFloat64ArraysWithOutputArray (arrayPtr1, arrayPtr2, resultPtr, length) {
      const array1 = new Float64Array(memoryManager.memory.buffer, arrayPtr1, length)
      const array2 = new Float64Array(memoryManager.memory.buffer, arrayPtr2, length)
      const result = new Float64Array(memoryManager.memory.buffer, resultPtr, length)
      for (let i = 0; i < length; ++i) {
        result[i] = array1[i] * array2[i]
      }
    }

    const proto = new FunctionPrototype(
      [
        new In(new ArrayType(new Float64Type())),
        new In(new ArrayType(new Float64Type())),
        new Out(new ArrayType(new Float64Type())),
        new In(new Int32Type())
      ]
    )

    const input1 = [1, 2, 3, 4]
    const input2 = [5, 6, 7, 8]
    const output = new Array(4)
    proto.invoke(
      memoryManager,
      multipleFloat64ArraysWithOutputArray,
      input1,
      input2,
      output,
      input1.length)

    assert.deepStrictEqual(output, [5, 12, 21, 32])
    assert.strictEqual(memoryManager.usedCount(), 0)
  })
})
