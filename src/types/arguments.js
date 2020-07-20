// @flow

import { Type } from './Type'

import { ArgumentDef } from './ArgumentDef'

/**
 * An input argument
 * @template T
 * @extends {ArgumentDef<T>}
 */
export class In<T> extends ArgumentDef<T> {
  /**
   * Construct an input argument
   * @param {Type<T>} type The argument type
   */
  constructor (type: Type<T>) {
    super(type, true, false)
  }
}

/**
 * An output argument
 * @template T
 * @extends {ArgumentDef<T>}
 */
export class Out<T> extends ArgumentDef<T> {
  /**
   * Construct an output argument
   * @param {Type<T>} type The argument type
   */
  constructor (type: Type<T>) {
    super(type, false, true)
  }
}

/**
 * An input/output argument
 * @template T
 * @extends {ArgumentDef<T>}
 */
export class InOut<T> extends ArgumentDef<T> {
  /**
   * Construct an input/output argument
   * @param {Type<T>} type The argument type
   */
  constructor (type: Type<T>) {
    super(type, true, true)
  }
}
