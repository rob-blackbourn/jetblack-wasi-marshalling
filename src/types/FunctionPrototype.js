// @flow

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

import type { wasmCallback, BigInt64Array, BigUint64Array } from '../wasiLibDef'

/**
 * A function prototype
 * @template T
 */
export class FunctionPrototype<TResult> {
  argDefs: Array<ArgumentDef<any>>
  returns: Type<TResult>

  /**
   * Construct a function prototype.
   * @param {Array<ArgumentDef<any>>} argDefs The argument definitions
   * @param {Type<T>} returns An optional return type
   */
  constructor (argDefs: Array<ArgumentDef<any>>, returns: Type<TResult>) {
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
  invoke (memoryManager: MemoryManager, func: wasmCallback, ...unmarshalledArgs: any): TResult|any {
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
  get mangledArgs(): string {
    return this.argDefs.map(x => x.type.mangledName).join('')
  }

  get mangleReturns(): string {
    return this.returns == null ? 'v0' : this.returns.mangledName
  }

  /**
   * The mangled function prototype
   * @returns {string} The mangled function prototype
   */
  get mangledName(): string {
    return `${this.mangleReturns}_${this.mangledArgs}`
  }

  static mangleNumber(value: number, options: any): string {
    if ('defaultNumber' in options) {
      return options['defaultNumber']
    } else if (Number.isInteger(value)) {
      if ('defaultInt' in options) {
        return options['defaultInt']
      } else {
        return Uint32Type.MANGLED_NAME
      }
    } else if ('defaultFloat' in options) {
      return options['defaultFloat']
    } else {
      return Float64Type.MANGLED_NAME
    }
  }

  static mangleString(value: string, options: any): string {
    if ('defaultString' in options) {
      return options['defaultString']
    } else {
      return StringBufferType.MANGLED_NAME
    }
  }

  /**
   * Mangle the value.
   * @param {any} value The value to mangle
   * @param {object} options Mangling options
   * @returns {string} The mangled value
   */
  static mangleValue(value: any, options: any): string {
    if (value == null) {
      return VoidType.MANGLED_NAME
    } else if (typeof value === 'number') {
      return FunctionPrototype.mangleNumber(value, options)
    } else if (typeof value === 'string') {
      return FunctionPrototype.mangleString(value, options)
    } else if (value instanceof Float32Array) {
      return `t(${Float32Type.MANGLED_NAME})`
    } else if (value instanceof Float64Array) {
      return `t(${Float64Type.MANGLED_NAME})`
    } else if (value instanceof Int8Array) {
      return `t(${Int8Type.MANGLED_NAME})`
    } else if (value instanceof Int16Array) {
      return `t(${Int16Type.MANGLED_NAME})`
    } else if (value instanceof Int32Array) {
      return `t(${Int32Type.MANGLED_NAME})`
    } else //$FlowFixMe
      if (value instanceof BigInt64Array) {
      return `t(${Int64Type.MANGLED_NAME})`
    } else if (value instanceof Uint8Array) {
      return `t(${Uint8Type.MANGLED_NAME})`
    } else if (value instanceof Uint16Array) {
      return `t(${Uint16Type.MANGLED_NAME})`
    } else if (value instanceof Uint32Array) {
      return `t(${Uint32Type.MANGLED_NAME})`
    } else // $FlowFixMe
      if (value instanceof BigUint64Array) {
      return `t(${Uint64Type.MANGLED_NAME})`
    } else if (value instanceof StringBuffer) {
      return StringBufferType.MANGLED_NAME
    } else if (value instanceof Array) {
      if (value.every(x => typeof x === 'string')) {
        return `a(${FunctionPrototype.mangleString(value[0], options)})`
      } else if (value.every(x => x instanceof StringBuffer)) {
        return `a(${StringBufferType.MANGLED_NAME})`
      } else if (value.every(x => typeof x  === 'number')) {
        return `a(${FunctionPrototype.mangleNumber(value[0], options)})`
      } else if (value.every(x => x instanceof Array)) {
        return `a(${FunctionPrototype.mangleValue(value[0], options)})`
      } else {
        throw new TypeError('Unknown array element type')
      }
    } else {
      throw new TypeError('Unknown types')
    }
  }

  /**
   * 
   * @param {Array<any>} values The values to mangle
   * @param {object} options Mangling options
   */
  static mangleValues(values: Array<any>, options: any): string {
    return values.map(x => FunctionPrototype.mangleValue(x, options)).join('')
  }
}
