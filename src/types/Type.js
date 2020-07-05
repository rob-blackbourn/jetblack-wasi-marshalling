import { MemoryManager } from '../MemoryManager'

/**
 * The base class for representing types
 * @template T
 */
export class Type {
  /**
   * The abstract constructor for a type.
   * @param {Int8ArrayConstructor|Int16ArrayConstructor|Int32ArrayConstructor|BigInt64ArrayConstructor|Uint8ArrayConstructor|Uint16ArrayConstructor|Uint32ArrayConstructor|BigUint64ArrayConstructor|Float32ArrayConstructor|Float64ArrayConstructor} typedArrayType The typed array for the type
   */
  constructor (typedArrayType) {
    this.TypedArrayType = typedArrayType
  }

  /**
   * Allocate memory for the type
   * @abstract
   * @param {MemoryManager} memoryManager The memory manager
   * @param {T} value An optional value
   * @returns {number} The address of the allocated value in memory
   */
  alloc (memoryManager, value) {
    throw new Error('Not Implemented')
  }

  /**
   * Free the memory for the value
   * @abstract
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the value in memory
   * @param {T} [value] An optional unmarshalled value
   */
  free (memoryManager, address, value) {
    throw new Error('Not Implemented')
  }

  /**
   * Marshal a value.
   * @abstract
   * @param {MemoryManager} memoryManager The memory manager
   * @param {T} value The value to marshall
   * @returns {number|T} The marshalled value
   */
  marshall (memoryManager, value) {
    throw new Error('Not Implemented')
  }

  /**
   * Unmarshall a value.
   * @abstract
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the value in memory
   * @param {T} [value] An optional unmarshalled value
   * @returns {T}
   */
  unmarshall (memoryManager, address, value) {
    throw new Error('Not Implemented')
  }

  /**
   * Copy a value
   * @abstract
   * @param {T} dest The destination value
   * @param {T} source The source value
   * @returns {T} The destination value
   */
  copy (dest, source) {
    throw new Error('Not Implemented')
  }
}
