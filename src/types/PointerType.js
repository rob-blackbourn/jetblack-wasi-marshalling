// @flow

import { MemoryManager } from '../MemoryManager'
import { Pointer } from '../Pointer'

import { ReferenceType } from './ReferenceType'
import { Type } from './Type'

import type { void_ptr } from '../wasiLibDef'

/**
 * A pointer type
 * @template T
 * @extends {ReferenceType<Pointer<T>>}
 */
export class PointerType<T> extends ReferenceType<Pointer<T>> {
  type: Type<T>

  /**
   * Construct a pointer type.
   * @param {Type<T>} type The type pointed to
   */
  constructor (type: Type<T>) {
    super()
    this.type = type
  }

  /**
   * Free an allocated pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the pointer to be freed
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {void}
   */
  free (memoryManager: MemoryManager, address: void_ptr, unmarshalledIndex: number, unmarshalledArgs: Array<any>): void {
    try {
      const marshalledAddress = memoryManager.dataView.getUint32(address)
      this.type.free(memoryManager, marshalledAddress, unmarshalledIndex, unmarshalledArgs)
    } finally {
      memoryManager.free(address)
    }
  }

  /**
   * Allocate memory for a pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns{number} The address of the allocated memory
   */
  alloc (memoryManager: MemoryManager, unmarshalledIndex: number, unmarshalledArgs: Array<any>): void_ptr {
    const address = memoryManager.malloc(Uint32Array.BYTES_PER_ELEMENT)
    return address
  }

  /**
   * Marshal a pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The address of the pointer in memory
   */
  marshall (memoryManager: MemoryManager, unmarshalledIndex: number, unmarshalledArgs: Array<any>): void_ptr {
    const address = this.alloc(memoryManager, unmarshalledIndex, unmarshalledArgs)
    const unmarshalledValue = unmarshalledArgs[unmarshalledIndex]
    const marshalledAddress = this.type.marshall(memoryManager, 0, [unmarshalledValue.contents])
    if (typeof marshalledAddress !== 'number') {
      throw new TypeError('Can only marshal references')
    }
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
  unmarshall (memoryManager: MemoryManager, address: void_ptr, unmarshalledIndex: number, unmarshalledArgs: Array<any>): Pointer<T> {
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
  copy (dest: Pointer<T>, source: Pointer<T>): Pointer<T> {
    dest.contents = source.contents
    return dest
  }

  get mangledName(): string {
    return `p(${this.type.mangledName})`
  }
}
