import { MemoryManager } from '../MemoryManager'

import { ReferenceType } from './ReferenceType'
import { Type } from './Type'

 /**
 * TypedArray
 * @typedef {Int8Array|Int16Array|Int32Array|BigInt64Array|Uint8Array|Uint16Array|Uint32Array|BigUint64Array|Float32Array|Float64Array} TypedArray
 */

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
 * @extends {ReferenceType<TypedArray>}
 */
export class TypedArrayType extends ReferenceType {
  /**
   * Construct an array type
   * @param {Type<T>} type The type of the elements in the array
   * @param {number|lengthCallback} [length] The optional length of the array
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
      const array = /** @type {TypedArray} */ (unmarshalledArgs[unmarshalledIndex])
      return array.length
    } else {
      throw RangeError('Unable to establish the length of the array')
    }
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
      const length = this.getLength(unmarshalledValue != null ? 0 : -1, [unmarshalledValue])
      return memoryManager.malloc(length * this.type.TypedArrayType.BYTES_PER_ELEMENT)
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
   * Marshall a typed array.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {TypedArray} unmarshalledValue The array to be marshalled
   * @returns {number} The address of the marshalled array
   */
  marshall (memoryManager, unmarshalledValue) {
    // Simply return the address.
    return unmarshalledValue.byteOffset
  }

  /**
   * Unmarshall a typed array.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the marshalled array
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments.
   * @returns {TypedArray} The unmarshalled array
   */
  unmarshall (memoryManager, address, unmarshalledIndex, unmarshalledArgs) {
    if (unmarshalledIndex !== -1) {
      // We assume typed arrays are references to memory in the WebAssembly, so
      // the unmarshalled value and the marshalled values are the same,
      return /** @type {TypedArray} */ unmarshalledArgs[unmarshalledIndex]
    } else {
      // Create the typed array. Note this is just a view into the WebAssembly
      // memory buffer.
      const length = this.getLength(unmarshalledIndex, unmarshalledArgs)
      const typedArray = new this.type.TypedArrayType(
        memoryManager.memory.buffer,
        address,
        length)
      memoryManager.freeWhenFinalized(typedArray, address)
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
