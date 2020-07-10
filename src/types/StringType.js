import { MemoryManager } from '../MemoryManager'
import { StringBuffer } from '../StringBuffer'

import { ReferenceType } from './ReferenceType'

/**
 * A class representing a string type
 * @extends {ReferenceType<string>}
 */
export class StringType extends ReferenceType {
  /**
   * Free an allocated string
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the string in memory
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {void}
   */
  free (memoryManager, address, unmarshalledIndex, unmarshalledArgs) {
    memoryManager.free(address)
  }

  /**
   * Marshall a string into memory
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of the value to marshall
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The address of the string in memory
   */
  marshall (memoryManager, unmarshalledIndex, unmarshalledArgs) {
    const unmarshalledValue = unmarshalledArgs[unmarshalledIndex]
    const stringBuffer = StringBuffer.fromString(memoryManager, unmarshalledValue, false)
    return stringBuffer.byteOffset
  }

  /**
   * Unmarshall a string
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the string in memory
   * @param {number} unmarshalledIndex The index to the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {string} The unmarshalled string
   */
  unmarshall (memoryManager, address, unmarshalledIndex, unmarshalledArgs) {
    try {
      const stringBuffer = StringBuffer.fromAddress(memoryManager, address, false)
      return stringBuffer.toString()
    } finally {
      // Free the memory
      memoryManager.free(address)
    }
  }

  get mangledName() {
    return 's8'
  }
}
