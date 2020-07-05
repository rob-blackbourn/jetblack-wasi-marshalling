import { MemoryManager } from '../MemoryManager'

import { Type } from './Type'

/**
 * A base class representing a value type
 * @template T
 * @extends {Type<T>}
 */
export class ValueType extends Type {
  /**
   * Allocate memory for the type
   * @param {MemoryManager} memoryManager The memory manager
   * @param {T} [unmarshalledValue] An optional value.
   * @returns {number} The address of the allocated memory
   */
  alloc (memoryManager, unmarshalledValue) {
    return memoryManager.malloc(this.TypedArrayType.BYTES_PER_ELEMENT)
  }

  /**
   * Free allocated memory
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the memory to be freed
   * @param {T} [unmarshalledValue] Optional unmarshalled value.
   */
  free (memoryManager, address, unmarshalledValue) {
    memoryManager.free(address)
  }
}
