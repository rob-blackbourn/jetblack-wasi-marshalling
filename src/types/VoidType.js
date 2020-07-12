import { Type } from './Type'

/**
 * A class representing no value
 */
export class VoidType extends Type {
  constructor() {
    super(Uint32Array)
  }
  
  static MANGLED_NAME = 'v0'

  get mangledName() {
    return VoidType.MANGLED_NAME
  }
}