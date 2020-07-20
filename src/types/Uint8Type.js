// @flow

import { MemoryManager } from '../MemoryManager'

import { ValueType } from './ValueType'

import { uint8, void_ptr } from '../wasiLibDef'

/**
 * A type representing an 8 bit unsigned integer
 * @extends {ValueType<number>}
 */
export class Uint8Type extends ValueType<uint8> {
  /**
   * Construct an 8 bit unsigned integer type
   */
  constructor () {
    super(Uint8Array)
  }

  /**
   * Marshalls the value to a pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of the value to marshall
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The address of a pointer to the value
   */
  marshall (memoryManager: MemoryManager, unmarshalledIndex: number, unmarshalledArgs: Array<any>): void_ptr {
    const address = this.alloc(memoryManager, unmarshalledIndex, unmarshalledArgs)
    memoryManager.dataView.setUint8(address, unmarshalledArgs[unmarshalledIndex])
    return address
  }

  /**
   * Unmarshall the value from a pointer.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the pointer to the value
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The unmarshalled value.
   */
  unmarshall (memoryManager: MemoryManager, address: void_ptr, unmarshalledIndex: number, unmarshalledArgs: Array<any>): uint8 {
    try {
      return memoryManager.dataView.getUint8(address)
    } finally {
      memoryManager.free(address)
    }
  }

  static MANGLED_NAME = 'u8'

  get mangledName(): string {
    return Uint8Type.MANGLED_NAME
  }
}
