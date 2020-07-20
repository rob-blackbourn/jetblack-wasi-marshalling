// @flow

import { Type } from './Type'

/**
 * A class representing no value
 */
export class VoidType extends Type<void> {
  constructor() {
    super(Uint32Array)
  }
  
  static MANGLED_NAME = 'v0'

  get mangledName(): string {
    return VoidType.MANGLED_NAME
  }
}