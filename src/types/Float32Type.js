import { MemoryManager } from '../MemoryManager'

import { ValueType } from './ValueType'

/**
 * A type representing a 64 bit float
 * @extends {ValueType<number>}
 */
export class Float32Type extends ValueType {
  /**
   * Construct a 32 bit float type
   */
  constructor () {
    super(Float32Array)
  }

  /**
   * Marshalls the value to a pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledValue The value to marhsall
   * @returns {number} The address of a pointer to the value
   */
  marshall (memoryManager, unmarshalledValue) {
    const address = this.alloc(memoryManager, unmarshalledValue)
    memoryManager.dataView.setFloat32(address, unmarshalledValue)
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
      return memoryManager.dataView.getFloat32(address)
    } finally {
      memoryManager.free(address)
    }
  }
}
