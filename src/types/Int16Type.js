import { MemoryManager } from '../MemoryManager'

import { ValueType } from './ValueType'

/**
 * A type representing a 16 bit integer
 * @extends {ValueType<number>}
 */
export class Int16Type extends ValueType {
  /**
   * Construct a 16 bit integer type
   */
  constructor () {
    super(Int8Array)
  }

  /**
   * Marshalls the value to a pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of the value to marshall
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The address of a pointer to the value
   */
  marshall (memoryManager, unmarshalledIndex, unmarshalledArgs) {
    const address = this.alloc(memoryManager, unmarshalledIndex, unmarshalledArgs)
    memoryManager.dataView.setInt16(address, unmarshalledArgs[unmarshalledIndex])
    return address
  }

  /**
   * Unmarshall the value from a pointer.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the pointer to the value
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The unmarshalled value.
   */
  unmarshall (memoryManager, address, unmarshalledIndex, unmarshalledArgs) {
    try {
      return memoryManager.dataView.getInt16(address)
    } finally {
      memoryManager.free(address)
    }
  }
}
