// @flow

import { MemoryManager } from '../MemoryManager'

import type { malloc, free, void_ptr } from '../wasiLibDef'

/**
 * The base class for representing types
 * @template T The value type
 */
export class Type<T> {
  TypedArrayType: Class<$TypedArray>

  /**
   * The abstract constructor for a type.
   * @param {Int8ArrayConstructor|Int16ArrayConstructor|Int32ArrayConstructor|BigInt64ArrayConstructor|Uint8ArrayConstructor|Uint16ArrayConstructor|Uint32ArrayConstructor|BigUint64ArrayConstructor|Float32ArrayConstructor|Float64ArrayConstructor} typedArrayType The typed array for the type
   */
  constructor (typedArrayType: Class<$TypedArray>) {
    this.TypedArrayType = typedArrayType
  }

  /**
   * Allocate memory for the type
   * @abstract
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of the unmarshalled value
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The address of the allocated value in memory
   */
  alloc (memoryManager: MemoryManager, unmarshalledIndex: number, unmarshalledArgs: Array<any>): void_ptr {
    throw new TypeError('Not Implemented')
  }

  /**
   * Free the memory for the value
   * @abstract
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the value in memory
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {void}
   */
  free (memoryManager: MemoryManager, address: void_ptr, unmarshalledIndex: number, unmarshalledArgs: Array<any>): void {
    throw new TypeError('Not Implemented')
  }

  /**
   * Marshal a value.
   * @abstract
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of the value to marshall
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number|T} The marshalled value
   */
  marshall (memoryManager: MemoryManager, unmarshalledIndex: number, unmarshalledArgs: Array<any>): void_ptr|T {
    throw new TypeError('Not Implemented')
  }

  /**
   * Unmarshall a value.
   * @abstract
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the value in memory
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled args
   * @returns {T}
   */
  unmarshall (memoryManager: MemoryManager, address: void_ptr, unmarshalledIndex: number, unmarshalledArgs: Array<any>): T {
    throw new TypeError('Not Implemented')
  }

  /**
   * Copy a value
   * @abstract
   * @param {T} dest The destination value
   * @param {T} source The source value
   * @returns {T} The destination value
   */
  copy (dest: T, source: T): T {
    throw new TypeError('Not Implemented')
  }

  /**
   * The mangled name
   * @returns {string} The mangled name for the type.
   */
  get mangledName(): string {
    throw new TypeError("Not Implemented")
  }
}
