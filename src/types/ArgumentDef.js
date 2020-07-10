import { MemoryManager } from '../MemoryManager'

import { ValueType } from './ValueType'
import { Type } from './Type'

/**
 * An argument definition is used by {@link FunctionPrototype} to define the
 * arguments to a function.
 * @template T
 */
export class ArgumentDef {
  /**
   * Construct an argument defintion. The {@link In}, {@link Out}, and {@link InOut}
   * helper classes should be used to construct argument definitions as they are
   * semantically clearer and avoid the possibility of setting both `isInput` and
   * `isOutput` to `false`.
   * @param {Type<T>} type The argument type
   * @param {boolean} isInput If true the argument provides data to the function
   * @param {boolean} isOutput If true the argument is poulated by the function
   */
  constructor (type, isInput, isOutput) {
    this.type = type
    this.isInput = isInput
    this.isOutput = isOutput
  }

  /**
   * Create a representation of the JavaScript value which can be passed to a
   * WebAssembly module instance. For value types this is typically the value
   * itself. For refrence types memory will be allocated in the instance, and
   * the data will be copied.
   * @param {MemoryManager} memoryManager A class which provides methods to
   * @param {T} unmarshalledValue The value for which a WebAssembly value should be created
   *    manage the memory of a WebAssembly module.
   * @returns {number|T} The address of the allocated memory or the marshalled value.
   * @throws {Error} If the argument is not input and/or output.
   */
  marshall (memoryManager, unmarshalledValue) {
    if (this.type instanceof ValueType) {
      return unmarshalledValue
    } else if (this.isInput) {
      return this.type.marshall(memoryManager, unmarshalledValue)
    } else if (this.isOutput) {
      return this.type.alloc(memoryManager, unmarshalledValue)
    } else {
      throw new Error('An argument must be input and/or output')
    }
  }

  /**
   * Unmarshall a value
   * @param {MemoryManager} memoryManager The memory manager
   * @param {number|T} addressOrValue The marshalled address or value 
   * @param {number} unmarshalledIndex The index of the unmarshalled value or -1
   * @param {Array<*>} unmarshalledArgs The unmarshall args
   * @returns {number|T} The unmarshalled value.
   */
  unmarshall (memoryManager, addressOrValue, unmarshalledIndex, unmarshalledArgs) {
    if (this.type instanceof ValueType) {
      return addressOrValue
    }

    if (this.isOutput) {
      if (unmarshalledIndex === -1) {
        throw new Error('Out put argument missing')
      }
      if (typeof addressOrValue !== 'number') {
        throw new Error('Expected address or to be a number')
      }
      const result = this.type.unmarshall(memoryManager, addressOrValue, unmarshalledIndex, unmarshalledArgs)
      this.type.copy(unmarshalledArgs[unmarshalledIndex], result)
    } else {
      if (typeof addressOrValue !== 'number') {
        throw new Error('Expected address to be a number')
      }
      this.type.free(memoryManager, addressOrValue, unmarshalledIndex === -1 ? null : unmarshalledArgs[unmarshalledIndex])
    }
  }
}
