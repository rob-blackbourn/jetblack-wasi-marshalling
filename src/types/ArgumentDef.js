// @flow

import { MemoryManager } from '../MemoryManager'

import { ValueType } from './ValueType'
import { Type } from './Type'

/**
 * An argument definition is used by {@link FunctionPrototype} to define the
 * arguments to a function.
 */
export class ArgumentDef<T> {
  type: Type<T>
  isInput: boolean
  isOutput: boolean

  /**
   * Construct an argument defintion. The {@link In}, {@link Out}, and {@link InOut}
   * helper classes should be used to construct argument definitions as they are
   * semantically clearer and avoid the possibility of setting both `isInput` and
   * `isOutput` to `false`.
   * @param {Type} type The argument type
   * @param {boolean} isInput If true the argument provides data to the function
   * @param {boolean} isOutput If true the argument is poulated by the function
   */
  constructor (type: Type<T>, isInput: boolean, isOutput: boolean) {
    this.type = type
    this.isInput = isInput
    this.isOutput = isOutput
  }

  /**
   * Create a representation of the JavaScript value which can be passed to a
   * WebAssembly module instance. For value types this is typically the value
   * itself. For refrence types memory will be allocated in the instance, and
   * the data will be copied.
   * @param {T} value The value for which a WebAssembly value should be created
   * @param {MemoryManager} memoryManager A class which provides methods to
   *    manage the memory of a WebAssembly module.
   */
  marshall (value: T, memoryManager: MemoryManager): number|T {
    if (this.type instanceof ValueType) {
      return value
    } else if (this.isInput) {
      return this.type.marshall(value, memoryManager)
    } else {
      return this.type.alloc(memoryManager, value)
    }
  }

  /**
   * Create a JavaScript representation of the value represented by the address.
   * @param {number} address The byte offset of the
   * @param {MemoryManager} memoryManager A class which provides methods to
   *    manage the memory of a WebAssembly module.
   * @param {T} value The original value of the argument.
   */
  unmarshall (address: number, memoryManager: MemoryManager, value: any): any {
    if (this.type instanceof ValueType) {
      return value
    }

    if (this.isOutput) {
      const result = this.type.unmarshall(address, memoryManager, value)
      this.type.copy(value, result)
    } else {
      this.type.free(address, memoryManager, value)
    }
  }
}
