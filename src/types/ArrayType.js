import { MemoryManager } from '../MemoryManager'

import { ReferenceType } from './ReferenceType'
import { Type } from './Type'

/**
 * Gets the length
 * @callback lengthCallback
 * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
 * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
 * @returns {number} The length of the array
 */

/**
 * An array type
 * @template T
 * @extends {ReferenceType<Array<T>>}
 */
export class ArrayType extends ReferenceType {
  /**
   * Construct an array type
   * @param {Type<T>} type The type of the elements in the array
   * @param {number|lengthCallback} [length] The length of the array
   */
  constructor (type, length = null) {
    super()
    this.type = type
    this.length = length
  }

  /**
   * Get the length of the array
   * @param {number} unmarshalledIndex The index of the unmarshalled argument or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The length of the array.
   */
  getLength (unmarshalledIndex, unmarshalledArgs) {
    if (typeof this.length === 'number') {
      return this.length
    } else if (typeof this.length === 'function') {
      return this.length(unmarshalledIndex, unmarshalledArgs)
    } else if (unmarshalledIndex !== -1) {
      const array = /** @type {Array<T>} */ (unmarshalledArgs[unmarshalledIndex])
      return array.length
    } else {
      throw RangeError('Unable to establish the length of the array')
    }
  }

  /**
   * Allocate memory for the array.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index to the unmarshalled array
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The address of the allocated memory.
   */
  alloc (memoryManager, unmarshalledIndex, unmarshalledArgs) {
    const length = this.getLength(unmarshalledIndex, unmarshalledArgs)
    return memoryManager.malloc(length * this.type.TypedArrayType.BYTES_PER_ELEMENT)
  }

  /**
   * Free allocated memory.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the memory to be freed
   * @param {number} unmarshalledIndex The index of the unmarshalled array or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled args
   * @returns {void}
   */
  free (memoryManager, address, unmarshalledIndex, unmarshalledArgs) {
    try {
      const length = this.getLength(unmarshalledIndex, unmarshalledArgs)
      if (this.type instanceof ReferenceType) {
        const unmarshalledValue = unmarshalledIndex == -1 ? null : unmarshalledArgs[unmarshalledIndex]
        const typedArray = new this.type.TypedArrayType(memoryManager.memory.buffer, address, length)
        typedArray.forEach((item, i) => {
          const index = unmarshalledValue == null ? -1 : 0
          const args = unmarshalledValue == null ? [] : unmarshalledValue[i]
          this.type.free(memoryManager, item, index, args)
        })
      }
    } finally {
      memoryManager.free(address)
    }
  }

  /**
   * Marshall a possibly nested array.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of the unmarshalled value
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The address of the marshalled array
   */
  marshall (memoryManager, unmarshalledIndex, unmarshalledArgs) {
    const address = this.alloc(memoryManager, unmarshalledIndex, unmarshalledArgs)

    const unmarshalledValue = /** @type {Array<T>} */ unmarshalledArgs[unmarshalledIndex]
    const typedArray = new this.type.TypedArrayType(memoryManager.memory.buffer, address, unmarshalledValue.length)
    if (this.type instanceof ReferenceType) {
      unmarshalledValue.forEach((item, i) => {
        typedArray[i] = /** @type {number} */ (this.type.marshall(memoryManager, 0, [item]))
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
   * @param {number} unmarshalledIndex The index of the unmarshalled arg or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled args
   * @returns {Array<T>} The unmarshalled array
   */
  unmarshall (memoryManager, address, unmarshalledIndex, unmarshalledArgs) {
    try {
      const length = this.getLength(unmarshalledIndex, unmarshalledArgs)
      const typedArray = new this.type.TypedArrayType(memoryManager.memory.buffer, address, length)
      if (this.type instanceof ReferenceType) {
        return Array.from(/** @type {Iterable<number>} */ (typedArray), x => (this.type.unmarshall(memoryManager, x, -1, [])))
      } else {
        return /** @type {Array<T>} */ (Array.from(/** @type {Iterable<*>} */ (typedArray)))
      }
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
