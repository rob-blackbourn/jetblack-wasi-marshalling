import { MemoryManager } from '../MemoryManager'

import { ValueType } from './ValueType'

/**
 * A type representing a 64 bit unsigned integer
 * @template {bigint} T
 * @extends {ValueType<T>}
 */
export class Uint64Type extends ValueType {
  /**
   * Construct a 64 bit unsigned integer type
   */
  constructor () {
    super(BigUint64Array)
  }

  /**
   * Marshalls the value to a pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {T} value The value to marhsall
   * @returns {number} The address of a pointer to the value
   */
  marshall (memoryManager, value) {
    const address = this.alloc(memoryManager)
    memoryManager.dataView.setBigUint64(address, value)
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
      return /** @type T */ (memoryManager.dataView.getBigUint64(address))
    } finally {
      memoryManager.free(address)
    }
  }
}
