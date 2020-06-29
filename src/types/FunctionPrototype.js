export class FunctionPrototype {
  constructor (argDefs, returns) {
    this.argDefs = argDefs
    this.returns = returns
  }

  invoke (memoryManager, func, ...args) {
    if (this.argDefs.length !== args.length) {
      throw new RangeError('Invalid number of arguments')
    }

    const marshalledArgs = []
    for (let i = 0; i < args.length; ++i) {
      const argDef = this.argDefs[i]
      const arg = args[i]
      marshalledArgs[i] = argDef.marshall(arg, memoryManager)
    }

    const result = func(...marshalledArgs)

    for (let i = 0; i < args.length; ++i) {
      const argDef = this.argDefs[i]
      const arg = args[i]
      const marshalledArg = marshalledArgs[i]
      argDef.unmarshall(marshalledArg, memoryManager, arg)
    }

    if (this.returns != null) {
      return this.returns.unmarshall(result, memoryManager)
    }
  }
}
