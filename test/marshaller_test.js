import assert from 'assert'
import { makeMockMemoryManager } from './mocks'
import {
  ArrayType,
  Float32Type,
  Float64Type,
  FunctionPrototype,
  In,
  Int32Type,
  Uint64Type,
  Out,
  Pointer,
  PointerType,
  StringType,
  TypedArrayType
} from '../src'
import { VoidType } from '../src/types/VoidType'

describe('test the marshaller', () => {
  it('should convert a string to a pointer and back', () => {
    const memoryManager = makeMockMemoryManager()

    const value = 'Hello, World!'
    const type = new StringType()
    const ptr = type.marshall(memoryManager, 0, [value])
    const roundtrip = type.unmarshall(memoryManager, ptr, -1, [])
    assert.strictEqual(value, roundtrip)
    assert.strictEqual(memoryManager.usedCount(), 0)
  })

  it('should roundtrip float 64 array', () => {
    const memoryManager = makeMockMemoryManager()

    const value = [1, 2, 3, 4]
    const type = new ArrayType(new Float64Type(), value.length)
    const ptr = type.marshall(memoryManager, 0, [value])
    const roundtrip = type.unmarshall(memoryManager, ptr, -1, [])
    assert.deepStrictEqual(value, roundtrip)
    assert.strictEqual(memoryManager.usedCount(), 0)
  })

  it('should roundtrip array of strings', () => {
    const memoryManager = makeMockMemoryManager()
    const value = ['one', 'two', 'three', 'four']
    const type = new ArrayType(new StringType(), value.length)
    const ptr = type.marshall(memoryManager, 0, [value])
    const roundtrip = type.unmarshall(memoryManager, ptr, -1, [])
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
    const ptr = type.marshall(memoryManager, 0, [value])
    const roundtrip = type.unmarshall(memoryManager, ptr, -1, [])
    assert.deepStrictEqual(value, roundtrip)
    assert.strictEqual(memoryManager.usedCount(), 0)
  })

  it('should roundtrip pointers', () => {
    const memoryManager = makeMockMemoryManager()
    const value = new Pointer(42)
    const type = new PointerType(new Int32Type())
    const ptr = type.marshall(memoryManager, 0, [value])
    const roundtrip = type.unmarshall(memoryManager, ptr, -1, [])
    assert.deepStrictEqual(value, roundtrip)
    assert.strictEqual(memoryManager.usedCount(), 0)
  })

})
