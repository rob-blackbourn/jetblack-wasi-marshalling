import { MemoryManager } from '../MemoryManager'

import { ValueType } from './ValueType'

/**
 * A type representing an 8 bit integer
 * @template {number} T
 * @extends {ValueType<T>}
 */
export class Int8Type extends ValueType {
  /**
   * Construct an 8 bit integer type
   */
  constructor () {
    super(Int8Array)
  }

  /**
   * Marshalls the value to a pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {T} unmarshalledValue The value to marhsall
   * @returns {number} The address of a pointer to the value
   */
  marshall (memoryManager, unmarshalledValue) {
    const address = this.alloc(memoryManager, unmarshalledValue)
    memoryManager.dataView.setInt8(address, unmarshalledValue)
    return address
  }

  /**
   * Unmarshal the value from a pointer.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the pointer to the value
   * @param {T} [unmarshalledValue] Optional unmarshalled value
   * @returns {T} The unmarshalled value.
   */
  unmarshall (memoryManager, address, unmarshalledValue) {
    try {
      return /** @type {T} */ (memoryManager.dataView.getInt8(address))
    } finally {
      memoryManager.free(address)
    }
  }
}
