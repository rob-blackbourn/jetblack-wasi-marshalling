// @flow

import { MemoryManager } from '../MemoryManager'

import { ValueType } from './ValueType'

import { int64, void_ptr, BigInt64Array } from '../wasiLibDef'

/**
 * A type representing a 64 bit integer
 * @extends {ValueType<bigint>}
 */
export class Int64Type extends ValueType<int64> {
  /**
   * Construct a 16 bit integer type
   */
  constructor () {
    super(BigInt64Array)
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
    // $FlowFixMe
    memoryManager.dataView.setBigInt64(address, unmarshalledArgs[unmarshalledIndex])
    return address
  }

  /**
   * Unmarshall the value from a pointer.
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} address The address of the pointer to the value
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {bigint} The unmarshalled value.
   */
  unmarshall (memoryManager: MemoryManager, address: void_ptr, unmarshalledIndex: number, unmarshalledArgs: Array<any>): int64 {
    try {
      // $FlowFixMe
      return memoryManager.dataView.getBigInt64(address)
    } finally {
      memoryManager.free(address)
    }
  }

  static MANGLED_NAME = 'i64'

  get mangledName(): string {
    return Int64Type.MANGLED_NAME
  }
}
