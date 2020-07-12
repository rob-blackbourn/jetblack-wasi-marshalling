import { MemoryManager } from '../MemoryManager'
import { StringBuffer } from '../StringBuffer'

import { ArgumentDef } from './ArgumentDef'
import { Type } from './Type'
import { Float64Type } from './Float64Type'
import { Float32Type } from './Float32Type'
import { Uint32Type } from './Uint32Type'
import { Int8Type } from './Int8Type'
import { Int16Type } from './Int16Type'
import { Int32Type } from './Int32Type'
import { Int64Type } from './Int64Type'
import { Uint8Type } from './Uint8Type'
import { Uint16Type } from './Uint16Type'
import { Uint64Type } from './Uint64Type'
import { StringBufferType } from './StringBufferType'
import { StringType } from './StringType'
import { VoidType } from './VoidType'

/**
 * A function prototype
 * @template T
 */
export class FunctionPrototype {
  /**
   * Construct a function prototype.
   * @param {Array<ArgumentDef<any>>} argDefs The argument definitions
   * @param {Type<T>} returns An optional return type
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

    if (!(this.returns instanceof VoidType)) {
      return this.returns.unmarshall(memoryManager, result, -1, unmarshalledArgs)
    }
  }

  /**
   * Gets the mangling of the arguments.
   * @returns {string} The mangled args
   */
  get mangledArgs() {
    return this.argDefs.map(x => x.type.mangledName).join('')
  }

  get mangleReturns() {
    return this.returns == null ? 'v0' : this.returns.mangledName
  }

  /**
   * The mangled function prototype
   * @returns {string} The mangled function prototype
   */
  get mangledName() {
    return `${this.mangleReturns}_${this.mangledArgs}`
  }

  static mangleValue(arg) {
    if (arg == null) {
      return VoidType.MANGLED_NAME
    } else if (typeof arg === 'number') {
      if (Number.isInteger(arg)) {
        return Uint32Type.MANGLED_NAME
      } else {
        return Float64Type.MANGLED_NAME
      }
    } else if (typeof arg === 'string') {
      return StringBufferType.MANGLED_NAME // Prefer StringBuffer
    } else if (arg instanceof Float32Array) {
      return `t(${Float32Type.MANGLED_NAME})`
    } else if (arg instanceof Float64Array) {
      return `t(${Float64Type.MANGLED_NAME})`
    } else if (arg instanceof Int8Array) {
      return `t(${Int8Type.MANGLED_NAME})`
    } else if (arg instanceof Int16Array) {
      return `t(${Int16Type.MANGLED_NAME})`
    } else if (arg instanceof Int32Array) {
      return `t(${Int32Type.MANGLED_NAME})`
    } else if (arg instanceof BigInt64Array) {
      return `t(${Int64Type.MANGLED_NAME})`
    } else if (arg instanceof Uint8Array) {
      return `t(${Uint8Type.MANGLED_NAME})`
    } else if (arg instanceof Uint16Array) {
      return `t(${Uint16Type.MANGLED_NAME})`
    } else if (arg instanceof Uint32Array) {
      return `t(${Uint32Type.MANGLED_NAME})`
    } else if (arg instanceof BigUint64Array) {
      return `t(${Uint64Type.MANGLED_NAME})`
    } else if (arg instanceof StringBuffer) {
      return StringBufferType.MANGLED_NAME
    } else if (arg instanceof Array) {
      if (arg.every(x => typeof x === 'string')) {
        return `a(${StringType.MANGLED_NAME})`
      } else if (arg.every(x => x instanceof StringBuffer)) {
        return `a(${StringBufferType.MANGLED_NAME})`
      } else if (arg.every(x => typeof x  === 'number')) {
        if (arg.every(x => Number.isInteger(x))) {
          return `a(${Int32Type.MANGLED_NAME})`
        } else {
          return `a(${Float64Type.MANGLED_NAME})`
        }
      } else if (arg.every(x => x instanceof Array)) {
        return `a(${FunctionPrototype.mangleValue(arg[0])})`
      } else {
        throw new TypeError('Unknown array element type')
      }
    } else {
      throw new TypeError('Unknown types')
    }
  }

  static mangleValues(...args) {
    return args.map(x => FunctionPrototype.mangleValue(x)).join('')
  }
}
