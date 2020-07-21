// @flow

import { MemoryManager } from '../MemoryManager'

import type { malloc, free } from '../wasiLibDef'

/**
 * The base class for representing types
 * @template T The value type
 */
export class Type<T> {

  /**
   * Allocate memory for the type
   * @abstract
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of the unmarshalled value
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The address of the allocated value in memory
   */
  alloc (memoryManager: MemoryManager, unmarshalledIndex: number, unmarshalledArgs: Array<any>): number {
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
  free (memoryManager: MemoryManager, address: number, unmarshalledIndex: number, unmarshalledArgs: Array<any>): void {
    throw new TypeError('Not Implemented')
  }

  /**
   * Marshal a value.
   * @abstract
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of the value to marshall
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The marshalled value
   */
  marshall (memoryManager: MemoryManager, unmarshalledIndex: number, unmarshalledArgs: Array<any>): number {
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
  unmarshall (memoryManager: MemoryManager, address: number, unmarshalledIndex: number, unmarshalledArgs: Array<any>): T {
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
