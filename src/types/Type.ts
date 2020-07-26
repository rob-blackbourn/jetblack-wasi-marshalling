// @filename '../types.d.ts'

import { MemoryManager } from '../MemoryManager'

/**
 * The base class for representing types
 * @template T The value type
 */
export abstract class Type<T> {

  /**
   * Allocate memory for the type
   * @abstract
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of the unmarshalled value
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The address of the allocated value in memory
   */
  abstract alloc (memoryManager: MemoryManager, unmarshalledIndex: number, unmarshalledArgs: Array<any>): number;

  /**
   * Free the memory for the value
   * @abstract
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the value in memory
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {void}
   */
  abstract free (memoryManager: MemoryManager, address: number, unmarshalledIndex: number, unmarshalledArgs: Array<any>): void;

  /**
   * Marshal a value.
   * @abstract
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of the value to marshall
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The marshalled value
   */
  abstract marshall (memoryManager: MemoryManager, unmarshalledIndex: number, unmarshalledArgs: Array<any>): number;

  /**
   * Unmarshall a value.
   * @abstract
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the value in memory
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled args
   * @returns {T}
   */
  abstract unmarshall (memoryManager: MemoryManager, address: number, unmarshalledIndex: number, unmarshalledArgs: Array<any>): T;

  /**
   * Copy a value
   * @abstract
   * @param {T} dest The destination value
   * @param {T} source The source value
   * @returns {T} The destination value
   */
  abstract copy (dest: T, source: T): T;

  /**
   * The mangled name
   * @returns {string} The mangled name for the type.
   */
  abstract get mangledName(): string;
}
