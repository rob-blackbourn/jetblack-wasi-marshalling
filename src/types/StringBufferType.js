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
   * @param {StringBuffer} [unmarshalledValue] Optional unmarshalled value.
   * @returns {StringBuffer} The unmarshalled string buffer
   */
  unmarshall (memoryManager, address, unmarshalledValue) {
    if (unmarshalledValue != null) {
      return unmarshalledValue
    } else {
      return StringBuffer.fromAddress(memoryManager, address, true)
    }
  }

  /**
   * Free allocated memory.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the memory to be freed
   * @param {StringBuffer} [unmarshalledValue] An optional unmarshalled value
   */
  free (memoryManager, address, unmarshalledValue) {
    // The finalizer handles freeing.
  }
}
