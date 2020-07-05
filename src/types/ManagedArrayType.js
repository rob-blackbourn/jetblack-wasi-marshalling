import { MemoryManager } from '../MemoryManager'

import { ReferenceType } from './ReferenceType'
import { Type } from './Type'

/**
 * An array type
 * @template T
 * @extends {ReferenceType<TypedArray>}
 */
export class ManagedArrayType extends ReferenceType {
  /**
   * Construct an array type
   * @param {Type<T>} type The type of the elements in the array
   * @param {number} length The length of the array
   */
  constructor (type, length) {
    super()
    this.type = type
    this.length = length
  }

  /**
   * Allocate memory for the array.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {TypedArray} [unmarshalledValue] An optional unmarshalled array
   * @returns {number} The address of the allocated memory.
   */
  alloc (memoryManager, unmarshalledValue) {
    if (unmarshalledValue != null) {
      return unmarshalledValue.byteOffset
    } else {
      return memoryManager.malloc(this.length * this.type.TypedArrayType.BYTES_PER_ELEMENT)
    }
  }

  /**
   * Free allocated memory.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the memory to be freed
   * @param {TypedArray} [unmarshalledValue] An optional unmarshalled array
   */
  free (memoryManager, address, unmarshalledValue) {
    // The finalizer handles freeing.
  }

  /**
   * Marshall a (possibly nested) array.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {TypedArray} unmarshalledValue The array to be marshalled
   * @returns {number} The address of the marshalled array
   */
  marshall (memoryManager, unmarshalledValue) {
    return unmarshalledValue.byteOffset
  }

  /**
   * Unmarshall a possibly nested array.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the marshalled array
   * @param {TypedArray} [unmarshalledValue] An optional unmarshalled array
   * @returns {TypedArray} The unmarshalled array
   */
  unmarshall (memoryManager, address, unmarshalledValue) {
    if (unmarshalledValue != null) {
      return unmarshalledValue
    } else {
      const typedArray = new this.type.TypedArrayType(memoryManager.memory.buffer, address, this.length)
      memoryManager.registry.register(typedArray, address)
      return typedArray
    }
  }

  /**
   * Copy an array
   * @param {TypedArray} dest The array to receive the data
   * @param {TypedArray} source The source array
   * @returns {TypedArray} The array to which the data was copied.
   */
  copy (dest, source) {
    // Nothing to do.
    return dest
  }
}
