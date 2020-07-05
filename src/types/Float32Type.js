import { MemoryManager } from '../MemoryManager'

import { ValueType } from './ValueType'

/**
 * A type representing a 64 bit float
 * @template {number} T
 * @extends {ValueType<T>}
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
   * @param {number} value The value to marhsall
   * @returns {number} The address of a pointer to the value
   */
  marshall (memoryManager, value) {
    const address = this.alloc(memoryManager)
    memoryManager.dataView.setFloat32(address, value)
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
      return /** @type {T} */ (memoryManager.dataView.getFloat32(address))
    } finally {
      memoryManager.free(address)
    }
  }
}
