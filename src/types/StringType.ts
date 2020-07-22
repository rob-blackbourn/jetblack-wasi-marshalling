import { MemoryManager } from '../MemoryManager'
import { StringBuffer } from '../StringBuffer'

import { ReferenceType } from './ReferenceType'

/**
 * A class representing a string type
 * @extends {ReferenceType<string>}
 */
export class StringType extends ReferenceType<string> {
  alloc(memoryManager: MemoryManager, unmarshalledIndex: number, unmarshalledArgs: any[]): number {
    throw new Error("Method not implemented.")
  }
  copy(dest: string, source: string): string {
    throw new Error("Method not implemented.")
  }
  /**
   * Free an allocated string
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the string in memory
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {void}
   */
  free (memoryManager: MemoryManager, address: number, unmarshalledIndex: number, unmarshalledArgs: Array<any>): void {
    memoryManager.free(address)
  }

  /**
   * Marshall a string into memory
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of the value to marshall
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The address of the string in memory
   */
  marshall (memoryManager: MemoryManager, unmarshalledIndex: number, unmarshalledArgs: Array<any>): number {
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
  unmarshall (memoryManager: MemoryManager, address: number, unmarshalledIndex: number, unmarshalledArgs: Array<any>): string {
    try {
      const stringBuffer = StringBuffer.fromAddress(memoryManager, address, false)
      return stringBuffer.toString()
    } finally {
      // Free the memory
      memoryManager.free(address)
    }
  }

  static MANGLED_NAME = 's8'

  get mangledName(): string {
    return StringType.MANGLED_NAME
  }
}
