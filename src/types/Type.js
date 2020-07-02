import { MemoryManager } from '../MemoryManager'

/**
 * The base class for representing types
 * @template T
 */
export class Type {
  /**
   * The abstract constructor for a type.
   * @param {TypedArray} typedArrayType The typed array for the type
   */
  constructor (typedArrayType) {
    this.TypedArrayType = typedArrayType
  }

  /**
   * Allocate memory for the type
   * @param {MemoryManager} memoryManager The memory manager
   * @param {T} array An optional array
   * @returns {number} The address of the allocated value in memory
   */
  alloc (memoryManager, array) {
    throw new Error('Not Implemented')
  }

  /**
   * Free the memory for the value
   * @param {number} address The address of the value in memory
   * @param {MemoryManager} memoryManager The memory manager
   * @param {T} value An optional unmarshalled value
   */
  free (address, memoryManager, value) {
    throw new Error('Not Implemented')
  }

  /**
   * Marshal a value into memory
   * @param {T} value The value to marshall
   * @param {MemoryManager} memoryManager The memory manager
   * @returns {number|T} The marshalled value
   */
  marshall (value, memoryManager) {
    throw new Error('Not Implemented')
  }

  /**
   * 
   * @param {number} address The address of the value in memory
   * @param {MemoryManager} memoryManager The memory manager
   * @param {T} value An optional unmarshalled value
   */
  unmarshall (address, memoryManager, value) {
    throw new Error('Not Implemented')
  }

  /**
   * Copy a value
   * @param {T} dest The destination value
   * @param {T} source The source value
   * @returns {T} The destination value
   */
  copy (dest, source) {
    throw new Error('Not Implemented')
  }
}
