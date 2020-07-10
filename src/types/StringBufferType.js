import { MemoryManager } from '../MemoryManager'
import { StringBuffer } from '../StringBuffer'

import { ReferenceType } from './ReferenceType'

/**
 * A class representing a string buffer type
 * @extends {ReferenceType<StringBuffer>}
 */
export class StringBufferType extends ReferenceType {

  /**
   * Marshall a string buffer into memory
   * @param {MemoryManager} memoryManager The memory manager
   * @param {StringBuffer} unmarshalledValue The string buffer to marshall
   * @returns {number} The address of the string in memory
   */
  marshall (memoryManager, unmarshalledValue) {
    return unmarshalledValue.byteOffset
  }

  /**
   * Unmarshall a string buffer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the string buffer in memory
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {StringBuffer} The unmarshalled string buffer
   */
  unmarshall (memoryManager, address, unmarshalledIndex, unmarshalledArgs) {
    if (unmarshalledIndex !== -1) {
      return /** @type {StringBuffer} */ unmarshalledArgs[unmarshalledIndex]
    } else {
      return StringBuffer.fromAddress(memoryManager, address, true)
    }
  }

  /**
   * Free allocated memory.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the memory to be freed
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   */
  free (memoryManager, address, unmarshalledIndex, unmarshalledArgs) {
    // The finalizer handles freeing.
  }
}
