// @flow

import { MemoryManager } from '../MemoryManager'
import { StringBuffer } from '../StringBuffer'

import { ReferenceType } from './ReferenceType'

/**
 * A class representing a string buffer type
 * @extends {ReferenceType<StringBuffer>}
 */
export class StringBufferType extends ReferenceType<StringBuffer> {

  /**
   * Marshall a string buffer into memory
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of the value to marshall
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The address of the string in memory
   */
  marshall (memoryManager: MemoryManager, unmarshalledIndex: number, unmarshalledArgs: Array<any>): number {
    return unmarshalledArgs[unmarshalledIndex].byteOffset
  }

  /**
   * Unmarshall a string buffer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the string buffer in memory
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {StringBuffer} The unmarshalled string buffer
   */
  unmarshall (memoryManager: MemoryManager, address: number, unmarshalledIndex: number, unmarshalledArgs: Array<any>): StringBuffer {
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
   * @returns {void}
   */
  free (memoryManager: MemoryManager, address: number, unmarshalledIndex: number, unmarshalledArgs: Array<any>): void {
    // The finalizer handles freeing.
  }

  static MANGLED_NAME = 'b8'

  get mangledName(): string {
    return StringBufferType.MANGLED_NAME
  }
}
