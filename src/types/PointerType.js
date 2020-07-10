import { MemoryManager } from '../MemoryManager'
import { Pointer } from '../Pointer'

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
   * @param {Pointer<T>} [unmarshalledValue] An optional unmarshalled value
   */
  free (memoryManager, address, unmarshalledValue) {
    try {
      const marshalledAddress = memoryManager.dataView.getUint32(address)
      this.type.free(memoryManager, marshalledAddress, null)
    } finally {
      memoryManager.free(address)
    }
  }

  /**
   * Allocate memory for a pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {Pointer<T>} [unmarshalledValue] The value
   * @returns{number} The address of the allocated memory
   */
  alloc (memoryManager, unmarshalledValue) {
    const address = memoryManager.malloc(Uint32Array.BYTES_PER_ELEMENT)
    return address
  }

  /**
   * Marshal a pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {Pointer<T>} unmarshalledValue The value to marshall
   * @returns {number} The address of the pointer in memory
   */
  marshall (memoryManager, unmarshalledValue) {
    const address = this.alloc(memoryManager, unmarshalledValue)
    const marshalledAddress = /** @type {number} */ (this.type.marshall(memoryManager, unmarshalledValue.contents))
    memoryManager.dataView.setUint32(address, marshalledAddress)
    return address
  }

  /**
   * Unmarshall a pointer.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the pointer in memory
   * @param {number} unmarshalledIndex The index to the unmarshalled value of -1
   * @param {Array<*>} unmarshalledArgs the unmarshalled arguments
   * @returns {Pointer<T>} The unmarshalled pointer
   */
  unmarshall (memoryManager, address, unmarshalledIndex, unmarshalledArgs) {
    try {
      const marshalledAddress = memoryManager.dataView.getUint32(address)
      return new Pointer(this.type.unmarshall(memoryManager, marshalledAddress, -1, []))
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
