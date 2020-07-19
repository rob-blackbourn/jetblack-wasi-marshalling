const assert = require('assert')
import { makeMockMemoryManager } from './mocks'
import {
  ArrayType,
  Float64Type,
  FunctionPrototype,
  In,
  Int32Type,
  Out,
} from '../src/index'
import { VoidType } from '../src/types/VoidType'

describe('test invoking functions', () => {

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
        new In(new ArrayType(new Float64Type(), null)),
        new In(new ArrayType(new Float64Type(), null)),
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

  it('should capture function result with length callback', () => {
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
        new In(new ArrayType(new Float64Type(), null)),
        new In(new ArrayType(new Float64Type(), null)),
        new In(new Int32Type())
      ],
      new ArrayType(new Float64Type(), (i, args) => args[2])
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
        new In(new ArrayType(new Float64Type(), null)),
        new In(new ArrayType(new Float64Type(), null)),
        new Out(new ArrayType(new Float64Type(), null)),
        new In(new Int32Type())
      ],
      new VoidType()
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
