import { MemoryManager } from '../MemoryManager'

import { ValueType } from './ValueType'

/**
 * A type representing a 32 bit integer
 * @extends {ValueType<number>}
 */
export class Int32Type extends ValueType {
  /**
   * Construct a 32 bit integer type
   */
  constructor () {
    super(Int32Array)
  }

  /**
   * Marshalls the value to a pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledValue The value to marhsall
   * @returns {number} The address of a pointer to the value
   */
  marshall (memoryManager, unmarshalledValue) {
    const address = this.alloc(memoryManager, unmarshalledValue)
    memoryManager.dataView.setInt32(address, unmarshalledValue)
    return address
  }

  /**
   * Unmarshall the value from a pointer.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the pointer to the value
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled args
   * @returns {number} The unmarshalled value.
   */
  unmarshall (memoryManager, address, unmarshalledIndex, unmarshalledArgs) {
    try {
      return memoryManager.dataView.getInt32(address)
    } finally {
      memoryManager.free(address)
    }
  }
}
