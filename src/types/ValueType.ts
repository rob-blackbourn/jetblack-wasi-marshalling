// @filename '../types.d.ts'

import { MemoryManager } from '../MemoryManager'

import { Type } from './Type'

/**
 * A base class representing a value type
 * @template T
 * @extends {Type<T>}
 */
export abstract class ValueType<T> extends Type<T> {
  TypedArrayType: TypedArrayConstructor

  /**
   * The abstract constructor for a type.
   * @param {Int8ArrayConstructor|Int16ArrayConstructor|Int32ArrayConstructor|BigInt64ArrayConstructor|Uint8ArrayConstructor|Uint16ArrayConstructor|Uint32ArrayConstructor|BigUint64ArrayConstructor|Float32ArrayConstructor|Float64ArrayConstructor} typedArrayType The typed array for the type
   */
  constructor (typedArrayType: TypedArrayConstructor) {
    super()
    this.TypedArrayType = typedArrayType
  }

  /**
   * Allocate memory for the type
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of the unmarshalled value
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The address of the allocated memory
   */
  alloc (memoryManager: MemoryManager, unmarshalledIndex: number, unmarshalledArgs: Array<any>): number {
    return memoryManager.malloc(this.TypedArrayType.BYTES_PER_ELEMENT)
  }

  /**
   * Free allocated memory
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the memory to be freed
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {void}
   */
  free (memoryManager: MemoryManager, address: number, unmarshalledIndex: number, unmarshalledArgs: Array<any>): void {
    memoryManager.free(address)
  }

  copy(dest: T, source: T): T {
    throw new Error("Method not implemented.")
  }
}
