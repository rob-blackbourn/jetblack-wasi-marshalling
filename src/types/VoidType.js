// @flow

import { Type } from './Type'

/**
 * A class representing no value
 */
export class VoidType extends Type<void> {
  static MANGLED_NAME = 'v0'

  get mangledName(): string {
    return VoidType.MANGLED_NAME
  }
}