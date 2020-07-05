import { MemoryManager } from '../MemoryManager'

import { Pointer } from './Pointer'
import { ReferenceType } from './ReferenceType'
import { Type } from './Type'

/**
 * A pointer type
 * @template T
 * @extends {ReferenceType<Pointer<T>>}
 */
export class PointerType extends ReferenceType {
  /**
   * Construct a pointer type.
   * @param {Type<T>} type The type pointed to
   */
  constructor (type) {
    super()
    this.type = type
  }

  /**
   * Free an allocated pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the pointer to be freed
   */
  free (memoryManager, address) {
    try {
      const marshalledAddress = memoryManager.dataView.getUint32(address)
      this.type.free(memoryManager, marshalledAddress)
    } finally {
      memoryManager.free(address)
    }
  }

  /**
   * Allocate memory for a pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {Pointer<T>} [value] The value
   * @returns{number} The address of the allocated memory
   */
  alloc (memoryManager, value) {
    const address = memoryManager.malloc(Uint32Array.BYTES_PER_ELEMENT)
    return address
  }

  /**
   * Marshal a pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {Pointer<T>} value The value to marshall
   * @returns {number} The address of the pointer in memory
   */
  marshall (memoryManager, value) {
    const address = this.alloc(memoryManager, value)
    const marshalledAddress = /** @type {number} */ (this.type.marshall(memoryManager, value.contents))
    memoryManager.dataView.setUint32(address, marshalledAddress)
    return address
  }

  /**
   * Unmarshall a pointer.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the pointer in memory
   * @param {Pointer<T>} [value] An optional value
   * @returns {Pointer<T>} The unmarshalled pointer
   */
  unmarshall (memoryManager, address, value) {
    try {
      const marshalledAddress = memoryManager.dataView.getUint32(address)
      return new Pointer(this.type.unmarshall(memoryManager, marshalledAddress))
    } finally {
      memoryManager.free(address)
    }
  }

  /**
   * Copy a pointer
   * @param {Pointer<T>} dest The destination pointer
   * @param {Pointer<T>} source The source pointer
   * @returns {Pointer<T>} The destination pointer
   */
  copy (dest, source) {
    dest.contents = source.contents
    return dest
  }
}
