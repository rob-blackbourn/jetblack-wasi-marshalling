import { MemoryManager } from '../MemoryManager'

import { ValueType } from './ValueType'

/**
 * A type representing a 16 bit integer
 * @template {number} T
 * @extends {ValueType<T>}
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
   * @param {T} value The value to marhsall
   * @param {MemoryManager} memoryManager The memory manager
   * @returns {number} The address of a pointer to the value
   */
  marshall (memoryManager, value) {
    const address = this.alloc(memoryManager, value)
    memoryManager.dataView.setInt16(address, value)
    return address
  }

  /**
   * Unmarshal the value from a pointer.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the pointer to the value
   * @param {T} [value] Optional unmarshalled value
   * @returns {T} The unmarshalled value.
   */
  unmarshall (memoryManager, address, value) {
    try {
      return /** @type {T} */ (memoryManager.dataView.getInt16(address))
    } finally {
      memoryManager.free(address)
    }
  }
}
