// @flow

import { MemoryManager } from '../MemoryManager'

import { ValueType } from './ValueType'

import { int32, void_ptr } from '../wasiLibDef'

/**
 * A type representing a 32 bit integer
 * @extends {ValueType<number>}
 */
export class Int32Type extends ValueType<int32> {
  /**
   * Construct a 32 bit integer type
   */
  constructor () {
    super(Int32Array)
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
    memoryManager.dataView.setInt32(address, unmarshalledArgs[unmarshalledIndex])
    return address
  }

  /**
   * Unmarshall the value from a pointer.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the pointer to the value
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled args
   * @returns {number} The unmarshalled value.
   */
  unmarshall (memoryManager: MemoryManager, address: void_ptr, unmarshalledIndex: number, unmarshalledArgs: Array<any>): int32 {
    try {
      return memoryManager.dataView.getInt32(address)
    } finally {
      memoryManager.free(address)
    }
  }

  static MANGLED_NAME = 'i32'

  get mangledName(): string {
    return Int32Type.MANGLED_NAME
  }
}
