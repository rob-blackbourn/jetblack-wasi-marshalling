// @flow

import { MemoryManager } from '../MemoryManager'

import { ValueType } from './ValueType'

import { float64, void_ptr } from '../wasiLibDef'

/**
 * A type representing a 64 bit float
 * @extends {ValueType<number>}
 */
export class Float64Type extends ValueType<float64> {
  /**
   * Construct a 64 bit float type
   */
  constructor () {
    super(Float64Array)
  }

  /**
   * Marshalls the value to a pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of value to marshall
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The address of a pointer to the value
   */
  marshall (memoryManager: MemoryManager, unmarshalledIndex: number, unmarshalledArgs: Array<any>): void_ptr {
    const address = this.alloc(memoryManager, unmarshalledIndex, unmarshalledArgs)
    memoryManager.dataView.setFloat64(address, unmarshalledArgs[unmarshalledIndex])
    return address
  }

  /**
   * Unmarshall the value from a pointer.
   * @param {number} address The address of the pointer to the value
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The unmarshalled value.
   */
  unmarshall (memoryManager: MemoryManager, address: void_ptr, unmarshalledIndex: number, unmarshalledArgs: Array<any>): float64 {
    try {
      return memoryManager.dataView.getFloat64(address)
    } finally {
      memoryManager.free(address)
    }
  }

  static MANGLED_NAME = 'f64'

  get mangledName (): string {
    return Float64Type.MANGLED_NAME
  }
}
