// @flow

import { MemoryManager } from '../MemoryManager'

import { ValueType } from './ValueType'

import { uint16, void_ptr } from '../wasiLibDef'

/**
 * A type representing a 16 bit unsigned integer
 * @extends {ValueType<number>}
 */
export class Uint16Type extends ValueType<uint16> {
  /**
   * Construct a 16 bit unsigned integer type
   */
  constructor () {
    super(Uint16Array)
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
    memoryManager.dataView.setUint16(address, unmarshalledArgs[unmarshalledIndex])
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
  unmarshall (memoryManager: MemoryManager, address: void_ptr, unmarshalledIndex: number, unmarshalledArgs: Array<any>): uint16 {
    try {
      return memoryManager.dataView.getUint16(address)
    } finally {
      memoryManager.free(address)
    }
  }

  static MANGLED_NAME = 'u16'

  get mangledName(): string {
    return Uint16Type.MANGLED_NAME
  }
}
