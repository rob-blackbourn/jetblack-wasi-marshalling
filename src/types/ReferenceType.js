// @flow

import { Type } from './Type'

/**
 * A class representing a reference type
 * @template T
 * @extends {Type<T>}
 */
export class ReferenceType<T> extends Type<T> {
  /**
   * Construct a reference type.
   */
  constructor () {
    super(Uint32Array)
  }
}
