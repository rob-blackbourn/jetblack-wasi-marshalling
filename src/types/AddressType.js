import { MemoryManager } from '../MemoryManager'
import { Pointer } from '../Pointer'

import { ReferenceType } from './ReferenceType'

/**
 * A class representing a string buffer type
 * @extends {ReferenceType<Pointer<number>>}
 */
export class AddressType extends ReferenceType {

  /**
   * Marshall an address into memory
   * @param {MemoryManager} memoryManager The memory manager
   * @param {Pointer<number>} unmarshalledValue The string buffer to marshall
   * @returns {number} The address of the string in memory
   */
  marshall (memoryManager, unmarshalledValue) {
    return unmarshalledValue.contents
  }

  /**
   * Unmarshall an address
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the string buffer in memory
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments.
   * @returns {Pointer<number>} The unmarshalled string buffer
   */
  unmarshall (memoryManager, address, unmarshalledIndex, unmarshalledArgs) {
    if (unmarshalledIndex !== -1) {
      return /** @type {Pointer<number>} */ (unmarshalledArgs[unmarshalledIndex])
    } else {
      const pointer =  new Pointer(address)
      memoryManager.freeWhenFinalized(pointer, address)
      return pointer
    }
  }

  /**
   * Free allocated memory.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the memory to be freed
   * @param {Pointer} [unmarshalledValue] An optional unmarshalled value
   */
  free (memoryManager, address, unmarshalledValue) {
    // The finalizer handles freeing.
  }
}
