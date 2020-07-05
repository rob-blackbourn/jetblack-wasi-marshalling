import { MemoryManager } from '../MemoryManager'

import { ValueType } from './ValueType'

/**
 * A type representing a 64 bit integer
 * @template {bigint} T
 * @extends {ValueType<T>}
 */
export class Int64Type extends ValueType {
  /**
   * Construct a 16 bit integer type
   */
  constructor () {
    super(BigInt64Array)
  }

  /**
   * Marshalls the value to a pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {T} unmarshalledValue The value to marhsall
   * @returns {number} The address of a pointer to the value
   */
  marshall (memoryManager, unmarshalledValue) {
    const address = this.alloc(memoryManager, unmarshalledValue)
    memoryManager.dataView.setBigInt64(address, unmarshalledValue)
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
      return /** @type {T} */ (memoryManager.dataView.getBigInt64(address))
    } finally {
      memoryManager.free(address)
    }
  }
}
