// @flow

import { MemoryManager } from '../MemoryManager'

import { ArgumentDef } from './ArgumentDef'
import { Type } from './Type'

export class FunctionPrototype<R> {
  argDefs: Array<ArgumentDef<any>>
  returns: ?Type<R>

  constructor (argDefs: Array<ArgumentDef<any>>, returns: ?Type<R>) {
    this.argDefs = argDefs
    this.returns = returns
  }

  invoke (memoryManager: MemoryManager, func: (...any) => any, ...args: Array<any>): any {
    if (this.argDefs.length !== args.length) {
      throw new RangeError('Invalid number of arguments')
    }

    const marshalledArgs = args.map((arg, i) =>
      this.argDefs[i].marshall(arg, memoryManager))

    const result = func(...marshalledArgs)

    args.forEach((arg, i) =>
      this.argDefs[i].unmarshall(marshalledArgs[i], memoryManager, arg))

    if (this.returns != null) {
      return this.returns.unmarshall(result, memoryManager)
    }
  }
}
