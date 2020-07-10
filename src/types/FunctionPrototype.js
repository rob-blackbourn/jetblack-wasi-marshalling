import { MemoryManager } from '../MemoryManager'

import { ArgumentDef } from './ArgumentDef'
import { Type } from './Type'

/**
 * A function prototype
 * @template T
 */
export class FunctionPrototype {
  /**
   * Construct a function prototype.
   * @param {Array<ArgumentDef<any>>} argDefs The argument definitions
   * @param {Type<T>} [returns] An optional return type
   */
  constructor (argDefs, returns) {
    this.argDefs = argDefs
    this.returns = returns
  }

  /**
   * Invoke a function
   * @param {MemoryManager} memoryManager The memory manager
   * @param {Function} func The function to invoke
   * @param {Array<any>} unmarshalledArgs The function arguments
   * @returns {T} An optional return value
   */
  invoke (memoryManager, func, ...unmarshalledArgs) {
    if (this.argDefs.length !== unmarshalledArgs.length) {
      throw new RangeError('Invalid number of arguments')
    }

    const marshalledArgs = unmarshalledArgs.map((arg, i) =>
      this.argDefs[i].marshall(memoryManager, i, unmarshalledArgs))

    const result = func(...marshalledArgs)

    unmarshalledArgs.forEach((arg, i) =>
      this.argDefs[i].unmarshall(memoryManager, marshalledArgs[i], i, unmarshalledArgs))

    if (this.returns != null) {
      return this.returns.unmarshall(memoryManager, result, -1, unmarshalledArgs)
    }
  }
}
