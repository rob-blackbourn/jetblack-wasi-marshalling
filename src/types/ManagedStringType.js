import { MemoryManager } from '../MemoryManager'

import { ReferenceType } from './ReferenceType'

/**
 * A class representing a string type
 * @template {string} T
 * @extends {ReferenceType<string>}
 */
export class ManagedStringType extends ReferenceType {

  /**
   * Marshall a string into memory
   * @param {MemoryManager} memoryManager The memory manager
   * @param {T} unmarshalledValue The string to marshall
   * @returns {number} The address of the string in memory
   */
  marshall (memoryManager, unmarshalledValue) {
    return memoryManager.marshallString(unmarshalledValue, true)
  }

  /**
   * Unmarshall a string
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the string in memory
   * @param {T} [unmarshalledValue] Optional unmarshalled value.
   * @returns {T} The unmarshalled string
   */
  unmarshall (memoryManager, address, unmarshalledValue) {
    return /** @type {T} */ (memoryManager.unmarshallString(address, true))
  }
}
