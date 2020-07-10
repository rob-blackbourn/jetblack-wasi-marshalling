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
   * @param {number} unmarshalledIndex The index of the unmarshalled value
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The address of the allocated memory
   */
  alloc (memoryManager, unmarshalledIndex, unmarshalledArgs) {
    return memoryManager.malloc(this.TypedArrayType.BYTES_PER_ELEMENT)
  }

  /**
   * Free allocated memory
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the memory to be freed
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   */
  free (memoryManager, address, unmarshalledIndex, unmarshalledArgs) {
    memoryManager.free(address)
  }
}
