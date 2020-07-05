import { MemoryManager } from '../MemoryManager'

import { ReferenceType } from './ReferenceType'
import { Type } from './Type'

/**
 * An array type
 * @template T
 * @extends {ReferenceType<Array<T>>}
 */
export class ArrayType extends ReferenceType {
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
   * @param {Array<T>} [unmarshalledValue] An optional unmarshalled array
   * @returns {number} The address of the allocated memory.
   */
  alloc (memoryManager, unmarshalledValue) {
    if (this.length != null && unmarshalledValue != null && this.length !== unmarshalledValue.length) {
      throw new RangeError('Invalid array length')
    }

    const length = unmarshalledValue != null ? unmarshalledValue.length : this.length
    if (length == null) {
      throw new RangeError('Unknown length')
    }
    return memoryManager.malloc(length * this.type.TypedArrayType.BYTES_PER_ELEMENT)
  }

  /**
   * Free allocated memory.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the memory to be freed
   * @param {Array<T>} [unmarshalledValue] An optional unmarshalled array
   */
  free (memoryManager, address, unmarshalledValue) {
    try {
      const length = unmarshalledValue != null ? unmarshalledValue.length : this.length
      if (length == null) {
        throw new Error('Unknwon length for array')
      }
      if (this.type instanceof ReferenceType) {
        const typedArray = new this.type.TypedArrayType(memoryManager.memory.buffer, address, length)
        typedArray.forEach(item => this.type.free(memoryManager, item, null))
      }
    } finally {
      memoryManager.free(address)
    }
  }

  /**
   * Marshall a (possibly nested) array.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {Array<T>} unmarshalledValue The array to be marshalled
   * @returns {number} The address of the marshalled array
   */
  marshall (memoryManager, unmarshalledValue) {
    const address = this.alloc(memoryManager, unmarshalledValue)

    const typedArray = new this.type.TypedArrayType(memoryManager.memory.buffer, address, unmarshalledValue.length)
    if (this.type instanceof ReferenceType) {
      unmarshalledValue.forEach((item, i) => {
        typedArray[i] = /** @type {number} */ (this.type.marshall(memoryManager, item))
      })
    } else {
      // @ts-ignore
      typedArray.set(unmarshalledValue)
    }

    return address
  }

  /**
   * Unmarshall a possibly nested array.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the marshalled array
   * @param {Array<T>} unmarshalledValue AN optional unmarshalled array
   * @returns {Array<T>} The unmarshalled array
   */
  unmarshall (memoryManager, address, unmarshalledValue) {
    try {
      const length = unmarshalledValue != null ? unmarshalledValue.length : this.length
      if (length == null) {
        throw new Error('Unknwon length for array')
      }
      const typedArray = new this.type.TypedArrayType(memoryManager.memory.buffer, address, length)
      // @ts-ignore
      return this.type instanceof ReferenceType
        // @ts-ignore
        ? Array.from(typedArray, x => (this.type.unmarshall(memoryManager, x, null)))
        // @ts-ignore
        : Array.from(typedArray)
    } finally {
      memoryManager.free(address)
    }
  }

  /**
   * Copy an array
   * @param {Array<T>} dest The array to receive the data
   * @param {Array<T>} source The source array
   * @returns {Array<T>} The array to which the data was copied.
   */
  copy (dest, source) {
    dest.splice(0, dest.length, ...source)
    return dest
  }
}
