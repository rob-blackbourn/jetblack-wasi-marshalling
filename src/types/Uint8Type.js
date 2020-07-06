import { MemoryManager } from '../MemoryManager'

import { ValueType } from './ValueType'

/**
 * A type representing an 8 bit unsigned integer
 * @extends {ValueType<number>}
 */
export class Uint8Type extends ValueType {
  /**
   * Construct an 8 bit unsigned integer type
   */
  constructor () {
    super(Uint8Array)
  }

  /**
   * Marshalls the value to a pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledValue The value to marhsall
   * @returns {number} The address of a pointer to the value
   */
  marshall (memoryManager, unmarshalledValue) {
    const address = this.alloc(memoryManager)
    memoryManager.dataView.setUint8(address, unmarshalledValue)
    return address
  }

  /**
   * Unmarshal the value from a pointer.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the pointer to the value
   * @param {number} [unmarshalledValue] Optional unmarshalled value
   * @returns {number} The unmarshalled value.
   */
  unmarshall (memoryManager, address, unmarshalledValue) {
    try {
      return memoryManager.dataView.getUint8(address)
    } finally {
      memoryManager.free(address)
    }
  }
}
