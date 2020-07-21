// @flow

import { MemoryManager } from '../MemoryManager'

import { ValueType } from './ValueType'

import type { BigInt, BigUint64Array } from '../wasiLibDef'

/**
 * A type representing a 64 bit unsigned integer
 * @extends {ValueType<bigint>}
 */
export class Uint64Type extends ValueType<BigInt> {
  /**
   * Construct a 64 bit unsigned integer type
   */
  constructor () {
    super(BigUint64Array)
  }

  /**
   * Marshalls the value to a pointer
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number} unmarshalledIndex The index of the value to marshall
   * @param {Array<*>} unmarshalledArgs The unmarshalled arguments
   * @returns {number} The address of a pointer to the value
   */
  marshall (memoryManager: MemoryManager, unmarshalledIndex: number, unmarshalledArgs: Array<any>): number {
    const address = this.alloc(memoryManager, unmarshalledIndex, unmarshalledArgs)
    // $FlowFixMe
    memoryManager.dataView.setBigUint64(address, unmarshalledArgs[unmarshalledIndex])
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
  unmarshall (memoryManager: MemoryManager, address: number, unmarshalledIndex: number, unmarshalledArgs: Array<any>): BigInt {
    try {
      // $FlowFixMe
      return memoryManager.dataView.getBigUint64(address)
    } finally {
      memoryManager.free(address)
    }
  }

  static MANGLED_NAME = 'u64'

  get mangledName(): string {
    return Uint64Type.MANGLED_NAME
  }
}
